import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

// Shared tRPC instance so that middleware modules (e.g. rateLimit) and the
// procedure definitions in trpc.ts use the same builder without a circular import.
export const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});
