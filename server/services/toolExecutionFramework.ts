/**
 * Unified Tool Execution Framework
 * Centralized execution platform for all 118 tools with real-time output streaming
 */

import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'file';
  label: string;
  description: string;
  required: boolean;
  default?: string | number | boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  validation?: RegExp;
}

export interface ToolDefinition {
  id: string;
  name: string;
  category: 'osint' | 'pentest' | 'recon' | 'analysis' | 'reporting';
  description: string;
  command: string;
  parameters: ToolParameter[];
  timeout?: number; // milliseconds
  maxConcurrent?: number;
  tags: string[];
}

export interface ExecutionSession {
  id: string;
  toolId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  output: string;
  error?: string;
  exitCode?: number;
  parameters: Record<string, any>;
}

export class ToolExecutionFramework extends EventEmitter {
  private sessions: Map<string, ExecutionSession> = new Map();
  private runningProcesses: Map<string, any> = new Map();
  private toolDefinitions: Map<string, ToolDefinition> = new Map();
  private maxConcurrentExecutions: number = 10;
  private activeExecutions: number = 0;

  /**
   * Register tool definition
   */
  registerTool(tool: ToolDefinition): void {
    this.toolDefinitions.set(tool.id, tool);
  }

  /**
   * Register multiple tools
   */
  registerTools(tools: ToolDefinition[]): void {
    tools.forEach(tool => this.registerTool(tool));
  }

  /**
   * Get tool definition
   */
  getTool(toolId: string): ToolDefinition | undefined {
    return this.toolDefinitions.get(toolId);
  }

  /**
   * Get all tools
   */
  getAllTools(): ToolDefinition[] {
    return Array.from(this.toolDefinitions.values());
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): ToolDefinition[] {
    return Array.from(this.toolDefinitions.values()).filter(t => t.category === category);
  }

  /**
   * Execute tool
   */
  async executeTool(
    toolId: string,
    parameters: Record<string, any>
  ): Promise<ExecutionSession> {
    const tool = this.toolDefinitions.get(toolId);
    if (!tool) throw new Error(`Tool ${toolId} not found`);

    // Wait if max concurrent executions reached
    while (this.activeExecutions >= this.maxConcurrentExecutions) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const session: ExecutionSession = {
      id: `session-${randomUUID()}`,
      toolId,
      status: 'running',
      startTime: new Date(),
      output: '',
      parameters,
    };

    this.sessions.set(session.id, session);
    this.activeExecutions++;

    try {
      this.emit('session-started', session);

      // Build command with parameters
      const command = this.buildCommand(tool, parameters);

      // Execute command
      await this.executeCommand(session, command, tool.timeout || 60000);

      session.status = 'completed';
      this.emit('session-completed', session);
    } catch (error) {
      session.status = 'failed';
      session.error = (error as Error).message;
      this.emit('session-failed', session);
    } finally {
      session.endTime = new Date();
      this.activeExecutions--;
      this.runningProcesses.delete(session.id);
    }

    return session;
  }

  /**
   * Build command from tool definition and parameters
   */
  private buildCommand(tool: ToolDefinition, parameters: Record<string, any>): string {
    let command = tool.command;

    // Replace parameter placeholders
    for (const [key, value] of Object.entries(parameters)) {
      const param = tool.parameters.find(p => p.name === key);
      if (param && value !== undefined && value !== null && value !== '') {
        // Handle different parameter types
        if (param.type === 'boolean') {
          if (value) {
            command = command.replace(`{${key}}`, `--${key}`);
          } else {
            command = command.replace(`{${key}}`, '');
          }
        } else {
          command = command.replace(`{${key}}`, String(value));
        }
      }
    }

    // Remove any remaining placeholders
    command = command.replace(/{[^}]+}/g, '');

    return command;
  }

  /**
   * Execute command and stream output
   */
  private executeCommand(
    session: ExecutionSession,
    command: string,
    timeout: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Parse command
        const [cmd, ...args] = command.split(' ');

        // Spawn process
        const process = spawn(cmd, args, {
          shell: true,
          timeout,
        });

        this.runningProcesses.set(session.id, process);

        // Capture stdout
        process.stdout?.on('data', (data: Buffer) => {
          const output = data.toString();
          session.output += output;
          this.emit('session-output', { sessionId: session.id, output });
        });

        // Capture stderr
        process.stderr?.on('data', (data: Buffer) => {
          const output = data.toString();
          session.output += `[ERROR] ${output}`;
          this.emit('session-output', { sessionId: session.id, output: `[ERROR] ${output}` });
        });

        // Handle process exit
        process.on('close', (code: number) => {
          session.exitCode = code;
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });

        // Handle process error
        process.on('error', (error: Error) => {
          reject(error);
        });

        // Handle timeout
        const timeoutHandle = setTimeout(() => {
          process.kill();
          reject(new Error(`Process timeout after ${timeout}ms`));
        }, timeout);

        process.on('close', () => clearTimeout(timeoutHandle));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Cancel execution
   */
  cancelExecution(sessionId: string): void {
    const process = this.runningProcesses.get(sessionId);
    if (process) {
      process.kill();
      const session = this.sessions.get(sessionId);
      if (session) {
        session.status = 'cancelled';
        this.emit('session-cancelled', session);
      }
    }
  }

  /**
   * Get session
   */
  getSession(sessionId: string): ExecutionSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get session output
   */
  getSessionOutput(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    return session?.output || '';
  }

  /**
   * Stream session output
   */
  streamSessionOutput(
    sessionId: string,
    callback: (output: string) => void
  ): () => void {
    const session = this.sessions.get(sessionId);
    if (!session) return () => {};

    // Send initial output
    callback(session.output);

    // Listen for new output
    const onOutput = (data: { sessionId: string; output: string }) => {
      if (data.sessionId === sessionId) {
        callback(data.output);
      }
    };

    this.on('session-output', onOutput);

    // Return unsubscribe function
    return () => {
      this.removeListener('session-output', onOutput);
    };
  }

  /**
   * Get execution statistics
   */
  getExecutionStats(): {
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    failedSessions: number;
  } {
    const sessions = Array.from(this.sessions.values());
    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.status === 'running').length,
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      failedSessions: sessions.filter(s => s.status === 'failed').length,
    };
  }

  /**
   * Clear old sessions (older than 24 hours)
   */
  clearOldSessions(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    const idsToDelete: string[] = [];
    this.sessions.forEach((session, id) => {
      if (now - session.startTime.getTime() > maxAge) {
        idsToDelete.push(id);
      }
    });

    idsToDelete.forEach(id => this.sessions.delete(id));
  }
}

export const createToolExecutionFramework = (): ToolExecutionFramework => {
  return new ToolExecutionFramework();
};
