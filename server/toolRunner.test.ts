import { describe, it, expect } from "vitest";
import { runTool } from "./toolRunner";
import type { ToolRunInput } from "./toolRunner";

describe("toolRunner", () => {
  describe("runTool", () => {
    it("should execute DNS enumeration for a domain", async () => {
      const input: ToolRunInput = {
        toolId: "dns-enumeration",
        toolName: "DNS Enumeration",
        baseCommand: "dig",
        target: "example.com",
        options: "",
        category: "osint",
      };

      const result = await runTool(input);

      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("mode");
      expect(result).toHaveProperty("output");
      expect(result).toHaveProperty("summary");
      expect(result).toHaveProperty("findings");
      expect(result).toHaveProperty("command");
      expect(result).toHaveProperty("target");
      expect(result).toHaveProperty("options");
    }, { timeout: 10000 });

    it("should return success status for valid DNS queries", async () => {
      const input: ToolRunInput = {
        toolId: "dns-enumeration",
        toolName: "DNS Enumeration",
        baseCommand: "dig",
        target: "example.com",
        options: "",
        category: "osint",
      };

      const result = await runTool(input);

      expect(result.status).toBe("success");
      expect(result.findings.length).toBeGreaterThan(0);
    }, { timeout: 10000 });

    it("should build correct command string", async () => {
      const input: ToolRunInput = {
        toolId: "dns-enumeration",
        toolName: "DNS Enumeration",
        baseCommand: "dig",
        target: "example.com",
        options: "+short",
        category: "osint",
      };

      const result = await runTool(input);

      expect(result.command).toContain("dig");
      expect(result.command).toContain("example.com");
      expect(result.command).toContain("+short");
    }, { timeout: 10000 });

    it("should include output in result", async () => {
      const input: ToolRunInput = {
        toolId: "dns-enumeration",
        toolName: "DNS Enumeration",
        baseCommand: "dig",
        target: "example.com",
        options: "",
        category: "osint",
      };

      const result = await runTool(input);

      expect(result.output).toBeDefined();
      expect(result.output.length).toBeGreaterThan(0);
      expect(result.output).toContain("[");
    }, { timeout: 10000 });

    it("should have findings array", async () => {
      const input: ToolRunInput = {
        toolId: "dns-enumeration",
        toolName: "DNS Enumeration",
        baseCommand: "dig",
        target: "example.com",
        options: "",
        category: "osint",
      };

      const result = await runTool(input);

      expect(Array.isArray(result.findings)).toBe(true);
      expect(result.findings.length).toBeGreaterThan(0);
    }, { timeout: 10000 });

    it("should have valid mode", async () => {
      const input: ToolRunInput = {
        toolId: "dns-enumeration",
        toolName: "DNS Enumeration",
        baseCommand: "dig",
        target: "example.com",
        options: "",
        category: "osint",
      };

      const result = await runTool(input);

      expect(["integrated", "guided"]).toContain(result.mode);
    }, { timeout: 10000 });

    it("should preserve target and options in result", async () => {
      const input: ToolRunInput = {
        toolId: "dns-enumeration",
        toolName: "DNS Enumeration",
        baseCommand: "dig",
        target: "example.com",
        options: "+short",
        category: "osint",
      };

      const result = await runTool(input);

      expect(result.target).toBe("example.com");
      expect(result.options).toBe("+short");
    }, { timeout: 10000 });
  });
});

import { isPublicIp } from "./toolRunner";

describe("SSRF guard", () => {
  it("classifies private, loopback, metadata and mapped addresses as non-public", () => {
    for (const ip of [
      "127.0.0.1",
      "10.1.2.3",
      "172.16.0.1",
      "192.168.1.1",
      "169.254.169.254",
      "100.64.0.1",
      "0.0.0.0",
      "::1",
      "fd00::1",
      "fe80::1",
      "::ffff:127.0.0.1",
    ]) {
      expect(isPublicIp(ip), ip).toBe(false);
    }
    expect(isPublicIp("93.184.216.34")).toBe(true);
    expect(isPublicIp("2606:4700:4700::1111")).toBe(true);
  });

  it("rejects hostnames that resolve to loopback", async () => {
    const result = await runTool({
      toolId: "httpx",
      toolName: "httpx",
      baseCommand: "httpx",
      target: "localhost.",
      options: "",
      category: "recon",
    });
    expect(result.status).toBe("error");
    expect(result.findings.join(" ")).toMatch(/Gesperrtes Ziel/);
  });
});
