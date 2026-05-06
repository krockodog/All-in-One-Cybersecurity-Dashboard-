import { z } from "zod";
import { runTool } from "./toolRunner";
import { toolCatalog } from "../client/src/lib/cyber-data";

export interface PipelineStep {
  id: string;
  toolId: string;
  toolName: string;
  inputs: Record<string, string>;
  dependencies: string[]; // IDs of steps that must complete first
  parallel: boolean; // Can run in parallel with other steps
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  steps: PipelineStep[];
  scope: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineExecution {
  pipelineId: string;
  executionId: string;
  status: "running" | "completed" | "failed";
  steps: Array<{
    stepId: string;
    toolName: string;
    status: "pending" | "running" | "completed" | "failed";
    output: string;
    findings: any[];
    startTime?: Date;
    endTime?: Date;
    error?: string;
  }>;
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
}

/**
 * Execute a pipeline with tool chaining
 * Supports both sequential and parallel execution
 */
export async function executePipeline(pipeline: Pipeline): Promise<PipelineExecution> {
  const execution: PipelineExecution = {
    pipelineId: pipeline.id,
    executionId: `exec-${Date.now()}`,
    status: "running",
    steps: pipeline.steps.map((step) => ({
      stepId: step.id,
      toolName: step.toolName,
      status: "pending",
      output: "",
      findings: [],
    })),
    startTime: new Date(),
  };

  try {
    // Build execution graph
    const executionGraph = buildExecutionGraph(pipeline.steps);

    // Execute in waves (respecting dependencies)
    for (const wave of executionGraph) {
      // Execute all steps in this wave in parallel
      const wavePromises = wave.map((stepId) =>
        executeStep(execution, pipeline, stepId, execution.steps)
      );

      await Promise.all(wavePromises);
    }

    execution.status = "completed";
  } catch (error) {
    execution.status = "failed";
    console.error("Pipeline execution failed:", error);
  }

  execution.endTime = new Date();
  execution.totalDuration = execution.endTime.getTime() - execution.startTime.getTime();

  return execution;
}

/**
 * Build execution graph respecting dependencies
 * Returns array of waves, each wave contains steps that can run in parallel
 */
function buildExecutionGraph(steps: PipelineStep[]): string[][] {
  const graph: string[][] = [];
  const completed = new Set<string>();
  const stepMap = new Map(steps.map((s) => [s.id, s]));

  while (completed.size < steps.length) {
    const wave: string[] = [];

    for (const step of steps) {
      if (completed.has(step.id)) continue;

      // Check if all dependencies are completed
      const depsCompleted = step.dependencies.every((dep) => completed.has(dep));

      if (depsCompleted) {
        wave.push(step.id);
      }
    }

    if (wave.length === 0) {
      throw new Error("Circular dependency detected in pipeline");
    }

    graph.push(wave);
    wave.forEach((id) => completed.add(id));
  }

  return graph;
}

/**
 * Execute a single step in the pipeline
 * Automatically passes output from previous steps as input
 */
async function executeStep(
  execution: PipelineExecution,
  pipeline: Pipeline,
  stepId: string,
  allSteps: PipelineExecution["steps"]
): Promise<void> {
  const pipelineStep = pipeline.steps.find((s) => s.id === stepId);
  const executionStep = allSteps.find((s) => s.stepId === stepId);

  if (!pipelineStep || !executionStep) return;

  executionStep.status = "running";
  executionStep.startTime = new Date();

  try {
    // Get tool definition
    const tool = toolCatalog.find((t) => t.id === pipelineStep.toolId);
    if (!tool) throw new Error(`Tool ${pipelineStep.toolId} not found`);

    // Prepare inputs: merge manual inputs with outputs from dependencies
    let inputs = { ...pipelineStep.inputs };

    // If there are dependencies, pass their outputs as inputs
    for (const depId of pipelineStep.dependencies) {
      const depStep = allSteps.find((s) => s.stepId === depId);
      if (depStep && depStep.output) {
        // Parse output and extract relevant data
        const parsedOutput = parseToolOutput(depStep.output, tool.category);
        inputs = { ...inputs, ...parsedOutput };
      }
    }

    // Execute the tool
    const result = await runTool({
      toolId: tool.id,
      toolName: tool.name,
      baseCommand: tool.commandTemplate || tool.name,
      target: inputs.target || pipeline.scope,
      options: inputs.options || "",
      category: tool.category,
    });

    executionStep.output = result.output;
    executionStep.findings = result.findings || [];
    executionStep.status = "completed";
  } catch (error) {
    executionStep.status = "failed";
    executionStep.error = error instanceof Error ? error.message : "Unknown error";
  }

  executionStep.endTime = new Date();
}

/**
 * Parse tool output to extract relevant data for next tool
 * Different tools produce different output formats
 */
function parseToolOutput(output: string, category: string): Record<string, string> {
  const result: Record<string, string> = {};

  // Extract ports from Nmap-like output
  if (category === "recon" || output.includes("open")) {
    const portMatch = output.match(/(\d+)\/tcp\s+open/g);
    if (portMatch) {
      result.ports = portMatch.map((p) => p.split("/")[0]).join(",");
    }
  }

  // Extract URLs from OSINT tools
  if (output.includes("http")) {
    const urlMatches = output.match(/https?:\/\/[^\s]+/g);
    if (urlMatches) {
      result.urls = urlMatches.join("\n");
    }
  }

  // Extract IPs
  const ipMatches = output.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g);
  if (ipMatches) {
    const uniqueIps = Array.from(new Set(ipMatches));
    result.ips = uniqueIps.join(",");
  }

  // Extract domains
  const domainMatches = output.match(/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}/gi);
  if (domainMatches) {
    const uniqueDomains = Array.from(new Set(domainMatches));
    result.domains = uniqueDomains.join(",");
  }

  result.raw_output = output;
  return result;
}

/**
 * Create a predefined pipeline template
 */
export function createPipelineTemplate(
  name: string,
  description: string,
  toolIds: string[],
  scope: string
): Pipeline {
  const steps: PipelineStep[] = toolIds.map((toolId, index) => {
    const tool = toolCatalog.find((t) => t.id === toolId);
    return {
      id: `step-${index}`,
      toolId,
      toolName: tool?.name || toolId,
      inputs: { target: scope },
      dependencies: index > 0 ? [`step-${index - 1}`] : [], // Sequential by default
      parallel: false,
    };
  });

  return {
    id: `pipeline-${Date.now()}`,
    name,
    description,
    steps,
    scope,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Common pipeline templates
 */
export const PIPELINE_TEMPLATES = {
  reconnaissance: () =>
    createPipelineTemplate(
      "Full Reconnaissance",
      "Nmap → Shodan → DNS Enumeration → Subdomain Discovery",
      ["nmap", "shodan", "dnsenum", "sublist3r"],
      ""
    ),

  webAppPentest: () =>
    createPipelineTemplate(
      "Web Application Pentest",
      "Nikto → SQLMap → XSStrike → Burp Suite",
      ["nikto", "sqlmap", "xsstrike", "burpsuite"],
      ""
    ),

  osint: () =>
    createPipelineTemplate(
      "OSINT Investigation",
      "Whois → DNS Lookup → Reverse IP → Email Finder",
      ["whois", "dig", "reverse-ip", "hunter"],
      ""
    ),

  cloudSecurity: () =>
    createPipelineTemplate(
      "Cloud Security Audit",
      "S3 Scanner → IAM Analyzer → CloudTrail Review",
      ["s3scanner", "iamalyzer", "cloudtrail"],
      ""
    ),
};
