import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  json,
  index,
  boolean,
  decimal,
  enum as mysqlEnum,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * ISO 27001 ISMS (Information Security Management System)
 * Comprehensive schema for compliance tracking and reporting
 */

/**
 * ISO 27001 Assessments - Main assessment records
 */
export const iso27001Assessments = mysqlTable(
  "iso27001Assessments",
  {
    id: int("id").autoincrement().primaryKey(),
    engagementId: int("engagementId").notNull(),
    organizationName: varchar("organizationName", { length: 255 }).notNull(),
    assessmentDate: timestamp("assessmentDate").notNull(),
    assessor: varchar("assessor", { length: 255 }).notNull(),
    
    // Assessment scope
    scope: text("scope").notNull(), // Description of what's being assessed
    
    // Assessment type
    assessmentType: mysqlEnum("assessmentType", [
      "initial",
      "surveillance",
      "recertification",
      "gap_analysis",
    ]).default("initial").notNull(),
    
    // Status
    status: mysqlEnum("status", [
      "draft",
      "in_progress",
      "completed",
      "approved",
    ]).default("draft").notNull(),
    
    // Risk metrics
    overallRiskScore: decimal("overallRiskScore", { precision: 3, scale: 1 }),
    
    // Metadata
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    engagementIdx: index("engagementIdx").on(table.engagementId),
    statusIdx: index("statusIdx").on(table.status),
  })
);

export type ISO27001Assessment = typeof iso27001Assessments.$inferSelect;
export type InsertISO27001Assessment = typeof iso27001Assessments.$inferInsert;

/**
 * ISO 27001 Controls - All 114 Annex A controls
 */
export const iso27001Controls = mysqlTable(
  "iso27001Controls",
  {
    id: int("id").autoincrement().primaryKey(),
    controlId: varchar("controlId", { length: 10 }).notNull().unique(), // e.g., "A.5.1.1"
    controlName: varchar("controlName", { length: 255 }).notNull(),
    controlDescription: text("controlDescription").notNull(),
    
    // Classification
    clause: varchar("clause", { length: 10 }).notNull(), // A.5, A.6, etc.
    category: mysqlEnum("category", [
      "administrative",
      "technical",
      "physical",
    ]).notNull(),
    
    // Implementation status
    implementationStatus: mysqlEnum("implementationStatus", [
      "not_implemented",
      "partial",
      "implemented",
      "optimized",
    ]).default("not_implemented").notNull(),
    
    // Effectiveness
    effectivenessScore: decimal("effectivenessScore", { precision: 3, scale: 1 }),
    
    // Evidence
    evidence: text("evidence"),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    controlIdIdx: index("controlIdIdx").on(table.controlId),
    clauseIdx: index("clauseIdx").on(table.clause),
  })
);

export type ISO27001Control = typeof iso27001Controls.$inferSelect;
export type InsertISO27001Control = typeof iso27001Controls.$inferInsert;

/**
 * ISO 27001 Assessment Controls - Assessment-specific control data
 */
export const iso27001AssessmentControls = mysqlTable(
  "iso27001AssessmentControls",
  {
    id: int("id").autoincrement().primaryKey(),
    assessmentId: int("assessmentId").notNull(),
    controlId: int("controlId").notNull(),
    
    // Applicability
    isApplicable: boolean("isApplicable").default(true).notNull(),
    applicabilityReason: text("applicabilityReason"),
    
    // Assessment
    implementationStatus: mysqlEnum("implementationStatus", [
      "not_implemented",
      "partial",
      "implemented",
      "optimized",
    ]).default("not_implemented").notNull(),
    
    effectivenessScore: decimal("effectivenessScore", { precision: 3, scale: 1 }),
    
    // Findings
    findings: json("findings").$type<Array<{
      findingId: number;
      severity: string;
      description: string;
    }>>().default([]),
    
    // Evidence
    evidence: text("evidence"),
    
    // Remediation
    remediationRequired: boolean("remediationRequired").default(false),
    remediationPlan: text("remediationPlan"),
    remediationDeadline: timestamp("remediationDeadline"),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    assessmentIdx: index("assessmentIdx").on(table.assessmentId),
    controlIdx: index("controlIdx").on(table.controlId),
  })
);

export type ISO27001AssessmentControl = typeof iso27001AssessmentControls.$inferSelect;
export type InsertISO27001AssessmentControl = typeof iso27001AssessmentControls.$inferInsert;

/**
 * ISO 27001 Risks - Risk register
 */
export const iso27001Risks = mysqlTable(
  "iso27001Risks",
  {
    id: int("id").autoincrement().primaryKey(),
    assessmentId: int("assessmentId").notNull(),
    
    riskId: varchar("riskId", { length: 50 }).notNull(),
    riskDescription: text("riskDescription").notNull(),
    
    // Risk assessment
    likelihood: mysqlEnum("likelihood", [
      "rare",
      "unlikely",
      "possible",
      "likely",
      "almost_certain",
    ]).notNull(),
    
    impact: mysqlEnum("impact", [
      "negligible",
      "minor",
      "moderate",
      "major",
      "catastrophic",
    ]).notNull(),
    
    riskScore: decimal("riskScore", { precision: 3, scale: 1 }).notNull(),
    
    // Risk treatment
    treatmentOption: mysqlEnum("treatmentOption", [
      "mitigate",
      "accept",
      "avoid",
      "transfer",
    ]).notNull(),
    
    treatmentPlan: text("treatmentPlan"),
    treatmentOwner: varchar("treatmentOwner", { length: 255 }),
    treatmentDeadline: timestamp("treatmentDeadline"),
    
    // Status
    status: mysqlEnum("status", [
      "identified",
      "in_treatment",
      "treated",
      "closed",
    ]).default("identified").notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    assessmentIdx: index("assessmentIdx").on(table.assessmentId),
    riskIdIdx: index("riskIdIdx").on(table.riskId),
    statusIdx: index("statusIdx").on(table.status),
  })
);

export type ISO27001Risk = typeof iso27001Risks.$inferSelect;
export type InsertISO27001Risk = typeof iso27001Risks.$inferInsert;

/**
 * ISO 27001 Statement of Applicability (SoA)
 */
export const iso27001SoA = mysqlTable(
  "iso27001SoA",
  {
    id: int("id").autoincrement().primaryKey(),
    assessmentId: int("assessmentId").notNull(),
    
    // SoA metadata
    version: varchar("version", { length: 20 }).default("1.0").notNull(),
    approvedBy: varchar("approvedBy", { length: 255 }),
    approvalDate: timestamp("approvalDate"),
    
    // Content
    applicableControls: json("applicableControls").$type<Array<{
      controlId: string;
      reason: string;
    }>>().default([]),
    
    excludedControls: json("excludedControls").$type<Array<{
      controlId: string;
      reason: string;
    }>>().default([]),
    
    implementationPlan: text("implementationPlan"),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    assessmentIdx: index("assessmentIdx").on(table.assessmentId),
  })
);

export type ISO27001SoA = typeof iso27001SoA.$inferSelect;
export type InsertISO27001SoA = typeof iso27001SoA.$inferInsert;

/**
 * ISO 27001 Reports - Generated reports
 */
export const iso27001Reports = mysqlTable(
  "iso27001Reports",
  {
    id: int("id").autoincrement().primaryKey(),
    assessmentId: int("assessmentId").notNull(),
    
    reportType: mysqlEnum("reportType", [
      "assessment_report",
      "soa",
      "risk_register",
      "remediation_plan",
      "compliance_status",
    ]).notNull(),
    
    // Report content
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(), // HTML or Markdown
    
    // Metadata
    generatedBy: varchar("generatedBy", { length: 255 }),
    generatedAt: timestamp("generatedAt").defaultNow().notNull(),
    
    // Export formats
    pdfUrl: varchar("pdfUrl", { length: 500 }),
    htmlUrl: varchar("htmlUrl", { length: 500 }),
    jsonUrl: varchar("jsonUrl", { length: 500 }),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    assessmentIdx: index("assessmentIdx").on(table.assessmentId),
    reportTypeIdx: index("reportTypeIdx").on(table.reportType),
  })
);

export type ISO27001Report = typeof iso27001Reports.$inferSelect;
export type InsertISO27001Report = typeof iso27001Reports.$inferInsert;

/**
 * ISO 27001 Audit Trail - Compliance audit log
 */
export const iso27001AuditTrail = mysqlTable(
  "iso27001AuditTrail",
  {
    id: int("id").autoincrement().primaryKey(),
    assessmentId: int("assessmentId").notNull(),
    
    action: varchar("action", { length: 255 }).notNull(),
    actor: varchar("actor", { length: 255 }).notNull(),
    details: text("details"),
    
    // Change tracking
    changedFields: json("changedFields").$type<Record<string, { old: any; new: any }>>(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    assessmentIdx: index("assessmentIdx").on(table.assessmentId),
    createdAtIdx: index("createdAtIdx").on(table.createdAt),
  })
);

export type ISO27001AuditTrail = typeof iso27001AuditTrail.$inferSelect;
export type InsertISO27001AuditTrail = typeof iso27001AuditTrail.$inferInsert;

// Relations
export const iso27001AssessmentsRelations = relations(iso27001Assessments, ({ many }) => ({
  controls: many(iso27001AssessmentControls),
  risks: many(iso27001Risks),
  soa: many(iso27001SoA),
  reports: many(iso27001Reports),
  auditTrail: many(iso27001AuditTrail),
}));

export const iso27001AssessmentControlsRelations = relations(
  iso27001AssessmentControls,
  ({ one }) => ({
    assessment: one(iso27001Assessments, {
      fields: [iso27001AssessmentControls.assessmentId],
      references: [iso27001Assessments.id],
    }),
    control: one(iso27001Controls, {
      fields: [iso27001AssessmentControls.controlId],
      references: [iso27001Controls.id],
    }),
  })
);

export const iso27001RisksRelations = relations(iso27001Risks, ({ one }) => ({
  assessment: one(iso27001Assessments, {
    fields: [iso27001Risks.assessmentId],
    references: [iso27001Assessments.id],
  }),
}));

export const iso27001SoARelations = relations(iso27001SoA, ({ one }) => ({
  assessment: one(iso27001Assessments, {
    fields: [iso27001SoA.assessmentId],
    references: [iso27001Assessments.id],
  }),
}));

export const iso27001ReportsRelations = relations(iso27001Reports, ({ one }) => ({
  assessment: one(iso27001Assessments, {
    fields: [iso27001Reports.assessmentId],
    references: [iso27001Assessments.id],
  }),
}));

export const iso27001AuditTrailRelations = relations(iso27001AuditTrail, ({ one }) => ({
  assessment: one(iso27001Assessments, {
    fields: [iso27001AuditTrail.assessmentId],
    references: [iso27001Assessments.id],
  }),
}));
