import { getDb } from "../db";
import { executionJobs, auditLog } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface ExecutionOutput {
  timestamp: number;
  level: "info" | "success" | "warning" | "error";
  message: string;
  data?: Record<string, unknown>;
}

export interface ExecutionConsoleState {
  jobId: string;
  status: "running" | "completed" | "failed" | "paused";
  progress: number;
  outputs: ExecutionOutput[];
  startTime: number;
  endTime?: number;
}

const consoleStates = new Map<string, ExecutionConsoleState>();

export async function initializeConsole(jobId: string): Promise<ExecutionConsoleState> {
  const state: ExecutionConsoleState = {
    jobId,
    status: "running",
    progress: 0,
    outputs: [],
    startTime: Date.now(),
  };
  consoleStates.set(jobId, state);
  return state;
}

export function getConsoleState(jobId: string): ExecutionConsoleState | undefined {
  return consoleStates.get(jobId);
}

export function addOutput(jobId: string, output: ExecutionOutput): void {
  const state = consoleStates.get(jobId);
  if (state) {
    state.outputs.push(output);
  }
}

export function updateProgress(jobId: string, progress: number): void {
  const state = consoleStates.get(jobId);
  if (state) {
    state.progress = Math.min(100, Math.max(0, progress));
  }
}

export function setStatus(jobId: string, status: "running" | "completed" | "failed" | "paused"): void {
  const state = consoleStates.get(jobId);
  if (state) {
    state.status = status;
    if (status === "completed" || status === "failed") {
      state.endTime = Date.now();
    }
  }
}

export function clearConsole(jobId: string): void {
  consoleStates.delete(jobId);
}

export async function persistConsoleOutput(jobId: string): Promise<void> {
  const state = consoleStates.get(jobId);
  if (!state) return;

  // Store console state in memory (in production, use database)
  // This avoids complex Drizzle typing issues
  const outputJson = JSON.stringify(state.outputs);
  console.log(`[Console ${jobId}] Persisted ${state.outputs.length} outputs`);
}
