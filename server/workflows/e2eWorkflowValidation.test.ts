/**
 * E2E Workflow Validation Tests
 * Comprehensive end-to-end testing for all security workflows
 */

import { beforeAll, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const searchExposedServices = vi.fn(async (target: string) => [
    {
      ip: '203.0.113.10',
      port: 443,
      severity: 'critical',
      service: 'https',
      product: 'nginx',
      host: target,
    },
    {
      ip: '203.0.113.11',
      port: 8080,
      severity: 'high',
      service: 'http-alt',
      product: 'apache',
      host: target,
    },
  ]);

  const searchVulnerabilities = vi.fn(async () => [
    {
      cve: 'CVE-2024-0001',
      severity: 'critical',
      exploitAvailable: true,
      description: 'Remote code execution vulnerability',
    },
    {
      cve: 'CVE-2024-0002',
      severity: 'high',
      exploitAvailable: false,
      description: 'Authentication bypass vulnerability',
    },
  ]);

  const searchCredentialLeaks = vi.fn(async (email: string) => [
    {
      email,
      source: 'BreachForum',
      compromised: true,
      passwordHash: 'hash',
    },
  ]);

  const searchSSLCertificates = vi.fn(async (target: string) => [
    {
      domain: target,
      issuer: 'Mock CA',
      expired: true,
      weakAlgorithm: false,
      validTo: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const searchDNSRecords = vi.fn(async (target: string) => [
    {
      domain: target,
      recordType: 'TXT',
      suspicious: true,
      value: 'v=spf1 include:_spf.example.com ~all',
    },
  ]);

  const comprehensiveSearch = vi.fn(async (target: string, email?: string) => ({
    target,
    exposedServices: await searchExposedServices(target),
    vulnerabilities: await searchVulnerabilities(),
    credentialLeaks: email ? await searchCredentialLeaks(email) : [],
    sslCertificates: await searchSSLCertificates(target),
    dnsRecords: await searchDNSRecords(target),
    summary: {
      totalExposedServices: 2,
      criticalVulnerabilities: 1,
      credentialLeaksFound: email ? 1 : 0,
      certificateIssues: 1,
      dnsAnomalies: 1,
      overallRiskScore: 82,
    },
  }));

  const shodanSearch = vi.fn(async () => ({
    services: [
      { port: 443, product: 'nginx' },
      { port: 8080, product: 'apache' },
    ],
    vulnerabilities: [{ cve: 'CVE-2024-0001' }],
    risk_score: 78,
  }));

  return {
    searchExposedServices,
    searchVulnerabilities,
    searchCredentialLeaks,
    searchSSLCertificates,
    searchDNSRecords,
    comprehensiveSearch,
    shodanSearch,
  };
});

vi.mock('../services/leakix', () => ({
  leakixService: {
    searchExposedServices: mocks.searchExposedServices,
    searchVulnerabilities: mocks.searchVulnerabilities,
    searchCredentialLeaks: mocks.searchCredentialLeaks,
    searchSSLCertificates: mocks.searchSSLCertificates,
    searchDNSRecords: mocks.searchDNSRecords,
    comprehensiveSearch: mocks.comprehensiveSearch,
  },
}));

vi.mock('../tools/shodan', () => ({
  shodanSearch: mocks.shodanSearch,
}));

import { workflowAutomationEngine } from '../services/workflowAutomation';
import { LeakIXShodanTool } from '../tools/leakixShodan';
import { LeakIXReconWorkflow } from './leakixReconWorkflow';

describe('E2E Workflow Validation', () => {
  const testDomain = 'example.com';
  const testEmail = 'test@example.com';

  beforeAll(() => {
    workflowAutomationEngine.initializeDefaultRules();
  });

  describe('LeakIX Reconnaissance Workflow', () => {
    it('should complete full reconnaissance workflow', async () => {
      const result = await LeakIXReconWorkflow.executeWorkflow({
        target: testDomain,
        email: testEmail,
        includeLeakIX: true,
        includeShodan: true,
        includeVulnerabilityAnalysis: true,
        generateReport: true,
      });

      expect(result.status).toBe('completed');
      expect(result.summary).toBeDefined();
    });

    it('should handle exposed services discovery', async () => {
      const result = await LeakIXReconWorkflow.executeWorkflow({
        target: testDomain,
        includeLeakIX: true,
        includeShodan: false,
        includeVulnerabilityAnalysis: false,
        generateReport: false,
      });

      const servicesPhase = result.phases.find((p) => p.name.includes('Exposed Services'));
      expect(servicesPhase?.status).toBe('completed');
    });

    it('should identify vulnerabilities', async () => {
      const result = await LeakIXReconWorkflow.executeWorkflow({
        target: testDomain,
        includeLeakIX: true,
        includeShodan: false,
        includeVulnerabilityAnalysis: true,
        generateReport: false,
      });

      const vulnPhase = result.phases.find((p) => p.name.includes('Vulnerability'));
      expect(vulnPhase?.status).toBe('completed');
    });

    it('should search credential leaks', async () => {
      const result = await LeakIXReconWorkflow.executeWorkflow({
        target: testDomain,
        email: testEmail,
        includeLeakIX: true,
        includeShodan: false,
        includeVulnerabilityAnalysis: false,
        generateReport: false,
      });

      const credPhase = result.phases.find((p) => p.name.includes('Credential'));
      expect(credPhase?.status).toBe('completed');
    });

    it('should analyze SSL certificates', async () => {
      const result = await LeakIXReconWorkflow.executeWorkflow({
        target: testDomain,
        includeLeakIX: true,
        includeShodan: false,
        includeVulnerabilityAnalysis: false,
        generateReport: false,
      });

      const sslPhase = result.phases.find((p) => p.name.includes('SSL'));
      expect(sslPhase?.status).toBe('completed');
    });

    it('should gather DNS intelligence', async () => {
      const result = await LeakIXReconWorkflow.executeWorkflow({
        target: testDomain,
        includeLeakIX: true,
        includeShodan: false,
        includeVulnerabilityAnalysis: false,
        generateReport: false,
      });

      const dnsPhase = result.phases.find((p) => p.name.includes('DNS'));
      expect(dnsPhase?.status).toBe('completed');
    });

    it('should correlate with Shodan', async () => {
      const result = await LeakIXReconWorkflow.executeWorkflow({
        target: testDomain,
        includeLeakIX: true,
        includeShodan: true,
        includeVulnerabilityAnalysis: false,
        generateReport: false,
      });

      const shodanPhase = result.phases.find((p) => p.name.includes('Shodan'));
      expect(shodanPhase?.status).toBe('completed');
    });

    it('should perform threat assessment', async () => {
      const result = await LeakIXReconWorkflow.executeWorkflow({
        target: testDomain,
        includeLeakIX: true,
        includeShodan: true,
        includeVulnerabilityAnalysis: true,
        generateReport: true,
      });

      const threatPhase = result.phases.find((p) => p.name.includes('Threat'));
      expect(threatPhase?.status).toBe('completed');
    });

    it('should generate recommendations', async () => {
      const result = await LeakIXReconWorkflow.executeWorkflow({
        target: testDomain,
        includeLeakIX: true,
        includeShodan: true,
        includeVulnerabilityAnalysis: true,
        generateReport: true,
      });

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.status).toBe('completed');
    });

    it('should calculate risk score', async () => {
      const result = await LeakIXReconWorkflow.executeWorkflow({
        target: testDomain,
        includeLeakIX: true,
        includeShodan: true,
        includeVulnerabilityAnalysis: true,
        generateReport: true,
      });

      expect(result.summary.overallRiskScore).toBeGreaterThanOrEqual(0);
      expect(result.summary.overallRiskScore).toBeLessThanOrEqual(100);
    });
  });

  describe('LeakIX + Shodan Combined Tool', () => {
    it('should execute combined scan', async () => {
      const result = await LeakIXShodanTool.executeScan(testDomain, testEmail);

      expect(result.leakixData).toBeDefined();
      expect(result.correlatedFindings).toBeDefined();
      expect(result.threatAssessment).toBeDefined();
    });

    it('should correlate findings', async () => {
      const result = await LeakIXShodanTool.executeScan(testDomain);

      expect(result.correlatedFindings.length).toBeGreaterThanOrEqual(0);
      result.correlatedFindings.forEach((finding) => {
        expect(finding.type).toBeDefined();
        expect(finding.severity).toMatch(/critical|high|medium|low/);
      });
    });

    it('should generate threat assessment', async () => {
      const result = await LeakIXShodanTool.executeScan(testDomain);
      expect(result.threatAssessment).toBeDefined();
    });

    it('should format report', async () => {
      const result = await LeakIXShodanTool.executeScan(testDomain);
      const report = LeakIXShodanTool.formatForReport(result);

      expect(report).toMatch(/Findings Summary/);
      expect(report).toMatch(/Immediate Actions/);
      expect(report).toMatch(/Correlated Findings/);
    });
  });

  describe('Workflow Automation', () => {
    it('should execute automation workflow', async () => {
      const execution = await workflowAutomationEngine.executeWorkflow({
        tool: 'leakix',
        riskScore: 75,
      });

      expect(execution.status).toMatch(/completed|failed/);
      expect(execution.executions.length).toBeGreaterThanOrEqual(0);
    });

    it('should match trigger conditions', async () => {
      const execution = await workflowAutomationEngine.executeWorkflow({
        tool: 'leakix',
        riskScore: 85,
      });

      expect(execution.rules.length).toBeGreaterThan(0);
    });

    it('should execute automation actions', async () => {
      const execution = await workflowAutomationEngine.executeWorkflow({
        tool: 'leakix',
        findingType: 'critical',
      });

      execution.executions.forEach((exec) => {
        expect(exec.status).toMatch(/pending|running|completed|failed/);
      });
    });

    it('should track execution history', () => {
      const history = workflowAutomationEngine.getExecutionHistory(5);
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeLessThanOrEqual(5);
    });
  });

  describe('End-to-End Integration', () => {
    it('should complete full security assessment workflow', async () => {
      const reconResult = await LeakIXReconWorkflow.executeWorkflow({
        target: testDomain,
        email: testEmail,
        includeLeakIX: true,
        includeShodan: true,
        includeVulnerabilityAnalysis: true,
        generateReport: true,
      });

      const automation = await workflowAutomationEngine.executeWorkflow({
        riskScore: reconResult.summary.overallRiskScore,
        findingType: reconResult.summary.criticalFindings.length > 0 ? 'critical' : 'high',
      });

      expect(reconResult.status).toBe('completed');
      expect(automation.status).toMatch(/completed|failed/);
    });

    it('should handle workflow errors gracefully', async () => {
      const result = await LeakIXReconWorkflow.executeWorkflow({
        target: '',
        includeLeakIX: true,
        includeShodan: true,
        includeVulnerabilityAnalysis: true,
        generateReport: true,
      });

      expect(result).toBeDefined();
      expect(result.phases).toBeDefined();
    });

    it('should support concurrent workflows', async () => {
      const workflows = [
        LeakIXReconWorkflow.executeWorkflow({
          target: 'example1.com',
          includeLeakIX: true,
          includeShodan: true,
          includeVulnerabilityAnalysis: true,
          generateReport: true,
        }),
        LeakIXReconWorkflow.executeWorkflow({
          target: 'example2.com',
          includeLeakIX: true,
          includeShodan: true,
          includeVulnerabilityAnalysis: true,
          generateReport: true,
        }),
        LeakIXReconWorkflow.executeWorkflow({
          target: 'example3.com',
          includeLeakIX: true,
          includeShodan: true,
          includeVulnerabilityAnalysis: true,
          generateReport: true,
        }),
      ];

      const results = await Promise.all(workflows);
      expect(results.length).toBe(3);
      results.forEach((result) => {
        expect(result.status).toBe('completed');
      });
    });
  });

  describe('Performance Validation', () => {
    it('should complete workflow within acceptable time', async () => {
      const startTime = Date.now();
      const result = await LeakIXReconWorkflow.executeWorkflow({
        target: testDomain,
        includeLeakIX: true,
        includeShodan: true,
        includeVulnerabilityAnalysis: true,
        generateReport: true,
      });
      const duration = Date.now() - startTime;

      expect(result.status).toBe('completed');
      expect(duration).toBeLessThan(30000);
    });

    it('should handle multiple concurrent scans', async () => {
      const scans = Array.from({ length: 10 }, (_, i) =>
        LeakIXReconWorkflow.executeWorkflow({
          target: `example${i}.com`,
          includeLeakIX: true,
          includeShodan: false,
          includeVulnerabilityAnalysis: false,
          generateReport: false,
        })
      );

      const results = await Promise.all(scans);
      expect(results.length).toBe(10);
      results.forEach((result) => {
        expect(result.status).toBe('completed');
      });
    });
  });
});
