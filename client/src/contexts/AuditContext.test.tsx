import { describe, it, expect } from "vitest";
import { toolCatalog } from "@/lib/cyber-data";

describe("AuditContext", () => {
  describe("Tool catalog", () => {
    it("should have tools defined", () => {
      expect(toolCatalog.length).toBeGreaterThan(0);
    });

    it("should have tools with required fields", () => {
      toolCatalog.forEach((tool) => {
        expect(tool).toHaveProperty("id");
        expect(tool).toHaveProperty("name");
        expect(tool).toHaveProperty("category");
        expect(tool).toHaveProperty("risk");
        expect(tool).toHaveProperty("description");
        expect(tool).toHaveProperty("executionMode");
        expect(tool).toHaveProperty("inputFields");
      });
    });

    it("should have valid categories", () => {
      const validCategories = ["osint", "pentest", "recon"];
      toolCatalog.forEach((tool) => {
        expect(validCategories).toContain(tool.category);
      });
    });

    it("should have valid risk levels", () => {
      const validRisks = ["passiv", "kontrolliert", "aktiv"];
      toolCatalog.forEach((tool) => {
        expect(validRisks).toContain(tool.risk);
      });
    });

    it("should have command templates for command-reference tools", () => {
      const commandRefTools = toolCatalog.filter((tool) => tool.executionMode === "command-reference");
      commandRefTools.forEach((tool) => {
        expect(tool.commandTemplate).toBeDefined();
        expect(tool.commandTemplate?.length).toBeGreaterThan(0);
      });
    });

    it("should have input fields for all tools", () => {
      toolCatalog.forEach((tool) => {
        expect(tool.inputFields.length).toBeGreaterThan(0);
        tool.inputFields.forEach((field) => {
          expect(field.name).toBeDefined();
          expect(field.label).toBeDefined();
          expect(["text", "textarea", "select"]).toContain(field.type);
        });
      });
    });
  });

  describe("Tool categories", () => {
    it("should have OSINT tools", () => {
      const osintTools = toolCatalog.filter((tool) => tool.category === "osint");
      expect(osintTools.length).toBeGreaterThan(0);
    });

    it("should have Pentest tools", () => {
      const pentestTools = toolCatalog.filter((tool) => tool.category === "pentest");
      expect(pentestTools.length).toBeGreaterThan(0);
    });

    it("should have Reconnaissance tools", () => {
      const reconTools = toolCatalog.filter((tool) => tool.category === "recon");
      expect(reconTools.length).toBeGreaterThan(0);
    });
  });

  describe("Tool descriptions", () => {
    it("should have descriptions for all tools", () => {
      toolCatalog.forEach((tool) => {
        expect(tool.description).toBeDefined();
        expect(tool.description.length).toBeGreaterThan(0);
        expect(tool.description.length).toBeLessThanOrEqual(100);
      });
    });
  });
});
