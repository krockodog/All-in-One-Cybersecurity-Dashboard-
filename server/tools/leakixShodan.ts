/**
 * LeakIX + Shodan Combined OSINT Tool
 * Integrates LeakIX and Shodan for comprehensive intelligence gathering
 */

import { leakixService, LeakIXSearchResult } from '../services/leakix';
import { shodanSearch } from './shodan';

export interface CombinedOSINTResult {
  target: string;
  leakixData: LeakIXSearchResult;
  shodanData: any;
  correlatedFindings: CorrelatedFinding[];
  threatAssessment: ThreatAssessment;
  recommendations: string[];
}

export interface CorrelatedFinding {
  type: string;
  severity: string;
  source: string[];
  details: string;
  affectedAssets: string[];
}

export interface ThreatAssessment {
  overallRiskScore: number;
  exposureLevel: 'critical' | 'high' | 'medium' | 'low';
  topThreats: string[];
  immediateActions: string[];
}

export class LeakIXShodanTool {
  /**
   * Execute combined OSINT scan
   */
  static async executeScan(target: string, email?: string): Promise<CombinedOSINTResult> {
    console.log(`[LeakIX+Shodan] Starting combined OSINT scan for ${target}`);

    // Parallel execution of both services
    const [leakixData, shodanData] = await Promise.all([
      leakixService.comprehensiveSearch(target, email),
      this.executeShodanSearch(target),
    ]);

    // Correlate findings
    const correlatedFindings = this.correlateFindings(leakixData, shodanData);

    // Generate threat assessment
    const threatAssessment = this.generateThreatAssessment(
      leakixData,
      shodanData,
      correlatedFindings
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      leakixData,
      shodanData,
      correlatedFindings
    );

    return {
      target,
      leakixData,
      shodanData,
      correlatedFindings,
      threatAssessment,
      recommendations,
    };
  }

  /**
   * Execute Shodan search
   */
  private static async executeShodanSearch(target: string): Promise<any> {
    try {
      // Check if target is IP or domain
      const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(target);

      if (isIP) {
        return await shodanSearch(target, 'ip');
      } else {
        // For domain, try to get IPs first (would need DNS resolution)
        return await shodanSearch(target, 'hostname');
      }
    } catch (error) {
      console.error('Shodan search failed:', error);
      return null;
    }
  }

  /**
   * Correlate findings from both sources
   */
  private static correlateFindings(
    leakixData: LeakIXSearchResult,
    shodanData: any
  ): CorrelatedFinding[] {
    const findings: CorrelatedFinding[] = [];

    // Correlate exposed services
    if (leakixData.exposedServices.length > 0 && shodanData?.services) {
      const leakixPorts = new Set(leakixData.exposedServices.map((s) => s.port));
      const shodanPorts = new Set(shodanData.services.map((s: any) => s.port));

      const commonPorts = Array.from(leakixPorts).filter((p) => shodanPorts.has(p));

      if (commonPorts.length > 0) {
        findings.push({
          type: 'Exposed Services Confirmed',
          severity: 'high',
          source: ['LeakIX', 'Shodan'],
          details: `Services on ports ${commonPorts.join(', ')} confirmed by both sources`,
          affectedAssets: leakixData.exposedServices
            .filter((s) => commonPorts.includes(s.port))
            .map((s) => `${s.ip}:${s.port}`),
        });
      }
    }

    // Correlate vulnerabilities
    if (leakixData.vulnerabilities.length > 0 && shodanData?.vulnerabilities) {
      const commonVulns = leakixData.vulnerabilities.filter((lv) =>
        shodanData.vulnerabilities.some((sv: any) => sv.cve === lv.cve)
      );

      if (commonVulns.length > 0) {
        findings.push({
          type: 'Confirmed Vulnerabilities',
          severity: 'critical',
          source: ['LeakIX', 'Shodan'],
          details: `${commonVulns.length} vulnerabilities confirmed by both sources`,
          affectedAssets: commonVulns.map((v) => v.cve),
        });
      }
    }

    // Certificate issues
    if (leakixData.sslCertificates.length > 0) {
      const expiredCerts = leakixData.sslCertificates.filter((c) => c.expired);
      if (expiredCerts.length > 0) {
        findings.push({
          type: 'Expired SSL Certificates',
          severity: 'high',
          source: ['LeakIX'],
          details: `${expiredCerts.length} expired SSL certificates detected`,
          affectedAssets: expiredCerts.map((c) => c.domain),
        });
      }
    }

    // Credential leaks
    if (leakixData.credentialLeaks.length > 0) {
      findings.push({
        type: 'Credential Leaks',
        severity: 'critical',
        source: ['LeakIX'],
        details: `${leakixData.summary.credentialLeaksFound} credential leaks found in public databases`,
        affectedAssets: leakixData.credentialLeaks.map((c) => c.email),
      });
    }

    // DNS anomalies
    if (leakixData.summary.dnsAnomalies > 0) {
      findings.push({
        type: 'DNS Anomalies',
        severity: 'medium',
        source: ['LeakIX'],
        details: `${leakixData.summary.dnsAnomalies} suspicious DNS records detected`,
        affectedAssets: leakixData.dnsRecords
          .filter((d) => d.suspicious)
          .map((d) => `${d.domain} (${d.recordType})`),
      });
    }

    return findings;
  }

  /**
   * Generate threat assessment
   */
  private static generateThreatAssessment(
    leakixData: LeakIXSearchResult,
    shodanData: any,
    correlatedFindings: CorrelatedFinding[]
  ): ThreatAssessment {
    const overallRiskScore = Math.max(
      leakixData.summary.overallRiskScore,
      shodanData?.risk_score || 0
    );

    const exposureLevel =
      overallRiskScore >= 80
        ? 'critical'
        : overallRiskScore >= 60
          ? 'high'
          : overallRiskScore >= 40
            ? 'medium'
            : 'low';

    const topThreats = correlatedFindings
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity as keyof typeof severityOrder] -
          severityOrder[b.severity as keyof typeof severityOrder]
          ? -1
          : 1;
      })
      .slice(0, 5)
      .map((f) => `${f.type} (${f.severity.toUpperCase()})`);

    const immediateActions: string[] = [];

    if (leakixData.summary.criticalVulnerabilities > 0) {
      immediateActions.push('Patch critical vulnerabilities immediately');
    }
    if (leakixData.credentialLeaks.length > 0) {
      immediateActions.push('Reset compromised credentials');
    }
    if (leakixData.summary.certificateIssues > 0) {
      immediateActions.push('Renew expired SSL certificates');
    }
    if (leakixData.summary.totalExposedServices > 5) {
      immediateActions.push('Audit and restrict exposed services');
    }
    if (leakixData.summary.dnsAnomalies > 0) {
      immediateActions.push('Investigate DNS anomalies');
    }

    return {
      overallRiskScore,
      exposureLevel,
      topThreats,
      immediateActions,
    };
  }

  /**
   * Generate recommendations
   */
  private static generateRecommendations(
    leakixData: LeakIXSearchResult,
    shodanData: any,
    correlatedFindings: CorrelatedFinding[]
  ): string[] {
    const recommendations: string[] = [];

    // Service hardening
    if (leakixData.summary.totalExposedServices > 0) {
      recommendations.push(
        'Implement network segmentation and firewall rules to restrict exposed services'
      );
      recommendations.push('Enable service authentication and disable unnecessary services');
    }

    // Vulnerability management
    if (leakixData.summary.criticalVulnerabilities > 0) {
      recommendations.push('Establish vulnerability management program with regular patching');
      recommendations.push('Implement intrusion detection/prevention systems');
    }

    // Credential protection
    if (leakixData.credentialLeaks.length > 0) {
      recommendations.push('Implement multi-factor authentication (MFA)');
      recommendations.push('Use password manager and enforce strong password policies');
      recommendations.push('Monitor dark web for credential leaks');
    }

    // SSL/TLS
    if (leakixData.summary.certificateIssues > 0) {
      recommendations.push('Implement automated certificate management');
      recommendations.push('Use modern TLS versions (1.2+) and strong ciphers');
    }

    // DNS security
    if (leakixData.summary.dnsAnomalies > 0) {
      recommendations.push('Implement DNSSEC');
      recommendations.push('Monitor DNS for anomalies and hijacking attempts');
    }

    // General recommendations
    recommendations.push('Conduct regular security assessments and penetration tests');
    recommendations.push('Implement security awareness training for employees');
    recommendations.push('Establish incident response plan');

    return recommendations;
  }

  /**
   * Format results for reporting
   */
  static formatForReport(result: CombinedOSINTResult): string {
    return `
# LeakIX + Shodan Combined OSINT Report

## Target: ${result.target}

## Threat Assessment
- **Overall Risk Score:** ${result.threatAssessment.overallRiskScore}/100
- **Exposure Level:** ${result.threatAssessment.exposureLevel.toUpperCase()}

### Top Threats
${result.threatAssessment.topThreats.map((t) => `- ${t}`).join('\n')}

### Immediate Actions Required
${result.threatAssessment.immediateActions.map((a) => `- ${a}`).join('\n')}

## Findings Summary
- **Exposed Services:** ${result.leakixData.summary.totalExposedServices}
- **Critical Vulnerabilities:** ${result.leakixData.summary.criticalVulnerabilities}
- **Credential Leaks:** ${result.leakixData.credentialLeaks.length}
- **Certificate Issues:** ${result.leakixData.summary.certificateIssues}
- **DNS Anomalies:** ${result.leakixData.summary.dnsAnomalies}

## Correlated Findings
${result.correlatedFindings.map((f) => `- **${f.type}** (${f.severity.toUpperCase()}): ${f.details}`).join('\n')}

## Recommendations
${result.recommendations.map((r) => `- ${r}`).join('\n')}
    `;
  }
}
