/**
 * Multi-Format Report Exporter Service
 * Export reports in DOCX, HTML, JSON, TXT, CSV formats
 */

import { ConsolidatedReport, Finding } from "./professionalReportGenerator";

export class MultiFormatReportExporter {
  /**
   * Export to HTML format
   */
  static exportToHTML(report: ConsolidatedReport): string {
    const criticalCount = report.findings.filter((f) => f.severity === "critical").length;
    const highCount = report.findings.filter((f) => f.severity === "high").length;
    const mediumCount = report.findings.filter((f) => f.severity === "medium").length;
    const lowCount = report.findings.filter((f) => f.severity === "low").length;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.config.projectName} - Security Assessment Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 1000px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 60px 40px; text-align: center; }
    .header h1 { font-size: 2.5em; margin-bottom: 10px; }
    .metadata { background: #f9f9f9; padding: 30px 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-bottom: 1px solid #e0e0e0; }
    .metadata-item { display: flex; justify-content: space-between; }
    .metadata-label { font-weight: 600; color: #666; }
    .summary-box { background: #f0f4ff; border-left: 4px solid #2a5298; padding: 20px; margin: 30px 40px; border-radius: 4px; }
    .summary-box h2 { color: #1e3c72; margin-bottom: 10px; }
    .findings-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 30px 40px; }
    .finding-card { background: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center; border-top: 3px solid #999; }
    .finding-card.critical { border-top-color: #dc2626; }
    .finding-card.high { border-top-color: #ea580c; }
    .finding-card.medium { border-top-color: #f59e0b; }
    .finding-card.low { border-top-color: #10b981; }
    .finding-card-number { font-size: 2em; font-weight: bold; color: #1e3c72; }
    .content { padding: 40px; }
    .section { margin-bottom: 40px; }
    .section h2 { color: #1e3c72; font-size: 1.8em; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #2a5298; }
    .section h3 { color: #2a5298; font-size: 1.3em; margin-top: 20px; margin-bottom: 10px; }
    .finding-item { background: #f9f9f9; padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #999; }
    .finding-item.critical { border-left-color: #dc2626; background: #fef2f2; }
    .finding-item.high { border-left-color: #ea580c; background: #fef3f2; }
    .finding-item.medium { border-left-color: #f59e0b; background: #fffbf0; }
    .finding-item.low { border-left-color: #10b981; background: #f0fdf4; }
    .severity-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 600; color: white; }
    .severity-badge.critical { background: #dc2626; }
    .severity-badge.high { background: #ea580c; }
    .severity-badge.medium { background: #f59e0b; }
    .severity-badge.low { background: #10b981; }
    .footer { background: #f9f9f9; padding: 30px 40px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 0.9em; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
    th { background: #f9f9f9; font-weight: 600; }
    @media print { body { background: white; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Security Assessment Report</h1>
      <p>${report.config.projectName}</p>
    </div>
    
    <div class="metadata">
      <div class="metadata-item"><span class="metadata-label">Client:</span><span>${report.config.clientName}</span></div>
      <div class="metadata-item"><span class="metadata-label">Assessment Type:</span><span>${report.config.assessmentType}</span></div>
      <div class="metadata-item"><span class="metadata-label">Date:</span><span>${report.config.engagementDate}</span></div>
      <div class="metadata-item"><span class="metadata-label">Overall Severity:</span><span><span class="severity-badge ${report.config.severity}">${report.config.severity.toUpperCase()}</span></span></div>
    </div>
    
    <div class="summary-box">
      <h2>Executive Summary</h2>
      <p>${report.summary}</p>
    </div>
    
    <div class="findings-grid">
      <div class="finding-card critical">
        <div class="finding-card-number">${criticalCount}</div>
        <div>Critical</div>
      </div>
      <div class="finding-card high">
        <div class="finding-card-number">${highCount}</div>
        <div>High</div>
      </div>
      <div class="finding-card medium">
        <div class="finding-card-number">${mediumCount}</div>
        <div>Medium</div>
      </div>
      <div class="finding-card low">
        <div class="finding-card-number">${lowCount}</div>
        <div>Low</div>
      </div>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Detailed Findings</h2>
        ${report.findings.map((finding) => this.generateFindingHTML(finding)).join("")}
      </div>
      
      <div class="section">
        <h2>Recommendations</h2>
        <ol>
          ${report.recommendations.map((rec) => `<li>${rec}</li>`).join("")}
        </ol>
      </div>
    </div>
    
    <div class="footer">
      <p>This report is confidential and intended for authorized recipients only.</p>
      <p>Generated by Professional Security Assessment System</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Export to JSON format
   */
  static exportToJSON(report: ConsolidatedReport): string {
    const jsonData = {
      metadata: {
        client: report.config.clientName,
        project: report.config.projectName,
        assessmentType: report.config.assessmentType,
        date: report.config.engagementDate,
        severity: report.config.severity,
      },
      summary: report.summary,
      statistics: {
        totalFindings: report.findings.length,
        critical: report.findings.filter((f) => f.severity === "critical").length,
        high: report.findings.filter((f) => f.severity === "high").length,
        medium: report.findings.filter((f) => f.severity === "medium").length,
        low: report.findings.filter((f) => f.severity === "low").length,
      },
      findings: report.findings.map((f) => ({
        id: f.id,
        title: f.title,
        severity: f.severity,
        cvss: f.cvss,
        description: f.description,
        impact: f.impact,
        remediation: f.remediation,
        evidence: f.evidence,
        references: f.references || [],
      })),
      recommendations: report.recommendations,
      sections: report.sections.map((s) => ({
        title: s.title,
        content: s.content,
      })),
    };

    return JSON.stringify(jsonData, null, 2);
  }

  /**
   * Export to CSV format
   */
  static exportToCSV(report: ConsolidatedReport): string {
    const headers = [
      "ID",
      "Title",
      "Severity",
      "CVSS Score",
      "Description",
      "Impact",
      "Remediation",
      "Evidence Count",
    ];

    const rows = report.findings.map((f) => [
      f.id,
      `"${f.title}"`,
      f.severity,
      f.cvss,
      `"${f.description.substring(0, 100)}..."`,
      `"${f.impact.substring(0, 100)}..."`,
      `"${f.remediation.substring(0, 100)}..."`,
      f.evidence.length,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return csv;
  }

  /**
   * Export to TXT format
   */
  static exportToTXT(report: ConsolidatedReport): string {
    let txt = "";

    txt += "=".repeat(80) + "\n";
    txt += "SECURITY ASSESSMENT REPORT\n";
    txt += "=".repeat(80) + "\n\n";

    txt += `Client: ${report.config.clientName}\n`;
    txt += `Project: ${report.config.projectName}\n`;
    txt += `Assessment Type: ${report.config.assessmentType}\n`;
    txt += `Date: ${report.config.engagementDate}\n`;
    txt += `Overall Severity: ${report.config.severity.toUpperCase()}\n\n`;

    txt += "-".repeat(80) + "\n";
    txt += "EXECUTIVE SUMMARY\n";
    txt += "-".repeat(80) + "\n";
    txt += report.summary + "\n\n";

    txt += "-".repeat(80) + "\n";
    txt += "FINDINGS SUMMARY\n";
    txt += "-".repeat(80) + "\n";
    txt += `Total Findings: ${report.findings.length}\n`;
    txt += `Critical: ${report.findings.filter((f) => f.severity === "critical").length}\n`;
    txt += `High: ${report.findings.filter((f) => f.severity === "high").length}\n`;
    txt += `Medium: ${report.findings.filter((f) => f.severity === "medium").length}\n`;
    txt += `Low: ${report.findings.filter((f) => f.severity === "low").length}\n\n`;

    txt += "-".repeat(80) + "\n";
    txt += "DETAILED FINDINGS\n";
    txt += "-".repeat(80) + "\n\n";

    for (const finding of report.findings) {
      txt += `[${finding.severity.toUpperCase()}] ${finding.title}\n`;
      txt += `CVSS Score: ${finding.cvss}\n`;
      txt += `ID: ${finding.id}\n\n`;
      txt += `Description:\n${finding.description}\n\n`;
      txt += `Impact:\n${finding.impact}\n\n`;
      txt += `Remediation:\n${finding.remediation}\n\n`;

      if (finding.evidence.length > 0) {
        txt += `Evidence:\n`;
        for (const evidence of finding.evidence) {
          txt += `  - ${evidence}\n`;
        }
        txt += "\n";
      }

      txt += "-".repeat(40) + "\n\n";
    }

    txt += "-".repeat(80) + "\n";
    txt += "RECOMMENDATIONS\n";
    txt += "-".repeat(80) + "\n\n";

    for (let i = 0; i < report.recommendations.length; i++) {
      txt += `${i + 1}. ${report.recommendations[i]}\n\n`;
    }

    txt += "=".repeat(80) + "\n";
    txt += "END OF REPORT\n";
    txt += "=".repeat(80) + "\n";

    return txt;
  }

  /**
   * Export to DOCX format (simplified - returns XML content)
   */
  static exportToDOCX(report: ConsolidatedReport): string {
    const docxContent = `<?xml version="1.0" encoding="UTF-8"?>
<document xmlns="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <body>
    <p>
      <pPr>
        <pStyle val="Heading1"/>
      </pPr>
      <r><t>Security Assessment Report</t></r>
    </p>
    <p>
      <r><t>${report.config.projectName}</t></r>
    </p>
    <p>
      <pPr>
        <pStyle val="Heading2"/>
      </pPr>
      <r><t>Executive Summary</t></r>
    </p>
    <p>
      <r><t>${report.summary}</t></r>
    </p>
    <p>
      <pPr>
        <pStyle val="Heading2"/>
      </pPr>
      <r><t>Detailed Findings</t></r>
    </p>
    ${report.findings.map((f) => this.generateFindingDOCX(f)).join("")}
    <p>
      <pPr>
        <pStyle val="Heading2"/>
      </pPr>
      <r><t>Recommendations</t></r>
    </p>
    ${report.recommendations.map((rec) => `<p><r><t>${rec}</t></r></p>`).join("")}
  </body>
</document>`;

    return docxContent;
  }

  /**
   * Helper: Generate finding HTML
   */
  private static generateFindingHTML(finding: Finding): string {
    return `
      <div class="finding-item ${finding.severity}">
        <h3>${finding.title} <span class="severity-badge ${finding.severity}">${finding.severity.toUpperCase()}</span></h3>
        <p><strong>CVSS Score:</strong> ${finding.cvss}</p>
        <p><strong>Description:</strong> ${finding.description}</p>
        <p><strong>Impact:</strong> ${finding.impact}</p>
        <p><strong>Remediation:</strong> ${finding.remediation}</p>
        ${
          finding.evidence.length > 0
            ? `<p><strong>Evidence:</strong><ul>${finding.evidence.map((e) => `<li>${e}</li>`).join("")}</ul></p>`
            : ""
        }
      </div>
    `;
  }

  /**
   * Helper: Generate finding DOCX
   */
  private static generateFindingDOCX(finding: Finding): string {
    return `
    <p>
      <pPr>
        <pStyle val="Heading3"/>
      </pPr>
      <r><t>${finding.title}</t></r>
    </p>
    <p><r><t>Severity: ${finding.severity.toUpperCase()} | CVSS: ${finding.cvss}</t></r></p>
    <p><r><t>Description: ${finding.description}</t></r></p>
    <p><r><t>Impact: ${finding.impact}</t></r></p>
    <p><r><t>Remediation: ${finding.remediation}</t></r></p>
    `;
  }
}
