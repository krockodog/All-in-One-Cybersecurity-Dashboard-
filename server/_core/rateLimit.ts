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

// Bounded to avoid unbounded memory growth from many distinct anonymous IPs.
const MAX_BUCKETS = 50_000;
let lastSweep = 0;

function sweepExpired(now: number): void {
  // Amortised cleanup: at most once per 60s we drop expired buckets so that
  // traffic from many one-off IPs cannot grow the map without bound.
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) buckets.delete(key);
  });
  // Hard cap: if still oversized (e.g. a burst within one window), evict the
  // oldest-resetting entries until back under the limit.
  if (buckets.size > MAX_BUCKETS) {
    const sorted = Array.from(buckets.entries()).sort((a, b) => a[1].resetAt - b[1].resetAt);
    for (let i = 0; i < sorted.length && buckets.size > MAX_BUCKETS; i++) {
      buckets.delete(sorted[i]![0]);
    }
  }
}

/**
 * Derive the client IP from trusted data only.
 *
 * Express is configured with `trust proxy` in `server/_core/index.ts`, so
 * `req.ip` already reflects the real client when running behind a known proxy
 * and the raw socket address otherwise. We deliberately do NOT read
 * `X-Forwarded-For` ourselves: that header is client-controlled and, without a
 * trusted-proxy boundary, a caller could send a different value on every
 * request to bypass the per-IP limits.
 */
function clientIp(req: unknown): string {
  const r = req as { ip?: string; socket?: { remoteAddress?: string } } | undefined;
  return r?.ip || r?.socket?.remoteAddress || "unknown";
}

export function rateLimit(opts: { windowMs: number; max: number; name: string }) {
  return t.middleware(async ({ ctx, path, next }) => {
    const now = Date.now();
    sweepExpired(now);
    // Key on BOTH the limiter name and the concrete procedure path so that each
    // endpoint enforces its own quota instead of sharing one bucket across every
    // procedure in the same class.
    const key = `${opts.name}:${path}:${clientIp(ctx.req)}`;
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

/** Cheap local computations (no LLM, no scan) that should still be bounded. */
export const localReportRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1h
  max: 120,
  name: "local-report",
});

/** Test-only helper to reset limiter state between cases. */
export function __resetRateLimitBuckets(): void {
  buckets.clear();
  lastSweep = 0;
}

/**
 * Rechtliche Bestätigung für aktive Scans (§202a–c, §303b StGB).
 * Der Client muss `legalConsent: true` mitsenden, nachdem der Nutzer den
 * Warnhinweis bestätigt hat. Jeder akzeptierte Scan wird protokolliert.
 */
export const requireLegalConsent = t.middleware(async ({ ctx, path, getRawInput, next }) => {
  const raw = (await getRawInput().catch(() => undefined)) as Record<string, unknown> | undefined;
  if (!raw || typeof raw !== "object" || raw.legalConsent !== true) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message:
        "Scan abgelehnt: Die Berechtigung für das Ziel muss bestätigt werden (§202a–c, §303b StGB).",
    });
  }
  const target =
    typeof raw.target === "string"
      ? raw.target
      : Array.isArray((raw as any).steps)
        ? (raw as any).steps.map((s: any) => s?.inputs?.target ?? s?.inputs?.url ?? s?.inputs?.domain ?? s?.inputs?.host).filter(Boolean).join(",")
        : "";
  const tool =
    typeof raw.toolId === "string"
      ? raw.toolId
      : Array.isArray(raw.toolIds)
        ? (raw.toolIds as unknown[]).join(",")
        : typeof raw.workflowId === "string"
          ? raw.workflowId
          : "";
  console.info(
    `[AUDIT] active-scan consent ts=${new Date().toISOString()} ip=${clientIp(ctx.req)} path=${path} target=${String(target).slice(0, 200)} tool=${String(tool).slice(0, 200)}`,
  );
  return next();
});
