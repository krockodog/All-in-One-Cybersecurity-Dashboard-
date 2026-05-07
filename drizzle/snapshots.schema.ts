import { mysqlTable, int, varchar, text, timestamp, json, index, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Investigation Snapshots - for reproducibility and historical tracking
 */
export const investigationSnapshots = mysqlTable(
  "investigationSnapshots",
  {
    id: int("id").autoincrement().primaryKey(),
    engagementId: int("engagementId").notNull(),
    userId: int("userId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    
    // Scope snapshot
    scope: json("scope").$type<{
      domains: string[];
      ipRanges: string[];
      services: string[];
      exclusions: string[];
    }>().notNull(),
    
    // Plan snapshot
    plan: json("plan").$type<{
      phases: Array<{
        name: string;
        tools: Array<{
          toolId: string;
          parameters: Record<string, any>;
        }>;
      }>;
    }>().notNull(),
    
    // Results snapshot
    results: json("results").$type<{
      jobIds: number[];
      totalJobs: number;
      successfulJobs: number;
      failedJobs: number;
      executionTime: number;
    }>().notNull(),
    
    // Findings snapshot
    findings: json("findings").$type<{
      findingIds: number[];
      totalFindings: number;
      bySeverity: Record<string, number>;
      criticalCount: number;
    }>().notNull(),
    
    // Metadata
    status: varchar("status", { length: 50 }).default("active").notNull(),
    tags: json("tags").$type<string[]>().default([]),
    isPublic: boolean("isPublic").default(false),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    engagementIdx: index("engagementIdx").on(table.engagementId),
    userIdx: index("userIdx").on(table.userId),
    statusIdx: index("statusIdx").on(table.status),
  })
);

export type InvestigationSnapshot = typeof investigationSnapshots.$inferSelect;
export type InsertInvestigationSnapshot = typeof investigationSnapshots.$inferInsert;

/**
 * Snapshot Comparisons - for diff analysis
 */
export const snapshotComparisons = mysqlTable(
  "snapshotComparisons",
  {
    id: int("id").autoincrement().primaryKey(),
    engagementId: int("engagementId").notNull(),
    snapshotAId: int("snapshotAId").notNull(),
    snapshotBId: int("snapshotBId").notNull(),
    
    // Diff results
    diff: json("diff").$type<{
      newFindings: number[];
      resolvedFindings: number[];
      changedSeverity: Array<{
        findingId: number;
        oldSeverity: string;
        newSeverity: string;
      }>;
      toolChanges: Array<{
        tool: string;
        oldStatus: string;
        newStatus: string;
      }>;
    }>().notNull(),
    
    // Summary
    summary: text("summary"),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    engagementIdx: index("engagementIdx").on(table.engagementId),
    snapshotAIdx: index("snapshotAIdx").on(table.snapshotAId),
    snapshotBIdx: index("snapshotBIdx").on(table.snapshotBId),
  })
);

export type SnapshotComparison = typeof snapshotComparisons.$inferSelect;
export type InsertSnapshotComparison = typeof snapshotComparisons.$inferInsert;

/**
 * Snapshot Runs - for re-execution tracking
 */
export const snapshotRuns = mysqlTable(
  "snapshotRuns",
  {
    id: int("id").autoincrement().primaryKey(),
    snapshotId: int("snapshotId").notNull(),
    engagementId: int("engagementId").notNull(),
    userId: int("userId").notNull(),
    
    // Execution details
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    startedAt: timestamp("startedAt"),
    completedAt: timestamp("completedAt"),
    durationMs: int("durationMs"),
    
    // Results
    newJobIds: json("newJobIds").$type<number[]>().default([]),
    newFindingIds: json("newFindingIds").$type<number[]>().default([]),
    
    // Comparison with original
    comparisonId: int("comparisonId"),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    snapshotIdx: index("snapshotIdx").on(table.snapshotId),
    engagementIdx: index("engagementIdx").on(table.engagementId),
    userIdx: index("userIdx").on(table.userId),
    statusIdx: index("statusIdx").on(table.status),
  })
);

export type SnapshotRun = typeof snapshotRuns.$inferSelect;
export type InsertSnapshotRun = typeof snapshotRuns.$inferInsert;

// Relations
export const investigationSnapshotsRelations = relations(investigationSnapshots, ({ many }) => ({
  comparisons: many(snapshotComparisons),
  runs: many(snapshotRuns),
}));

export const snapshotComparisonsRelations = relations(snapshotComparisons, ({ one }) => ({
  snapshotA: one(investigationSnapshots, {
    fields: [snapshotComparisons.snapshotAId],
    references: [investigationSnapshots.id],
  }),
  snapshotB: one(investigationSnapshots, {
    fields: [snapshotComparisons.snapshotBId],
    references: [investigationSnapshots.id],
  }),
}));

export const snapshotRunsRelations = relations(snapshotRuns, ({ one }) => ({
  snapshot: one(investigationSnapshots, {
    fields: [snapshotRuns.snapshotId],
    references: [investigationSnapshots.id],
  }),
  comparison: one(snapshotComparisons, {
    fields: [snapshotRuns.comparisonId],
    references: [snapshotComparisons.id],
  }),
}));
