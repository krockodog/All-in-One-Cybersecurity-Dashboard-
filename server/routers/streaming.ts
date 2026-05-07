import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { executionJobs } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Streaming router using polling-based approach
 * More stable than WebSocket for Cloudrun deployments
 */
export const streamingRouter = router({
  /**
   * Get current job status and output
   */
  getJobStatus: protectedProcedure
    .input(z.object({ jobId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          found: false,
          status: null,
          output: null,
          progress: 0,
          error: "Database not available",
        };
      }

      const job = await db.query.executionJobs.findFirst({
        where: eq(executionJobs.id, input.jobId),
      });

      if (!job) {
        return {
          found: false,
          status: null,
          output: null,
          progress: 0,
          error: null,
        };
      }

      return {
        found: true,
        status: job.status,
        output: job.output || "",
        progress: job.status === "running" ? 50 : job.status === "success" ? 100 : 0,
        error: job.errorMessage,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        durationMs: job.durationMs,
      };
    }),

  /**
   * Get job output in chunks (for large outputs)
   */
  getJobOutput: protectedProcedure
    .input(
      z.object({
        jobId: z.number().int().positive(),
        offset: z.number().int().nonnegative().default(0),
        limit: z.number().int().positive().default(1000),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          output: "",
          offset: input.offset,
          total: 0,
          hasMore: false,
        };
      }

      const job = await db.query.executionJobs.findFirst({
        where: eq(executionJobs.id, input.jobId),
      });

      if (!job || !job.output) {
        return {
          output: "",
          offset: input.offset,
          total: 0,
          hasMore: false,
        };
      }

      const output = job.output;
      const total = output.length;
      const chunk = output.substring(input.offset, input.offset + input.limit);

      return {
        output: chunk,
        offset: input.offset,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  /**
   * Stream job output lines (for live console)
   */
  getJobOutputLines: protectedProcedure
    .input(
      z.object({
        jobId: z.number().int().positive(),
        fromLine: z.number().int().nonnegative().default(0),
        maxLines: z.number().int().positive().default(100),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          lines: [],
          fromLine: input.fromLine,
          totalLines: 0,
          hasMore: false,
        };
      }

      const job = await db.query.executionJobs.findFirst({
        where: eq(executionJobs.id, input.jobId),
      });

      if (!job || !job.output) {
        return {
          lines: [],
          fromLine: input.fromLine,
          totalLines: 0,
          hasMore: false,
        };
      }

      const lines = job.output.split("\n");
      const totalLines = lines.length;
      const endLine = Math.min(input.fromLine + input.maxLines, totalLines);
      const outputLines = lines.slice(input.fromLine, endLine);

      return {
        lines: outputLines,
        fromLine: input.fromLine,
        totalLines,
        hasMore: endLine < totalLines,
      };
    }),

  /**
   * Poll for job updates (simplified polling endpoint)
   */
  pollJobUpdates: protectedProcedure
    .input(
      z.object({
        jobId: z.number().int().positive(),
        lastSeenAt: z.number().int().nonnegative().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          found: false,
          updates: [],
        };
      }

      const job = await db.query.executionJobs.findFirst({
        where: eq(executionJobs.id, input.jobId),
      });

      if (!job) {
        return {
          found: false,
          updates: [],
        };
      }

      // Simulate updates based on job state
      const updates = [];

      if (job.startedAt && job.startedAt.getTime() > input.lastSeenAt) {
        updates.push({
          type: "status_change",
          timestamp: job.startedAt.getTime(),
          status: "running",
          message: `Job started at ${job.startedAt.toISOString()}`,
        });
      }

      if (job.completedAt && job.completedAt.getTime() > input.lastSeenAt) {
        updates.push({
          type: "status_change",
          timestamp: job.completedAt.getTime(),
          status: job.status,
          message: `Job ${job.status} at ${job.completedAt.toISOString()}`,
        });
      }

      if (job.output && job.output.length > 0) {
        updates.push({
          type: "output_update",
          timestamp: Date.now(),
          outputLength: job.output.length,
          lines: job.output.split("\n").length,
        });
      }

      if (job.errorMessage && job.status === "error") {
        updates.push({
          type: "error",
          timestamp: Date.now(),
          error: job.errorMessage,
        });
      }

      return {
        found: true,
        updates,
        jobStatus: job.status,
      };
    }),
});

export type StreamingRouter = typeof streamingRouter;

