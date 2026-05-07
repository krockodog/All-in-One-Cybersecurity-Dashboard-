/**
 * PDF Report Exporter Service
 * Professional PDF generation with branding and layouts
 */

import { ConsolidatedReport } from "./professionalReportGenerator";

export interface PDFExportOptions {
  includeTableOfContents: boolean;
  includeExecutiveSummary: boolean;
  includeDetailedFindings: boolean;
  includeRiskMatrix: boolean;
  includeRemediationRoadmap: boolean;
  includeRecommendations: boolean;
  companyLogo?: string;
  companyName?: string;
  footerText?: string;
}

export class PDFReportExporter {
  /**
   * Generate professional PDF report
   */
  static generatePDFContent(
    report: ConsolidatedReport,
    options: PDFExportOptions = {
      includeTableOfContents: true,
      includeExecutiveSummary: true,
      includeDetailedFindings: true,
      includeRiskMatrix: true,
      includeRemediationRoadmap: true,
      includeRecommendations: true,
    }
  ): string {
    let content = "";

    // Cover Page
    content += this.generateCoverPage(report, options);

    // Table of Contents
    if (options.includeTableOfContents) {
      content += this.generateTableOfContents(report, options);
    }

    // Executive Summary
    if (options.includeExecutiveSummary) {
      content += this.generateExecutiveSummaryPage(report);
    }

    // Findings Overview
    content += this.generateFindingsOverviewPage(report);

    // Detailed Findings
    if (options.includeDetailedFindings) {
      content += this.generateDetailedFindingsPages(report);
    }

    // Risk Matrix
    if (options.includeRiskMatrix) {
      content += this.generateRiskMatrixPage(report);
    }

    // Remediation Roadmap
    if (options.includeRemediationRoadmap) {
      content += this.generateRemediationRoadmapPage(report);
    }

    // Recommendations
    if (options.includeRecommendations) {
      content += this.generateRecommendationsPage(report);
    }

    // Appendices
    content += this.generateAppendices(report);

    return content;
  }

  /**
   * Generate cover page
   */
  private static generateCoverPage(
    report: ConsolidatedReport,
    options: PDFExportOptions
  ): string {
    return `
<div style="page-break-after: always; text-align: center; padding: 100px 50px; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; min-height: 100vh; display: flex; flex-direction: column; justify-content: center;">
  ${
    options.companyLogo
      ? `<img src="${options.companyLogo}" style="max-width: 200px; margin-bottom: 40px;" />`
      : ""
  }
  <h1 style="font-size: 3em; margin: 20px 0; font-weight: bold;">Security Assessment Report</h1>
  <h2 style="font-size: 2em; margin: 20px 0; opacity: 0.9;">${report.config.projectName}</h2>
  <div style="margin: 60px 0; font-size: 1.2em; opacity: 0.8;">
    <p><strong>Client:</strong> ${report.config.clientName}</p>
    <p><strong>Assessment Type:</strong> ${report.config.assessmentType}</p>
    <p><strong>Date:</strong> ${report.config.engagementDate}</p>
  </div>
  <div style="margin-top: 80px; opacity: 0.7; font-size: 0.9em;">
    <p>This report is confidential and intended for authorized recipients only.</p>
    ${options.companyName ? `<p>${options.companyName}</p>` : ""}
  </div>
</div>
`;
  }

  /**
   * Generate table of contents
   */
  private static generateTableOfContents(
    report: ConsolidatedReport,
    options: PDFExportOptions
  ): string {
    let toc = `
<div style="page-break-after: always; padding: 50px;">
  <h1 style="color: #1e3c72; margin-bottom: 30px;">Table of Contents</h1>
  <ol style="font-size: 1.1em; line-height: 2;">
`;

    let pageNum = 3;

    if (options.includeExecutiveSummary) {
      toc += `<li><a href="#executive-summary">Executive Summary</a> .......................... ${pageNum++}</li>`;
    }

    toc += `<li><a href="#findings-overview">Findings Overview</a> .......................... ${pageNum++}</li>`;

    if (options.includeDetailedFindings) {
      toc += `<li><a href="#detailed-findings">Detailed Findings</a> .......................... ${pageNum++}</li>`;
    }

    if (options.includeRiskMatrix) {
      toc += `<li><a href="#risk-matrix">Risk Matrix</a> .......................... ${pageNum++}</li>`;
    }

    if (options.includeRemediationRoadmap) {
      toc += `<li><a href="#remediation-roadmap">Remediation Roadmap</a> .......................... ${pageNum++}</li>`;
    }

    if (options.includeRecommendations) {
      toc += `<li><a href="#recommendations">Recommendations</a> .......................... ${pageNum++}</li>`;
    }

    toc += `<li><a href="#appendices">Appendices</a> .......................... ${pageNum}</li>`;
    toc += `</ol></div>`;

    return toc;
  }

  /**
   * Generate executive summary page
   */
  private static generateExecutiveSummaryPage(report: ConsolidatedReport): string {
    return `
<div style="page-break-after: always; padding: 50px;">
  <h1 id="executive-summary" style="color: #1e3c72; margin-bottom: 30px; border-bottom: 2px solid #2a5298; padding-bottom: 10px;">Executive Summary</h1>
  <div style="background: #f0f4ff; border-left: 4px solid #2a5298; padding: 20px; margin: 20px 0; border-radius: 4px;">
    <p style="font-size: 1.05em; line-height: 1.8;">${report.summary}</p>
  </div>
  <div style="margin-top: 40px;">
    <h3 style="color: #2a5298; margin-bottom: 15px;">Key Metrics</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="background: #f9f9f9;">
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Findings</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${report.findings.length}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Critical Issues</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center; color: #dc2626; font-weight: bold;">${report.findings.filter((f) => f.severity === "critical").length}</td>
      </tr>
      <tr style="background: #f9f9f9;">
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>High Issues</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center; color: #ea580c; font-weight: bold;">${report.findings.filter((f) => f.severity === "high").length}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Medium Issues</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center; color: #f59e0b; font-weight: bold;">${report.findings.filter((f) => f.severity === "medium").length}</td>
      </tr>
      <tr style="background: #f9f9f9;">
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Low Issues</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center; color: #10b981; font-weight: bold;">${report.findings.filter((f) => f.severity === "low").length}</td>
      </tr>
    </table>
  </div>
</div>
`;
  }

  /**
   * Generate findings overview page
   */
  private static generateFindingsOverviewPage(report: ConsolidatedReport): string {
    return `
<div style="page-break-after: always; padding: 50px;">
  <h1 id="findings-overview" style="color: #1e3c72; margin-bottom: 30px; border-bottom: 2px solid #2a5298; padding-bottom: 10px;">Findings Overview</h1>
  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0;">
    <div style="background: #fef2f2; border-top: 3px solid #dc2626; padding: 20px; border-radius: 8px; text-align: center;">
      <div style="font-size: 2em; font-weight: bold; color: #dc2626;">${report.findings.filter((f) => f.severity === "critical").length}</div>
      <div style="color: #666; margin-top: 10px;">Critical</div>
    </div>
    <div style="background: #fef3f2; border-top: 3px solid #ea580c; padding: 20px; border-radius: 8px; text-align: center;">
      <div style="font-size: 2em; font-weight: bold; color: #ea580c;">${report.findings.filter((f) => f.severity === "high").length}</div>
      <div style="color: #666; margin-top: 10px;">High</div>
    </div>
    <div style="background: #fffbf0; border-top: 3px solid #f59e0b; padding: 20px; border-radius: 8px; text-align: center;">
      <div style="font-size: 2em; font-weight: bold; color: #f59e0b;">${report.findings.filter((f) => f.severity === "medium").length}</div>
      <div style="color: #666; margin-top: 10px;">Medium</div>
    </div>
    <div style="background: #f0fdf4; border-top: 3px solid #10b981; padding: 20px; border-radius: 8px; text-align: center;">
      <div style="font-size: 2em; font-weight: bold; color: #10b981;">${report.findings.filter((f) => f.severity === "low").length}</div>
      <div style="color: #666; margin-top: 10px;">Low</div>
    </div>
  </div>
  <h3 style="color: #2a5298; margin-top: 40px; margin-bottom: 20px;">Top Findings</h3>
  ${report.findings
    .slice(0, 5)
    .map(
      (finding) => `
    <div style="background: #f9f9f9; padding: 15px; margin-bottom: 15px; border-left: 3px solid ${this.getSeverityColor(finding.severity)}; border-radius: 4px;">
      <strong>${finding.title}</strong>
      <span style="float: right; background: ${this.getSeverityColor(finding.severity)}; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.9em;">${finding.severity.toUpperCase()}</span>
      <div style="margin-top: 5px; font-size: 0.9em; color: #666;">CVSS Score: ${finding.cvss}</div>
    </div>
  `
    )
    .join("")}
</div>
`;
  }

  /**
   * Generate detailed findings pages
   */
  private static generateDetailedFindingsPages(report: ConsolidatedReport): string {
    let content = `<div style="page-break-after: always; padding: 50px;">
  <h1 id="detailed-findings" style="color: #1e3c72; margin-bottom: 30px; border-bottom: 2px solid #2a5298; padding-bottom: 10px;">Detailed Findings</h1>`;

    for (const finding of report.findings) {
      content += `
  <div style="background: ${this.getSeverityBackground(finding.severity)}; border-left: 4px solid ${this.getSeverityColor(finding.severity)}; padding: 20px; margin-bottom: 20px; border-radius: 4px; page-break-inside: avoid;">
    <h3 style="color: #1e3c72; margin-bottom: 10px;">
      ${finding.title}
      <span style="float: right; background: ${this.getSeverityColor(finding.severity)}; color: white; padding: 4px 12px; border-radius: 3px; font-size: 0.9em;">${finding.severity.toUpperCase()}</span>
    </h3>
    <div style="margin-bottom: 10px; font-size: 0.95em;">
      <strong>CVSS Score:</strong> ${finding.cvss} | <strong>ID:</strong> ${finding.id}
    </div>
    <div style="margin-bottom: 15px;">
      <strong>Description:</strong>
      <p style="margin-top: 5px;">${finding.description}</p>
    </div>
    <div style="margin-bottom: 15px;">
      <strong>Impact:</strong>
      <p style="margin-top: 5px;">${finding.impact}</p>
    </div>
    <div style="margin-bottom: 15px;">
      <strong>Remediation:</strong>
      <p style="margin-top: 5px;">${finding.remediation}</p>
    </div>
    ${
      finding.evidence.length > 0
        ? `
    <div>
      <strong>Evidence:</strong>
      <ul style="margin-top: 5px;">
        ${finding.evidence.map((e) => `<li>${e}</li>`).join("")}
      </ul>
    </div>
    `
        : ""
    }
  </div>
`;
    }

    content += `</div>`;
    return content;
  }

  /**
   * Generate risk matrix page
   */
  private static generateRiskMatrixPage(report: ConsolidatedReport): string {
    return `
<div style="page-break-after: always; padding: 50px;">
  <h1 id="risk-matrix" style="color: #1e3c72; margin-bottom: 30px; border-bottom: 2px solid #2a5298; padding-bottom: 10px;">Risk Matrix</h1>
  <p style="margin-bottom: 20px;">The risk matrix below illustrates the relationship between likelihood and impact of identified vulnerabilities.</p>
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="background: #f9f9f9;">
      <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Severity</th>
      <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Count</th>
      <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Percentage</th>
      <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Action Required</th>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; color: #dc2626; font-weight: bold;">Critical</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${report.findings.filter((f) => f.severity === "critical").length}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${((report.findings.filter((f) => f.severity === "critical").length / report.findings.length) * 100).toFixed(1)}%</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">Immediate</td>
    </tr>
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; border: 1px solid #ddd; color: #ea580c; font-weight: bold;">High</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${report.findings.filter((f) => f.severity === "high").length}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${((report.findings.filter((f) => f.severity === "high").length / report.findings.length) * 100).toFixed(1)}%</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">Within 30 days</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; color: #f59e0b; font-weight: bold;">Medium</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${report.findings.filter((f) => f.severity === "medium").length}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${((report.findings.filter((f) => f.severity === "medium").length / report.findings.length) * 100).toFixed(1)}%</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">Within 90 days</td>
    </tr>
    <tr style="background: #f9f9f9;">
      <td style="padding: 10px; border: 1px solid #ddd; color: #10b981; font-weight: bold;">Low</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${report.findings.filter((f) => f.severity === "low").length}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${((report.findings.filter((f) => f.severity === "low").length / report.findings.length) * 100).toFixed(1)}%</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">Within 6 months</td>
    </tr>
  </table>
</div>
`;
  }

  /**
   * Generate remediation roadmap page
   */
  private static generateRemediationRoadmapPage(report: ConsolidatedReport): string {
    return `
<div style="page-break-after: always; padding: 50px;">
  <h1 id="remediation-roadmap" style="color: #1e3c72; margin-bottom: 30px; border-bottom: 2px solid #2a5298; padding-bottom: 10px;">Remediation Roadmap</h1>
  <h3 style="color: #2a5298; margin-top: 20px; margin-bottom: 15px;">Phase 1: Immediate (0-30 days)</h3>
  <p>Address all critical vulnerabilities to prevent potential security breaches.</p>
  <ul>
    ${report.findings
      .filter((f) => f.severity === "critical")
      .map((f) => `<li>${f.title}</li>`)
      .join("")}
  </ul>
  
  <h3 style="color: #2a5298; margin-top: 20px; margin-bottom: 15px;">Phase 2: Short-term (30-90 days)</h3>
  <p>Remediate high-severity vulnerabilities to reduce overall risk exposure.</p>
  <ul>
    ${report.findings
      .filter((f) => f.severity === "high")
      .map((f) => `<li>${f.title}</li>`)
      .join("")}
  </ul>
  
  <h3 style="color: #2a5298; margin-top: 20px; margin-bottom: 15px;">Phase 3: Medium-term (90-180 days)</h3>
  <p>Address medium-severity issues as part of regular security improvements.</p>
  <ul>
    ${report.findings
      .filter((f) => f.severity === "medium")
      .slice(0, 5)
      .map((f) => `<li>${f.title}</li>`)
      .join("")}
  </ul>
  
  <h3 style="color: #2a5298; margin-top: 20px; margin-bottom: 15px;">Phase 4: Long-term (180+ days)</h3>
  <p>Implement low-severity fixes and continuous security improvements.</p>
</div>
`;
  }

  /**
   * Generate recommendations page
   */
  private static generateRecommendationsPage(report: ConsolidatedReport): string {
    return `
<div style="page-break-after: always; padding: 50px;">
  <h1 id="recommendations" style="color: #1e3c72; margin-bottom: 30px; border-bottom: 2px solid #2a5298; padding-bottom: 10px;">Recommendations</h1>
  <ol style="line-height: 2;">
    ${report.recommendations.map((rec) => `<li style="margin-bottom: 15px;">${rec}</li>`).join("")}
  </ol>
</div>
`;
  }

  /**
   * Generate appendices
   */
  private static generateAppendices(report: ConsolidatedReport): string {
    return `
<div style="page-break-after: always; padding: 50px;">
  <h1 id="appendices" style="color: #1e3c72; margin-bottom: 30px; border-bottom: 2px solid #2a5298; padding-bottom: 10px;">Appendices</h1>
  
  <h3 style="color: #2a5298; margin-top: 20px; margin-bottom: 15px;">Assessment Methodology</h3>
  <p>This security assessment was conducted using industry-standard methodologies and best practices. The assessment included vulnerability scanning, configuration review, and security control evaluation.</p>
  
  <h3 style="color: #2a5298; margin-top: 20px; margin-bottom: 15px;">CVSS Scoring</h3>
  <p>Vulnerabilities are scored using the Common Vulnerability Scoring System (CVSS) v3.1. Scores range from 0.0 (no severity) to 10.0 (critical severity).</p>
  
  <h3 style="color: #2a5298; margin-top: 20px; margin-bottom: 15px;">References</h3>
  <ul>
    <li>OWASP Top 10: https://owasp.org/www-project-top-ten/</li>
    <li>CVSS v3.1 Calculator: https://www.first.org/cvss/calculator/3.1</li>
    <li>NIST Cybersecurity Framework: https://www.nist.gov/cyberframework</li>
    <li>CIS Controls: https://www.cisecurity.org/cis-controls/</li>
  </ul>
  
  <h3 style="color: #2a5298; margin-top: 20px; margin-bottom: 15px;">Disclaimer</h3>
  <p>This report is confidential and intended for authorized recipients only. The findings and recommendations in this report are based on the assessment conducted on the specified date. Security vulnerabilities may change over time, and organizations should implement continuous monitoring and regular assessments to maintain security posture.</p>
</div>
`;
  }

  /**
   * Helper: Get severity color
   */
  private static getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      critical: "#dc2626",
      high: "#ea580c",
      medium: "#f59e0b",
      low: "#10b981",
    };
    return colors[severity] || "#999";
  }

  /**
   * Helper: Get severity background
   */
  private static getSeverityBackground(severity: string): string {
    const backgrounds: Record<string, string> = {
      critical: "#fef2f2",
      high: "#fef3f2",
      medium: "#fffbf0",
      low: "#f0fdf4",
    };
    return backgrounds[severity] || "#f9f9f9";
  }
}
