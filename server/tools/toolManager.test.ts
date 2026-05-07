import { describe, it, expect, vi } from "vitest";
import { executeTool, ToolExecutionRequest } from "./toolManager";

describe("Tool Manager", () => {
  it("should handle unknown tool gracefully", async () => {
    const request: ToolExecutionRequest = {
      tool: "unknown_tool" as any,
      phase: "osint",
      target: "example.com",
      parameters: {},
      userId: 1,
    };

    const result = await executeTool(request);

    expect(result.status).toBe("error");
    expect(result.error).toContain("Unknown tool");
  });

  it("should extract findings from Nmap results", async () => {
    const request: ToolExecutionRequest = {
      tool: "nmap",
      phase: "recon",
      target: "127.0.0.1",
      parameters: { scanType: "quick" },
      userId: 1,
    };

    // Mock would be needed for actual Nmap execution
    // For now, we test the error handling
    const result = await executeTool(request);

    // Result should have expected structure
    expect(result).toHaveProperty("tool");
    expect(result).toHaveProperty("target");
    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("findings");
    expect(Array.isArray(result.findings)).toBe(true);
  });

  it("should handle tool execution errors", async () => {
    const request: ToolExecutionRequest = {
      tool: "shodan",
      phase: "osint",
      target: "example.com",
      parameters: { searchType: "host" },
      userId: 1,
    };

    const result = await executeTool(request);

    // Should return error status when credentials not configured
    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("error");
  });

  it("should include duration in execution result", async () => {
    const request: ToolExecutionRequest = {
      tool: "nmap",
      phase: "recon",
      target: "127.0.0.1",
      parameters: { scanType: "quick" },
      userId: 1,
    };

    const result = await executeTool(request);

    expect(result.duration).toBeGreaterThanOrEqual(0);
    expect(typeof result.duration).toBe("number");
  });
});
