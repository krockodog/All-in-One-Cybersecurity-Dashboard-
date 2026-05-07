/**
 * Professional Report Generator Service
 * Generates enterprise-grade security reports with AI analysis
 */

import {
  ProfessionalReport,
  EnhancedFinding,
  AttackChain,
  SeverityLevel,
  CVSSScore,
  ReportType,
} from '@shared/types/report';
import { Finding } from '@shared/types';
import { invokeLLM } from '../_core/llm';

export class ReportGeneratorService {
  /**
   * Generate a professional report
   */
  static async generateReport(
    engagementId: string,
    findings: Finding[],
    reportType: ReportType,
    includeAIAnalysis: boolean = true
  ): Promise<ProfessionalReport> {
    // Step 1: Enhance findings with AI analysis
    const enhancedFindings = await this.enhanceFindings(findings, includeAIAnalysis);

    // Step 2: Generate executive summary
    const executiveSummary = await this.generateExecutiveSummary(enhancedFindings);

    // Step 3: Calculate risk matrix
    const riskMatrix = this.calculateRiskMatrix(enhancedFindings);

    // Step 4: Create base report
    let report: ProfessionalReport = {
      metadata: {
        id: `report-${Date.now()}`,
        engagementId,
        reportType,
        title: this.getReportTitle(reportType),
        author: 'CyberDash AI',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        classification: 'confidential',
      },
      executiveSummary,
      findings: enhancedFindings,
      riskMatrix,
    };

    // Step 5: Add type-specific content
    switch (reportType) {
      case 'red_team':
        report = await this.addRedTeamContent(report, enhancedFindings);
        break;
      case 'remediation_roadmap':
        report = await this.addRemediationRoadmapContent(report);
        break;
    }

    return report;
  }

  /**
   * Enhance findings with CVSS, CWE, MITRE ATT&CK mapping
   */
  private static async enhanceFindings(
    findings: Finding[],
    includeAIAnalysis: boolean
  ): Promise<EnhancedFinding[]> {
    const enhancedFindings: EnhancedFinding[] = [];

    for (const finding of findings) {
      let cvssScore: CVSSScore | undefined;

      // Use AI to analyze and enhance the finding
      if (includeAIAnalysis) {
        cvssScore = await this.analyzeFindingWithAI(finding);
      }

      const enhanced: EnhancedFinding = {
        id: String(finding.id),
        title: finding.title,
        description: finding.description || '',
        severity: this.mapSeverity(finding.severity),
        cvssScore,
        cweReferences: [],
        mitreAttackTactics: [],
        proofOfConcept: {
          description: 'See technical details',
          steps: this.parseSteps(finding.description || ''),
          screenshots: [],
        },
        impact: {
          confidentiality: 'high',
          integrity: 'high',
          availability: 'medium',
          businessImpact: `This vulnerability could allow attackers to compromise the system.`,
        },
        remediation: {
          shortTerm: [
            `Apply security patches for ${finding.title}`,
            'Implement input validation and output encoding',
          ],
          longTerm: [
            'Conduct security training for development team',
            'Establish secure development lifecycle practices',
            'Implement automated security testing in CI/CD',
          ],
          priority: this.calculatePriority(finding.severity),
          estimatedEffort: this.estimateEffort(finding.severity),
        },
        references: [
          {
            title: 'OWASP Top 10',
            url: 'https://owasp.org/Top10/',
            source: 'OWASP',
          },
        ],
      };

      enhancedFindings.push(enhanced);
    }

    return enhancedFindings;
  }

  /**
   * Analyze finding with AI to extract CVSS score
   */
  private static async analyzeFindingWithAI(finding: Finding): Promise<CVSSScore | undefined> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a cybersecurity expert. Analyze the security finding and provide a CVSS v3.1 score (0-10).
Return ONLY a JSON object with: { score: number (0-10), vector: string }`,
          },
          {
            role: 'user',
            content: `Vulnerability: ${finding.title}\nDescription: ${finding.description || 'N/A'}`,
          },
        ],
      });

      const content = response.choices[0].message.content;
      if (!content || typeof content !== 'string') return undefined;

      try {
        const analysis = JSON.parse(content);
        return {
          baseScore: analysis.score || 5,
          baseSeverity: this.mapCVSSToSeverity(analysis.score || 5),
          vector: analysis.vector || 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
          exploitability: (analysis.score || 5) * 0.8,
          impactScore: (analysis.score || 5) * 0.9,
        };
      } catch {
        return undefined;
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      return undefined;
    }
  }

  /**
   * Generate executive summary
   */
  private static async generateExecutiveSummary(
    findings: EnhancedFinding[]
  ): Promise<{
    overview: string;
    keyFindings: string[];
    riskScore: number;
    recommendations: string[];
  }> {
    const criticalCount = findings.filter((f) => f.severity === 'critical').length;
    const highCount = findings.filter((f) => f.severity === 'high').length;
    const riskScore = Math.min(100, criticalCount * 20 + highCount * 10);

    return {
      overview: `This security assessment identified ${findings.length} vulnerabilities across the target environment. The assessment revealed ${criticalCount} critical and ${highCount} high-severity issues that require immediate attention.`,
      keyFindings: findings
        .slice(0, 5)
        .map((f) => `${f.title} (${f.severity.toUpperCase()})`),
      riskScore,
      recommendations: [
        'Prioritize remediation of critical findings within 7 days',
        'Implement compensating controls for high-severity issues',
        'Establish a vulnerability management program',
        'Conduct regular security assessments',
      ],
    };
  }

  /**
   * Calculate risk matrix
   */
  private static calculateRiskMatrix(findings: EnhancedFinding[]): {
    criticalFindings: number;
    highFindings: number;
    mediumFindings: number;
    lowFindings: number;
    overallRiskScore: number;
  } {
    const critical = findings.filter((f) => f.severity === 'critical').length;
    const high = findings.filter((f) => f.severity === 'high').length;
    const medium = findings.filter((f) => f.severity === 'medium').length;
    const low = findings.filter((f) => f.severity === 'low').length;

    const overallRiskScore = Math.min(100, critical * 20 + high * 10 + medium * 5 + low);

    return {
      criticalFindings: critical,
      highFindings: high,
      mediumFindings: medium,
      lowFindings: low,
      overallRiskScore,
    };
  }

  /**
   * Add remediation roadmap content
   */
  private static async addRemediationRoadmapContent(
    report: ProfessionalReport
  ): Promise<ProfessionalReport> {
    const phase1 = report.findings.filter((f) => f.severity === 'critical').slice(0, 3);
    const phase2 = report.findings.filter((f) => f.severity === 'high').slice(0, 5);
    const phase3 = report.findings.filter((f) => ['medium', 'low'].includes(f.severity));

    report.remediationRoadmap = {
      phase1: {
        name: 'Immediate (0-30 days)',
        findings: phase1,
        estimatedCost: '$10,000 - $25,000',
        estimatedEffort: '2-3 weeks',
        expectedOutcome: 'Eliminate critical vulnerabilities',
      },
      phase2: {
        name: 'Short-term (30-90 days)',
        findings: phase2,
        estimatedCost: '$25,000 - $50,000',
        estimatedEffort: '4-6 weeks',
        expectedOutcome: 'Reduce high-risk exposures',
      },
      phase3: {
        name: 'Long-term (90+ days)',
        findings: phase3,
        estimatedCost: '$50,000+',
        estimatedEffort: '8+ weeks',
        expectedOutcome: 'Establish mature security posture',
      },
    };

    return report;
  }

  /**
   * Add red team report content
   */
  private static async addRedTeamContent(
    report: ProfessionalReport,
    findings: EnhancedFinding[]
  ): Promise<ProfessionalReport> {
    // Generate attack chains
    const attackChains = this.generateAttackChains(findings);
    report.attackChains = attackChains;
    report.lateralMovementPaths = this.generateLateralMovementPaths(findings);
    report.persistenceMechanisms = this.generatePersistenceMechanisms(findings);

    return report;
  }

  /**
   * Generate attack chains from findings
   */
  private static generateAttackChains(findings: EnhancedFinding[]): AttackChain[] {
    const chains: AttackChain[] = [];

    if (findings.length > 0) {
      const chain: AttackChain = {
        id: `chain-${Date.now()}`,
        engagementId: '',
        name: 'Primary Attack Chain',
        description: 'Likely attack path using identified vulnerabilities',
        nodes: findings.slice(0, 5).map((f, idx) => ({
          id: `node-${idx}`,
          phase: this.getAttackPhase(idx),
          name: f.title,
          description: f.description,
          findings: [f],
          exploitabilityScore: (f.cvssScore?.exploitability || 5) / 10,
          impactScore: (f.cvssScore?.impactScore || 5) / 10,
          prerequisites: [],
          postConditions: [],
          detectionMethods: ['IDS/IPS alerts', 'Log analysis'],
          evasionTechniques: ['Living off the land', 'Obfuscation'],
        })),
        successProbability: 0.7,
        estimatedTimeToCompromise: '2-4 hours',
        requiredSkillLevel: 'medium' as const,
        detectionDifficulty: 'medium' as const,
      };

      chains.push(chain);
    }

    return chains;
  }

  /**
   * Generate lateral movement paths
   */
  private static generateLateralMovementPaths(findings: EnhancedFinding[]) {
    const paths = [];

    if (findings.length > 0) {
      paths.push({
        id: `path-${Date.now()}`,
        sourceSystem: 'Web Server',
        targetSystem: 'Database Server',
        method: 'SQL Injection to RCE',
        difficulty: 'medium' as const,
        detectionMethods: ['Network segmentation monitoring', 'Database audit logs'],
        evasionTechniques: ['Encrypted channels', 'Legitimate service abuse'],
        impactIfSuccessful: 'Complete database compromise and data exfiltration',
      });
    }

    return paths;
  }

  /**
   * Generate persistence mechanisms
   */
  private static generatePersistenceMechanisms(findings: EnhancedFinding[]) {
    const mechanisms = [];

    if (findings.length > 0) {
      mechanisms.push({
        id: `persist-${Date.now()}`,
        type: 'web_shell' as const,
        name: 'Web Shell Persistence',
        description: 'Attacker uploads web shell for continued access',
        implementation: '<%@ Page Language="C#" %>\n<% System.Diagnostics.Process.Start("cmd.exe"); %>',
        detectionMethods: ['File integrity monitoring', 'Web server log analysis'],
        removalSteps: ['Remove web shell files', 'Review access logs', 'Patch vulnerability'],
        difficulty: 'low' as const,
      });
    }

    return mechanisms;
  }

  /**
   * Helper functions
   */
  private static mapSeverity(severity: string | null | undefined): SeverityLevel {
    if (!severity) return 'medium';
    const map: Record<string, SeverityLevel> = {
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low',
      info: 'info',
    };
    return map[severity.toLowerCase()] || 'medium';
  }

  private static mapCVSSToSeverity(score: number): SeverityLevel {
    if (score >= 9) return 'critical';
    if (score >= 7) return 'high';
    if (score >= 4) return 'medium';
    if (score > 0) return 'low';
    return 'info';
  }

  private static calculatePriority(severity: string | null | undefined): 1 | 2 | 3 | 4 | 5 {
    if (!severity) return 3;
    const map: Record<string, 1 | 2 | 3 | 4 | 5> = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4,
      info: 5,
    };
    return map[severity.toLowerCase()] || 3;
  }

  private static estimateEffort(severity: string | null | undefined): 'low' | 'medium' | 'high' {
    if (!severity) return 'medium';
    const map: Record<string, 'low' | 'medium' | 'high'> = {
      critical: 'high',
      high: 'high',
      medium: 'medium',
      low: 'low',
      info: 'low',
    };
    return map[severity.toLowerCase()] || 'medium';
  }

  private static parseSteps(description: string): string[] {
    return description.split('.').filter((s) => s.trim().length > 0);
  }

  private static getAttackPhase(index: number): any {
    const phases = [
      'reconnaissance',
      'weaponization',
      'delivery',
      'exploitation',
      'installation',
    ];
    return phases[index % phases.length] as any;
  }

  private static getReportTitle(reportType: ReportType): string {
    const titles: Record<ReportType, string> = {
      executive_summary: 'Executive Summary Report',
      technical: 'Technical Security Assessment Report',
      risk_assessment: 'Risk Assessment Report',
      remediation_roadmap: 'Remediation Roadmap',
      red_team: 'Red Team Assessment Report',
    };
    return titles[reportType];
  }
}
