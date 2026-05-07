/**
 * LeakIX Router
 * tRPC procedures for LeakIX OSINT operations
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { leakixService } from '../services/leakix';
import { LeakIXShodanTool } from '../tools/leakixShodan';
import { TRPCError } from '@trpc/server';

export const leakixRouter = router({
  /**
   * Search for exposed services
   */
  searchExposedServices: protectedProcedure
    .input(z.object({ target: z.string() }))
    .query(async ({ input }) => {
      try {
        const services = await leakixService.searchExposedServices(input.target);
        return {
          success: true,
          services,
          count: services.length,
        };
      } catch (error) {
        console.error('Exposed services search failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search exposed services',
        });
      }
    }),

  /**
   * Search for vulnerabilities
   */
  searchVulnerabilities: protectedProcedure
    .input(z.object({ target: z.string() }))
    .query(async ({ input }) => {
      try {
        const vulnerabilities = await leakixService.searchVulnerabilities(input.target);
        return {
          success: true,
          vulnerabilities,
          count: vulnerabilities.length,
          criticalCount: vulnerabilities.filter((v) => v.severity === 'critical').length,
        };
      } catch (error) {
        console.error('Vulnerability search failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search vulnerabilities',
        });
      }
    }),

  /**
   * Search for credential leaks
   */
  searchCredentialLeaks: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      try {
        const leaks = await leakixService.searchCredentialLeaks(input.email);
        return {
          success: true,
          leaks,
          count: leaks.length,
          compromised: leaks.filter((l) => l.compromised).length,
        };
      } catch (error) {
        console.error('Credential leak search failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search credential leaks',
        });
      }
    }),

  /**
   * Search for SSL certificate issues
   */
  searchSSLCertificates: protectedProcedure
    .input(z.object({ domain: z.string() }))
    .query(async ({ input }) => {
      try {
        const certificates = await leakixService.searchSSLCertificates(input.domain);
        return {
          success: true,
          certificates,
          count: certificates.length,
          expiredCount: certificates.filter((c) => c.expired).length,
        };
      } catch (error) {
        console.error('SSL certificate search failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search SSL certificates',
        });
      }
    }),

  /**
   * Search for DNS records
   */
  searchDNSRecords: protectedProcedure
    .input(z.object({ domain: z.string() }))
    .query(async ({ input }) => {
      try {
        const records = await leakixService.searchDNSRecords(input.domain);
        return {
          success: true,
          records,
          count: records.length,
          suspiciousCount: records.filter((r) => r.suspicious).length,
        };
      } catch (error) {
        console.error('DNS search failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search DNS records',
        });
      }
    }),

  /**
   * Comprehensive LeakIX search
   */
  comprehensiveSearch: protectedProcedure
    .input(z.object({ target: z.string(), email: z.string().email().optional() }))
    .query(async ({ input }) => {
      try {
        const result = await leakixService.comprehensiveSearch(input.target, input.email);
        return {
          success: true,
          result,
        };
      } catch (error) {
        console.error('Comprehensive search failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to perform comprehensive search',
        });
      }
    }),

  /**
   * Combined LeakIX + Shodan search
   */
  combinedSearch: protectedProcedure
    .input(z.object({ target: z.string(), email: z.string().email().optional() }))
    .mutation(async ({ input }) => {
      try {
        const result = await LeakIXShodanTool.executeScan(input.target, input.email);
        return {
          success: true,
          result,
          report: LeakIXShodanTool.formatForReport(result),
        };
      } catch (error) {
        console.error('Combined search failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to perform combined search',
        });
      }
    }),

  /**
   * Get LeakIX statistics
   */
  getStatistics: protectedProcedure.query(async () => {
    try {
      return {
        success: true,
        statistics: {
          features: [
            'Exposed Services Scanning',
            'Vulnerability Database Lookup',
            'Credential Leak Search',
            'SSL Certificate Analysis',
            'DNS/Network Intelligence',
          ],
          integrations: ['Shodan', 'CVSS Scoring', 'MITRE ATT&CK'],
          lastUpdated: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get statistics',
      });
    }
  }),
});
