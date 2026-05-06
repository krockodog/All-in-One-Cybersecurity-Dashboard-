/**
 * Professional Report Generator Service
 * Enterprise-grade report generation with multi-format support
 */

import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";

export interface ReportConfig {
  clientName: string;
  projectName: string;
  engagementDate: string;
  assessmentType: string;
  severity: "critical" | "high" | "medium" | "low";
  logo?: string;
  companyName?: string;
}

export interface ReportSection {
  title: string;
  content: string;
  subsections?: ReportSection[];
  findings?: Finding[];
}

export interface Finding {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  cvss: number;
  description: string;
  impact: string;
  remediation: string;
  evidence: string[];
  references?: string[];
}

export interface ConsolidatedReport {
  config: ReportConfig;
  sections: ReportSection[];
  findings: Finding[];
  summary: string;
  recommendations: string[];
  timeline: string;
}

export class ProfessionalReportGenerator {
  /**
   * Generate Executive Summary
   */
  static async generateExecutiveSummary(
    findings: Finding[],
    config: ReportConfig
  ): Promise<string> {
    const criticalCount = findings.filter((f) => f.severity === "critical").length;
    const highCount = findings.filter((f) => f.severity === "high").length;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a professional security consultant writing executive summaries for C-level stakeholders. Write concise, impactful summaries that focus on business impact and risk.",
        },
        {
          role: "user",
          content: `Generate a professional executive summary for a security assessment of ${config.projectName} conducted on ${config.engagementDate}.

Key Findings:
- Critical Issues: ${criticalCount}
- High Issues: ${highCount}
- Total Issues: ${findings.length}

Findings:
${findings.map((f) => `- ${f.title} (${f.severity.toUpperCase()}, CVSS ${f.cvss}): ${f.description}`).join("\n")}

Write a 2-3 paragraph executive summary that:
1. States the overall security posture
2. Highlights critical risks
3. Emphasizes business impact
4. Provides confidence level in remediation`,
        },
      ],
    });

    return (response.choices[0].message.content as string) || "";
  }

  /**
   * Generate Technical Findings Report
   */
  static async generateTechnicalFindings(findings: Finding[]): Promise<string> {
    const findingsByCategory = this.groupFindingsByCategory(findings);

    let content = "# Technical Findings\n\n";

    for (const [category, categoryFindings] of Object.entries(findingsByCategory)) {
      content += `## ${category}\n\n`;

      for (const finding of categoryFindings) {
        content += `### ${finding.title}\n`;
        content += `**Severity:** ${finding.severity.toUpperCase()} | **CVSS Score:** ${finding.cvss}\n\n`;
        content += `**Description:**\n${finding.description}\n\n`;
        content += `**Impact:**\n${finding.impact}\n\n`;
        content += `**Evidence:**\n${finding.evidence.map((e) => `- ${e}`).join("\n")}\n\n`;
        content += `**Remediation:**\n${finding.remediation}\n\n`;

        if (finding.references?.length) {
          content += `**References:**\n${finding.references.map((r) => `- ${r}`).join("\n")}\n\n`;
        }

        content += "---\n\n";
      }
    }

    return content;
  }

  /**
   * Generate Risk Assessment Report
   */
  static async generateRiskAssessment(findings: Finding[]): Promise<string> {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a professional risk analyst. Generate comprehensive risk assessments with business impact analysis.",
        },
        {
          role: "user",
          content: `Generate a risk assessment report for the following findings:

${findings
  .map(
    (f) =>
      `- ${f.title} (CVSS ${f.cvss}): ${f.description}. Impact: ${f.impact}`
  )
  .join("\n")}

Include:
1. Risk Matrix (Likelihood vs Impact)
2. Business Impact Analysis
3. Risk Prioritization
4. Mitigation Timeline
5. Residual Risk Assessment`,
        },
      ],
    });

    return (response.choices[0].message.content as string) || "";
  }

  /**
   * Generate Remediation Roadmap
   */
  static async generateRemediationRoadmap(findings: Finding[]): Promise<string> {
    const sortedFindings = [...findings].sort((a, b) => b.cvss - a.cvss);

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a security remediation specialist. Create actionable, prioritized remediation roadmaps.",
        },
        {
          role: "user",
          content: `Create a remediation roadmap for the following findings, prioritized by CVSS score:

${sortedFindings
  .map(
    (f) =>
      `- ${f.title} (CVSS ${f.cvss}): ${f.remediation}`
  )
  .join("\n")}

Include:
1. Phase 1 (Immediate - 0-30 days): Critical issues
2. Phase 2 (Short-term - 30-90 days): High issues
3. Phase 3 (Medium-term - 90-180 days): Medium issues
4. Phase 4 (Long-term - 180+ days): Low issues
5. Resource Requirements
6. Success Metrics`,
        },
      ],
    });

    return (response.choices[0].message.content as string) || "";
  }

  /**
   * Consolidate Multiple Reports
   */
  static async consolidateReports(
    reports: ConsolidatedReport[]
  ): Promise<ConsolidatedReport> {
    const allFindings = reports.flatMap((r) => r.findings);
    const uniqueFindings = this.deduplicateFindings(allFindings);

    const consolidatedSummary = await this.generateExecutiveSummary(
      uniqueFindings,
      reports[0].config
    );

    return {
      config: reports[0].config,
      sections: this.consolidateSections(reports.map((r) => r.sections)),
      findings: uniqueFindings,
      summary: consolidatedSummary,
      recommendations: this.consolidateRecommendations(
        reports.flatMap((r) => r.recommendations)
      ),
      timeline: this.generateConsolidatedTimeline(reports),
    };
  }

  /**
   * Generate HTML Report
   */
  static async generateHTMLReport(report: ConsolidatedReport): Promise<string> {
    const criticalCount = report.findings.filter((f) => f.severity === "critical").length;
    const highCount = report.findings.filter((f) => f.severity === "high").length;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.config.projectName} - Security Assessment Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white;
      padding: 60px 40px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    
    .header p {
      font-size: 1.1em;
      opacity: 0.9;
    }
    
    .metadata {
      background: #f9f9f9;
      padding: 30px 40px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .metadata-item {
      display: flex;
      justify-content: space-between;
    }
    
    .metadata-label {
      font-weight: 600;
      color: #666;
    }
    
    .metadata-value {
      color: #333;
    }
    
    .summary-box {
      background: #f0f4ff;
      border-left: 4px solid #2a5298;
      padding: 20px;
      margin: 30px 40px;
      border-radius: 4px;
    }
    
    .summary-box h2 {
      color: #1e3c72;
      margin-bottom: 10px;
    }
    
    .findings-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin: 30px 40px;
    }
    
    .finding-card {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border-top: 3px solid #999;
    }
    
    .finding-card.critical {
      border-top-color: #dc2626;
    }
    
    .finding-card.high {
      border-top-color: #ea580c;
    }
    
    .finding-card.medium {
      border-top-color: #f59e0b;
    }
    
    .finding-card.low {
      border-top-color: #10b981;
    }
    
    .finding-card-number {
      font-size: 2em;
      font-weight: bold;
      color: #1e3c72;
    }
    
    .finding-card-label {
      font-size: 0.9em;
      color: #666;
      margin-top: 5px;
    }
    
    .content {
      padding: 40px;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section h2 {
      color: #1e3c72;
      font-size: 1.8em;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #2a5298;
    }
    
    .section h3 {
      color: #2a5298;
      font-size: 1.3em;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    
    .finding-item {
      background: #f9f9f9;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      border-left: 4px solid #999;
    }
    
    .finding-item.critical {
      border-left-color: #dc2626;
      background: #fef2f2;
    }
    
    .finding-item.high {
      border-left-color: #ea580c;
      background: #fef3f2;
    }
    
    .finding-item.medium {
      border-left-color: #f59e0b;
      background: #fffbf0;
    }
    
    .finding-item.low {
      border-left-color: #10b981;
      background: #f0fdf4;
    }
    
    .finding-title {
      font-size: 1.1em;
      font-weight: 600;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .severity-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
      color: white;
    }
    
    .severity-badge.critical {
      background: #dc2626;
    }
    
    .severity-badge.high {
      background: #ea580c;
    }
    
    .severity-badge.medium {
      background: #f59e0b;
    }
    
    .severity-badge.low {
      background: #10b981;
    }
    
    .cvss-score {
      display: inline-block;
      background: #333;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.9em;
      margin-left: 10px;
    }
    
    .finding-detail {
      margin-top: 10px;
      font-size: 0.95em;
      line-height: 1.6;
    }
    
    .finding-detail strong {
      color: #1e3c72;
      display: block;
      margin-top: 8px;
    }
    
    .footer {
      background: #f9f9f9;
      padding: 30px 40px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 0.9em;
    }
    
    .page-break {
      page-break-after: always;
      margin: 40px 0;
    }
    
    @media print {
      body {
        background: white;
      }
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Security Assessment Report</h1>
      <p>${report.config.projectName}</p>
    </div>
    
    <!-- Metadata -->
    <div class="metadata">
      <div class="metadata-item">
        <span class="metadata-label">Client:</span>
        <span class="metadata-value">${report.config.clientName}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Assessment Type:</span>
        <span class="metadata-value">${report.config.assessmentType}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Date:</span>
        <span class="metadata-value">${report.config.engagementDate}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Overall Severity:</span>
        <span class="metadata-value">
          <span class="severity-badge ${report.config.severity}">${report.config.severity.toUpperCase()}</span>
        </span>
      </div>
    </div>
    
    <!-- Summary -->
    <div class="summary-box">
      <h2>Executive Summary</h2>
      <p>${report.summary}</p>
    </div>
    
    <!-- Findings Summary -->
    <div class="findings-summary">
      <div class="finding-card critical">
        <div class="finding-card-number">${criticalCount}</div>
        <div class="finding-card-label">Critical</div>
      </div>
      <div class="finding-card high">
        <div class="finding-card-number">${highCount}</div>
        <div class="finding-card-label">High</div>
      </div>
      <div class="finding-card medium">
        <div class="finding-card-number">${report.findings.filter((f) => f.severity === "medium").length}</div>
        <div class="finding-card-label">Medium</div>
      </div>
      <div class="finding-card low">
        <div class="finding-card-number">${report.findings.filter((f) => f.severity === "low").length}</div>
        <div class="finding-card-label">Low</div>
      </div>
    </div>
    
    <!-- Content -->
    <div class="content">
      <!-- Findings -->
      <div class="section">
        <h2>Detailed Findings</h2>
        ${report.findings
          .sort((a, b) => {
            const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return severityOrder[a.severity] - severityOrder[b.severity];
          })
          .map(
            (finding) => `
          <div class="finding-item ${finding.severity}">
            <div class="finding-title">
              ${finding.title}
              <span>
                <span class="severity-badge ${finding.severity}">${finding.severity.toUpperCase()}</span>
                <span class="cvss-score">CVSS ${finding.cvss}</span>
              </span>
            </div>
            <div class="finding-detail">
              <strong>Description:</strong>
              ${finding.description}
            </div>
            <div class="finding-detail">
              <strong>Impact:</strong>
              ${finding.impact}
            </div>
            <div class="finding-detail">
              <strong>Remediation:</strong>
              ${finding.remediation}
            </div>
            ${
              finding.evidence.length > 0
                ? `
              <div class="finding-detail">
                <strong>Evidence:</strong>
                <ul>
                  ${finding.evidence.map((e) => `<li>${e}</li>`).join("")}
                </ul>
              </div>
            `
                : ""
            }
          </div>
        `
          )
          .join("")}
      </div>
      
      <!-- Recommendations -->
      <div class="section page-break">
        <h2>Recommendations</h2>
        <ol>
          ${report.recommendations.map((rec) => `<li>${rec}</li>`).join("")}
        </ol>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>This report is confidential and intended for authorized recipients only.</p>
      <p>Generated by Professional Security Assessment System</p>
    </div>
  </div>
</body>
</html>`;

    return html;
  }

  /**
   * Helper: Group findings by category
   */
  private static groupFindingsByCategory(
    findings: Finding[]
  ): Record<string, Finding[]> {
    return findings.reduce(
      (acc, finding) => {
        const category = finding.title.split(" ")[0] || "Other";
        if (!acc[category]) acc[category] = [];
        acc[category].push(finding);
        return acc;
      },
      {} as Record<string, Finding[]>
    );
  }

  /**
   * Helper: Deduplicate findings
   */
  private static deduplicateFindings(findings: Finding[]): Finding[] {
    const seen = new Set<string>();
    return findings.filter((f) => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
  }

  /**
   * Helper: Consolidate sections
   */
  private static consolidateSections(sections: ReportSection[][]): ReportSection[] {
    const consolidated: Record<string, ReportSection> = {};

    for (const sectionGroup of sections) {
      for (const section of sectionGroup) {
        if (!consolidated[section.title]) {
          consolidated[section.title] = section;
        } else {
          consolidated[section.title].content += "\n\n" + section.content;
        }
      }
    }

    return Object.values(consolidated);
  }

  /**
   * Helper: Consolidate recommendations
   */
  private static consolidateRecommendations(recommendations: string[]): string[] {
    const uniqueSet = new Set(recommendations);
    const result: string[] = [];
    uniqueSet.forEach((rec) => result.push(rec));
    return result;
  }

  /**
   * Helper: Generate consolidated timeline
   */
  private static generateConsolidatedTimeline(reports: ConsolidatedReport[]): string {
    return reports.map((r) => r.timeline).join("\n\n");
  }
}
