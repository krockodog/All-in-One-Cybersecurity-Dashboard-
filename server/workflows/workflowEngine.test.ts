import { describe, it, expect } from "vitest";
import { PREDEFINED_WORKFLOWS } from "./workflowEngine";

describe("Workflow Engine", () => {
  it("should have predefined workflows", () => {
    expect(Object.keys(PREDEFINED_WORKFLOWS).length).toBeGreaterThan(0);
  });

  it("should have full_pentest workflow", () => {
    const workflow = PREDEFINED_WORKFLOWS.full_pentest;
    expect(workflow).toBeDefined();
    expect(workflow.name).toBe("Full Penetration Test");
    expect(workflow.steps.length).toBeGreaterThan(0);
  });

  it("should have quick_scan workflow", () => {
    const workflow = PREDEFINED_WORKFLOWS.quick_scan;
    expect(workflow).toBeDefined();
    expect(workflow.name).toBe("Quick Security Scan");
    expect(workflow.steps.length).toBeGreaterThan(0);
  });

  it("should have web_app_pentest workflow", () => {
    const workflow = PREDEFINED_WORKFLOWS.web_app_pentest;
    expect(workflow).toBeDefined();
    expect(workflow.name).toBe("Web Application Penetration Test");
    expect(workflow.steps.length).toBeGreaterThan(0);
  });

  it("should have network_recon workflow", () => {
    const workflow = PREDEFINED_WORKFLOWS.network_recon;
    expect(workflow).toBeDefined();
    expect(workflow.name).toBe("Network Reconnaissance");
    expect(workflow.steps.length).toBeGreaterThan(0);
  });

  it("workflow steps should have required fields", () => {
    const workflow = PREDEFINED_WORKFLOWS.full_pentest;

    for (const step of workflow.steps) {
      expect(step).toHaveProperty("id");
      expect(step).toHaveProperty("phase");
      expect(step).toHaveProperty("tool");
      expect(step).toHaveProperty("target");
      expect(step).toHaveProperty("parameters");
    }
  });

  it("should have valid phase values", () => {
    const validPhases = ["osint", "recon", "pentest", "post_exploitation", "reporting"];

    for (const workflow of Object.values(PREDEFINED_WORKFLOWS)) {
      for (const step of workflow.steps) {
        expect(validPhases).toContain(step.phase);
      }
    }
  });

  it("should have valid tool names", () => {
    const validTools = ["nmap", "shodan", "sqlmap", "burp", "nuclei", "subfinder"];

    for (const workflow of Object.values(PREDEFINED_WORKFLOWS)) {
      for (const step of workflow.steps) {
        expect(validTools).toContain(step.tool);
      }
    }
  });
});
