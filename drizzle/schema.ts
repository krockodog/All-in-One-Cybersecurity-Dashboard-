import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here
import { boolean, decimal, index, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// Engagements (Pentesting Aufträge)
export const engagements = mysqlTable(
  "engagements",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    clientId: int("clientId").notNull(),
    pentesterId: int("pentesterId").notNull(),
    description: text("description"),
    status: mysqlEnum("status", ["planning", "active", "paused", "completed", "archived"]).default(
      "planning",
    ),
    startDate: timestamp("startDate"),
    endDate: timestamp("endDate"),
    authorizationDocument: text("authorizationDocument"),
    authorizationExpires: timestamp("authorizationExpires"),
    scope: json("scope").$type<{
      domains: string[];
      ipRanges: string[];
      services: string[];
      exclusions: string[];
    }>(),
    budget: decimal("budget", { precision: 10, scale: 2 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    clientIdx: index("clientIdx").on(table.clientId),
    pentesterIdx: index("pentesterIdx").on(table.pentesterId),
    statusIdx: index("statusIdx").on(table.status),
  }),
);

export type Engagement = typeof engagements.$inferSelect;
export type InsertEngagement = typeof engagements.$inferInsert;

// Execution Jobs (Tool-Ausführungen)
export const executionJobs = mysqlTable(
  "executionJobs",
  {
    id: int("id").autoincrement().primaryKey(),
    engagementId: int("engagementId").notNull(),
    phase: mysqlEnum("phase", ["osint", "recon", "pentest", "post_exploitation", "reporting"]).notNull(),
    tool: varchar("tool", { length: 255 }).notNull(),
    target: varchar("target", { length: 255 }).notNull(),
    parameters: json("parameters").$type<Record<string, any>>().default({}),
    status: mysqlEnum("status", ["queued", "running", "success", "error", "cancelled"]).default("queued"),
    output: text("output"),
    errorMessage: text("errorMessage"),
    startedAt: timestamp("startedAt"),
    completedAt: timestamp("completedAt"),
    durationMs: int("durationMs"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    engagementIdx: index("engagementIdx").on(table.engagementId),
    phaseIdx: index("phaseIdx").on(table.phase),
    toolIdx: index("toolIdx").on(table.tool),
    statusIdx: index("statusIdx").on(table.status),
  }),
);

export type ExecutionJob = typeof executionJobs.$inferSelect;
export type InsertExecutionJob = typeof executionJobs.$inferInsert;

// Findings (Schwachstellen & Ergebnisse)
export const findings = mysqlTable(
  "findings",
  {
    id: int("id").autoincrement().primaryKey(),
    jobId: int("jobId").notNull(),
    engagementId: int("engagementId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    severity: mysqlEnum("severity", ["critical", "high", "medium", "low", "info"]).notNull(),
    cvss: decimal("cvss", { precision: 3, scale: 1 }),
    cve: varchar("cve", { length: 50 }),
    evidence: text("evidence"),
    remediation: text("remediation"),
    status: mysqlEnum("status", ["open", "in_progress", "resolved", "false_positive"]).default("open"),
    aiAnalysis: json("aiAnalysis").$type<{
      exploitability: number;
      businessImpact: string;
      priority: number;
      suggestedNextSteps: string[];
    }>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    jobIdx: index("jobIdx").on(table.jobId),
    engagementIdx: index("engagementIdx").on(table.engagementId),
    severityIdx: index("severityIdx").on(table.severity),
    cveIdx: index("cveIdx").on(table.cve),
  }),
);

export type Finding = typeof findings.$inferSelect;
export type InsertFinding = typeof findings.$inferInsert;

// Audit Log (Compliance & Tracking)
export const auditLog = mysqlTable(
  "auditLog",
  {
    id: int("id").autoincrement().primaryKey(),
    engagementId: int("engagementId").notNull(),
    userId: int("userId").notNull(),
    action: varchar("action", { length: 255 }).notNull(),
    resource: varchar("resource", { length: 255 }),
    details: json("details").$type<Record<string, any>>().default({}),
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    engagementIdx: index("engagementIdx").on(table.engagementId),
    userIdx: index("userIdx").on(table.userId),
    actionIdx: index("actionIdx").on(table.action),
  }),
);

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

// Tool Credentials (API Keys, Secrets)
export const toolCredentials = mysqlTable(
  "toolCredentials",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    tool: varchar("tool", { length: 255 }).notNull(),
    credentialType: varchar("credentialType", { length: 255 }).notNull(),
    encryptedValue: text("encryptedValue").notNull(),
    isActive: boolean("isActive").default(true),
    lastUsed: timestamp("lastUsed"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    expiresAt: timestamp("expiresAt"),
  },
  (table) => ({
    userIdx: index("userIdx").on(table.userId),
    toolIdx: index("toolIdx").on(table.tool),
  }),
);

export type ToolCredential = typeof toolCredentials.$inferSelect;
export type InsertToolCredential = typeof toolCredentials.$inferInsert;

// Reports (Pentest Reports)
export const reports = mysqlTable(
  "reports",
  {
    id: int("id").autoincrement().primaryKey(),
    engagementId: int("engagementId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    executiveSummary: text("executiveSummary"),
    findings: json("findings").$type<number[]>().default([]),
    recommendations: text("recommendations"),
    reportFormat: mysqlEnum("reportFormat", ["pdf", "html", "json", "docx"]).default("pdf"),
    generatedAt: timestamp("generatedAt"),
    generatedBy: int("generatedBy"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    engagementIdx: index("engagementIdx").on(table.engagementId),
  }),
);

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  engagementsAsClient: many(engagements, { relationName: "client" }),
  engagementsAsPentester: many(engagements, { relationName: "pentester" }),
  auditLogs: many(auditLog),
  credentials: many(toolCredentials),
}));

export const engagementsRelations = relations(engagements, ({ one, many }) => ({
  client: one(users, {
    fields: [engagements.clientId],
    references: [users.id],
    relationName: "client",
  }),
  pentester: one(users, {
    fields: [engagements.pentesterId],
    references: [users.id],
    relationName: "pentester",
  }),
  jobs: many(executionJobs),
  findings: many(findings),
  auditLogs: many(auditLog),
  reports: many(reports),
}));

export const executionJobsRelations = relations(executionJobs, ({ one, many }) => ({
  engagement: one(engagements, {
    fields: [executionJobs.engagementId],
    references: [engagements.id],
  }),
  findings: many(findings),
}));

export const findingsRelations = relations(findings, ({ one }) => ({
  job: one(executionJobs, {
    fields: [findings.jobId],
    references: [executionJobs.id],
  }),
  engagement: one(engagements, {
    fields: [findings.engagementId],
    references: [engagements.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  engagement: one(engagements, {
    fields: [auditLog.engagementId],
    references: [engagements.id],
  }),
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}));

export const toolCredentialsRelations = relations(toolCredentials, ({ one }) => ({
  user: one(users, {
    fields: [toolCredentials.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  engagement: one(engagements, {
    fields: [reports.engagementId],
    references: [engagements.id],
  }),
}));


// Notifications
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["info", "success", "warning", "error", "critical"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  actionUrl: varchar("actionUrl", { length: 512 }),
  data: json("data").$type<Record<string, unknown>>(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
