/**
 * ISO 27001 Report Export Service
 * Generates professional ISO 27001 compliance reports in multiple formats
 */

import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import * as XLSX from "xlsx";

export interface ISO27001Report {
  organizationName: string;
  reportDate: Date;
  auditScope: string;
  riskScore: number;
  controlsImplemented: number;
  controlsTotal: number;
  findings: Array<{
    id: string;
    title: string;
    severity: "critical" | "high" | "medium" | "low";
    relatedControls: string[];
    remediation: string;
  }>;
  risks: Array<{
    id: string;
    description: string;
    likelihood: number;
    impact: number;
    riskScore: number;
    treatment: "mitigate" | "accept" | "avoid" | "transfer";
  }>;
  controls: Array<{
    id: string;
    clause: string;
    description: string;
    status: "not_implemented" | "partial" | "implemented";
    evidence: string;
  }>;
  soa: Array<{
    controlId: string;
    applicable: boolean;
    justification: string;
  }>;
}

/**
 * Generate PDF report
 */
export async function generateISO27001PDF(
  report: ISO27001Report
): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([612, 792]); // Letter size
    const { width, height } = page.getSize();

    let yPosition = height - 50;

    // Header
    page.drawText("ISO 27001 ISMS Compliance Report", {
      x: 50,
      y: yPosition,
      size: 24,
      color: rgb(0, 0.2, 0.4),
    });
    yPosition -= 40;

    // Organization info
    page.drawText(`Organization: ${report.organizationName}`, {
      x: 50,
      y: yPosition,
      size: 12,
    });
    yPosition -= 20;
    page.drawText(`Report Date: ${report.reportDate.toLocaleDateString()}`, {
      x: 50,
      y: yPosition,
      size: 12,
    });
    yPosition -= 20;
    page.drawText(`Audit Scope: ${report.auditScope}`, {
      x: 50,
      y: yPosition,
      size: 12,
    });
    yPosition -= 40;

    // Executive Summary
    page.drawText("Executive Summary", {
      x: 50,
      y: yPosition,
      size: 14,
      color: rgb(0, 0.2, 0.4),
    });
    yPosition -= 20;

    const summaryText = `Risk Score: ${report.riskScore}/100 | Controls: ${report.controlsImplemented}/${report.controlsTotal} Implemented`;
    page.drawText(summaryText, {
      x: 50,
      y: yPosition,
      size: 11,
    });
    yPosition -= 40;

    // Findings Summary
    page.drawText("Key Findings", {
      x: 50,
      y: yPosition,
      size: 14,
      color: rgb(0, 0.2, 0.4),
    });
    yPosition -= 20;

    report.findings.slice(0, 5).forEach((finding) => {
      if (yPosition < 100) {
        page = pdfDoc.addPage([612, 792]) as PDFPage;
        yPosition = height - 50;
      }

      page.drawText(`• ${finding.title} [${finding.severity.toUpperCase()}]`, {
        x: 50,
        y: yPosition,
        size: 10,
      });
      yPosition -= 15;
    });

    // Footer
    page.drawText("Confidential - For Authorized Use Only", {
      x: 50,
      y: 20,
      size: 8,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
}

/**
 * Generate Excel report
 */
export async function generateISO27001Excel(
  report: ISO27001Report
): Promise<Buffer> {
  try {
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["ISO 27001 Compliance Report"],
      ["Organization", report.organizationName],
      ["Report Date", report.reportDate.toLocaleDateString()],
      ["Audit Scope", report.auditScope],
      ["Risk Score", `${report.riskScore}/100`],
      ["Controls Implemented", `${report.controlsImplemented}/${report.controlsTotal}`],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Findings sheet
    const findingsData = [
      ["ID", "Title", "Severity", "Related Controls", "Remediation"],
      ...report.findings.map((f) => [
        f.id,
        f.title,
        f.severity,
        f.relatedControls.join(", "),
        f.remediation,
      ]),
    ];
    const findingsSheet = XLSX.utils.aoa_to_sheet(findingsData);
    XLSX.utils.book_append_sheet(workbook, findingsSheet, "Findings");

    // Risks sheet
    const risksData = [
      ["ID", "Description", "Likelihood", "Impact", "Risk Score", "Treatment"],
      ...report.risks.map((r) => [
        r.id,
        r.description,
        r.likelihood,
        r.impact,
        r.riskScore,
        r.treatment,
      ]),
    ];
    const risksSheet = XLSX.utils.aoa_to_sheet(risksData);
    XLSX.utils.book_append_sheet(workbook, risksSheet, "Risks");

    // Controls sheet
    const controlsData = [
      ["Control ID", "Clause", "Description", "Status", "Evidence"],
      ...report.controls.map((c) => [
        c.id,
        c.clause,
        c.description,
        c.status,
        c.evidence,
      ]),
    ];
    const controlsSheet = XLSX.utils.aoa_to_sheet(controlsData);
    XLSX.utils.book_append_sheet(workbook, controlsSheet, "Controls");

    // SoA sheet
    const soaData = [
      ["Control ID", "Applicable", "Justification"],
      ...report.soa.map((s) => [s.controlId, s.applicable ? "Yes" : "No", s.justification]),
    ];
    const soaSheet = XLSX.utils.aoa_to_sheet(soaData);
    XLSX.utils.book_append_sheet(workbook, soaSheet, "SoA");

    const excelBuffer = XLSX.write(workbook, { type: "buffer" });
    return excelBuffer as Buffer;
  } catch (error) {
    console.error("Excel generation error:", error);
    throw error;
  }
}

/**
 * Generate HTML report
 */
export function generateISO27001HTML(report: ISO27001Report): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ISO 27001 Compliance Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
    .header { background: #003366; color: white; padding: 20px; border-radius: 5px; }
    .section { background: white; margin: 20px 0; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .metric { background: #f0f0f0; padding: 15px; border-radius: 5px; }
    .metric-value { font-size: 24px; font-weight: bold; color: #003366; }
    .metric-label { font-size: 12px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #003366; color: white; }
    .critical { background: #ffcccc; }
    .high { background: #ffe6cc; }
    .medium { background: #ffffcc; }
    .low { background: #ccffcc; }
    .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ISO 27001 ISMS Compliance Report</h1>
    <p>${report.organizationName} | ${report.reportDate.toLocaleDateString()}</p>
  </div>

  <div class="section">
    <h2>Executive Summary</h2>
    <div class="summary">
      <div class="metric">
        <div class="metric-value">${report.riskScore}</div>
        <div class="metric-label">Risk Score (0-100)</div>
      </div>
      <div class="metric">
        <div class="metric-value">${report.controlsImplemented}/${report.controlsTotal}</div>
        <div class="metric-label">Controls Implemented</div>
      </div>
    </div>
    <p><strong>Audit Scope:</strong> ${report.auditScope}</p>
  </div>

  <div class="section">
    <h2>Key Findings</h2>
    <table>
      <tr>
        <th>ID</th>
        <th>Title</th>
        <th>Severity</th>
        <th>Related Controls</th>
      </tr>
      ${report.findings
        .map(
          (f) => `
        <tr class="${f.severity}">
          <td>${f.id}</td>
          <td>${f.title}</td>
          <td>${f.severity.toUpperCase()}</td>
          <td>${f.relatedControls.join(", ")}</td>
        </tr>
      `
        )
        .join("")}
    </table>
  </div>

  <div class="section">
    <h2>Risk Assessment</h2>
    <table>
      <tr>
        <th>ID</th>
        <th>Description</th>
        <th>Likelihood</th>
        <th>Impact</th>
        <th>Risk Score</th>
        <th>Treatment</th>
      </tr>
      ${report.risks
        .map(
          (r) => `
        <tr>
          <td>${r.id}</td>
          <td>${r.description}</td>
          <td>${r.likelihood}</td>
          <td>${r.impact}</td>
          <td>${r.riskScore}</td>
          <td>${r.treatment}</td>
        </tr>
      `
        )
        .join("")}
    </table>
  </div>

  <div class="section">
    <h2>Controls Status</h2>
    <table>
      <tr>
        <th>Control ID</th>
        <th>Clause</th>
        <th>Description</th>
        <th>Status</th>
      </tr>
      ${report.controls
        .map(
          (c) => `
        <tr>
          <td>${c.id}</td>
          <td>${c.clause}</td>
          <td>${c.description}</td>
          <td>${c.status}</td>
        </tr>
      `
        )
        .join("")}
    </table>
  </div>

  <div class="footer">
    <p>Confidential - For Authorized Use Only</p>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `;
  return html;
}

/**
 * Generate JSON report
 */
export function generateISO27001JSON(report: ISO27001Report): string {
  return JSON.stringify(
    {
      metadata: {
        reportType: "ISO 27001 ISMS Compliance",
        organizationName: report.organizationName,
        reportDate: report.reportDate.toISOString(),
        auditScope: report.auditScope,
        generatedAt: new Date().toISOString(),
      },
      summary: {
        riskScore: report.riskScore,
        controlsImplemented: report.controlsImplemented,
        controlsTotal: report.controlsTotal,
        compliancePercentage: Math.round(
          (report.controlsImplemented / report.controlsTotal) * 100
        ),
      },
      findings: report.findings,
      risks: report.risks,
      controls: report.controls,
      soa: report.soa,
    },
    null,
    2
  );
}
