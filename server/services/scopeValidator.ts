/**
 * Scope Validator with KI-Agent
 * Validates scope authorization and legality
 */

import { invokeLLM } from '../_core/llm';

export interface ScopeInput {
  target: string; // Domain, IP, Network, Range
  type: 'domain' | 'ip' | 'network' | 'range';
  description?: string;
  authorization?: string; // Authorization document/reference
}

export interface ScopeValidation {
  isValid: boolean;
  isAuthorized: boolean;
  isLegal: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  warnings: string[];
  analysis: string;
  timestamp: Date;
}

export class ScopeValidator {
  /**
   * Validate scope with KI-Agent
   */
  async validateScope(input: ScopeInput): Promise<ScopeValidation> {
    // Parse scope
    const parsedScope = this.parseScope(input);

    // KI-Agent validation
    const aiAnalysis = await this.runKIAgent(input, parsedScope);

    // Compile validation result
    return {
      isValid: aiAnalysis.isValid,
      isAuthorized: aiAnalysis.isAuthorized,
      isLegal: aiAnalysis.isLegal,
      riskLevel: aiAnalysis.riskLevel,
      recommendations: aiAnalysis.recommendations,
      warnings: aiAnalysis.warnings,
      analysis: aiAnalysis.analysis,
      timestamp: new Date(),
    };
  }

  /**
   * Parse scope input
   */
  private parseScope(input: ScopeInput) {
    const target = input.target.trim();

    // Detect type if not provided
    let type = input.type;
    if (!type) {
      if (target.includes('/')) {
        type = 'network';
      } else if (target.includes('-')) {
        type = 'range';
      } else if (this.isIP(target)) {
        type = 'ip';
      } else {
        type = 'domain';
      }
    }

    return {
      target,
      type,
      isPrivateIP: this.isPrivateIP(target),
      isLocalhost: this.isLocalhost(target),
      isReserved: this.isReserved(target),
    };
  }

  /**
   * Run KI-Agent for validation
   */
  private async runKIAgent(
    input: ScopeInput,
    parsedScope: any
  ): Promise<any> {
    const prompt = `
You are a Penetration Testing Authorization Validator. Analyze the following scope and determine:
1. Is the scope valid and well-defined?
2. Is there proper authorization for testing?
3. Are there legal/compliance concerns?
4. What is the risk level?

Scope Details:
- Target: ${input.target}
- Type: ${input.type}
- Description: ${input.description || 'Not provided'}
- Authorization: ${input.authorization || 'Not provided'}

Parsed Analysis:
- Is Private IP: ${parsedScope.isPrivateIP}
- Is Localhost: ${parsedScope.isLocalhost}
- Is Reserved: ${parsedScope.isReserved}

IMPORTANT CHECKS:
1. Authorization Check: Is there explicit authorization for testing this target?
2. Legality Check: Are there any legal concerns (e.g., testing third-party systems without permission)?
3. Scope Clarity: Is the scope clearly defined and testable?
4. Risk Assessment: What is the risk level of testing this scope?

Respond with JSON format:
{
  "isValid": boolean,
  "isAuthorized": boolean,
  "isLegal": boolean,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "recommendations": ["recommendation1", "recommendation2"],
  "warnings": ["warning1", "warning2"],
  "analysis": "detailed analysis text"
}
`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content:
              'You are a Penetration Testing Authorization Validator. Provide security-first analysis.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.choices[0].message.content;
      // Parse JSON from response
      const jsonMatch = typeof content === 'string' ? content.match(/\{[\s\S]*\}/) : null;
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content as string);
    } catch (error) {
      console.error('KI-Agent validation failed:', error);
      return {
        isValid: false,
        isAuthorized: false,
        isLegal: false,
        riskLevel: 'critical',
        recommendations: [
          'Manual review required',
          'Contact security team for authorization verification',
        ],
        warnings: ['KI-Agent validation failed', 'Unable to verify authorization'],
        analysis: 'Validation failed. Please provide explicit authorization documentation.',
      };
    }
  }

  /**
   * Check if string is an IP address
   */
  private isIP(target: string): boolean {
    const ipv4Regex =
      /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    return ipv4Regex.test(target);
  }

  /**
   * Check if IP is private
   */
  private isPrivateIP(target: string): boolean {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./,
      /^fc00:/i,
      /^fe80:/i,
    ];

    return privateRanges.some(range => range.test(target));
  }

  /**
   * Check if target is localhost
   */
  private isLocalhost(target: string): boolean {
    return (
      target === 'localhost' ||
      target === '127.0.0.1' ||
      target === '::1' ||
      target === '0.0.0.0'
    );
  }

  /**
   * Check if IP is reserved
   */
  private isReserved(target: string): boolean {
    const reservedRanges = [
      /^0\./,
      /^255\./,
      /^224\./,
      /^240\./,
      /^255\.255\.255\.255$/,
    ];

    return reservedRanges.some(range => range.test(target));
  }

  /**
   * Generate authorization checklist
   */
  generateAuthorizationChecklist(): string[] {
    return [
      '✓ Written authorization from target organization',
      '✓ Defined scope boundaries (in-scope vs out-of-scope)',
      '✓ Testing window/timeframe agreed upon',
      '✓ Emergency contact information provided',
      '✓ Compliance requirements documented (GDPR, HIPAA, etc.)',
      '✓ Data handling procedures agreed',
      '✓ Incident response procedures defined',
      '✓ Liability/indemnification clauses reviewed',
      '✓ NDA signed if required',
      '✓ Legal review completed',
    ];
  }

  /**
   * Generate legal compliance checklist
   */
  generateLegalComplianceChecklist(): string[] {
    return [
      '✓ Testing is authorized by target organization',
      '✓ No unauthorized access to third-party systems',
      '✓ Compliance with local laws and regulations',
      '✓ Data protection regulations (GDPR, CCPA, etc.) considered',
      '✓ No testing of systems outside agreed scope',
      '✓ Proper handling of sensitive data discovered',
      '✓ Incident notification procedures in place',
      '✓ Legal counsel review completed',
      '✓ Insurance coverage verified',
      '✓ Contractual obligations understood',
    ];
  }
}

export const createScopeValidator = (): ScopeValidator => {
  return new ScopeValidator();
};
