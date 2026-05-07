/**
 * Finding Structure Engine - PoC & Finding-Aufbau-Regeln
 * Ensures consistent, professional finding structure in reports
 */

export interface PoC {
  title: string;
  steps: string[];
  code?: string;
  screenshots?: string[]; // Base64 encoded
  tools?: string[];
}

export interface Finding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cvssScore: number; // 0-10
  cvssVector?: string;
  cveId?: string;
  cweId?: string;
  description: string;
  impact: string;
  affectedSystems: string[];
  poc: PoC;
  remediation: string;
  remediationEffort: 'low' | 'medium' | 'high';
  references: {
    cve?: string;
    cwe?: string;
    owasp?: string;
    mitre?: string;
    custom?: string[];
  };
  timestamp: Date;
  discoveredBy: string;
}

export interface FindingTemplate {
  id: string;
  name: string;
  fields: string[];
  customFields?: Record<string, any>;
  required: string[];
}

// CVSS v3.1 Severity Mapping
const CVSS_SEVERITY_MAP: Record<number, 'critical' | 'high' | 'medium' | 'low' | 'info'> = {
  0: 'info',
  1: 'low',
  2: 'low',
  3: 'low',
  4: 'medium',
  5: 'medium',
  6: 'medium',
  7: 'high',
  8: 'high',
  9: 'critical',
  10: 'critical',
};

// Default Template
const DEFAULT_TEMPLATE: FindingTemplate = {
  id: 'default',
  name: 'Standard Finding Template',
  fields: [
    'title',
    'severity',
    'cvssScore',
    'description',
    'impact',
    'affectedSystems',
    'poc',
    'remediation',
    'references',
  ],
  required: [
    'title',
    'severity',
    'description',
    'impact',
    'poc',
    'remediation',
  ],
};

export class FindingStructureEngine {
  private templates: Map<string, FindingTemplate> = new Map();

  constructor() {
    this.templates.set('default', DEFAULT_TEMPLATE);
  }

  /**
   * Create a new finding with validation
   */
  createFinding(data: Partial<Finding>): Finding {
    const finding: Finding = {
      id: data.id || this.generateId(),
      title: data.title || '',
      severity: data.severity || 'medium',
      cvssScore: data.cvssScore || 5.0,
      cvssVector: data.cvssVector,
      cveId: data.cveId,
      cweId: data.cweId,
      description: data.description || '',
      impact: data.impact || '',
      affectedSystems: data.affectedSystems || [],
      poc: data.poc || { title: '', steps: [] },
      remediation: data.remediation || '',
      remediationEffort: data.remediationEffort || 'medium',
      references: data.references || { custom: [] },
      timestamp: data.timestamp || new Date(),
      discoveredBy: data.discoveredBy || 'Unknown',
    };

    // Validate required fields
    this.validateFinding(finding);

    // Auto-calculate severity from CVSS if not provided
    if (!data.severity && data.cvssScore) {
      finding.severity = this.getSeverityFromCVSS(data.cvssScore);
    }

    return finding;
  }

  /**
   * Validate finding structure
   */
  private validateFinding(finding: Finding): void {
    const template = this.templates.get('default')!;
    
    for (const field of template.required) {
      const value = (finding as any)[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        throw new Error(`Required field missing: ${field}`);
      }
    }

    // Validate CVSS score
    if (finding.cvssScore < 0 || finding.cvssScore > 10) {
      throw new Error('CVSS score must be between 0 and 10');
    }

    // Validate severity
    const validSeverities = ['critical', 'high', 'medium', 'low', 'info'];
    if (!validSeverities.includes(finding.severity)) {
      throw new Error(`Invalid severity: ${finding.severity}`);
    }
  }

  /**
   * Get severity from CVSS score
   */
  getSeverityFromCVSS(score: number): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    const rounded = Math.round(score);
    return CVSS_SEVERITY_MAP[rounded] || 'medium';
  }

  /**
   * Calculate CVSS v3.1 score
   */
  calculateCVSS(vector: string): number {
    // Simplified CVSS calculation
    // Full implementation would parse the vector string
    const baseScore = 5.0; // Default
    return baseScore;
  }

  /**
   * Format finding for report
   */
  formatFinding(finding: Finding): string {
    const lines: string[] = [];

    lines.push(`# ${finding.title}`);
    lines.push('');
    lines.push(`**Severity:** ${finding.severity.toUpperCase()} (CVSS ${finding.cvssScore})`);
    
    if (finding.cveId) {
      lines.push(`**CVE:** ${finding.cveId}`);
    }
    if (finding.cweId) {
      lines.push(`**CWE:** ${finding.cweId}`);
    }
    
    lines.push('');
    lines.push('## Description');
    lines.push(finding.description);
    lines.push('');
    
    lines.push('## Impact');
    lines.push(finding.impact);
    lines.push('');
    
    lines.push('## Affected Systems');
    for (const system of finding.affectedSystems) {
      lines.push(`- ${system}`);
    }
    lines.push('');
    
    lines.push('## Proof of Concept');
    lines.push(`### ${finding.poc.title}`);
    lines.push('');
    lines.push('**Steps:**');
    for (let i = 0; i < finding.poc.steps.length; i++) {
      lines.push(`${i + 1}. ${finding.poc.steps[i]}`);
    }
    
    if (finding.poc.code) {
      lines.push('');
      lines.push('**Code:**');
      lines.push('```');
      lines.push(finding.poc.code);
      lines.push('```');
    }
    
    if (finding.poc.screenshots && finding.poc.screenshots.length > 0) {
      lines.push('');
      lines.push('**Screenshots:**');
      for (let i = 0; i < finding.poc.screenshots.length; i++) {
        lines.push(`![Screenshot ${i + 1}](data:image/png;base64,${finding.poc.screenshots[i].substring(0, 50)}...)`);
      }
    }
    
    lines.push('');
    lines.push('## Remediation');
    lines.push(finding.remediation);
    lines.push(`**Effort:** ${finding.remediationEffort}`);
    lines.push('');
    
    lines.push('## References');
    if (finding.references.cve) {
      lines.push(`- **CVE:** https://cve.mitre.org/cgi-bin/cvename.cgi?name=${finding.references.cve}`);
    }
    if (finding.references.cwe) {
      lines.push(`- **CWE:** https://cwe.mitre.org/data/definitions/${finding.references.cwe}.html`);
    }
    if (finding.references.owasp) {
      lines.push(`- **OWASP:** ${finding.references.owasp}`);
    }
    if (finding.references.mitre) {
      lines.push(`- **MITRE ATT&CK:** ${finding.references.mitre}`);
    }
    if (finding.references.custom) {
      for (const ref of finding.references.custom) {
        lines.push(`- ${ref}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Create template
   */
  createTemplate(template: FindingTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get template
   */
  getTemplate(id: string): FindingTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * List all templates
   */
  listTemplates(): FindingTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Batch format findings
   */
  formatFindings(findings: Finding[]): string {
    return findings.map(f => this.formatFinding(f)).join('\n\n---\n\n');
  }
}

export const createFindingEngine = (): FindingStructureEngine => {
  return new FindingStructureEngine();
};
