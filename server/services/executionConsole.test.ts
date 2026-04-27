import { describe, it, expect, beforeEach } from "vitest";
import {
  initializeConsole,
  getConsoleState,
  addOutput,
  updateProgress,
  setStatus,
  clearConsole,
  ExecutionOutput,
} from "./executionConsole";

describe("executionConsole", () => {
  const jobId = "test-job-001";
  const anotherJobId = "test-job-002";

  beforeEach(() => {
    // Clean up any state from previous tests
    clearConsole(jobId);
    clearConsole(anotherJobId);
  });

  describe("initializeConsole", () => {
    it("should create a new console state for the given jobId", async () => {
      const state = await initializeConsole(jobId);
      expect(state).toBeDefined();
      expect(state.jobId).toBe(jobId);
    });

    it("should initialize status as 'running'", async () => {
      const state = await initializeConsole(jobId);
      expect(state.status).toBe("running");
    });

    it("should initialize progress as 0", async () => {
      const state = await initializeConsole(jobId);
      expect(state.progress).toBe(0);
    });

    it("should initialize outputs as empty array", async () => {
      const state = await initializeConsole(jobId);
      expect(state.outputs).toHaveLength(0);
    });

    it("should set a startTime", async () => {
      const before = Date.now();
      const state = await initializeConsole(jobId);
      const after = Date.now();
      expect(state.startTime).toBeGreaterThanOrEqual(before);
      expect(state.startTime).toBeLessThanOrEqual(after);
    });

    it("should not set an endTime initially", async () => {
      const state = await initializeConsole(jobId);
      expect(state.endTime).toBeUndefined();
    });
  });

  describe("getConsoleState", () => {
    it("should return undefined for an unknown jobId", () => {
      const state = getConsoleState("nonexistent-job");
      expect(state).toBeUndefined();
    });

    it("should return the state after initialization", async () => {
      await initializeConsole(jobId);
      const state = getConsoleState(jobId);
      expect(state).toBeDefined();
      expect(state!.jobId).toBe(jobId);
    });

    it("should reflect the current state", async () => {
      await initializeConsole(jobId);
      updateProgress(jobId, 50);
      const state = getConsoleState(jobId);
      expect(state!.progress).toBe(50);
    });
  });

  describe("addOutput", () => {
    it("should add an output entry to the state", async () => {
      await initializeConsole(jobId);
      const output: ExecutionOutput = {
        timestamp: Date.now(),
        level: "info",
        message: "Test message",
      };
      addOutput(jobId, output);
      const state = getConsoleState(jobId);
      expect(state!.outputs).toHaveLength(1);
      expect(state!.outputs[0].message).toBe("Test message");
    });

    it("should support multiple outputs", async () => {
      await initializeConsole(jobId);
      addOutput(jobId, { timestamp: Date.now(), level: "info", message: "First" });
      addOutput(jobId, { timestamp: Date.now(), level: "success", message: "Second" });
      addOutput(jobId, { timestamp: Date.now(), level: "error", message: "Third" });
      const state = getConsoleState(jobId);
      expect(state!.outputs).toHaveLength(3);
    });

    it("should preserve all output fields", async () => {
      await initializeConsole(jobId);
      const now = Date.now();
      const output: ExecutionOutput = {
        timestamp: now,
        level: "warning",
        message: "Warning message",
        data: { key: "value" },
      };
      addOutput(jobId, output);
      const state = getConsoleState(jobId);
      const stored = state!.outputs[0];
      expect(stored.timestamp).toBe(now);
      expect(stored.level).toBe("warning");
      expect(stored.message).toBe("Warning message");
      expect(stored.data).toEqual({ key: "value" });
    });

    it("should silently ignore an unknown jobId", () => {
      // Should not throw
      expect(() =>
        addOutput("nonexistent", { timestamp: Date.now(), level: "info", message: "msg" })
      ).not.toThrow();
    });
  });

  describe("updateProgress", () => {
    it("should update progress to the specified value", async () => {
      await initializeConsole(jobId);
      updateProgress(jobId, 75);
      const state = getConsoleState(jobId);
      expect(state!.progress).toBe(75);
    });

    it("should clamp progress at 100 maximum", async () => {
      await initializeConsole(jobId);
      updateProgress(jobId, 150);
      const state = getConsoleState(jobId);
      expect(state!.progress).toBe(100);
    });

    it("should clamp progress at 0 minimum", async () => {
      await initializeConsole(jobId);
      updateProgress(jobId, -10);
      const state = getConsoleState(jobId);
      expect(state!.progress).toBe(0);
    });

    it("should accept progress of exactly 100", async () => {
      await initializeConsole(jobId);
      updateProgress(jobId, 100);
      const state = getConsoleState(jobId);
      expect(state!.progress).toBe(100);
    });

    it("should silently ignore an unknown jobId", async () => {
      expect(() => updateProgress("nonexistent", 50)).not.toThrow();
    });
  });

  describe("setStatus", () => {
    it("should update status to completed", async () => {
      await initializeConsole(jobId);
      setStatus(jobId, "completed");
      const state = getConsoleState(jobId);
      expect(state!.status).toBe("completed");
    });

    it("should update status to failed", async () => {
      await initializeConsole(jobId);
      setStatus(jobId, "failed");
      const state = getConsoleState(jobId);
      expect(state!.status).toBe("failed");
    });

    it("should update status to paused", async () => {
      await initializeConsole(jobId);
      setStatus(jobId, "paused");
      const state = getConsoleState(jobId);
      expect(state!.status).toBe("paused");
    });

    it("should set endTime when status becomes completed", async () => {
      await initializeConsole(jobId);
      const before = Date.now();
      setStatus(jobId, "completed");
      const after = Date.now();
      const state = getConsoleState(jobId);
      expect(state!.endTime).toBeGreaterThanOrEqual(before);
      expect(state!.endTime).toBeLessThanOrEqual(after);
    });

    it("should set endTime when status becomes failed", async () => {
      await initializeConsole(jobId);
      setStatus(jobId, "failed");
      const state = getConsoleState(jobId);
      expect(state!.endTime).toBeDefined();
    });

    it("should not set endTime when status becomes paused", async () => {
      await initializeConsole(jobId);
      setStatus(jobId, "paused");
      const state = getConsoleState(jobId);
      expect(state!.endTime).toBeUndefined();
    });

    it("should silently ignore an unknown jobId", async () => {
      expect(() => setStatus("nonexistent", "completed")).not.toThrow();
    });
  });

  describe("clearConsole", () => {
    it("should remove state for the given jobId", async () => {
      await initializeConsole(jobId);
      clearConsole(jobId);
      const state = getConsoleState(jobId);
      expect(state).toBeUndefined();
    });

    it("should not affect other jobs", async () => {
      await initializeConsole(jobId);
      await initializeConsole(anotherJobId);
      clearConsole(jobId);
      const other = getConsoleState(anotherJobId);
      expect(other).toBeDefined();
    });

    it("should silently handle unknown jobId", () => {
      expect(() => clearConsole("nonexistent")).not.toThrow();
    });
  });

  describe("multiple jobs", () => {
    it("should maintain independent state for different jobs", async () => {
      await initializeConsole(jobId);
      await initializeConsole(anotherJobId);
      updateProgress(jobId, 30);
      updateProgress(anotherJobId, 80);
      expect(getConsoleState(jobId)!.progress).toBe(30);
      expect(getConsoleState(anotherJobId)!.progress).toBe(80);
    });

    it("should maintain independent output queues", async () => {
      await initializeConsole(jobId);
      await initializeConsole(anotherJobId);
      addOutput(jobId, { timestamp: Date.now(), level: "info", message: "job1 msg" });
      addOutput(anotherJobId, { timestamp: Date.now(), level: "error", message: "job2 msg" });
      addOutput(anotherJobId, { timestamp: Date.now(), level: "success", message: "job2 msg2" });
      expect(getConsoleState(jobId)!.outputs).toHaveLength(1);
      expect(getConsoleState(anotherJobId)!.outputs).toHaveLength(2);
    });
  });
});
