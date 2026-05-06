import { describe, expect, it } from 'vitest';
import { hexstrikeRouter } from './hexstrike';

const caller = hexstrikeRouter.createCaller({
  user: {
    name: 'Compatibility Tester',
  },
} as any);

describe('HexStrike Router Compatibility', () => {
  it('returns legacy validation flags while using the Pentest validation pipeline', async () => {
    const result = await caller.validateScope({
      target: 'example.com',
      type: 'domain',
      description: 'Main domain and selected subdomains',
      authorization: 'AUTH-2026-001',
    });

    expect(result).toHaveProperty('isValid');
    expect(result).toHaveProperty('isAuthorized');
    expect(result).toHaveProperty('isLegal');
    expect(result).toHaveProperty('riskLevel');
    expect(result).toHaveProperty('analysis');
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('returns the legacy plan structure while sourcing planning from the Pentest service', async () => {
    const result = await caller.generatePentestPlan({
      target: 'example.com',
      scopeDescription: 'Perform a controlled assessment of the external attack surface',
    });

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('scopeId');
    expect(result).toHaveProperty('target', 'example.com');
    expect(result).toHaveProperty('phases');
    expect(Array.isArray(result.phases)).toBe(true);
    expect(result.phases.length).toBeGreaterThan(0);
    expect(result.totalTools).toBeGreaterThan(0);

    result.phases.forEach((phase: any) => {
      expect(phase).toHaveProperty('id');
      expect(phase).toHaveProperty('name');
      expect(phase).toHaveProperty('description');
      expect(phase).toHaveProperty('tools');
      expect(Array.isArray(phase.tools)).toBe(true);
      expect(phase.tools.length).toBeGreaterThan(0);
    });
  });
});
