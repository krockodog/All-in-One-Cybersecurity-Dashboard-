import { TRPCError } from "@trpc/server";
import { NOT_ADMIN_ERR_MSG } from "@shared/const";
import type { User } from "../../drizzle/schema";
import { t } from "./trpcBase";

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * No-login mode.
 *
 * The dashboard is intentionally usable without authentication: every user-facing
 * feature must work anonymously. Instead of rejecting requests without a session,
 * the former `protectedProcedure` / `adminProcedure` now transparently fall back to
 * a shared anonymous user so that downstream code relying on `ctx.user` keeps
 * working (per-user data simply becomes shared/session-less anonymous data).
 *
 * The original auth middleware is intentionally left removed from the request path
 * (not deleted wholesale) so the OAuth flow can be re-enabled later without
 * rewriting the routers.
 */
export const ANONYMOUS_USER: User = {
  id: 0,
  openId: "anonymous",
  name: "Anonymous",
  email: null,
  loginMethod: null,
  // Deliberately NOT `admin`: anonymous visitors share one workspace (id 0) and
  // must not gain access to data owned by real (logged-in) users.
  role: "user",
  createdAt: new Date(0),
  updatedAt: new Date(0),
  lastSignedIn: new Date(0),
};

const withAnonymousFallback = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  return next({
    ctx: {
      ...ctx,
      user: ctx.user ?? ANONYMOUS_USER,
    },
  });
});

// Kept named `protectedProcedure` / `adminProcedure` so router imports are unchanged,
// but they no longer require (or enforce) authentication.
export const protectedProcedure = t.procedure.use(withAnonymousFallback);
export const adminProcedure = t.procedure.use(withAnonymousFallback);

/**
 * Strict owner/admin check (requires a real authenticated admin session).
 * Only used for internal, non user-facing operations such as `system.notifyOwner`,
 * which would otherwise let anonymous visitors spam the site owner.
 */
export const ownerOnlyProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);
