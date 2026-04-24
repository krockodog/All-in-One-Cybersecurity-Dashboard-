import { Finding } from "../../drizzle/schema";

export interface ReportData {
  engagementId: string;
  engagementName: string;
  findings: Array<{
    id: number;
    title: string;
    description: string | null;
    severity: "critical" | "high" | "medium" | "low" | "info";
    cvssScore?: string | null;
    remediation: string;
    discoveredAt?: Date | null;
  }>;
  generatedAt: Date;
  testerName: string;
}

export function generateJsonReport(data: ReportData): string {
  return JSON.stringify(
    {
      metadata: {
        engagementId: data.engagementId,
        engagementName: data.engagementName,
        generatedAt: data.generatedAt.toISOString(),
        testerName: data.testerName,
        findingsCount: data.findings.length,
      },
      findings: data.findings.map((f) => ({
        id: f.id,
        title: f.title,
        description: f.description,
        severity: f.severity,
        cvssScore: f.cvssScore || null,
        remediation: f.remediation,
        discoveredAt: f.discoveredAt?.toISOString() || null,
      })),
    },
    null,
    2
  );
}

export function generateHtmlReport(data: ReportData): string {
  const criticalFindings = data.findings.filter((f) => f.severity === "critical").length;
  const highFindings = data.findings.filter((f) => f.severity === "high").length;
  const mediumFindings = data.findings.filter((f) => f.severity === "medium").length;
  const lowFindings = data.findings.filter((f) => f.severity === "low").length;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Penetration Test Report - ${data.engagementName}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .header { background: #1a1a1a; color: #fff; padding: 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 2.5em; }
    .metadata { background: #f5f5f5; padding: 20px; margin: 20px 0; }
    .metadata p { margin: 5px 0; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
    .summary-card { background: #f9f9f9; padding: 20px; border-radius: 5px; text-align: center; }
    .summary-card h3 { margin: 0; font-size: 2em; }
    .summary-card p { margin: 5px 0 0 0; color: #666; }
    .critical { color: #d32f2f; }
    .high { color: #f57c00; }
    .medium { color: #fbc02d; }
    .low { color: #388e3c; }
    .finding { page-break-inside: avoid; margin: 20px 0; padding: 20px; border-left: 4px solid #ccc; }
    .finding.critical { border-left-color: #d32f2f; }
    .finding.high { border-left-color: #f57c00; }
    .finding.medium { border-left-color: #fbc02d; }
    .finding.low { border-left-color: #388e3c; }
    .finding h3 { margin: 0 0 10px 0; }
    .finding p { margin: 5px 0; }
    .cvss { background: #f0f0f0; padding: 10px; border-radius: 3px; margin: 10px 0; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Penetration Test Report</h1>
    <p>${data.engagementName}</p>
  </div>

  <div class="metadata">
    <p><strong>Engagement ID:</strong> ${data.engagementId}</p>
    <p><strong>Generated:</strong> ${data.generatedAt.toLocaleString()}</p>
    <p><strong>Tester:</strong> ${data.testerName}</p>
  </div>

  <div class="summary">
    <div class="summary-card">
      <h3 class="critical">${criticalFindings}</h3>
      <p>Critical</p>
    </div>
    <div class="summary-card">
      <h3 class="high">${highFindings}</h3>
      <p>High</p>
    </div>
    <div class="summary-card">
      <h3 class="medium">${mediumFindings}</h3>
      <p>Medium</p>
    </div>
    <div class="summary-card">
      <h3 class="low">${lowFindings}</h3>
      <p>Low</p>
    </div>
  </div>

  <h2>Findings</h2>
  ${data.findings
    .map(
      (f) => `
    <div class="finding ${f.severity}">
      <h3>${f.title}</h3>
      <p><strong>Severity:</strong> <span class="${f.severity}">${f.severity.toUpperCase()}</span></p>
      ${f.cvssScore ? `<div class="cvss"><strong>CVSS Score:</strong> ${f.cvssScore}</div>` : ""}
      <p><strong>Description:</strong> ${f.description || "N/A"}</p>
      <p><strong>Remediation:</strong> ${f.remediation}</p>
      ${f.discoveredAt ? `<p><strong>Discovered:</strong> ${new Date(f.discoveredAt).toLocaleString()}</p>` : ""}
    </div>
  `
    )
    .join("")}

  <div class="footer">
    <p>This report is confidential and intended for authorized recipients only.</p>
  </div>
</body>
</html>
  `;
}

export function generateCsvReport(data: ReportData): string {
  const headers = ["ID", "Title", "Description", "Severity", "CVSS Score", "Remediation", "Discovered"];
  const rows = data.findings.map((f) => [
    f.id,
    `"${f.title}"`,
    `"${f.description}"`,
    f.severity,
    f.cvssScore || "",
    `"${f.remediation}"`,
    f.discoveredAt?.toISOString() || "",
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
