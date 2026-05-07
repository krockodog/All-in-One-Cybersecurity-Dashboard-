/**
 * Enterprise Professional Reporting System
 * Data Models & Types für Report Generation
 */

export type ReportType = 
  | 'executive_summary'
  | 'technical'
  | 'risk_assessment'
  | 'remediation_roadmap'
  | 'red_team';

export type ReportFormat = 'pdf' | 'docx' | 'html' | 'json';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ExploitabilityLevel = 'high' | 'medium' | 'low' | 'unproven';

/**
 * CVSS v3.1 Score & Vector
 * Reference: https://www.first.org/cvss/v3.1/specification-document
 */
export interface CVSSScore {
  baseScore: number; // 0.0 - 10.0
  baseSeverity: SeverityLevel;
  vector: string; // CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
  exploitability: number;
  impactScore: number;
}

/**
 * CWE (Common Weakness Enumeration) Reference
 * Reference: https://cwe.mitre.org/
 */
export interface CWEReference {
  id: string; // CWE-79
  name: string; // Improper Neutralization of Input During Web Page Generation
  description: string;
  url: string;
}

/**
 * MITRE ATT&CK Framework Reference
 * Reference: https://attack.mitre.org/
 */
export interface MitreAttackTactic {
  id: string; // TA0001
  name: string; // Reconnaissance
  techniques: MitreAttackTechnique[];
}

export interface MitreAttackTechnique {
  id: string; // T1592
  name: string; // Gather Victim Identity Information
  subTechniques?: MitreAttackSubTechnique[];
}

export interface MitreAttackSubTechnique {
  id: string; // T1592.001
  name: string; // Credentials
}

/**
 * Enhanced Finding with AI Analysis
 */
export interface EnhancedFinding {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  cvssScore?: CVSSScore;
  cweReferences: CWEReference[];
  mitreAttackTactics: MitreAttackTactic[];
  
  // Proof of Concept
  proofOfConcept: {
    description: string;
    steps: string[];
    screenshots?: string[]; // URLs
    commandExamples?: string[];
  };
  
  // Impact Analysis
  impact: {
    confidentiality: 'high' | 'medium' | 'low' | 'none';
    integrity: 'high' | 'medium' | 'low' | 'none';
    availability: 'high' | 'medium' | 'low' | 'none';
    businessImpact: string;
  };
  
  // Remediation
  remediation: {
    shortTerm: string[]; // Immediate fixes
    longTerm: string[]; // Strategic improvements
    priority: 1 | 2 | 3 | 4 | 5; // 1 = highest
    estimatedEffort: 'low' | 'medium' | 'high'; // in hours/days
    timeline?: string; // e.g., "1-2 weeks"
  };
  
  // References
  references: Reference[];
}

/**
 * Attack Chain Node
 * Represents a single step in an attack chain
 */
export interface AttackChainNode {
  id: string;
  phase: AttackPhase;
  name: string;
  description: string;
  findings: EnhancedFinding[];
  exploitabilityScore: number; // 0-10
  impactScore: number; // 0-10
  prerequisites: string[]; // What needs to be true before this phase
  postConditions: string[]; // What becomes true after this phase
  detectionMethods: string[];
  evasionTechniques: string[];
}

/**
 * Attack Chain (Cyber Kill Chain)
 * Reference: https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html
 */
export type AttackPhase = 
  | 'reconnaissance'
  | 'weaponization'
  | 'delivery'
  | 'exploitation'
  | 'installation'
  | 'command_and_control'
  | 'actions_on_objectives'
  | 'lateral_movement'
  | 'persistence'
  | 'privilege_escalation'
  | 'defense_evasion'
  | 'credential_access'
  | 'discovery'
  | 'collection'
  | 'exfiltration'
  | 'impact';

export interface AttackChain {
  id: string;
  engagementId: string;
  name: string;
  description: string;
  nodes: AttackChainNode[];
  successProbability: number; // 0-1
  estimatedTimeToCompromise: string; // e.g., "2-4 hours"
  requiredSkillLevel: 'low' | 'medium' | 'high' | 'expert';
  detectionDifficulty: 'low' | 'medium' | 'high';
}

/**
 * Lateral Movement Path
 */
export interface LateralMovementPath {
  id: string;
  sourceSystem: string;
  targetSystem: string;
  method: string; // e.g., "Pass-the-Hash", "Kerberoasting", "Delegation Abuse"
  difficulty: 'low' | 'medium' | 'high';
  detectionMethods: string[];
  evasionTechniques: string[];
  impactIfSuccessful: string;
}

/**
 * Persistence Mechanism
 */
export interface PersistenceMechanism {
  id: string;
  type: 'backdoor' | 'scheduled_task' | 'registry' | 'service' | 'startup' | 'web_shell' | 'rootkit' | 'other';
  name: string;
  description: string;
  implementation: string; // Code/command to implement
  detectionMethods: string[];
  removalSteps: string[];
  difficulty: 'low' | 'medium' | 'high';
}

/**
 * Report Metadata
 */
export interface ReportMetadata {
  id: string;
  engagementId: string;
  reportType: ReportType;
  title: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  
  // AI Analysis Results
  aiAnalysis?: {
    reviewedAt: Date;
    reviewedBy: string; // AI Model name
    findings: string[]; // Issues found
    suggestions: string[]; // Improvement suggestions
    enhancedFindingsCount: number;
    redTeamTacticsIdentified: number;
  };
}

/**
 * Complete Report Object
 */
export interface ProfessionalReport {
  metadata: ReportMetadata;
  
  // Executive Summary (for all report types)
  executiveSummary: {
    overview: string;
    keyFindings: string[];
    riskScore: number; // 0-100
    recommendations: string[];
  };
  
  // Technical Details
  findings: EnhancedFinding[];
  
  // Risk Assessment
  riskMatrix?: {
    criticalFindings: number;
    highFindings: number;
    mediumFindings: number;
    lowFindings: number;
    overallRiskScore: number;
  };
  
  // Attack Chains (Red Team Report)
  attackChains?: AttackChain[];
  lateralMovementPaths?: LateralMovementPath[];
  persistenceMechanisms?: PersistenceMechanism[];
  
  // Remediation Roadmap
  remediationRoadmap?: {
    phase1: RemediationPhase; // 0-30 days
    phase2: RemediationPhase; // 30-90 days
    phase3: RemediationPhase; // 90+ days
  };
  
  // Compliance Mapping
  complianceMapping?: ComplianceMapping;
  
  // Appendices
  appendices?: {
    methodology: string;
    toolsUsed: string[];
    timeline: string;
    references: Reference[];
  };
}

export interface RemediationPhase {
  name: string;
  findings: EnhancedFinding[];
  estimatedCost: string;
  estimatedEffort: string;
  expectedOutcome: string;
}

export interface ComplianceMapping {
  soc2?: ComplianceFramework;
  iso27001?: ComplianceFramework;
  pciDss?: ComplianceFramework;
}

export interface ComplianceFramework {
  name: string;
  applicableControls: string[];
  findingsPerControl: Record<string, EnhancedFinding[]>;
  complianceScore: number; // 0-100
}

export interface Reference {
  title: string;
  url: string;
  source: string; // e.g., "OWASP", "NIST", "CWE", "CVE"
}

/**
 * Report Generation Request
 */
export interface ReportGenerationRequest {
  engagementId: string;
  reportTypes: ReportType[];
  formats: ReportFormat[];
  includeAIAnalysis: boolean;
  includeRedTeamAnalysis: boolean;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  customBranding?: {
    companyName: string;
    companyLogo?: string;
    reportTemplate?: string;
  };
}

/**
 * Report Generation Response
 */
export interface ReportGenerationResponse {
  reportId: string;
  engagementId: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number; // 0-100
  reports: {
    type: ReportType;
    format: ReportFormat;
    url: string; // Download URL
    fileSize: number; // in bytes
    generatedAt: Date;
  }[];
  aiAnalysis?: {
    findings: string[];
    suggestions: string[];
    completedAt: Date;
  };
  error?: string;
}
