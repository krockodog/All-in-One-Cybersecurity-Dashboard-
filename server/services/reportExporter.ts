/**
 * Report Exporter Service
 * Exports reports in multiple formats (PDF, DOCX, HTML, JSON)
 */

import { ProfessionalReport, ReportFormat } from '@shared/types/report';

export interface ExportResult {
  format: ReportFormat;
  filename: string;
  content: Buffer | string;
  mimeType: string;
}

export class ReportExporterService {
  /**
   * Export report in specified format
   */
  static async exportReport(report: ProfessionalReport, format: ReportFormat): Promise<ExportResult> {
    switch (format) {
      case 'json':
        return this.exportAsJSON(report);
      case 'html':
        return this.exportAsHTML(report);
      case 'pdf':
        return this.exportAsPDF(report);
      case 'docx':
        return this.exportAsDOCX(report);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Export as JSON
   */
  private static exportAsJSON(report: ProfessionalReport): ExportResult {
    const content = JSON.stringify(report, null, 2);
    const filename = `${report.metadata.title.replace(/\s+/g, '_')}_${Date.now()}.json`;

    return {
      format: 'json',
      filename,
      content,
      mimeType: 'application/json',
    };
  }

  /**
   * Export as HTML
   */
  private static exportAsHTML(report: ProfessionalReport): ExportResult {
    const html = this.generateHTMLReport(report);
    const filename = `${report.metadata.title.replace(/\s+/g, '_')}_${Date.now()}.html`;

    return {
      format: 'html',
      filename,
      content: html,
      mimeType: 'text/html',
    };
  }

  /**
   * Export as PDF (placeholder - would use library like pdfkit)
   */
  private static exportAsPDF(report: ProfessionalReport): ExportResult {
    const html = this.generateHTMLReport(report);
    const filename = `${report.metadata.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

    // In production, would use pdfkit or similar to generate PDF from HTML
    // For now, return HTML that can be printed to PDF
    return {
      format: 'pdf',
      filename,
      content: html,
      mimeType: 'application/pdf',
    };
  }

  /**
   * Export as DOCX (placeholder - would use library like docx)
   */
  private static exportAsDOCX(report: ProfessionalReport): ExportResult {
    const filename = `${report.metadata.title.replace(/\s+/g, '_')}_${Date.now()}.docx`;

    // In production, would use docx library to generate DOCX file
    // For now, return placeholder
    return {
      format: 'docx',
      filename,
      content: Buffer.from('DOCX content placeholder'),
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
  }

  /**
   * Generate HTML report
   */
  private static generateHTMLReport(report: ProfessionalReport): string {
    const criticalCount = report.findings.filter((f) => f.severity === 'critical').length;
    const highCount = report.findings.filter((f) => f.severity === 'high').length;
    const mediumCount = report.findings.filter((f) => f.severity === 'medium').length;
    const lowCount = report.findings.filter((f) => f.severity === 'low').length;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.metadata.title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .page { page-break-after: always; padding: 40px; max-width: 900px; margin: 0 auto; }
        .header { border-bottom: 3px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 32px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
        .subtitle { font-size: 14px; color: #666; }
        .section { margin: 30px 0; }
        .section-title { font-size: 20px; font-weight: bold; color: #1e40af; border-left: 4px solid #1e40af; padding-left: 10px; margin-bottom: 15px; }
        .finding { border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin: 10px 0; }
        .severity-critical { border-left: 4px solid #dc2626; background: #fef2f2; }
        .severity-high { border-left: 4px solid #ea580c; background: #fff7ed; }
        .severity-medium { border-left: 4px solid #eab308; background: #fefce8; }
        .severity-low { border-left: 4px solid #16a34a; background: #f0fdf4; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; margin-right: 5px; }
        .badge-critical { background: #dc2626; color: white; }
        .badge-high { background: #ea580c; color: white; }
        .badge-medium { background: #eab308; color: black; }
        .badge-low { background: #16a34a; color: white; }
        .metric { display: inline-block; margin-right: 30px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1e40af; }
        .metric-label { font-size: 12px; color: #666; }
        .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .table th { background: #f3f4f6; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #1e40af; }
        .table td { padding: 10px; border-bottom: 1px solid #ddd; }
        .table tr:hover { background: #f9fafb; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        .risk-matrix { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0; }
        .risk-item { padding: 15px; border-radius: 5px; text-align: center; }
        @media print { body { margin: 0; padding: 0; } .page { page-break-inside: avoid; } }
    </style>
</head>
<body>
    <!-- Title Page -->
    <div class="page">
        <div class="header">
            <div class="title">${report.metadata.title}</div>
            <div class="subtitle">
                <p>Report ID: ${report.metadata.id}</p>
                <p>Generated: ${new Date(report.metadata.createdAt).toLocaleDateString()}</p>
                <p>Classification: ${report.metadata.classification}</p>
            </div>
        </div>
    </div>

    <!-- Executive Summary -->
    <div class="page">
        <div class="section-title">Executive Summary</div>
        <p>${report.executiveSummary.overview}</p>
        
        <div style="margin: 20px 0;">
            <div class="metric">
                <div class="metric-value">${report.riskMatrix?.overallRiskScore || 0}</div>
                <div class="metric-label">Risk Score</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.findings.length}</div>
                <div class="metric-label">Total Findings</div>
            </div>
            <div class="metric">
                <div class="metric-value">${criticalCount}</div>
                <div class="metric-label">Critical</div>
            </div>
            <div class="metric">
                <div class="metric-value">${highCount}</div>
                <div class="metric-label">High</div>
            </div>
        </div>

        <div class="section">
            <h3 style="margin-bottom: 10px;">Key Findings</h3>
            <ul style="margin-left: 20px;">
                ${report.executiveSummary.keyFindings.map((f) => `<li>${f}</li>`).join('')}
            </ul>
        </div>

        <div class="section">
            <h3 style="margin-bottom: 10px;">Recommendations</h3>
            <ol style="margin-left: 20px;">
                ${report.executiveSummary.recommendations.map((r) => `<li>${r}</li>`).join('')}
            </ol>
        </div>
    </div>

    <!-- Risk Matrix -->
    <div class="page">
        <div class="section-title">Risk Assessment</div>
        <div class="risk-matrix">
            <div class="risk-item" style="background: #fef2f2; border: 2px solid #dc2626;">
                <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${criticalCount}</div>
                <div style="font-size: 12px; color: #666;">Critical</div>
            </div>
            <div class="risk-item" style="background: #fff7ed; border: 2px solid #ea580c;">
                <div style="font-size: 24px; font-weight: bold; color: #ea580c;">${highCount}</div>
                <div style="font-size: 12px; color: #666;">High</div>
            </div>
            <div class="risk-item" style="background: #fefce8; border: 2px solid #eab308;">
                <div style="font-size: 24px; font-weight: bold; color: #eab308;">${mediumCount}</div>
                <div style="font-size: 12px; color: #666;">Medium</div>
            </div>
            <div class="risk-item" style="background: #f0fdf4; border: 2px solid #16a34a;">
                <div style="font-size: 24px; font-weight: bold; color: #16a34a;">${lowCount}</div>
                <div style="font-size: 12px; color: #666;">Low</div>
            </div>
        </div>
    </div>

    <!-- Findings -->
    ${report.findings
      .map(
        (finding) => `
    <div class="page">
        <div class="section-title">${finding.title}</div>
        <div class="finding severity-${finding.severity}">
            <div style="margin-bottom: 10px;">
                <span class="badge badge-${finding.severity}">${finding.severity.toUpperCase()}</span>
                ${finding.cvssScore ? `<span class="badge" style="background: #1e40af; color: white;">CVSS ${finding.cvssScore.baseScore}</span>` : ''}
            </div>
            <p><strong>Description:</strong> ${finding.description}</p>
            <p style="margin-top: 10px;"><strong>Business Impact:</strong> ${finding.impact.businessImpact}</p>
            
            <h4 style="margin-top: 15px; margin-bottom: 10px;">Remediation Steps</h4>
            <h5 style="color: #666; margin-bottom: 5px;">Short-term (0-30 days)</h5>
            <ul style="margin-left: 20px;">
                ${finding.remediation.shortTerm.map((step) => `<li>${step}</li>`).join('')}
            </ul>
            
            <h5 style="color: #666; margin-bottom: 5px; margin-top: 10px;">Long-term (30+ days)</h5>
            <ul style="margin-left: 20px;">
                ${finding.remediation.longTerm.map((step) => `<li>${step}</li>`).join('')}
            </ul>
        </div>
    </div>
    `
      )
      .join('')}

    <!-- Footer -->
    <div class="page">
        <div class="footer">
            <p><strong>Report Classification:</strong> ${report.metadata.classification}</p>
            <p><strong>Generated by:</strong> ${report.metadata.author}</p>
            <p><strong>Report Date:</strong> ${new Date(report.metadata.createdAt).toLocaleDateString()}</p>
            <p style="margin-top: 20px; font-style: italic;">This report contains confidential information and should be handled accordingly.</p>
        </div>
    </div>
</body>
</html>
    `;
  }
}
