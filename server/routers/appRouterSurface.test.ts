import { describe, expect, it } from 'vitest';
import { appRouter } from '../routers';

describe('App Router Surface', () => {
  it('exposes the migrated pentest workflow route instead of a direct hexstrike route', () => {
    const routes = Object.keys((appRouter as any)._def.record ?? {});

    expect(routes).toContain('pentestWorkflow');
    expect(routes).not.toContain('hexstrike');
  });
});
