/**
 * ISO 27001 ISMS (Information Security Management System)
 * Comprehensive framework for ISO 27001 compliance reporting
 */

export interface ISO27001Control {
  id: string; // A.5.1, A.5.2, etc.
  clause: string; // 5, 6, 7, etc.
  title: string;
  description: string;
  category: 'administrative' | 'technical' | 'physical';
  implementationStatus: 'not-implemented' | 'partial' | 'implemented';
  effectiveness: number; // 0-100%
  relatedFindings: string[]; // Finding IDs
  evidence: string[];
  notes: string;
}

export interface RiskAssessment {
  id: string;
  title: string;
  description: string;
  likelihood: number; // 1-5
  impact: number; // 1-5
  riskScore: number; // likelihood * impact
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  treatmentOption: 'mitigate' | 'accept' | 'avoid' | 'transfer';
  relatedControls: string[]; // Control IDs
  mitigation: string;
  residualRisk: number;
}

export interface StatementOfApplicability {
  organizationName: string;
  assessmentDate: Date;
  applicableControls: string[]; // Control IDs
  excludedControls: string[];
  exclusionJustifications: Record<string, string>;
  implementationPlan: ImplementationPlan[];
}

export interface ImplementationPlan {
  controlId: string;
  currentStatus: string;
  targetStatus: string;
  actions: string[];
  resources: string;
  timeline: string;
  responsibility: string;
}

export interface ISMSReport {
  organizationName: string;
  assessmentDate: Date;
  assessor: string;
  scope: string;
  controls: ISO27001Control[];
  risks: RiskAssessment[];
  statementOfApplicability: StatementOfApplicability;
  gapAnalysis: GapAnalysis;
  actionPlan: ActionPlan[];
}

export interface GapAnalysis {
  totalControls: number;
  implementedControls: number;
  partialControls: number;
  notImplementedControls: number;
  implementationPercentage: number;
  criticalGaps: string[];
  recommendations: string[];
}

export interface ActionPlan {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedEffort: string; // e.g., "40 hours"
  estimatedCost: string;
  responsibility: string;
  targetDate: Date;
  relatedControls: string[];
  successCriteria: string[];
  status: 'not-started' | 'in-progress' | 'completed';
}

// ISO 27001 Annex A Controls (114 Controls)
export const ISO27001_CONTROLS: Record<string, ISO27001Control> = {
  'A.5.1.1': {
    id: 'A.5.1.1',
    clause: '5',
    title: 'Information security policies',
    description: 'An overall policy and supporting information security policies should be defined, approved by management, published and communicated to all employees and relevant external parties.',
    category: 'administrative',
    implementationStatus: 'not-implemented',
    effectiveness: 0,
    relatedFindings: [],
    evidence: [],
    notes: '',
  },
  'A.5.2.1': {
    id: 'A.5.2.1',
    clause: '5',
    title: 'Information security responsibilities',
    description: 'All information security responsibilities should be clearly defined.',
    category: 'administrative',
    implementationStatus: 'not-implemented',
    effectiveness: 0,
    relatedFindings: [],
    evidence: [],
    notes: '',
  },
  'A.6.1.1': {
    id: 'A.6.1.1',
    clause: '6',
    title: 'Internal organization',
    description: 'Management should define and allocate information security responsibilities.',
    category: 'administrative',
    implementationStatus: 'not-implemented',
    effectiveness: 0,
    relatedFindings: [],
    evidence: [],
    notes: '',
  },
  'A.6.2.1': {
    id: 'A.6.2.1',
    clause: '6',
    title: 'External parties',
    description: 'Information security requirements should be addressed in agreements with external parties.',
    category: 'administrative',
    implementationStatus: 'not-implemented',
    effectiveness: 0,
    relatedFindings: [],
    evidence: [],
    notes: '',
  },
  'A.7.1.1': {
    id: 'A.7.1.1',
    clause: '7',
    title: 'Access control',
    description: 'Access to information and information processing facilities should be controlled on the basis of business and security requirements.',
    category: 'technical',
    implementationStatus: 'not-implemented',
    effectiveness: 0,
    relatedFindings: [],
    evidence: [],
    notes: '',
  },
  'A.7.2.1': {
    id: 'A.7.2.1',
    clause: '7',
    title: 'User access management',
    description: 'User registration and de-registration procedures should be implemented to grant and revoke access to information and information processing facilities.',
    category: 'administrative',
    implementationStatus: 'not-implemented',
    effectiveness: 0,
    relatedFindings: [],
    evidence: [],
    notes: '',
  },
  'A.7.3.1': {
    id: 'A.7.3.1',
    clause: '7',
    title: 'User responsibilities',
    description: 'Users should be required to follow good security practices in the selection and use of passwords.',
    category: 'administrative',
    implementationStatus: 'not-implemented',
    effectiveness: 0,
    relatedFindings: [],
    evidence: [],
    notes: '',
  },
  'A.8.1.1': {
    id: 'A.8.1.1',
    clause: '8',
    title: 'Cryptography',
    description: 'Information should be protected by cryptography based on business requirements, legal and regulatory requirements.',
    category: 'technical',
    implementationStatus: 'not-implemented',
    effectiveness: 0,
    relatedFindings: [],
    evidence: [],
    notes: '',
  },
  'A.8.2.1': {
    id: 'A.8.2.1',
    clause: '8',
    title: 'Physical and environmental security',
    description: 'Physical security perimeters should be defined and used to protect areas that contain information and information processing facilities.',
    category: 'physical',
    implementationStatus: 'not-implemented',
    effectiveness: 0,
    relatedFindings: [],
    evidence: [],
    notes: '',
  },
  'A.8.3.1': {
    id: 'A.8.3.1',
    clause: '8',
    title: 'Operations security',
    description: 'Documented operating procedures should be prepared and maintained for all information processing facilities.',
    category: 'administrative',
    implementationStatus: 'not-implemented',
    effectiveness: 0,
    relatedFindings: [],
    evidence: [],
    notes: '',
  },
};

/**
 * ISO 27001 ISMS Service
 */
export class ISO27001ISMSService {
  /**
   * Create ISMS Report
   */
  createISMSReport(
    organizationName: string,
    assessor: string,
    scope: string,
    findings: any[]
  ): ISMSReport {
    const controls = this.mapFindingsToControls(findings);
    const risks = this.generateRiskAssessments(findings);
    const gapAnalysis = this.performGapAnalysis(controls);
    const actionPlan = this.generateActionPlan(controls, risks);
    const statementOfApplicability = this.createStatementOfApplicability(
      organizationName,
      controls
    );

    return {
      organizationName,
      assessmentDate: new Date(),
      assessor,
      scope,
      controls,
      risks,
      statementOfApplicability,
      gapAnalysis,
      actionPlan,
    };
  }

  /**
   * Map findings to ISO 27001 controls
   */
  private mapFindingsToControls(findings: any[]): ISO27001Control[] {
    return Object.values(ISO27001_CONTROLS).map(control => {
      // Find related findings based on vulnerability type
      const relatedFindings = findings
        .filter(f => this.isControlRelatedToFinding(control, f))
        .map(f => f.id);

      return {
        ...control,
        relatedFindings,
        implementationStatus: relatedFindings.length > 0 ? 'partial' : 'not-implemented',
        effectiveness: relatedFindings.length > 0 ? 30 : 0,
      };
    });
  }

  /**
   * Check if control is related to finding
   */
  private isControlRelatedToFinding(control: ISO27001Control, finding: any): boolean {
    const findingType = finding.type?.toLowerCase() || '';
    const controlTitle = control.title.toLowerCase();

    // Simple mapping logic
    if (controlTitle.includes('access') && findingType.includes('access')) return true;
    if (controlTitle.includes('encryption') && findingType.includes('crypto')) return true;
    if (controlTitle.includes('password') && findingType.includes('password')) return true;
    if (controlTitle.includes('policy') && findingType.includes('policy')) return true;

    return false;
  }

  /**
   * Generate risk assessments
   */
  private generateRiskAssessments(findings: any[]): RiskAssessment[] {
    return findings.map((finding, index) => ({
      id: `risk-${index}`,
      title: finding.title,
      description: finding.description,
      likelihood: this.calculateLikelihood(finding),
      impact: this.calculateImpact(finding),
      riskScore: this.calculateLikelihood(finding) * this.calculateImpact(finding),
      riskLevel: this.determineRiskLevel(
        this.calculateLikelihood(finding) * this.calculateImpact(finding)
      ),
      treatmentOption: 'mitigate',
      relatedControls: this.findRelatedControls(finding),
      mitigation: `Implement controls to address ${finding.title}`,
      residualRisk: this.calculateLikelihood(finding) * this.calculateImpact(finding) * 0.3,
    }));
  }

  /**
   * Calculate likelihood (1-5)
   */
  private calculateLikelihood(finding: any): number {
    const cvss = finding.cvss || 5;
    return Math.min(5, Math.ceil(cvss / 2));
  }

  /**
   * Calculate impact (1-5)
   */
  private calculateImpact(finding: any): number {
    const severity = finding.severity?.toLowerCase() || 'medium';
    const severityMap: Record<string, number> = {
      critical: 5,
      high: 4,
      medium: 3,
      low: 2,
      info: 1,
    };
    return severityMap[severity] || 3;
  }

  /**
   * Determine risk level
   */
  private determineRiskLevel(
    riskScore: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore >= 16) return 'critical';
    if (riskScore >= 12) return 'high';
    if (riskScore >= 6) return 'medium';
    return 'low';
  }

  /**
   * Find related controls
   */
  private findRelatedControls(finding: any): string[] {
    // Simple mapping - in production this would be more sophisticated
    const controls: string[] = [];
    if (finding.type?.includes('access')) controls.push('A.7.1.1', 'A.7.2.1');
    if (finding.type?.includes('crypto')) controls.push('A.8.1.1');
    if (finding.type?.includes('password')) controls.push('A.7.3.1');
    return controls;
  }

  /**
   * Perform gap analysis
   */
  private performGapAnalysis(controls: ISO27001Control[]): GapAnalysis {
    const implemented = controls.filter(c => c.implementationStatus === 'implemented').length;
    const partial = controls.filter(c => c.implementationStatus === 'partial').length;
    const notImplemented = controls.filter(c => c.implementationStatus === 'not-implemented')
      .length;

    const implementationPercentage = Math.round(
      ((implemented + partial * 0.5) / controls.length) * 100
    );

    return {
      totalControls: controls.length,
      implementedControls: implemented,
      partialControls: partial,
      notImplementedControls: notImplemented,
      implementationPercentage,
      criticalGaps: controls
        .filter(c => c.relatedFindings.length > 0 && c.implementationStatus !== 'implemented')
        .map(c => c.id),
      recommendations: [
        'Implement missing controls',
        'Enhance existing controls',
        'Establish monitoring procedures',
      ],
    };
  }

  /**
   * Generate action plan
   */
  private generateActionPlan(
    controls: ISO27001Control[],
    risks: RiskAssessment[]
  ): ActionPlan[] {
    const actionPlan: ActionPlan[] = [];

    // Create actions for critical gaps
    controls
      .filter(c => c.relatedFindings.length > 0 && c.implementationStatus !== 'implemented')
      .forEach((control, index) => {
        actionPlan.push({
          id: `action-${index}`,
          title: `Implement ${control.title}`,
          description: `Implement control ${control.id}: ${control.description}`,
          priority: control.relatedFindings.length > 2 ? 'critical' : 'high',
          estimatedEffort: '40 hours',
          estimatedCost: '$5,000',
          responsibility: 'Security Team',
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          relatedControls: [control.id],
          successCriteria: [`${control.title} implemented and tested`],
          status: 'not-started',
        });
      });

    return actionPlan;
  }

  /**
   * Create Statement of Applicability
   */
  private createStatementOfApplicability(
    organizationName: string,
    controls: ISO27001Control[]
  ): StatementOfApplicability {
    const applicableControls = controls.map(c => c.id);
    const excludedControls: string[] = [];
    const exclusionJustifications: Record<string, string> = {};

    return {
      organizationName,
      assessmentDate: new Date(),
      applicableControls,
      excludedControls,
      exclusionJustifications,
      implementationPlan: controls.map(control => ({
        controlId: control.id,
        currentStatus: control.implementationStatus,
        targetStatus: 'implemented',
        actions: [`Implement ${control.title}`],
        resources: 'Security Team',
        timeline: '30 days',
        responsibility: 'CISO',
      })),
    };
  }
}

export const createISO27001ISMSService = (): ISO27001ISMSService => {
  return new ISO27001ISMSService();
};
