/**
 * Export Service
 * Export scan results to multiple formats (TXT, CSV, JSON, HTML)
 */

export interface ExportOptions {
  format: 'txt' | 'csv' | 'json' | 'html';
  includeTimestamp: boolean;
  includeMetadata: boolean;
  prettyPrint: boolean;
}

export class ExportService {
  /**
   * Export results to TXT format
   */
  static exportToTXT(data: any, options: Partial<ExportOptions> = {}): string {
    const opts: ExportOptions = {
      format: 'txt',
      includeTimestamp: true,
      includeMetadata: true,
      prettyPrint: true,
      ...options,
    };

    let output = '';

    // Header
    if (opts.includeMetadata) {
      output += '═══════════════════════════════════════════════════════════════\n';
      output += 'CYBERSECURITY ASSESSMENT REPORT\n';
      output += '═══════════════════════════════════════════════════════════════\n\n';

      if (opts.includeTimestamp) {
        output += `Generated: ${new Date().toISOString()}\n`;
        output += `Report ID: ${this.generateReportID()}\n\n`;
      }
    }

    // Content
    output += this.formatTXTContent(data, opts.prettyPrint);

    // Footer
    if (opts.includeMetadata) {
      output += '\n═══════════════════════════════════════════════════════════════\n';
      output += 'END OF REPORT\n';
      output += '═══════════════════════════════════════════════════════════════\n';
    }

    return output;
  }

  /**
   * Export results to CSV format
   */
  static exportToCSV(data: any[], options: Partial<ExportOptions> = {}): string {
    const opts: ExportOptions = {
      format: 'csv',
      includeTimestamp: true,
      includeMetadata: false,
      prettyPrint: false,
      ...options,
    };

    const rows: string[] = [];

    // Header
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0]);
      rows.push(headers.map((h) => `"${h}"`).join(','));

      // Data rows
      data.forEach((item) => {
        const values = headers.map((h) => {
          const value = item[h];
          if (typeof value === 'string') {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return JSON.stringify(value);
        });
        rows.push(values.join(','));
      });
    }

    return rows.join('\n');
  }

  /**
   * Export results to JSON format
   */
  static exportToJSON(data: any, options: Partial<ExportOptions> = {}): string {
    const opts: ExportOptions = {
      format: 'json',
      includeTimestamp: true,
      includeMetadata: true,
      prettyPrint: true,
      ...options,
    };

    const output: any = {};

    if (opts.includeMetadata) {
      output.metadata = {
        generated: new Date().toISOString(),
        reportID: this.generateReportID(),
        format: 'json',
      };
    }

    output.data = data;

    return opts.prettyPrint ? JSON.stringify(output, null, 2) : JSON.stringify(output);
  }

  /**
   * Export results to HTML format
   */
  static exportToHTML(data: any, options: Partial<ExportOptions> = {}): string {
    const opts: ExportOptions = {
      format: 'html',
      includeTimestamp: true,
      includeMetadata: true,
      prettyPrint: true,
      ...options,
    };

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cybersecurity Assessment Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .metadata {
            background: white;
            padding: 15px;
            border-left: 4px solid #667eea;
            margin-bottom: 20px;
            border-radius: 3px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            margin-bottom: 20px;
            border-radius: 3px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        th {
            background: #667eea;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
        }
        tr:hover {
            background: #f9f9f9;
        }
        .section {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 3px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-top: 0;
        }
        .severity-critical {
            color: #dc3545;
            font-weight: bold;
        }
        .severity-high {
            color: #fd7e14;
            font-weight: bold;
        }
        .severity-medium {
            color: #ffc107;
            font-weight: bold;
        }
        .severity-low {
            color: #28a745;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Cybersecurity Assessment Report</h1>
        <p>Professional Security Analysis</p>
    </div>`;

    if (opts.includeMetadata) {
      html += `
    <div class="metadata">
        <strong>Generated:</strong> ${new Date().toISOString()}<br>
        <strong>Report ID:</strong> ${this.generateReportID()}<br>
        <strong>Format:</strong> HTML
    </div>`;
    }

    // Add data sections
    if (typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        html += `
    <div class="section">
        <h2>${this.formatKey(key)}</h2>
        ${this.formatHTMLValue(value)}
    </div>`;
      });
    }

    html += `
    <div class="footer">
        <p>This report contains confidential information and should be handled accordingly.</p>
        <p>© 2024 Cybersecurity Dashboard. All rights reserved.</p>
    </div>
</body>
</html>`;

    return html;
  }

  /**
   * Format TXT content
   */
  private static formatTXTContent(data: any, prettyPrint: boolean): string {
    let output = '';

    if (typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        output += `\n${this.formatKey(key)}\n`;
        output += '─'.repeat(50) + '\n';

        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            output += `\n[${index + 1}] ${JSON.stringify(item, null, prettyPrint ? 2 : 0)}\n`;
          });
        } else if (typeof value === 'object') {
          output += JSON.stringify(value, null, prettyPrint ? 2 : 0) + '\n';
        } else {
          output += `${value}\n`;
        }
      });
    } else {
      output += JSON.stringify(data, null, prettyPrint ? 2 : 0);
    }

    return output;
  }

  /**
   * Format HTML value
   */
  private static formatHTMLValue(value: any): string {
    if (Array.isArray(value)) {
      let html = '<table><tr>';
      if (value.length > 0 && typeof value[0] === 'object') {
        const keys = Object.keys(value[0]);
        keys.forEach((k) => {
          html += `<th>${this.formatKey(k)}</th>`;
        });
        html += '</tr>';

        value.forEach((item) => {
          html += '<tr>';
          keys.forEach((k) => {
            const cellValue = item[k];
            const cellClass = typeof cellValue === 'string' && cellValue.includes('critical') ? ' class="severity-critical"' : '';
            html += `<td${cellClass}>${cellValue}</td>`;
          });
          html += '</tr>';
        });
      }
      html += '</table>';
      return html;
    } else if (typeof value === 'object') {
      return `<pre>${JSON.stringify(value, null, 2)}</pre>`;
    } else {
      return `<p>${value}</p>`;
    }
  }

  /**
   * Format key
   */
  private static formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  /**
   * Generate report ID
   */
  private static generateReportID(): string {
    return `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  /**
   * Export to file (returns filename and content)
   */
  static exportToFile(
    data: any,
    format: 'txt' | 'csv' | 'json' | 'html' = 'txt'
  ): { filename: string; content: string } {
    const timestamp = new Date().toISOString().split('T')[0];
    const reportID = this.generateReportID();

    let content = '';
    let filename = '';

    switch (format) {
      case 'txt':
        content = this.exportToTXT(data);
        filename = `report_${reportID}.txt`;
        break;
      case 'csv':
        content = this.exportToCSV(Array.isArray(data) ? data : [data]);
        filename = `report_${reportID}.csv`;
        break;
      case 'json':
        content = this.exportToJSON(data);
        filename = `report_${reportID}.json`;
        break;
      case 'html':
        content = this.exportToHTML(data);
        filename = `report_${reportID}.html`;
        break;
    }

    return { filename, content };
  }
}

export const exportService = new ExportService();
