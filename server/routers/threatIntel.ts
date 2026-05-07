import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getThreatIntelligenceService } from "../threatIntelligence";

export const threatIntelRouter = router({
  /**
   * Get comprehensive threat intelligence for a CVE
   */
  getCVEIntelligence: protectedProcedure
    .input(z.object({ cveId: z.string().min(1) }))
    .query(async ({ input }) => {
      const service = getThreatIntelligenceService();
      const intelligence = await service.getThreatIntelligence(input.cveId);
      return intelligence;
    }),

  /**
   * Look up CVE information
   */
  lookupCVE: protectedProcedure
    .input(z.object({ cveId: z.string().min(1) }))
    .query(async ({ input }) => {
      const service = getThreatIntelligenceService();
      const cve = await service.lookupCVE(input.cveId);
      return cve;
    }),

  /**
   * Look up exploits for a CVE
   */
  lookupExploits: protectedProcedure
    .input(z.object({ cveId: z.string().min(1) }))
    .query(async ({ input }) => {
      const service = getThreatIntelligenceService();
      const exploits = await service.lookupExploits(input.cveId);
      return exploits;
    }),

  /**
   * Check if CVE is in CISA Known Exploited Vulnerabilities list
   */
  checkCISAKEV: protectedProcedure
    .input(z.object({ cveId: z.string().min(1) }))
    .query(async ({ input }) => {
      const service = getThreatIntelligenceService();
      const cisaKev = await service.checkCISAKEV(input.cveId);
      return cisaKev;
    }),

  /**
   * Get threat intelligence cache statistics
   */
  getCacheStats: protectedProcedure.query(async () => {
    const service = getThreatIntelligenceService();
    return service.getCacheStats();
  }),

  /**
   * Clear threat intelligence cache
   */
  clearCache: protectedProcedure.mutation(async () => {
    const service = getThreatIntelligenceService();
    service.clearCache();
    return { success: true, message: "Cache cleared" };
  }),

  /**
   * Batch lookup for multiple CVEs
   */
  batchLookup: protectedProcedure
    .input(z.object({ cveIds: z.array(z.string().min(1)).min(1).max(100) }))
    .query(async ({ input }) => {
      const service = getThreatIntelligenceService();
      const results = await Promise.all(
        input.cveIds.map(async (cveId) => ({
          cveId,
          intelligence: await service.getThreatIntelligence(cveId),
        }))
      );
      return results;
    }),
});

export type ThreatIntelRouter = typeof threatIntelRouter;
