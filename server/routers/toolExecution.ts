/**
 * Tool Execution Router
 * tRPC endpoints for server-side tool execution
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { createToolExecutionFramework } from '../services/toolExecutionFramework';

// Initialize framework
const executionFramework = createToolExecutionFramework();

// Register all tools (in production, load from database)
executionFramework.registerTools([
  {
    id: 'nmap',
    name: 'Nmap',
    category: 'recon',
    description: 'Network mapper - scan networks and hosts',
    command: 'nmap {target} {options}',
    parameters: [
      {
        name: 'target',
        type: 'string',
        label: 'Target Host/Network',
        description: 'IP address, hostname, or CIDR range',
        required: true,
        placeholder: '192.168.1.0/24',
      },
      {
        name: 'scanType',
        type: 'select',
        label: 'Scan Type',
        description: 'Type of scan to perform',
        required: true,
        options: [
          { label: 'SYN Scan (-sS)', value: '-sS' },
          { label: 'TCP Connect (-sT)', value: '-sT' },
          { label: 'UDP Scan (-sU)', value: '-sU' },
          { label: 'Ping Scan (-sn)', value: '-sn' },
        ],
      },
      {
        name: 'ports',
        type: 'string',
        label: 'Ports',
        description: 'Specific ports to scan',
        required: false,
        placeholder: '1-1000',
      },
      {
        name: 'aggressive',
        type: 'boolean',
        label: 'Aggressive Scan',
        description: 'Enable aggressive scan mode (-A)',
        required: false,
      },
    ],
    timeout: 300000,
    tags: ['network', 'recon', 'scanning'],
  },
  {
    id: 'sqlmap',
    name: 'SQLMap',
    category: 'pentest',
    description: 'Automatic SQL injection detection and exploitation',
    command: 'sqlmap -u {url} {options}',
    parameters: [
      {
        name: 'url',
        type: 'string',
        label: 'Target URL',
        description: 'URL to test for SQL injection',
        required: true,
        placeholder: 'http://target.com/page.php?id=1',
      },
      {
        name: 'technique',
        type: 'select',
        label: 'Injection Technique',
        description: 'SQL injection technique',
        required: false,
        options: [
          { label: 'Boolean-based blind', value: 'B' },
          { label: 'Time-based blind', value: 'T' },
          { label: 'Error-based', value: 'E' },
          { label: 'UNION query-based', value: 'U' },
        ],
      },
      {
        name: 'riskLevel',
        type: 'number',
        label: 'Risk Level',
        description: 'Risk level (1-3)',
        required: false,
        default: '1',
      },
    ],
    timeout: 300000,
    tags: ['web', 'pentest', 'injection'],
  },
  {
    id: 'shodan',
    name: 'Shodan',
    category: 'osint',
    description: 'Search engine for internet-connected devices',
    command: 'shodan search {query} {options}',
    parameters: [
      {
        name: 'query',
        type: 'string',
        label: 'Search Query',
        description: 'Shodan search query',
        required: true,
        placeholder: 'apache country:US',
      },
      {
        name: 'limit',
        type: 'number',
        label: 'Result Limit',
        description: 'Maximum number of results',
        required: false,
        default: '100',
      },
    ],
    timeout: 60000,
    tags: ['osint', 'search', 'reconnaissance'],
  },
]);

export const toolExecutionRouter = router({
  /**
   * Get all available tools
   */
  getAllTools: protectedProcedure.query(() => {
    return executionFramework.getAllTools();
  }),

  /**
   * Get tools by category
   */
  getToolsByCategory: protectedProcedure
    .input(z.object({ category: z.string() }))
    .query(({ input }: any) => {
      return executionFramework.getToolsByCategory(input.category);
    }),

  /**
   * Get specific tool
   */
  getTool: protectedProcedure
    .input(z.object({ toolId: z.string() }))
    .query(({ input }: any) => {
      return executionFramework.getTool(input.toolId);
    }),

  /**
   * Execute tool
   */
  execute: protectedProcedure
    .input(
      z.object({
        toolId: z.string(),
        parameters: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      // Verify user has permission to execute tools
      if (ctx.user?.role !== 'admin' && ctx.user?.role !== 'pentester') {
        throw new Error('Insufficient permissions to execute tools');
      }

      try {
        const session = await executionFramework.executeTool(input.toolId, input.parameters);
        return {
          sessionId: session.id,
          status: session.status,
          output: session.output,
        };
      } catch (error) {
        throw new Error(`Tool execution failed: ${(error as Error).message}`);
      }
    }),

  /**
   * Get session status and output
   */
  getSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ input }: any) => {
      const session = executionFramework.getSession(input.sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      return {
        id: session.id,
        toolId: session.toolId,
        status: session.status,
        output: session.output,
        error: session.error,
        startTime: session.startTime,
        endTime: session.endTime,
      };
    }),

  /**
   * Cancel execution
   */
  cancel: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(({ input }: any) => {
      executionFramework.cancelExecution(input.sessionId);
      return { success: true };
    }),

  /**
   * Get execution statistics
   */
  getStats: protectedProcedure.query(() => {
    return executionFramework.getExecutionStats();
  }),
});
