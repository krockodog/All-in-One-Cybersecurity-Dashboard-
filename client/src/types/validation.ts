/**
 * Validation Types for Phase 22 Block 9
 * Sichtbare KI-Validierungsregeln, Jurisdiktionswahl und Scope-Enforcement
 */

export type ValidationStatus = 'passed' | 'warning' | 'failed' | 'pending';
export type ValidationSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ValidationCategory = 'legal' | 'technical' | 'authorization' | 'jurisdiction';
export type Jurisdiction = 'de' | 'eu' | 'us' | 'other';

export interface ValidationRule {
  id: string;
  name: string;
  category: ValidationCategory;
  description: string;
  status: ValidationStatus;
  severity: ValidationSeverity;
  detail: string;
  remediationHint?: string;
}

export interface JurisdictionInfo {
  name: string;
  restrictions: string[];
  complianceFrameworks: string[];
}

export const JURISDICTION_MAP: Record<Jurisdiction, JurisdictionInfo> = {
  de: {
    name: 'Deutschland (BDSG, IT-Sicherheitsgesetz)',
    restrictions: ['Datenschutz-Compliance erforderlich', 'Dokumentation erforderlich'],
    complianceFrameworks: ['BDSG', 'IT-Sicherheitsgesetz', 'NIS2'],
  },
  eu: {
    name: 'EU (GDPR, NIS2)',
    restrictions: ['GDPR-Compliance erforderlich', 'Audit-Trail erforderlich'],
    complianceFrameworks: ['GDPR', 'NIS2', 'eIDAS'],
  },
  us: {
    name: 'USA (CFAA, NIST)',
    restrictions: ['Written Authorization erforderlich', 'Scope-Dokumentation erforderlich'],
    complianceFrameworks: ['CFAA', 'NIST', 'SOC 2'],
  },
  other: {
    name: 'Andere Jurisdiktion',
    restrictions: ['Lokale Gesetze beachten', 'Lokale Genehmigung erforderlich'],
    complianceFrameworks: ['Lokale Gesetze'],
  },
};

export interface ScopeEnforcementConfig {
  requireAuthorization: boolean;
  requireLegalBasis: boolean;
  requireTargetValidation: boolean;
  allowOverride: boolean;
  overrideSeverity: 'warning' | 'error';
}

export const DEFAULT_SCOPE_ENFORCEMENT_CONFIG: ScopeEnforcementConfig = {
  requireAuthorization: true,
  requireLegalBasis: true,
  requireTargetValidation: true,
  allowOverride: true,
  overrideSeverity: 'error',
};
