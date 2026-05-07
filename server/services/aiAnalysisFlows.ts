/**
 * Dedicated AI Analysis Flows
 * Specialized AI workflows for Finding, Vulnerability, and Remediation analysis
 */

import { invokeLLM } from '../_core/llm';

export interface AnalysisResult {
  id: string;
  type: 'finding' | 'vulnerability' | 'remediation';
  input: any;
  analysis: string;
  recommendations: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  timestamp: Date;
}

export class AIAnalysisFlows {
  /**
   * Analyze Security Finding
   */
  static async analyzeFinding(finding: any): Promise<AnalysisResult> {
    const prompt = `
You are a cybersecurity expert. Analyze the following security finding and provide:
1. Detailed analysis of the finding
2. Potential impact assessment
3. Attack scenarios
4. Remediation steps
5. Risk rating (critical/high/medium/low)

Finding:
- Type: ${finding.type}
- Description: ${finding.description}
- Location: ${finding.location}
- Evidence: ${finding.evidence}

Provide a comprehensive analysis in JSON format with keys: analysis, recommendations, severity, confidence.
`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a cybersecurity expert providing detailed security analysis.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'finding_analysis',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                analysis: { type: 'string', description: 'Detailed analysis' },
                recommendations: { type: 'array', items: { type: 'string' }, description: 'Remediation steps' },
                severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                confidence: { type: 'number', minimum: 0, maximum: 1 },
              },
              required: ['analysis', 'recommendations', 'severity', 'confidence'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;

      return {
        id: `analysis-${Date.now()}`,
        type: 'finding',
        input: finding,
        analysis: parsed.analysis,
        recommendations: parsed.recommendations,
        severity: parsed.severity,
        confidence: parsed.confidence,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[AI Analysis] Finding analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze Vulnerability
   */
  static async analyzeVulnerability(vulnerability: any): Promise<AnalysisResult> {
    const prompt = `
You are a vulnerability researcher. Analyze the following vulnerability and provide:
1. Detailed vulnerability analysis
2. CVSS v3.1 score and vector
3. Affected systems and versions
4. Known exploits and POC availability
5. Mitigation strategies
6. Detection methods

Vulnerability:
- CVE: ${vulnerability.cve}
- Title: ${vulnerability.title}
- Description: ${vulnerability.description}
- Affected Component: ${vulnerability.component}
- Version Range: ${vulnerability.versionRange}

Provide a comprehensive analysis in JSON format with keys: analysis, recommendations, severity, confidence.
`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a vulnerability researcher providing detailed vulnerability analysis.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'vulnerability_analysis',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                analysis: { type: 'string', description: 'Detailed vulnerability analysis' },
                recommendations: { type: 'array', items: { type: 'string' }, description: 'Mitigation steps' },
                severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                confidence: { type: 'number', minimum: 0, maximum: 1 },
              },
              required: ['analysis', 'recommendations', 'severity', 'confidence'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;

      return {
        id: `analysis-${Date.now()}`,
        type: 'vulnerability',
        input: vulnerability,
        analysis: parsed.analysis,
        recommendations: parsed.recommendations,
        severity: parsed.severity,
        confidence: parsed.confidence,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[AI Analysis] Vulnerability analysis failed:', error);
      throw error;
    }
  }

  /**
   * Generate Remediation Plan
   */
  static async generateRemediationPlan(findings: any[]): Promise<AnalysisResult> {
    const findingsSummary = findings
      .map(
        (f, i) =>
          `${i + 1}. ${f.type} - ${f.title} (Severity: ${f.severity})`
      )
      .join('\n');

    const prompt = `
You are a security remediation expert. Create a comprehensive remediation plan for the following findings:

${findingsSummary}

Provide:
1. Executive summary of findings
2. Prioritized remediation roadmap (by risk and effort)
3. Quick wins (high impact, low effort)
4. Long-term improvements
5. Resource requirements
6. Timeline estimates
7. Success metrics

Provide a comprehensive plan in JSON format with keys: analysis, recommendations, severity, confidence.
`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a security remediation expert providing detailed remediation plans.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'remediation_plan',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                analysis: { type: 'string', description: 'Remediation plan' },
                recommendations: { type: 'array', items: { type: 'string' }, description: 'Action items' },
                severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                confidence: { type: 'number', minimum: 0, maximum: 1 },
              },
              required: ['analysis', 'recommendations', 'severity', 'confidence'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;

      return {
        id: `analysis-${Date.now()}`,
        type: 'remediation',
        input: { findings },
        analysis: parsed.analysis,
        recommendations: parsed.recommendations,
        severity: parsed.severity,
        confidence: parsed.confidence,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[AI Analysis] Remediation plan generation failed:', error);
      throw error;
    }
  }

  /**
   * Batch analyze findings
   */
  static async batchAnalyzeFindings(findings: any[]): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];

    for (const finding of findings) {
      try {
        const result = await this.analyzeFinding(finding);
        results.push(result);
      } catch (error) {
        console.error(`[AI Analysis] Failed to analyze finding ${finding.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Batch analyze vulnerabilities
   */
  static async batchAnalyzeVulnerabilities(vulnerabilities: any[]): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];

    for (const vuln of vulnerabilities) {
      try {
        const result = await this.analyzeVulnerability(vuln);
        results.push(result);
      } catch (error) {
        console.error(`[AI Analysis] Failed to analyze vulnerability ${vuln.cve}:`, error);
      }
    }

    return results;
  }

  /**
   * Compare multiple analyses
   */
  static async compareAnalyses(analyses: AnalysisResult[]): Promise<string> {
    const summary = analyses
      .map(
        (a, i) =>
          `Analysis ${i + 1} (${a.type}): Severity=${a.severity}, Confidence=${a.confidence}`
      )
      .join('\n');

    const prompt = `
Compare the following security analyses and provide:
1. Common themes and patterns
2. Highest priority items
3. Overlapping recommendations
4. Unique risks and concerns

${summary}

Provide a comprehensive comparison summary.
`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a security analyst comparing multiple analyses.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return response.choices[0].message.content as string;
    } catch (error) {
      console.error('[AI Analysis] Comparison failed:', error);
      throw error;
    }
  }

  /**
   * Generate executive summary
   */
  static async generateExecutiveSummary(analyses: AnalysisResult[]): Promise<string> {
    const criticalCount = analyses.filter((a) => a.severity === 'critical').length;
    const highCount = analyses.filter((a) => a.severity === 'high').length;
    const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;

    const prompt = `
Generate an executive summary for a security assessment with the following results:
- Total Analyses: ${analyses.length}
- Critical Findings: ${criticalCount}
- High Findings: ${highCount}
- Average Confidence: ${avgConfidence.toFixed(2)}

Key findings:
${analyses
  .slice(0, 5)
  .map((a) => `- ${a.type}: ${a.analysis.substring(0, 100)}...`)
  .join('\n')}

Provide a concise executive summary suitable for C-level stakeholders (max 300 words).
`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a security executive providing executive summaries.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return response.choices[0].message.content as string;
    } catch (error) {
      console.error('[AI Analysis] Executive summary generation failed:', error);
      throw error;
    }
  }
}

export const aiAnalysisFlows = AIAnalysisFlows;
