import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import * as schema from "../drizzle/schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL, { schema, mode: "default" });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

import {
  engagements,
  executionJobs,
  findings,
  auditLog,
  toolCredentials,
  reports,
} from "../drizzle/schema";
import { desc, and } from "drizzle-orm";

/**
 * Engagement Helpers
 */
export async function createEngagement(data: {
  name: string;
  clientId: number;
  pentesterId: number;
  description?: string;
  scope?: any;
  authorizationExpires?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(engagements).values(data);
}

export async function getEngagementById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.query.engagements.findFirst({
    where: eq(engagements.id, id),
    with: {
      client: true,
      pentester: true,
      jobs: true,
      findings: true,
      reports: true,
    },
  });
}

export async function listEngagements(pentesterId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.query.engagements.findMany({
    where: eq(engagements.pentesterId, pentesterId),
    with: {
      client: true,
      jobs: true,
      findings: true,
    },
    orderBy: desc(engagements.createdAt),
  });
}

export async function updateEngagementStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(engagements)
    .set({ status: status as any })
    .where(eq(engagements.id, id));
}

/**
 * Execution Job Helpers
 */
export async function createExecutionJob(data: {
  engagementId: number;
  phase: "osint" | "recon" | "pentest" | "post_exploitation" | "reporting";
  tool: string;
  target: string;
  parameters?: any;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const insertData: any = {
    engagementId: data.engagementId,
    phase: data.phase,
    tool: data.tool,
    target: data.target,
    parameters: data.parameters || {},
  };
  return db.insert(executionJobs).values(insertData);
}

export async function getExecutionJobById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.query.executionJobs.findFirst({
    where: eq(executionJobs.id, id),
    with: {
      findings: true,
    },
  });
}

export async function updateExecutionJobStatus(
  id: number,
  status: string,
  output?: string,
  errorMessage?: string,
  durationMs?: number,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(executionJobs)
    .set({
      status: status as any,
      output,
      errorMessage,
      durationMs,
      completedAt: new Date(),
    })
    .where(eq(executionJobs.id, id));
}

export async function listExecutionJobs(engagementId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.query.executionJobs.findMany({
    where: eq(executionJobs.engagementId, engagementId),
    with: {
      findings: true,
    },
    orderBy: desc(executionJobs.createdAt),
  });
}

/**
 * Finding Helpers
 */
export async function createFinding(data: {
  jobId: number;
  engagementId: number;
  title: string;
  description?: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  cvss?: number;
  cve?: string;
  evidence?: string;
  remediation?: string;
  aiAnalysis?: any;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const insertData: any = {
    jobId: data.jobId,
    engagementId: data.engagementId,
    title: data.title,
    description: data.description,
    severity: data.severity,
    cvss: data.cvss,
    cve: data.cve,
    evidence: data.evidence,
    remediation: data.remediation,
    aiAnalysis: data.aiAnalysis,
  };
  return db.insert(findings).values(insertData);
}

export async function getFindingsByEngagement(engagementId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.query.findings.findMany({
    where: eq(findings.engagementId, engagementId),
    orderBy: desc(findings.severity),
  });
}

export async function updateFindingStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(findings)
    .set({ status: status as any })
    .where(eq(findings.id, id));
}

/**
 * Audit Log Helpers
 */
export async function logAuditEvent(data: {
  engagementId: number;
  userId: number;
  action: string;
  resource?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(auditLog).values(data);
}

export async function getAuditLog(engagementId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.query.auditLog.findMany({
    where: eq(auditLog.engagementId, engagementId),
    orderBy: desc(auditLog.createdAt),
  });
}

/**
 * Tool Credentials Helpers
 */
export async function storeToolCredential(data: {
  userId: number;
  tool: string;
  credentialType: string;
  encryptedValue: string;
  expiresAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(toolCredentials).values(data);
}

export async function getToolCredential(userId: number, tool: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.query.toolCredentials.findFirst({
    where: and(eq(toolCredentials.userId, userId), eq(toolCredentials.tool, tool)),
  });
}

/**
 * Report Helpers
 */
export async function createReport(data: {
  engagementId: number;
  title: string;
  executiveSummary?: string;
  findings?: number[];
  recommendations?: string;
  reportFormat?: "pdf" | "html" | "json" | "docx";
  generatedBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const insertData: any = {
    engagementId: data.engagementId,
    title: data.title,
    executiveSummary: data.executiveSummary,
    findings: data.findings,
    recommendations: data.recommendations,
    reportFormat: data.reportFormat || "pdf",
    generatedBy: data.generatedBy,
  };
  return db.insert(reports).values(insertData);
}

export async function getReportsByEngagement(engagementId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.query.reports.findMany({
    where: eq(reports.engagementId, engagementId),
    orderBy: desc(reports.createdAt),
  });
}
