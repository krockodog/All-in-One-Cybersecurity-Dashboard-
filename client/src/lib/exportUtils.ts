/**
 * Export Utilities for Pentest Reports
 * Supports: JSON, CSV, HTML, PDF
 */

export interface PentestResult {
  target: string;
  type: string;
  timestamp: string;
  tools: Array<{
    name: string;
    status: string;
    output: string;
    findings: any[];
  }>;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface ISO27001Report {
  target: string;
  generatedAt: string;
  complianceScore: number;
  riskSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  findings: Array<{
    title: string;
    description: string;
    severity: string;
  }>;
  affectedControls: string[];
  recommendations: Array<{
    priority: string;
    action: string;
  }>;
}

/**
 * Download helper - creates blob and triggers download
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Pentest Results as JSON
 */
export function exportPentestJSON(result: PentestResult) {
  const filename = `pentest-${result.target}-${new Date().toISOString().split("T")[0]}.json`;
  const content = JSON.stringify(result, null, 2);
  downloadFile(content, filename, "application/json");
}

/**
 * Export Pentest Results as CSV
 */
export function exportPentestCSV(result: PentestResult) {
  const filename = `pentest-${result.target}-${new Date().toISOString().split("T")[0]}.csv`;
  
  let csv = "Tool,Status,Findings Count,Severity\n";
  
  result.tools.forEach((tool) => {
    const findings = tool.findings || [];
    csv += `"${tool.name}","${tool.status}",${findings.length},"${tool.status}"\n`;
  });
  
  csv += "\nSummary\n";
  csv += `Critical,${result.summary.critical}\n`;
  csv += `High,${result.summary.high}\n`;
  csv += `Medium,${result.summary.medium}\n`;
  csv += `Low,${result.summary.low}\n`;
  
  downloadFile(csv, filename, "text/csv");
}

/**
 * Export Pentest Results as HTML
 */
export function exportPentestHTML(result: PentestResult) {
  const filename = `pentest-${result.target}-${new Date().toISOString().split("T")[0]}.html`;
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pentest Report - ${result.target}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #1a1a1a;
      border-bottom: 3px solid #00d4ff;
      padding-bottom: 10px;
    }
    h2 {
      color: #00d4ff;
      margin-top: 30px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .summary-card {
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      font-weight: bold;
    }
    .critical { background: #ffebee; color: #c62828; }
    .high { background: #fff3e0; color: #e65100; }
    .medium { background: #fffde7; color: #f57f17; }
    .low { background: #e3f2fd; color: #1565c0; }
    .tool-result {
      margin: 15px 0;
      padding: 15px;
      border-left: 4px solid #00d4ff;
      background: #f9f9f9;
      border-radius: 4px;
    }
    .tool-name {
      font-weight: bold;
      color: #00d4ff;
    }
    .status {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-left: 10px;
    }
    .status.completed { background: #c8e6c9; color: #2e7d32; }
    .status.failed { background: #ffcdd2; color: #c62828; }
    .status.running { background: #bbdefb; color: #1565c0; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f5f5f5;
      font-weight: bold;
    }
    tr:hover {
      background: #f9f9f9;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔒 Pentest Report</h1>
    <p><strong>Target:</strong> ${result.target}</p>
    <p><strong>Type:</strong> ${result.type}</p>
    <p><strong>Generated:</strong> ${result.timestamp}</p>
    
    <h2>Summary</h2>
    <div class="summary">
      <div class="summary-card critical">
        <div>${result.summary.critical}</div>
        <div>Critical</div>
      </div>
      <div class="summary-card high">
        <div>${result.summary.high}</div>
        <div>High</div>
      </div>
      <div class="summary-card medium">
        <div>${result.summary.medium}</div>
        <div>Medium</div>
      </div>
      <div class="summary-card low">
        <div>${result.summary.low}</div>
        <div>Low</div>
      </div>
    </div>
    
    <h2>Tool Results</h2>
    ${result.tools
      .map(
        (tool) => `
      <div class="tool-result">
        <div class="tool-name">
          ${tool.name}
          <span class="status ${tool.status.toLowerCase()}">${tool.status}</span>
        </div>
        <p><strong>Findings:</strong> ${tool.findings?.length || 0}</p>
        ${tool.output ? `<p><strong>Output:</strong></p><pre>${tool.output}</pre>` : ""}
      </div>
    `
      )
      .join("")}
    
    <div class="footer">
      <p>Generated by CyberDash Security Framework</p>
      <p>This report is confidential and intended for authorized use only.</p>
    </div>
  </div>
</body>
</html>`;
  
  downloadFile(html, filename, "text/html");
}

/**
 * Export ISO 27001 Report as JSON
 */
export function exportISO27001JSON(report: ISO27001Report) {
  const filename = `iso27001-${report.target}-${new Date().toISOString().split("T")[0]}.json`;
  const content = JSON.stringify(report, null, 2);
  downloadFile(content, filename, "application/json");
}

/**
 * Export ISO 27001 Report as HTML
 */
export function exportISO27001HTML(report: ISO27001Report) {
  const filename = `iso27001-${report.target}-${new Date().toISOString().split("T")[0]}.html`;
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ISO 27001 Report - ${report.target}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 4px solid #00d4ff;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      margin: 0 0 10px 0;
      color: #1a1a1a;
    }
    .meta {
      color: #666;
      font-size: 14px;
    }
    .compliance-score {
      display: flex;
      align-items: center;
      gap: 30px;
      margin: 30px 0;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      color: white;
    }
    .score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      font-weight: bold;
    }
    .score-text h2 {
      margin: 0 0 5px 0;
      color: white;
    }
    .risk-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .risk-card {
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .risk-card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
    }
    .risk-card .number {
      font-size: 32px;
      font-weight: bold;
    }
    .critical { background: #ffebee; color: #c62828; }
    .high { background: #fff3e0; color: #e65100; }
    .medium { background: #fffde7; color: #f57f17; }
    .low { background: #e3f2fd; color: #1565c0; }
    h2 {
      color: #00d4ff;
      border-bottom: 2px solid #00d4ff;
      padding-bottom: 10px;
      margin-top: 30px;
    }
    .finding {
      margin: 15px 0;
      padding: 15px;
      border-left: 4px solid #00d4ff;
      background: #f9f9f9;
      border-radius: 4px;
    }
    .finding-title {
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 5px;
    }
    .finding-desc {
      color: #666;
      font-size: 14px;
    }
    .controls-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin: 15px 0;
    }
    .control {
      padding: 10px;
      background: #f0f0f0;
      border-left: 3px solid #00d4ff;
      border-radius: 4px;
      font-size: 14px;
    }
    .recommendation {
      margin: 15px 0;
      padding: 15px;
      background: #e8f5e9;
      border-left: 4px solid #4caf50;
      border-radius: 4px;
    }
    .rec-priority {
      font-weight: bold;
      color: #2e7d32;
      margin-bottom: 5px;
    }
    .rec-action {
      color: #555;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #999;
      font-size: 12px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 ISO 27001 ISMS Assessment Report</h1>
      <div class="meta">
        <p><strong>Target:</strong> ${report.target}</p>
        <p><strong>Generated:</strong> ${new Date(report.generatedAt).toLocaleString()}</p>
      </div>
    </div>
    
    <div class="compliance-score">
      <div class="score-circle">${Math.round(report.complianceScore)}%</div>
      <div class="score-text">
        <h2>Overall Compliance Score</h2>
        <p>This score reflects the organization's adherence to ISO 27001 controls based on identified findings.</p>
      </div>
    </div>
    
    <h2>Risk Summary</h2>
    <div class="risk-grid">
      <div class="risk-card critical">
        <h3>Critical</h3>
        <div class="number">${report.riskSummary.critical}</div>
      </div>
      <div class="risk-card high">
        <h3>High</h3>
        <div class="number">${report.riskSummary.high}</div>
      </div>
      <div class="risk-card medium">
        <h3>Medium</h3>
        <div class="number">${report.riskSummary.medium}</div>
      </div>
      <div class="risk-card low">
        <h3>Low</h3>
        <div class="number">${report.riskSummary.low}</div>
      </div>
    </div>
    
    <h2>Key Findings</h2>
    ${report.findings
      .map(
        (finding) => `
      <div class="finding">
        <div class="finding-title">${finding.title}</div>
        <div class="finding-desc">${finding.description}</div>
      </div>
    `
      )
      .join("")}
    
    <h2>Affected ISO 27001 Controls</h2>
    <div class="controls-grid">
      ${report.affectedControls.map((control) => `<div class="control">${control}</div>`).join("")}
    </div>
    
    <h2>Remediation Recommendations</h2>
    ${report.recommendations
      .map(
        (rec) => `
      <div class="recommendation">
        <div class="rec-priority">${rec.priority}</div>
        <div class="rec-action">${rec.action}</div>
      </div>
    `
      )
      .join("")}
    
    <div class="footer">
      <p>This report is confidential and intended for authorized use only.</p>
      <p>Generated by CyberDash Security Framework - ISO 27001 ISMS Assessment Tool</p>
    </div>
  </div>
</body>
</html>`;
  
  downloadFile(html, filename, "text/html");
}

/**
 * Export ISO 27001 Report as CSV
 */
export function exportISO27001CSV(report: ISO27001Report) {
  const filename = `iso27001-${report.target}-${new Date().toISOString().split("T")[0]}.csv`;
  
  let csv = "ISO 27001 ISMS Assessment Report\n";
  csv += `Target,${report.target}\n`;
  csv += `Generated,${report.generatedAt}\n`;
  csv += `Compliance Score,${report.complianceScore}%\n\n`;
  
  csv += "Risk Summary\n";
  csv += `Critical,${report.riskSummary.critical}\n`;
  csv += `High,${report.riskSummary.high}\n`;
  csv += `Medium,${report.riskSummary.medium}\n`;
  csv += `Low,${report.riskSummary.low}\n\n`;
  
  csv += "Findings\n";
  csv += "Title,Description,Severity\n";
  report.findings.forEach((finding) => {
    csv += `"${finding.title}","${finding.description}","${finding.severity}"\n`;
  });
  
  csv += "\nAffected Controls\n";
  report.affectedControls.forEach((control) => {
    csv += `${control}\n`;
  });
  
  csv += "\nRecommendations\n";
  csv += "Priority,Action\n";
  report.recommendations.forEach((rec) => {
    csv += `"${rec.priority}","${rec.action}"\n`;
  });
  
  downloadFile(csv, filename, "text/csv");
}
