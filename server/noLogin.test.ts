import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { ANONYMOUS_USER, router } from "./_core/trpc";
import { rateLimit } from "./_core/rateLimit";
import { t } from "./_core/trpcBase";

/**
 * No-login mode: every user-facing feature must work without a session.
 * These tests replace the former "auth required" expectations.
 */
function createAnonymousContext(ip = "203.0.113.10"): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      ip,
      headers: {},
      get: () => undefined,
    } as unknown as TrpcContext["req"],
    res: {
      clearCookie: () => undefined,
    } as unknown as TrpcContext["res"],
  };
}

describe("no-login mode", () => {
  it("exposes the anonymous fallback user without admin privileges", () => {
    expect(ANONYMOUS_USER.id).toBe(0);
    expect(ANONYMOUS_USER.role).toBe("user");
  });

  it("auth.me returns null for anonymous visitors (no redirect / no error)", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    await expect(caller.auth.me()).resolves.toBeNull();
  });

  it("allows formerly protected read procedures without a cookie", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());

    const tools = await caller.pentest.getTools();
    expect(tools.total).toBeGreaterThan(0);

    const templates = await caller.pipelines.getTemplates();
    expect(templates).toHaveProperty("reconnaissance");

    const workflows = await caller.workflows.listWorkflows();
    expect(Array.isArray(workflows)).toBe(true);

    const status = await caller.iso27001.getComplianceStatus({ organizationName: "ACME" });
    expect(status.organizationName).toBe("ACME");

    const cve = await caller.threatIntel.lookupCVE({ cveId: "CVE-2024-0001" });
    expect(cve).toBeDefined();
  });

  it("allows per-user procedures to run for anonymous visitors without crashing", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());

    const notifications = await caller.notifications.getNotifications({ limit: 5 });
    expect(notifications.success).toBe(true);

    // Without a configured database the engagement list degrades to an empty list.
    const engagements = await caller.engagements.list();
    expect(Array.isArray(engagements)).toBe(true);
  });

  it("allows formerly protected mutations without a cookie", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    const pipeline = await caller.pipelines.create({
      name: "anon pipeline",
      description: "created without login",
      scope: "example.com",
      steps: [{ toolId: "dns-enumeration" }],
    });
    expect(pipeline.name).toBe("anon pipeline");
    expect(pipeline.steps).toHaveLength(1);
  });

  it("keeps the internal owner-notification endpoint restricted", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    await expect(
      caller.system.notifyOwner({ title: "spam", content: "spam" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("per-IP rate limit middleware", () => {
  const limited = t.procedure
    .use(rateLimit({ windowMs: 60_000, max: 2, name: "test-limit" }))
    .query(() => "ok");
  const testRouter = router({ limited });

  it("allows requests up to the limit and rejects afterwards", async () => {
    const caller = testRouter.createCaller(createAnonymousContext("198.51.100.1"));
    await expect(caller.limited()).resolves.toBe("ok");
    await expect(caller.limited()).resolves.toBe("ok");
    await expect(caller.limited()).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  });

  it("tracks limits separately per IP", async () => {
    const other = testRouter.createCaller(createAnonymousContext("198.51.100.2"));
    await expect(other.limited()).resolves.toBe("ok");
  });
});

describe("review hardening for anonymous access", () => {
  it("keys rate limits per procedure and ignores a spoofed X-Forwarded-For", async () => {
    const limiter = rateLimit({ windowMs: 60_000, max: 1, name: "shared-class" });
    const r = router({
      a: t.procedure.use(limiter).query(() => "a"),
      b: t.procedure.use(limiter).query(() => "b"),
    });
    const ctx = createAnonymousContext("198.51.100.50");
    const caller = r.createCaller(ctx);
    await expect(caller.a()).resolves.toBe("a");
    // Same limiter class, different procedure -> independent quota.
    await expect(caller.b()).resolves.toBe("b");
    await expect(caller.a()).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });

    // A client-supplied X-Forwarded-For must not create a fresh bucket.
    const spoofed = createAnonymousContext("198.51.100.50");
    (spoofed.req as unknown as { headers: Record<string, string> }).headers = {
      "x-forwarded-for": "1.2.3.4",
    };
    await expect(r.createCaller(spoofed).a()).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
    });
  });

  it("rejects unbounded tool lists and oversized chat input", async () => {
    const caller = appRouter.createCaller(createAnonymousContext("198.51.100.60"));
    const tooMany = Array.from({ length: 26 }, (_, i) => `tool-${i}`);
    await expect(
      caller.pentest.runAutomated({ target: "example.com", toolIds: tooMany, legalConsent: true }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      caller.aiChat.chat({ message: "x".repeat(8_001), conversationHistory: [] }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      caller.aiChat.chat({
        message: "hi",
        conversationHistory: Array.from({ length: 41 }, () => ({
          role: "user" as const,
          content: "x",
        })),
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects shell metacharacters in workflow targets", async () => {
    const caller = appRouter.createCaller(createAnonymousContext("198.51.100.61"));
    await expect(
      caller.workflows.startWorkflow({
        engagementId: 1,
        workflowId: "network_recon",
        target: "example.com; id",
        legalConsent: true,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("keeps the global threat-intel cache reset owner-only", async () => {
    const caller = appRouter.createCaller(createAnonymousContext("198.51.100.62"));
    await expect(caller.threatIntel.clearCache()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("issues unguessable server-side HexStrike plan IDs", async () => {
    const caller = appRouter.createCaller(createAnonymousContext("198.51.100.63"));
    const first = await caller.pentestWorkflow.startExecution({
      planId: "victim-plan",
      toolIds: ["subfinder"],
      legalConsent: true,
    });
    expect(first.id).not.toBe("victim-plan");
    expect(first.id).toMatch(/^plan-[0-9a-f-]{36}$/);
    await caller.pentestWorkflow.cancelExecution({ planId: first.id });
  });

  it("rejects active scans without legal consent (§202a–c, §303b StGB)", async () => {
    const caller = appRouter.createCaller(createAnonymousContext("198.51.100.70"));
    await expect(
      caller.pentest.runAutomated({ target: "example.com", toolIds: ["subfinder"] } as any),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    await expect(
      caller.workflows.startWorkflow({ engagementId: 1, workflowId: "network_recon", target: "example.com" } as any),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    await expect(
      caller.tools.run({ toolId: "nmap", toolName: "nmap", baseCommand: "nmap", target: "example.com", category: "recon" } as any),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    await expect(
      caller.aiChat.executeScanFromChat({ target: "example.com", scope: "x" } as any),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    await expect(
      caller.tools.run({ toolId: "nmap", toolName: "nmap", baseCommand: "nmap", target: "example.com", category: "recon", legalConsent: false } as any),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });
});
