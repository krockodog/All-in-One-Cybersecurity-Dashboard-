import { TRPCError } from "@trpc/server";
import { t } from "./trpcBase";

/**
 * Simple in-memory per-IP rate limiter for tRPC procedures.
 *
 * Needed because — in no-login mode — several procedures that trigger active
 * scans against third-party targets or expensive LLM calls are now reachable
 * anonymously. This provides basic abuse protection without a login wall.
 *
 * It is intentionally lightweight (single-process, in-memory). For a multi-
 * instance deployment this should be backed by a shared store (e.g. Redis).
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function clientIp(req: unknown): string {
  const r = req as
    | { ip?: string; headers?: Record<string, string | string[] | undefined> }
    | undefined;
  // Use the RIGHT-most X-Forwarded-For entry: it is appended by the nearest
  // reverse proxy and cannot be forged by the client (the left-most can).
  const raw = r?.headers?.["x-forwarded-for"];
  const fwd = Array.isArray(raw) ? raw.join(",") : raw;
  if (typeof fwd === "string" && fwd.trim().length > 0) {
    const parts = fwd.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1]!;
  }
  return r?.ip || "unknown";
}

export function rateLimit(opts: { windowMs: number; max: number; name: string }) {
  return t.middleware(async ({ ctx, next }) => {
    const key = `${opts.name}:${clientIp(ctx.req)}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    } else {
      bucket.count += 1;
      if (bucket.count > opts.max) {
        const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Rate limit exceeded for ${opts.name}. Try again in ${retryAfter}s.`,
        });
      }
    }

    return next();
  });
}

/** Active scans / third-party target probing: stricter. */
export const activeScanRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1h
  max: 30,
  name: "active-scan",
});

/** Expensive LLM-backed procedures and procedures that trigger owner notifications. */
export const llmRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1h
  max: 40,
  name: "llm",
});
