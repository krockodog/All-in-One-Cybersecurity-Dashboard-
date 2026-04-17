import { describe, it, expect } from "vitest";
import {
  toolCatalog,
  toolsByCategory,
  categoryLabel,
  riskLabel,
  riskColor,
  defaultSettings,
} from "./cyber-data";

describe("cyber-data", () => {
  describe("toolCatalog", () => {
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

    it("should have valid execution modes", () => {
      const validModes = ["web-integrated", "command-reference", "external"];
      toolCatalog.forEach((tool) => {
        expect(validModes).toContain(tool.executionMode);
      });
    });

    it("should have input fields with required properties", () => {
      toolCatalog.forEach((tool) => {
        tool.inputFields.forEach((field) => {
          expect(field).toHaveProperty("name");
          expect(field).toHaveProperty("label");
          expect(field).toHaveProperty("type");
          expect(["text", "textarea", "select"]).toContain(field.type);
        });
      });
    });
  });

  describe("toolsByCategory", () => {
    it("should have all three categories", () => {
      expect(toolsByCategory).toHaveProperty("osint");
      expect(toolsByCategory).toHaveProperty("pentest");
      expect(toolsByCategory).toHaveProperty("recon");
    });

    it("should have tools in each category", () => {
      expect(toolsByCategory.osint.length).toBeGreaterThan(0);
      expect(toolsByCategory.pentest.length).toBeGreaterThan(0);
      expect(toolsByCategory.recon.length).toBeGreaterThan(0);
    });

    it("should filter tools correctly", () => {
      toolsByCategory.osint.forEach((tool) => {
        expect(tool.category).toBe("osint");
      });
      toolsByCategory.pentest.forEach((tool) => {
        expect(tool.category).toBe("pentest");
      });
      toolsByCategory.recon.forEach((tool) => {
        expect(tool.category).toBe("recon");
      });
    });
  });

  describe("categoryLabel", () => {
    it("should return correct labels", () => {
      expect(categoryLabel("osint")).toBe("OSINT");
      expect(categoryLabel("pentest")).toBe("Pentest");
      expect(categoryLabel("recon")).toBe("Reconnaissance");
    });
  });

  describe("riskLabel", () => {
    it("should return correct labels", () => {
      expect(riskLabel("passiv")).toBe("Passiv");
      expect(riskLabel("kontrolliert")).toBe("Kontrolliert");
      expect(riskLabel("aktiv")).toBe("Aktiv");
    });
  });

  describe("riskColor", () => {
    it("should return correct color classes", () => {
      expect(riskColor("passiv")).toBe("text-green-400");
      expect(riskColor("kontrolliert")).toBe("text-yellow-400");
      expect(riskColor("aktiv")).toBe("text-red-400");
    });
  });

  describe("defaultSettings", () => {
    it("should have default settings", () => {
      expect(defaultSettings).toHaveProperty("mode");
      expect(defaultSettings).toHaveProperty("routing");
      expect(defaultSettings).toHaveProperty("logRetention");
      expect(defaultSettings).toHaveProperty("rateProfile");
      expect(defaultSettings).toHaveProperty("alerts");
      expect(defaultSettings).toHaveProperty("evidenceSnapshots");
    });

    it("should have expected default values", () => {
      expect(defaultSettings.mode).toBe("advisor-controlled");
      expect(defaultSettings.routing).toBe("segmented-workspaces");
      expect(defaultSettings.logRetention).toBe(30);
      expect(defaultSettings.rateProfile).toBe("balanced");
      expect(defaultSettings.alerts).toBe(true);
      expect(defaultSettings.evidenceSnapshots).toBe(true);
    });
  });
});
