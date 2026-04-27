import { describe, it, expect, vi } from "vitest";
import { runSubfinder, runNuclei, performExtendedRecon } from "./nucleiSubfinder";

// nuclei and subfinder binaries are not available in the test environment,
// so these functions fall through to their mock implementations.

describe("nucleiSubfinder", () => {
  describe("runSubfinder", () => {
    it("should return an array of results", async () => {
      const results = await runSubfinder("example.com");
      expect(Array.isArray(results)).toBe(true);
    });

    it("should return results for the given domain", async () => {
      const results = await runSubfinder("example.com");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should have correct domain field on each result", async () => {
      const results = await runSubfinder("example.com");
      for (const result of results) {
        expect(result.domain).toBe("example.com");
      }
    });

    it("should have subdomain field ending with the domain", async () => {
      const results = await runSubfinder("example.com");
      for (const result of results) {
        expect(result.subdomain).toContain("example.com");
      }
    });

    it("should have a source field on each result", async () => {
      const results = await runSubfinder("example.com");
      for (const result of results) {
        expect(result.source).toBeTruthy();
      }
    });

    it("should have a timestamp field on each result", async () => {
      const results = await runSubfinder("example.com");
      for (const result of results) {
        expect(result.timestamp).toBeInstanceOf(Date);
      }
    });

    it("should work with different domain inputs", async () => {
      const results = await runSubfinder("test.org");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].domain).toBe("test.org");
    });

    it("should include common subdomain prefixes", async () => {
      const results = await runSubfinder("example.com");
      const subdomains = results.map((r) => r.subdomain);
      expect(subdomains).toContain("www.example.com");
      expect(subdomains).toContain("mail.example.com");
    });
  });

  describe("runNuclei", () => {
    it("should return an array of results", async () => {
      const results = await runNuclei("https://example.com");
      expect(Array.isArray(results)).toBe(true);
    });

    it("should return at least one result", async () => {
      const results = await runNuclei("https://example.com");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should have required fields on each result", async () => {
      const results = await runNuclei("https://example.com");
      for (const result of results) {
        expect(result).toHaveProperty("template");
        expect(result).toHaveProperty("host");
        expect(result).toHaveProperty("matched");
        expect(result).toHaveProperty("severity");
        expect(result).toHaveProperty("description");
        expect(result).toHaveProperty("timestamp");
      }
    });

    it("should have valid severity values", async () => {
      const validSeverities = ["critical", "high", "medium", "low", "info"];
      const results = await runNuclei("https://example.com");
      for (const result of results) {
        expect(validSeverities).toContain(result.severity);
      }
    });

    it("should set host to target", async () => {
      const results = await runNuclei("https://example.com");
      for (const result of results) {
        expect(result.host).toBe("https://example.com");
      }
    });

    it("should have timestamps as Date objects", async () => {
      const results = await runNuclei("https://example.com");
      for (const result of results) {
        expect(result.timestamp).toBeInstanceOf(Date);
      }
    });

    it("should accept optional templates parameter", async () => {
      // Should not throw when templates are provided
      const results = await runNuclei("https://example.com", ["cves", "security"]);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe("performExtendedRecon", () => {
    it("should return an object with subdomains and vulnerabilities", async () => {
      const result = await performExtendedRecon("example.com");
      expect(result).toHaveProperty("subdomains");
      expect(result).toHaveProperty("vulnerabilities");
    });

    it("should return arrays for both fields", async () => {
      const result = await performExtendedRecon("example.com");
      expect(Array.isArray(result.subdomains)).toBe(true);
      expect(Array.isArray(result.vulnerabilities)).toBe(true);
    });

    it("should return subdomains for the target domain", async () => {
      const result = await performExtendedRecon("example.com");
      expect(result.subdomains.length).toBeGreaterThan(0);
      for (const sub of result.subdomains) {
        expect(sub.domain).toBe("example.com");
      }
    });

    it("should return vulnerabilities for the target", async () => {
      const result = await performExtendedRecon("example.com");
      expect(result.vulnerabilities.length).toBeGreaterThan(0);
    });
  });
});
