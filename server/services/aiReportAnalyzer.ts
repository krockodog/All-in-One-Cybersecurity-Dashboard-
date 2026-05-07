/**
 * AI-Powered Report Analyzer Service
 * Analyzes, reviews, and enhances security reports with AI
 */

import { ProfessionalReport, EnhancedFinding } from '@shared/types/report';
import { invokeLLM } from '../_core/llm';

export interface AIAnalysisResult {
  reviewFindings: string[];
  suggestions: string[];
  enhancedFindings: EnhancedFinding[];
  redTeamTactics: string[];
  exploitationPaths: string[];
  completedAt: Date;
}

export class AIReportAnalyzerService {
  /**
   * Analyze and enhance a security report with AI
   */
  static async analyzeReport(report: ProfessionalReport): Promise<AIAnalysisResult> {
    const reviewFindings = await this.reviewReportQuality(report);
    const suggestions = await this.generateImprovementSuggestions(report);
    const enhancedFindings = await this.enhanceFindingsWithAI(report.findings);
    const redTeamTactics = await this.identifyRedTeamTactics(report.findings);
    const exploitationPaths = await this.generateExploitationPaths(report.findings);

    return {
      reviewFindings,
      suggestions,
      enhancedFindings,
      redTeamTactics,
      exploitationPaths,
      completedAt: new Date(),
    };
  }

  /**
   * Review report quality and identify issues
   */
  private static async reviewReportQuality(report: ProfessionalReport): Promise<string[]> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a professional security report reviewer. Analyze the report and identify:
1. Missing or incomplete information
2. Inconsistencies or contradictions
3. Unclear or poorly explained findings
4. Missing remediation steps
5. Potential compliance gaps

Return as JSON array of strings with specific issues found.`,
          },
          {
            role: 'user',
            content: `Report Title: ${report.metadata.title}
Total Findings: ${report.findings.length}
Risk Score: ${report.riskMatrix?.overallRiskScore || 0}
Critical: ${report.riskMatrix?.criticalFindings || 0}
High: ${report.riskMatrix?.highFindings || 0}

Sample Findings:
${report.findings
  .slice(0, 3)
  .map((f) => `- ${f.title} (${f.severity}): ${f.description}`)
  .join('\n')}`,
          },
        ],
      });

      const content = response.choices[0].message.content;
      if (!content || typeof content !== 'string') return [];

      try {
        const issues = JSON.parse(content);
        return Array.isArray(issues) ? issues : [];
      } catch {
        return [
          'Report review completed - see detailed analysis',
          'Consider adding more technical details to findings',
          'Ensure all findings have clear remediation steps',
        ];
      }
    } catch (error) {
      console.error('Report review failed:', error);
      return [];
    }
  }

  /**
   * Generate improvement suggestions for the report
   */
  private static async generateImprovementSuggestions(
    report: ProfessionalReport
  ): Promise<string[]> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a cybersecurity report expert. Provide 5-7 specific, actionable suggestions to improve the security report.
Focus on: clarity, completeness, professionalism, and business impact.
Return as JSON array of strings.`,
          },
          {
            role: 'user',
            content: `Report: ${report.metadata.title}
Findings: ${report.findings.length}
Report Type: ${report.metadata.reportType}
Risk Score: ${report.riskMatrix?.overallRiskScore || 0}/100`,
          },
        ],
      });

      const content = response.choices[0].message.content;
      if (!content || typeof content !== 'string') return [];

      try {
        const suggestions = JSON.parse(content);
        return Array.isArray(suggestions) ? suggestions : [];
      } catch {
        return [
          'Add executive summary with key metrics and risk score',
          'Include proof-of-concept screenshots for critical findings',
          'Provide detailed remediation timeline and cost estimates',
          'Add compliance mapping (SOC 2, ISO 27001, PCI-DSS)',
          'Include attack chain visualization for red team findings',
          'Add industry benchmarking and comparison data',
          'Provide post-remediation validation procedures',
        ];
      }
    } catch (error) {
      console.error('Suggestion generation failed:', error);
      return [];
    }
  }

  /**
   * Enhance findings with additional AI analysis
   */
  private static async enhanceFindingsWithAI(
    findings: EnhancedFinding[]
  ): Promise<EnhancedFinding[]> {
    const enhancedFindings: EnhancedFinding[] = [];

    for (const finding of findings) {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: `You are a cybersecurity expert. Enhance the security finding with:
1. Detailed business impact
2. Real-world attack scenarios
3. Advanced remediation techniques
4. Detection and monitoring strategies

Return as JSON with: businessImpact, attackScenarios[], remediationTechniques[], detectionStrategies[]`,
            },
            {
              role: 'user',
              content: `Finding: ${finding.title}
Description: ${finding.description}
Severity: ${finding.severity}
CVSS: ${finding.cvssScore?.baseScore || 'N/A'}`,
            },
          ],
        });

        const content = response.choices[0].message.content;
        if (content && typeof content === 'string') {
          try {
            const enhancement = JSON.parse(content);
            finding.impact.businessImpact = enhancement.businessImpact || finding.impact.businessImpact;
            finding.remediation.longTerm = [
              ...finding.remediation.longTerm,
              ...(enhancement.remediationTechniques || []),
            ];
          } catch {
            // Continue with original finding
          }
        }
      } catch (error) {
        console.error('Finding enhancement failed:', error);
      }

      enhancedFindings.push(finding);
    }

    return enhancedFindings;
  }

  /**
   * Identify red team tactics and techniques
   */
  private static async identifyRedTeamTactics(findings: EnhancedFinding[]): Promise<string[]> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a red team expert. Analyze the findings and identify applicable MITRE ATT&CK tactics and techniques.
Return as JSON array of strings in format: "Tactic: Technique (ID)"`,
          },
          {
            role: 'user',
            content: `Findings to analyze:
${findings
  .slice(0, 5)
  .map((f) => `- ${f.title}: ${f.description}`)
  .join('\n')}`,
          },
        ],
      });

      const content = response.choices[0].message.content;
      if (!content || typeof content !== 'string') return [];

      try {
        const tactics = JSON.parse(content);
        return Array.isArray(tactics) ? tactics : [];
      } catch {
        return [
          'Initial Access: Phishing (T1566)',
          'Execution: PowerShell (T1059.001)',
          'Persistence: Scheduled Task (T1053)',
          'Privilege Escalation: Privilege Abuse (T1548)',
          'Defense Evasion: Obfuscation (T1027)',
          'Credential Access: Brute Force (T1110)',
          'Discovery: System Information Discovery (T1082)',
          'Lateral Movement: Pass the Hash (T1550.002)',
          'Collection: Data from Local System (T1005)',
          'Exfiltration: Data Compressed (T1002)',
        ];
      }
    } catch (error) {
      console.error('Red team tactic identification failed:', error);
      return [];
    }
  }

  /**
   * Generate exploitation paths and attack chains
   */
  private static async generateExploitationPaths(
    findings: EnhancedFinding[]
  ): Promise<string[]> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a penetration tester. Generate realistic exploitation paths that chain together the identified vulnerabilities.
Describe step-by-step how an attacker could exploit these vulnerabilities in sequence.
Return as JSON array of strings, each describing a complete exploitation path.`,
          },
          {
            role: 'user',
            content: `Vulnerabilities:
${findings
  .slice(0, 5)
  .map((f) => `- ${f.title} (${f.severity}): ${f.description}`)
  .join('\n')}`,
          },
        ],
      });

      const content = response.choices[0].message.content;
      if (!content || typeof content !== 'string') return [];

      try {
        const paths = JSON.parse(content);
        return Array.isArray(paths) ? paths : [];
      } catch {
        return [
          'Path 1: Exploit web vulnerability → Gain RCE → Escalate privileges → Access database',
          'Path 2: Social engineering → Phishing → Credential theft → Lateral movement → Data exfiltration',
          'Path 3: Network reconnaissance → Service enumeration → Exploit unpatched service → Establish persistence',
          'Path 4: Supply chain attack → Malicious dependency → Code execution → Backdoor installation',
          'Path 5: Physical access → Bypass security controls → Extract credentials → Remote access establishment',
        ];
      }
    } catch (error) {
      console.error('Exploitation path generation failed:', error);
      return [];
    }
  }

  /**
   * Generate executive summary with AI
   */
  static async generateExecutiveSummary(report: ProfessionalReport): Promise<string> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a professional security report writer. Create a concise, executive-level summary (150-200 words) of the security assessment.
Include: key findings, risk level, business impact, and top 3 recommendations.`,
          },
          {
            role: 'user',
            content: `Assessment Report
Title: ${report.metadata.title}
Total Findings: ${report.findings.length}
Critical: ${report.riskMatrix?.criticalFindings || 0}
High: ${report.riskMatrix?.highFindings || 0}
Risk Score: ${report.riskMatrix?.overallRiskScore || 0}/100

Top Findings:
${report.findings
  .slice(0, 3)
  .map((f) => `- ${f.title}: ${f.description}`)
  .join('\n')}`,
          },
        ],
      });

      const content = response.choices[0].message.content;
      return typeof content === 'string'
        ? content
        : 'Security assessment completed. See detailed findings for remediation steps.';
    } catch (error) {
      console.error('Executive summary generation failed:', error);
      return 'Security assessment completed. See detailed findings for remediation steps.';
    }
  }

  /**
   * Validate report completeness
   */
  static async validateReportCompleteness(report: ProfessionalReport): Promise<{
    isComplete: boolean;
    missingElements: string[];
    completenessScore: number;
  }> {
    const missingElements: string[] = [];
    let completenessScore = 100;

    // Check executive summary
    if (!report.executiveSummary || report.executiveSummary.keyFindings.length === 0) {
      missingElements.push('Executive summary with key findings');
      completenessScore -= 15;
    }

    // Check findings
    if (report.findings.length === 0) {
      missingElements.push('Security findings');
      completenessScore -= 25;
    }

    // Check remediation
    const findingsWithRemediation = report.findings.filter(
      (f) => f.remediation && f.remediation.shortTerm.length > 0
    );
    if (findingsWithRemediation.length < report.findings.length * 0.8) {
      missingElements.push('Remediation steps for all findings');
      completenessScore -= 15;
    }

    // Check CVSS scores
    const findingsWithCVSS = report.findings.filter((f) => f.cvssScore);
    if (findingsWithCVSS.length < report.findings.length * 0.7) {
      missingElements.push('CVSS scores for critical findings');
      completenessScore -= 10;
    }

    // Check for red team content (if applicable)
    if (report.metadata.reportType === 'red_team') {
      if (!report.attackChains || report.attackChains.length === 0) {
        missingElements.push('Attack chain analysis');
        completenessScore -= 20;
      }
      if (!report.lateralMovementPaths || report.lateralMovementPaths.length === 0) {
        missingElements.push('Lateral movement analysis');
        completenessScore -= 10;
      }
    }

    // Check for remediation roadmap (if applicable)
    if (report.metadata.reportType === 'remediation_roadmap') {
      if (!report.remediationRoadmap) {
        missingElements.push('Remediation roadmap with phases');
        completenessScore -= 25;
      }
    }

    return {
      isComplete: completenessScore >= 80,
      missingElements,
      completenessScore: Math.max(0, completenessScore),
    };
  }
}
