/**
 * LeakIX Reconnaissance Workflow
 * Automated OSINT reconnaissance using LeakIX + Shodan
 */

import { LeakIXShodanTool, CombinedOSINTResult } from '../tools/leakixShodan';
import { leakixService } from '../services/leakix';

export interface ReconWorkflowConfig {
  target: string;
  email?: string;
  includeLeakIX: boolean;
  includeShodan: boolean;
  includeVulnerabilityAnalysis: boolean;
  generateReport: boolean;
}

export interface ReconWorkflowResult {
  workflowId: string;
  target: string;
  status: 'completed' | 'failed' | 'in_progress';
  phases: WorkflowPhase[];
  summary: ReconSummary;
  recommendations: string[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export interface WorkflowPhase {
  name: string;
  status: 'completed' | 'failed' | 'pending';
  startTime: Date;
  endTime?: Date;
  results: any;
  errors?: string[];
}

export interface ReconSummary {
  exposedServices: number;
  vulnerabilities: number;
  credentialLeaks: number;
  certificateIssues: number;
  dnsAnomalies: number;
  overallRiskScore: number;
  criticalFindings: string[];
}

export class LeakIXReconWorkflow {
  /**
   * Execute full reconnaissance workflow
   */
  static async executeWorkflow(config: ReconWorkflowConfig): Promise<ReconWorkflowResult> {
    const workflowId = `recon-${Date.now()}`;
    const startTime = new Date();
    const phases: WorkflowPhase[] = [];

    console.log(`[LeakIX Recon] Starting workflow ${workflowId} for target: ${config.target}`);

    try {
      // Phase 1: Exposed Services Discovery
      const servicesPhase = await this.phaseExposedServices(config);
      phases.push(servicesPhase);

      // Phase 2: Vulnerability Analysis
      const vulnPhase = await this.phaseVulnerabilityAnalysis(config);
      phases.push(vulnPhase);

      // Phase 3: Credential Leak Search
      const credPhase = await this.phaseCredentialLeaks(config);
      phases.push(credPhase);

      // Phase 4: SSL/TLS Analysis
      const sslPhase = await this.phaseSSLAnalysis(config);
      phases.push(sslPhase);

      // Phase 5: DNS Intelligence
      const dnsPhase = await this.phaseDNSIntelligence(config);
      phases.push(dnsPhase);

      // Phase 6: Shodan Correlation (if enabled)
      let shodanPhase: WorkflowPhase | null = null;
      if (config.includeShodan) {
        shodanPhase = await this.phaseShodanCorrelation(config);
        phases.push(shodanPhase);
      }

      // Phase 7: Combined Threat Assessment
      const threatPhase = await this.phaseThreatAssessment(config, phases);
      phases.push(threatPhase);

      // Phase 8: Generate Recommendations
      const recommendations = this.generateRecommendations(phases);

      // Compile summary
      const summary = this.compileSummary(phases);

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      return {
        workflowId,
        target: config.target,
        status: 'completed',
        phases,
        summary,
        recommendations,
        startTime,
        endTime,
        duration,
      };
    } catch (error) {
      console.error(`[LeakIX Recon] Workflow failed: ${error}`);
      return {
        workflowId,
        target: config.target,
        status: 'failed',
        phases,
        summary: {
          exposedServices: 0,
          vulnerabilities: 0,
          credentialLeaks: 0,
          certificateIssues: 0,
          dnsAnomalies: 0,
          overallRiskScore: 0,
          criticalFindings: [],
        },
        recommendations: [],
        startTime,
      };
    }
  }

  /**
   * Phase 1: Exposed Services Discovery
   */
  private static async phaseExposedServices(config: ReconWorkflowConfig): Promise<WorkflowPhase> {
    const startTime = new Date();
    try {
      const services = await leakixService.searchExposedServices(config.target);

      return {
        name: 'Exposed Services Discovery',
        status: 'completed',
        startTime,
        endTime: new Date(),
        results: {
          services,
          count: services.length,
          criticalServices: services.filter((s) => s.severity === 'critical').length,
        },
      };
    } catch (error) {
      return {
        name: 'Exposed Services Discovery',
        status: 'failed',
        startTime,
        endTime: new Date(),
        results: {},
        errors: [`Failed to discover exposed services: ${error}`],
      };
    }
  }

  /**
   * Phase 2: Vulnerability Analysis
   */
  private static async phaseVulnerabilityAnalysis(config: ReconWorkflowConfig): Promise<WorkflowPhase> {
    const startTime = new Date();
    try {
      const vulnerabilities = await leakixService.searchVulnerabilities(config.target);

      const criticalVulns = vulnerabilities.filter((v) => v.severity === 'critical');
      const exploitableVulns = vulnerabilities.filter((v) => v.exploitAvailable);

      return {
        name: 'Vulnerability Analysis',
        status: 'completed',
        startTime,
        endTime: new Date(),
        results: {
          vulnerabilities,
          count: vulnerabilities.length,
          critical: criticalVulns.length,
          exploitable: exploitableVulns.length,
          topVulnerabilities: criticalVulns.slice(0, 5),
        },
      };
    } catch (error) {
      return {
        name: 'Vulnerability Analysis',
        status: 'failed',
        startTime,
        endTime: new Date(),
        results: {},
        errors: [`Failed to analyze vulnerabilities: ${error}`],
      };
    }
  }

  /**
   * Phase 3: Credential Leak Search
   */
  private static async phaseCredentialLeaks(config: ReconWorkflowConfig): Promise<WorkflowPhase> {
    const startTime = new Date();
    try {
      if (!config.email) {
        return {
          name: 'Credential Leak Search',
          status: 'completed',
          startTime,
          endTime: new Date(),
          results: { skipped: true, reason: 'No email provided' },
        };
      }

      const leaks = await leakixService.searchCredentialLeaks(config.email);
      const compromised = leaks.filter((l) => l.compromised);

      return {
        name: 'Credential Leak Search',
        status: 'completed',
        startTime,
        endTime: new Date(),
        results: {
          leaks,
          count: leaks.length,
          compromised: compromised.length,
          sources: Array.from(new Set(leaks.map((l) => l.source))),
        },
      };
    } catch (error) {
      return {
        name: 'Credential Leak Search',
        status: 'failed',
        startTime,
        endTime: new Date(),
        results: {},
        errors: [`Failed to search credential leaks: ${error}`],
      };
    }
  }

  /**
   * Phase 4: SSL/TLS Analysis
   */
  private static async phaseSSLAnalysis(config: ReconWorkflowConfig): Promise<WorkflowPhase> {
    const startTime = new Date();
    try {
      const certificates = await leakixService.searchSSLCertificates(config.target);

      const expired = certificates.filter((c) => c.expired);
      const weak = certificates.filter((c) => c.weakAlgorithm);

      return {
        name: 'SSL/TLS Analysis',
        status: 'completed',
        startTime,
        endTime: new Date(),
        results: {
          certificates,
          count: certificates.length,
          expired: expired.length,
          weakAlgorithms: weak.length,
          issues: [...expired, ...weak],
        },
      };
    } catch (error) {
      return {
        name: 'SSL/TLS Analysis',
        status: 'failed',
        startTime,
        endTime: new Date(),
        results: {},
        errors: [`Failed to analyze SSL certificates: ${error}`],
      };
    }
  }

  /**
   * Phase 5: DNS Intelligence
   */
  private static async phaseDNSIntelligence(config: ReconWorkflowConfig): Promise<WorkflowPhase> {
    const startTime = new Date();
    try {
      const records = await leakixService.searchDNSRecords(config.target);
      const suspicious = records.filter((r) => r.suspicious);

      return {
        name: 'DNS Intelligence',
        status: 'completed',
        startTime,
        endTime: new Date(),
        results: {
          records,
          count: records.length,
          suspicious: suspicious.length,
          recordTypes: Array.from(new Set(records.map((r) => r.recordType))),
        },
      };
    } catch (error) {
      return {
        name: 'DNS Intelligence',
        status: 'failed',
        startTime,
        endTime: new Date(),
        results: {},
        errors: [`Failed to gather DNS intelligence: ${error}`],
      };
    }
  }

  /**
   * Phase 6: Shodan Correlation
   */
  private static async phaseShodanCorrelation(config: ReconWorkflowConfig): Promise<WorkflowPhase> {
    const startTime = new Date();
    try {
      const result = await LeakIXShodanTool.executeScan(config.target, config.email);

      return {
        name: 'Shodan Correlation',
        status: 'completed',
        startTime,
        endTime: new Date(),
        results: {
          correlatedFindings: result.correlatedFindings,
          threatAssessment: result.threatAssessment,
          correlationCount: result.correlatedFindings.length,
        },
      };
    } catch (error) {
      return {
        name: 'Shodan Correlation',
        status: 'failed',
        startTime,
        endTime: new Date(),
        results: {},
        errors: [`Failed to correlate with Shodan: ${error}`],
      };
    }
  }

  /**
   * Phase 7: Threat Assessment
   */
  private static async phaseThreatAssessment(
    config: ReconWorkflowConfig,
    phases: WorkflowPhase[]
  ): Promise<WorkflowPhase> {
    const startTime = new Date();
    try {
      const summary = this.compileSummary(phases);

      const threatLevel =
        summary.overallRiskScore >= 80
          ? 'CRITICAL'
          : summary.overallRiskScore >= 60
            ? 'HIGH'
            : summary.overallRiskScore >= 40
              ? 'MEDIUM'
              : 'LOW';

      return {
        name: 'Threat Assessment',
        status: 'completed',
        startTime,
        endTime: new Date(),
        results: {
          threatLevel,
          riskScore: summary.overallRiskScore,
          criticalFindings: summary.criticalFindings,
          exposureAnalysis: {
            exposedServices: summary.exposedServices,
            vulnerabilities: summary.vulnerabilities,
            credentialLeaks: summary.credentialLeaks,
          },
        },
      };
    } catch (error) {
      return {
        name: 'Threat Assessment',
        status: 'failed',
        startTime,
        endTime: new Date(),
        results: {},
        errors: [`Failed to assess threats: ${error}`],
      };
    }
  }

  /**
   * Compile workflow summary
   */
  private static compileSummary(phases: WorkflowPhase[]): ReconSummary {
    let exposedServices = 0;
    let vulnerabilities = 0;
    let credentialLeaks = 0;
    let certificateIssues = 0;
    let dnsAnomalies = 0;
    const criticalFindings: string[] = [];

    phases.forEach((phase) => {
      if (phase.results.count) {
        if (phase.name.includes('Exposed Services')) exposedServices = phase.results.count;
        if (phase.name.includes('Vulnerability')) vulnerabilities = phase.results.count;
        if (phase.name.includes('Credential')) credentialLeaks = phase.results.count;
        if (phase.name.includes('SSL')) certificateIssues = phase.results.count;
        if (phase.name.includes('DNS')) dnsAnomalies = phase.results.count;
      }

      if (phase.results.critical) {
        criticalFindings.push(`${phase.name}: ${phase.results.critical} critical items`);
      }
    });

    const riskScore = this.calculateRiskScore({
      exposedServices,
      vulnerabilities,
      credentialLeaks,
      certificateIssues,
      dnsAnomalies,
    });

    return {
      exposedServices,
      vulnerabilities,
      credentialLeaks,
      certificateIssues,
      dnsAnomalies,
      overallRiskScore: riskScore,
      criticalFindings,
    };
  }

  /**
   * Calculate risk score
   */
  private static calculateRiskScore(metrics: {
    exposedServices: number;
    vulnerabilities: number;
    credentialLeaks: number;
    certificateIssues: number;
    dnsAnomalies: number;
  }): number {
    const weights = {
      exposedServices: 0.2,
      vulnerabilities: 0.35,
      credentialLeaks: 0.25,
      certificateIssues: 0.1,
      dnsAnomalies: 0.1,
    };

    const normalized = {
      exposedServices: Math.min(metrics.exposedServices / 10, 1),
      vulnerabilities: Math.min(metrics.vulnerabilities / 5, 1),
      credentialLeaks: Math.min(metrics.credentialLeaks / 10, 1),
      certificateIssues: Math.min(metrics.certificateIssues / 5, 1),
      dnsAnomalies: Math.min(metrics.dnsAnomalies / 5, 1),
    };

    const score =
      (normalized.exposedServices * weights.exposedServices +
        normalized.vulnerabilities * weights.vulnerabilities +
        normalized.credentialLeaks * weights.credentialLeaks +
        normalized.certificateIssues * weights.certificateIssues +
        normalized.dnsAnomalies * weights.dnsAnomalies) *
      100;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Generate recommendations
   */
  private static generateRecommendations(phases: WorkflowPhase[]): string[] {
    const recommendations: string[] = [];

    phases.forEach((phase) => {
      if (phase.name.includes('Exposed Services') && phase.results.count > 0) {
        recommendations.push('Audit and restrict exposed services');
        recommendations.push('Implement network segmentation');
      }

      if (phase.name.includes('Vulnerability') && phase.results.critical > 0) {
        recommendations.push('Patch critical vulnerabilities immediately');
        recommendations.push('Implement vulnerability management program');
      }

      if (phase.name.includes('Credential') && phase.results.compromised > 0) {
        recommendations.push('Reset all compromised credentials');
        recommendations.push('Implement multi-factor authentication');
      }

      if (phase.name.includes('SSL') && phase.results.expired > 0) {
        recommendations.push('Renew expired SSL certificates');
        recommendations.push('Implement automated certificate management');
      }

      if (phase.name.includes('DNS') && phase.results.suspicious > 0) {
        recommendations.push('Investigate suspicious DNS records');
        recommendations.push('Implement DNSSEC');
      }
    });

    return Array.from(new Set(recommendations));
  }
}
