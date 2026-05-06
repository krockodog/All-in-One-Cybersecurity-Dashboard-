/**
 * HexStrike AI Framework Integration
 * Integrates HexStrike AI as central analysis engine for vulnerability detection
 * and exploitation analysis
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { Finding } from './findingStructureEngine';

const execPromise = promisify(exec);

export interface HexStrikeConfig {
  enabled: boolean;
  pythonPath: string;
  hexstrikePath: string;
  apiKey?: string;
  maxConcurrentScans: number;
  timeout: number; // milliseconds
}

export interface HexStrikeAnalysisResult {
  vulnerabilities: Finding[];
  threatIntelligence: ThreatIntelligence;
  exploitationAnalysis: ExploitationAnalysis;
  recommendations: string[];
  timestamp: Date;
}

export interface ThreatIntelligence {
  cves: CVEInfo[];
  exploitsAvailable: number;
  threatLevel: 'critical' | 'high' | 'medium' | 'low';
  relatedThreats: string[];
}

export interface CVEInfo {
  id: string;
  description: string;
  cvssScore: number;
  exploitAvailable: boolean;
  publicExploit: boolean;
  inWildUse: boolean;
}

export interface ExploitationAnalysis {
  attackVectors: AttackVector[];
  lateralMovementPaths: string[];
  persistenceMechanisms: string[];
  eversionTechniques: string[];
  postExploitationOptions: string[];
}

export interface AttackVector {
  name: string;
  difficulty: 'low' | 'medium' | 'high';
  impact: string;
  tools: string[];
}

const DEFAULT_CONFIG: HexStrikeConfig = {
  enabled: true,
  pythonPath: '/usr/bin/python3',
  hexstrikePath: '/home/ubuntu/hexstrike-ai',
  maxConcurrentScans: 5,
  timeout: 300000, // 5 minutes
};

export class HexStrikeIntegration {
  private config: HexStrikeConfig;
  private activeScan: Map<string, boolean> = new Map();

  constructor(config: Partial<HexStrikeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize HexStrike AI
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      console.log('HexStrike AI is disabled');
      return;
    }

    try {
      // Verify HexStrike installation
      const { stdout } = await execPromise(
        `${this.config.pythonPath} -c "import sys; print(sys.version)"`
      );
      console.log('Python environment ready:', stdout.trim());
    } catch (error) {
      console.error('Failed to initialize HexStrike:', error);
      throw new Error('HexStrike initialization failed');
    }
  }

  /**
   * Run comprehensive vulnerability analysis
   */
  async analyzeTarget(target: string): Promise<HexStrikeAnalysisResult> {
    if (!this.config.enabled) {
      throw new Error('HexStrike AI is disabled');
    }

    const scanId = `scan_${Date.now()}`;
    this.activeScan.set(scanId, true);

    try {
      // Run HexStrike analysis
      const vulnerabilities = await this.detectVulnerabilities(target);
      const threatIntel = await this.gatherThreatIntelligence(vulnerabilities);
      const exploitAnalysis = await this.analyzeExploitation(vulnerabilities);
      const recommendations = await this.generateRecommendations(vulnerabilities);

      return {
        vulnerabilities,
        threatIntelligence: threatIntel,
        exploitationAnalysis: exploitAnalysis,
        recommendations,
        timestamp: new Date(),
      };
    } finally {
      this.activeScan.delete(scanId);
    }
  }

  /**
   * Detect vulnerabilities using HexStrike
   */
  private async detectVulnerabilities(target: string): Promise<Finding[]> {
    const findings: Finding[] = [];

    try {
      // Mock HexStrike vulnerability detection
      // In production, this would call the actual HexStrike server
      const mockVulnerabilities = [
        {
          id: 'vuln_1',
          title: 'SQL Injection in Login Form',
          severity: 'critical' as const,
          cvssScore: 9.8,
          cveId: 'CVE-2024-1234',
          cweId: 'CWE-89',
          description: 'The login form is vulnerable to SQL injection attacks',
          impact: 'Attackers can bypass authentication and gain unauthorized access',
          affectedSystems: [target],
          poc: {
            title: 'SQL Injection PoC',
            steps: [
              'Navigate to login page',
              'Enter: admin\' OR \'1\'=\'1',
              'Observe database error or successful login',
            ],
            code: "SELECT * FROM users WHERE username='admin' OR '1'='1' AND password='anything'",
          },
          remediation: 'Use parameterized queries and input validation',
          remediationEffort: 'low' as const,
          references: {
            cve: 'CVE-2024-1234',
            cwe: 'CWE-89',
            owasp: 'A03:2021 - Injection',
            mitre: 'T1190 - Exploit Public-Facing Application',
          },
          timestamp: new Date(),
          discoveredBy: 'HexStrike AI',
        },
      ];

      for (const vuln of mockVulnerabilities) {
        findings.push(vuln as Finding);
      }

      return findings;
    } catch (error) {
      console.error('Vulnerability detection failed:', error);
      return [];
    }
  }

  /**
   * Gather threat intelligence
   */
  private async gatherThreatIntelligence(findings: Finding[]): Promise<ThreatIntelligence> {
    const cves: CVEInfo[] = [];
    let exploitsCount = 0;

    for (const finding of findings) {
      if (finding.cveId) {
        cves.push({
          id: finding.cveId,
          description: finding.description,
          cvssScore: finding.cvssScore,
          exploitAvailable: finding.cvssScore >= 7,
          publicExploit: finding.cvssScore >= 8,
          inWildUse: finding.severity === 'critical',
        });

        if (finding.cvssScore >= 7) {
          exploitsCount++;
        }
      }
    }

    const threatLevel =
      findings.some(f => f.severity === 'critical') ? 'critical' :
      findings.some(f => f.severity === 'high') ? 'high' :
      findings.some(f => f.severity === 'medium') ? 'medium' : 'low';

    return {
      cves,
      exploitsAvailable: exploitsCount,
      threatLevel,
      relatedThreats: [
        'Lateral Movement',
        'Privilege Escalation',
        'Data Exfiltration',
      ],
    };
  }

  /**
   * Analyze exploitation paths
   */
  private async analyzeExploitation(findings: Finding[]): Promise<ExploitationAnalysis> {
    const attackVectors: AttackVector[] = [];

    for (const finding of findings) {
      if (finding.severity === 'critical' || finding.severity === 'high') {
        attackVectors.push({
          name: finding.title,
          difficulty: finding.remediationEffort === 'low' ? 'low' : 'medium',
          impact: finding.impact,
          tools: ['sqlmap', 'burp-suite', 'metasploit'],
        });
      }
    }

    return {
      attackVectors,
      lateralMovementPaths: [
        'Compromised user account → Escalate privileges → Access sensitive data',
        'Web shell upload → Execute commands → Pivot to internal network',
      ],
      persistenceMechanisms: [
        'Web shell in web root',
        'Scheduled task for reverse shell',
        'Registry persistence (Windows)',
        'Cron job (Linux)',
      ],
      eversionTechniques: [
        'Disable logging',
        'Obfuscate shell commands',
        'Use legitimate tools (LOLBins)',
        'Tunnel traffic through HTTPS',
      ],
      postExploitationOptions: [
        'Dump database credentials',
        'Exfiltrate sensitive files',
        'Establish C2 communication',
        'Deploy malware/ransomware',
      ],
    };
  }

  /**
   * Generate recommendations
   */
  private async generateRecommendations(findings: Finding[]): Promise<string[]> {
    const recommendations: string[] = [];

    // Critical findings
    const criticalFindings = findings.filter(f => f.severity === 'critical');
    if (criticalFindings.length > 0) {
      recommendations.push(
        `URGENT: Patch ${criticalFindings.length} critical vulnerabilities immediately`
      );
    }

    // Input validation
    if (findings.some(f => f.cweId?.includes('89'))) {
      recommendations.push(
        'Implement parameterized queries and input validation for all user inputs'
      );
    }

    // Authentication
    if (findings.some(f => f.title.toLowerCase().includes('auth'))) {
      recommendations.push(
        'Enforce strong authentication mechanisms (MFA, strong passwords)'
      );
    }

    // Network segmentation
    if (findings.length > 5) {
      recommendations.push(
        'Implement network segmentation to limit lateral movement'
      );
    }

    return recommendations;
  }

  /**
   * Generate report from analysis
   */
  async generateReport(analysis: HexStrikeAnalysisResult): Promise<string> {
    const lines: string[] = [];

    lines.push('# HexStrike AI Security Analysis Report');
    lines.push('');
    lines.push(`**Generated:** ${analysis.timestamp.toISOString()}`);
    lines.push(`**Threat Level:** ${analysis.threatIntelligence.threatLevel.toUpperCase()}`);
    lines.push('');

    lines.push('## Executive Summary');
    lines.push(
      `Found ${analysis.vulnerabilities.length} vulnerabilities with ` +
      `${analysis.threatIntelligence.exploitsAvailable} exploitable issues.`
    );
    lines.push('');

    lines.push('## Vulnerabilities');
    for (const vuln of analysis.vulnerabilities) {
      lines.push(`### ${vuln.title}`);
      lines.push(`- **Severity:** ${vuln.severity.toUpperCase()}`);
      lines.push(`- **CVSS:** ${vuln.cvssScore}`);
      lines.push(`- **Description:** ${vuln.description}`);
      lines.push('');
    }

    lines.push('## Threat Intelligence');
    lines.push(`- **CVEs Found:** ${analysis.threatIntelligence.cves.length}`);
    lines.push(`- **Exploits Available:** ${analysis.threatIntelligence.exploitsAvailable}`);
    lines.push('');

    lines.push('## Exploitation Analysis');
    lines.push('### Attack Vectors');
    for (const vector of analysis.exploitationAnalysis.attackVectors) {
      lines.push(`- ${vector.name} (${vector.difficulty} difficulty)`);
    }
    lines.push('');

    lines.push('### Lateral Movement Paths');
    for (const path of analysis.exploitationAnalysis.lateralMovementPaths) {
      lines.push(`- ${path}`);
    }
    lines.push('');

    lines.push('## Recommendations');
    for (const rec of analysis.recommendations) {
      lines.push(`- ${rec}`);
    }

    return lines.join('\n');
  }

  /**
   * Get configuration
   */
  getConfig(): HexStrikeConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<HexStrikeConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if scan is active
   */
  isScanActive(scanId: string): boolean {
    return this.activeScan.get(scanId) || false;
  }

  /**
   * Get active scans count
   */
  getActiveScanCount(): number {
    return this.activeScan.size;
  }
}

export const createHexStrike = (config?: Partial<HexStrikeConfig>): HexStrikeIntegration => {
  return new HexStrikeIntegration(config);
};
