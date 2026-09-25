import { z } from "zod";

/**
 * Shared input-size limits for anonymous (no-login) endpoints.
 *
 * Because active-scan and LLM endpoints are reachable without authentication and
 * are rate-limited per request, unbounded arrays would let a single request
 * consume unbounded work (one bucket token launching thousands of tool runs) or
 * unbounded memory/cost (a huge chat history). These caps keep one request ≈
 * one unit of work.
 */
export const MAX_TOOLS_PER_REQUEST = 25;
export const MAX_PIPELINE_STEPS = 25;
export const MAX_CHAT_MESSAGE_CHARS = 8_000;
export const MAX_CHAT_HISTORY_ITEMS = 40;
export const MAX_CHAT_HISTORY_CHARS = 60_000;

/** A bounded, de-duplicated list of tool IDs (order preserved). */
export const toolIdsSchema = z
  .array(z.string().min(1))
  .min(1)
  .max(MAX_TOOLS_PER_REQUEST)
  .transform((ids) => Array.from(new Set(ids)));

/** Same as {@link toolIdsSchema} but optional (empty/undefined allowed). */
export const optionalToolIdsSchema = z
  .array(z.string().min(1))
  .max(MAX_TOOLS_PER_REQUEST)
  .transform((ids) => Array.from(new Set(ids)))
  .optional();

/**
 * Reject shell metacharacters in values that are eventually interpolated into
 * native tool command lines (nmap/sqlmap/etc. run via child_process). This is a
 * defence-in-depth guard on top of the SSRF/private-target checks; it blocks
 * command injection such as `example.com; rm -rf /` or `$(...)`.
 */
const SHELL_METACHARS = /[;&|`$(){}<>\\!\n\r'"*?\[\]]/;

export const safeTargetSchema = z
  .string()
  .min(1)
  .max(255)
  .refine((v) => !SHELL_METACHARS.test(v), {
    message:
      "Ungültiges Ziel: Shell-Metazeichen sind nicht erlaubt (mögliche Command Injection).",
  });

export function assertSafeTarget(target: string): void {
  if (SHELL_METACHARS.test(target)) {
    throw new Error(
      "Ungültiges Ziel: Shell-Metazeichen sind nicht erlaubt (mögliche Command Injection).",
    );
  }
}
