/**
 * Result Export & Storage Service
 * Export tool execution results in multiple formats
 */

import { storagePut, storageGet } from '../storage';

export interface ExportOptions {
  format: 'json' | 'csv' | 'txt' | 'html' | 'pdf';
  includeMetadata: boolean;
  includeTimestamp: boolean;
}

export interface ToolResult {
  sessionId: string;
  toolId: string;
  toolName: string;
  status: string;
  output: string;
  parameters: Record<string, any>;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export class ResultExportService {
  /**
   * Export result to JSON
   */
  exportToJSON(result: ToolResult, options: Partial<ExportOptions> = {}): string {
    const data: any = {
      tool: {
        id: result.toolId,
        name: result.toolName,
      },
      execution: {
        sessionId: result.sessionId,
        status: result.status,
        startTime: result.startTime,
        endTime: result.endTime,
        duration: result.duration,
      },
      output: result.output,
    };

    if (options.includeMetadata) {
      data.parameters = result.parameters;
    }

    if (options.includeTimestamp) {
      data.exportedAt = new Date();
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export result to CSV
   */
  exportToCSV(result: ToolResult, options: Partial<ExportOptions> = {}): string {
    const lines: string[] = [];

    // Header
    lines.push('Tool Execution Result');
    lines.push(`Tool,${result.toolName}`);
    lines.push(`Session ID,${result.sessionId}`);
    lines.push(`Status,${result.status}`);
    lines.push(`Start Time,${result.startTime}`);
    lines.push(`End Time,${result.endTime || 'N/A'}`);
    lines.push(`Duration (ms),${result.duration || 'N/A'}`);

    if (options.includeMetadata) {
      lines.push('');
      lines.push('Parameters');
      Object.entries(result.parameters).forEach(([key, value]) => {
        lines.push(`${key},"${value}"`);
      });
    }

    lines.push('');
    lines.push('Output');
    lines.push(result.output.replace(/"/g, '""')); // Escape quotes

    if (options.includeTimestamp) {
      lines.push('');
      lines.push(`Exported At,${new Date()}`);
    }

    return lines.join('\n');
  }

  /**
   * Export result to TXT
   */
  exportToTXT(result: ToolResult, options: Partial<ExportOptions> = {}): string {
    const lines: string[] = [];

    // Header
    lines.push('═'.repeat(80));
    lines.push(`TOOL EXECUTION RESULT`);
    lines.push('═'.repeat(80));
    lines.push('');

    // Tool Info
    lines.push(`Tool: ${result.toolName} (${result.toolId})`);
    lines.push(`Session ID: ${result.sessionId}`);
    lines.push(`Status: ${result.status}`);
    lines.push(`Start Time: ${result.startTime}`);
    lines.push(`End Time: ${result.endTime || 'N/A'}`);
    lines.push(`Duration: ${result.duration ? `${result.duration}ms` : 'N/A'}`);

    if (options.includeMetadata) {
      lines.push('');
      lines.push('─'.repeat(80));
      lines.push('PARAMETERS');
      lines.push('─'.repeat(80));
      Object.entries(result.parameters).forEach(([key, value]) => {
        lines.push(`${key}: ${value}`);
      });
    }

    lines.push('');
    lines.push('─'.repeat(80));
    lines.push('OUTPUT');
    lines.push('─'.repeat(80));
    lines.push(result.output);

    if (options.includeTimestamp) {
      lines.push('');
      lines.push('─'.repeat(80));
      lines.push(`Exported At: ${new Date()}`);
    }

    return lines.join('\n');
  }

  /**
   * Export result to HTML
   */
  exportToHTML(result: ToolResult, options: Partial<ExportOptions> = {}): string {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${result.toolName} - Execution Result</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .info-item {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #3498db;
    }
    .info-label {
      font-weight: bold;
      color: #555;
      font-size: 0.9em;
      text-transform: uppercase;
    }
    .info-value {
      color: #2c3e50;
      margin-top: 5px;
      font-family: 'Courier New', monospace;
    }
    .output-section {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .parameters {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .parameters table {
      width: 100%;
      border-collapse: collapse;
    }
    .parameters th,
    .parameters td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .parameters th {
      background: #e8f4f8;
      font-weight: bold;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 0.9em;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${result.toolName} - Execution Result</h1>
    
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Session ID</div>
        <div class="info-value">${result.sessionId}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Status</div>
        <div class="info-value">${result.status}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Start Time</div>
        <div class="info-value">${result.startTime}</div>
      </div>
      <div class="info-item">
        <div class="info-label">End Time</div>
        <div class="info-value">${result.endTime || 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Duration</div>
        <div class="info-value">${result.duration ? `${result.duration}ms` : 'N/A'}</div>
      </div>
    </div>

    ${
      options.includeMetadata
        ? `
    <div class="parameters">
      <h2>Parameters</h2>
      <table>
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(result.parameters)
            .map(
              ([key, value]) => `
          <tr>
            <td>${key}</td>
            <td>${value}</td>
          </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    `
        : ''
    }

    <h2>Output</h2>
    <div class="output-section">${result.output}</div>

    ${
      options.includeTimestamp
        ? `
    <div class="footer">
      <p>Exported at: ${new Date()}</p>
    </div>
    `
        : ''
    }
  </div>
</body>
</html>`;

    return html;
  }

  /**
   * Export result to S3
   */
  async exportToS3(
    result: ToolResult,
    format: 'json' | 'csv' | 'txt' | 'html',
    options: Partial<ExportOptions> = {}
  ): Promise<{ key: string; url: string }> {
    let content: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = this.exportToJSON(result, options);
        mimeType = 'application/json';
        break;
      case 'csv':
        content = this.exportToCSV(result, options);
        mimeType = 'text/csv';
        break;
      case 'html':
        content = this.exportToHTML(result, options);
        mimeType = 'text/html';
        break;
      case 'txt':
      default:
        content = this.exportToTXT(result, options);
        mimeType = 'text/plain';
    }

    const fileName = `${result.toolId}-${result.sessionId}.${format}`;
    const key = `tool-results/${result.toolId}/${fileName}`;

    return storagePut(key, content, mimeType);
  }

  /**
   * Get exported result from S3
   */
  async getExportedResult(key: string): Promise<string> {
    const result = await storageGet(key);
    return result.url;
  }
}

export const createResultExportService = (): ResultExportService => {
  return new ResultExportService();
};
