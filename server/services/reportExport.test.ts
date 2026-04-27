import { describe, it, expect } from "vitest";
import { generateJsonReport, generateHtmlReport, generateCsvReport, ReportData } from "./reportExport";

const baseReportData: ReportData = {
  engagementId: "eng-001",
  engagementName: "Test Engagement",
  findings: [
    {
      id: 1,
      title: "SQL Injection",
      description: "SQL injection vulnerability in login form",
      severity: "critical",
      cvssScore: "9.8",
      remediation: "Use parameterized queries",
      discoveredAt: new Date("2024-01-15T10:00:00Z"),
    },
    {
      id: 2,
      title: "XSS Vulnerability",
      description: "Reflected XSS in search parameter",
      severity: "high",
      cvssScore: "7.4",
      remediation: "Sanitize user input",
      discoveredAt: new Date("2024-01-16T12:00:00Z"),
    },
    {
      id: 3,
      title: "Missing Security Headers",
      description: "CSP header not set",
      severity: "medium",
      cvssScore: null,
      remediation: "Add Content-Security-Policy header",
      discoveredAt: null,
    },
    {
      id: 4,
      title: "Verbose Error Messages",
      description: "Stack traces exposed in error pages",
      severity: "low",
      cvssScore: "3.1",
      remediation: "Disable debug mode in production",
      discoveredAt: new Date("2024-01-17T08:00:00Z"),
    },
  ],
  generatedAt: new Date("2024-01-20T00:00:00Z"),
  testerName: "Alice Tester",
};

describe("reportExport", () => {
  describe("generateJsonReport", () => {
    it("should return a valid JSON string", () => {
      const result = generateJsonReport(baseReportData);
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it("should include metadata block", () => {
      const result = generateJsonReport(baseReportData);
      const parsed = JSON.parse(result);
      expect(parsed.metadata).toBeDefined();
      expect(parsed.metadata.engagementId).toBe("eng-001");
      expect(parsed.metadata.engagementName).toBe("Test Engagement");
      expect(parsed.metadata.testerName).toBe("Alice Tester");
    });

    it("should include correct findings count in metadata", () => {
      const result = generateJsonReport(baseReportData);
      const parsed = JSON.parse(result);
      expect(parsed.metadata.findingsCount).toBe(4);
    });

    it("should include all findings", () => {
      const result = generateJsonReport(baseReportData);
      const parsed = JSON.parse(result);
      expect(parsed.findings).toHaveLength(4);
    });

    it("should serialize finding fields correctly", () => {
      const result = generateJsonReport(baseReportData);
      const parsed = JSON.parse(result);
      const first = parsed.findings[0];
      expect(first.id).toBe(1);
      expect(first.title).toBe("SQL Injection");
      expect(first.severity).toBe("critical");
      expect(first.cvssScore).toBe("9.8");
    });

    it("should handle null cvssScore as null", () => {
      const result = generateJsonReport(baseReportData);
      const parsed = JSON.parse(result);
      const mediumFinding = parsed.findings.find((f: any) => f.severity === "medium");
      expect(mediumFinding.cvssScore).toBeNull();
    });

    it("should handle null discoveredAt as null", () => {
      const result = generateJsonReport(baseReportData);
      const parsed = JSON.parse(result);
      const mediumFinding = parsed.findings.find((f: any) => f.severity === "medium");
      expect(mediumFinding.discoveredAt).toBeNull();
    });

    it("should serialize discoveredAt as ISO string", () => {
      const result = generateJsonReport(baseReportData);
      const parsed = JSON.parse(result);
      const first = parsed.findings[0];
      expect(first.discoveredAt).toBe("2024-01-15T10:00:00.000Z");
    });

    it("should produce pretty-printed JSON", () => {
      const result = generateJsonReport(baseReportData);
      // Pretty-printed JSON has newlines and indentation
      expect(result).toContain("\n");
    });

    it("should work with empty findings array", () => {
      const emptyData: ReportData = { ...baseReportData, findings: [] };
      const result = generateJsonReport(emptyData);
      const parsed = JSON.parse(result);
      expect(parsed.findings).toHaveLength(0);
      expect(parsed.metadata.findingsCount).toBe(0);
    });
  });

  describe("generateHtmlReport", () => {
    it("should return a non-empty string", () => {
      const result = generateHtmlReport(baseReportData);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should contain DOCTYPE declaration", () => {
      const result = generateHtmlReport(baseReportData);
      expect(result).toContain("<!DOCTYPE html>");
    });

    it("should contain engagement name in title", () => {
      const result = generateHtmlReport(baseReportData);
      expect(result).toContain("Test Engagement");
    });

    it("should contain tester name", () => {
      const result = generateHtmlReport(baseReportData);
      expect(result).toContain("Alice Tester");
    });

    it("should display correct critical findings count", () => {
      const result = generateHtmlReport(baseReportData);
      // 1 critical finding
      expect(result).toContain("critical");
    });

    it("should include all finding titles", () => {
      const result = generateHtmlReport(baseReportData);
      expect(result).toContain("SQL Injection");
      expect(result).toContain("XSS Vulnerability");
      expect(result).toContain("Missing Security Headers");
      expect(result).toContain("Verbose Error Messages");
    });

    it("should include CVSS scores when present", () => {
      const result = generateHtmlReport(baseReportData);
      expect(result).toContain("9.8");
      expect(result).toContain("7.4");
    });

    it("should include remediation text", () => {
      const result = generateHtmlReport(baseReportData);
      expect(result).toContain("Use parameterized queries");
    });

    it("should include severity classes for styling", () => {
      const result = generateHtmlReport(baseReportData);
      expect(result).toContain('class="finding critical"');
      expect(result).toContain('class="finding high"');
      expect(result).toContain('class="finding medium"');
      expect(result).toContain('class="finding low"');
    });

    it("should contain closing html tag", () => {
      const result = generateHtmlReport(baseReportData);
      expect(result).toContain("</html>");
    });

    it("should work with empty findings array", () => {
      const emptyData: ReportData = { ...baseReportData, findings: [] };
      const result = generateHtmlReport(emptyData);
      expect(result).toContain("<!DOCTYPE html>");
      expect(result).toContain("Test Engagement");
    });

    it("should not include CVSS block when score is null", () => {
      const singleFindingData: ReportData = {
        ...baseReportData,
        findings: [
          {
            id: 5,
            title: "No CVSS Finding",
            description: "A finding without CVSS",
            severity: "info",
            cvssScore: null,
            remediation: "No action needed",
            discoveredAt: null,
          },
        ],
      };
      const result = generateHtmlReport(singleFindingData);
      // The CVSS block should only appear when score is present
      expect(result).not.toContain("CVSS Score:</strong> null");
    });
  });

  describe("generateCsvReport", () => {
    it("should return a non-empty string", () => {
      const result = generateCsvReport(baseReportData);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should have a header row", () => {
      const result = generateCsvReport(baseReportData);
      const lines = result.split("\n");
      expect(lines[0]).toBe("ID,Title,Description,Severity,CVSS Score,Remediation,Discovered");
    });

    it("should have correct number of rows", () => {
      const result = generateCsvReport(baseReportData);
      const lines = result.split("\n");
      // 1 header + 4 data rows
      expect(lines).toHaveLength(5);
    });

    it("should include finding IDs", () => {
      const result = generateCsvReport(baseReportData);
      expect(result).toContain("1,");
      expect(result).toContain("2,");
      expect(result).toContain("3,");
      expect(result).toContain("4,");
    });

    it("should include finding severities", () => {
      const result = generateCsvReport(baseReportData);
      expect(result).toContain("critical");
      expect(result).toContain("high");
      expect(result).toContain("medium");
      expect(result).toContain("low");
    });

    it("should quote string fields", () => {
      const result = generateCsvReport(baseReportData);
      expect(result).toContain('"SQL Injection"');
    });

    it("should include ISO date for discoveredAt", () => {
      const result = generateCsvReport(baseReportData);
      expect(result).toContain("2024-01-15T10:00:00.000Z");
    });

    it("should produce empty string for null discoveredAt", () => {
      const result = generateCsvReport(baseReportData);
      // The medium finding has null discoveredAt so the last column should be empty
      const lines = result.split("\n");
      const mediumLine = lines.find((l) => l.includes("medium"));
      expect(mediumLine).toBeDefined();
      expect(mediumLine!.endsWith(",")).toBe(true);
    });

    it("should work with empty findings array", () => {
      const emptyData: ReportData = { ...baseReportData, findings: [] };
      const result = generateCsvReport(emptyData);
      const lines = result.split("\n");
      expect(lines).toHaveLength(1);
      expect(lines[0]).toBe("ID,Title,Description,Severity,CVSS Score,Remediation,Discovered");
    });
  });
});
