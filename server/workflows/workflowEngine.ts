import { createExecutionJob, updateExecutionJobStatus, createFinding } from "../db";
import { executeTool, ToolExecutionRequest, ToolExecutionResult } from "../tools/toolManager";
import { invokeLLM } from "../_core/llm";

export type WorkflowPhase = "osint" | "recon" | "pentest" | "post_exploitation" | "reporting";

export interface WorkflowStep {
  id: string;
  phase: WorkflowPhase;
  tool: string;
  target: string;
  parameters: Record<string, any>;
  dependsOn?: string[];
  condition?: (results: Record<string, ToolExecutionResult>) => boolean;
}

export interface WorkflowDefinition {
  name: string;
  description: string;
  steps: WorkflowStep[];
}

export interface WorkflowExecution {
  engagementId: number;
  workflowId: string;
  status: "running" | "completed" | "failed" | "paused";
  results: Record<string, ToolExecutionResult>;
  findings: Array<{
    severity: "critical" | "high" | "medium" | "low" | "info";
    title: string;
    description: string;
    source: string;
  }>;
  startedAt: Date;
  completedAt?: Date;
}

/**
 * Predefined workflows for common pentesting scenarios
 */
export const PREDEFINED_WORKFLOWS: Record<string, WorkflowDefinition> = {
  full_pentest: {
    name: "Full Penetration Test",
    description: "Complete OSINT → Recon → Pentest workflow",
    steps: [
      // OSINT Phase
      {
        id: "osint_shodan",
        phase: "osint",
        tool: "shodan",
        target: "{target}",
        parameters: { searchType: "host" },
      },
      {
        id: "osint_credentials",
        phase: "osint",
        tool: "shodan",
        target: "{target}",
        parameters: { searchType: "credentials" },
      },

      // Recon Phase
      {
        id: "recon_nmap_quick",
        phase: "recon",
        tool: "nmap",
        target: "{target}",
        parameters: { scanType: "quick" },
        dependsOn: ["osint_shodan"],
      },
      {
        id: "recon_nmap_aggressive",
        phase: "recon",
        tool: "nmap",
        target: "{target}",
        parameters: { scanType: "aggressive" },
        dependsOn: ["recon_nmap_quick"],
        condition: (results) => (results.recon_nmap_quick?.output?.hosts?.length || 0) > 0,
      },

      // Pentest Phase
      {
        id: "pentest_sqlmap",
        phase: "pentest",
        tool: "sqlmap",
        target: "{target}",
        parameters: { scanType: "quick" },
        dependsOn: ["recon_nmap_aggressive"],
      },
      {
        id: "pentest_burp",
        phase: "pentest",
        tool: "burp",
        target: "{target}",
        parameters: { scanType: "crawl_and_audit", waitForCompletion: false },
        dependsOn: ["recon_nmap_aggressive"],
      },
    ],
  },

  quick_scan: {
    name: "Quick Security Scan",
    description: "Fast OSINT and basic recon",
    steps: [
      {
        id: "osint_shodan",
        phase: "osint",
        tool: "shodan",
        target: "{target}",
        parameters: { searchType: "host" },
      },
      {
        id: "recon_nmap",
        phase: "recon",
        tool: "nmap",
        target: "{target}",
        parameters: { scanType: "quick" },
        dependsOn: ["osint_shodan"],
      },
    ],
  },

  web_app_pentest: {
    name: "Web Application Penetration Test",
    description: "Focused on web vulnerabilities",
    steps: [
      {
        id: "pentest_sqlmap",
        phase: "pentest",
        tool: "sqlmap",
        target: "{target}",
        parameters: { scanType: "quick" },
      },
      {
        id: "pentest_burp",
        phase: "pentest",
        tool: "burp",
        target: "{target}",
        parameters: { scanType: "crawl_and_audit" },
      },
    ],
  },

  network_recon: {
    name: "Network Reconnaissance",
    description: "Deep network scanning and enumeration",
    steps: [
      {
        id: "recon_nmap_aggressive",
        phase: "recon",
        tool: "nmap",
        target: "{target}",
        parameters: { scanType: "aggressive" },
      },
    ],
  },
};

/**
 * Execute a workflow
 */
export async function executeWorkflow(
  engagementId: number,
  workflowId: string,
  target: string,
  userId: number,
): Promise<WorkflowExecution> {
  const workflow = PREDEFINED_WORKFLOWS[workflowId];
  if (!workflow) {
    throw new Error(`Workflow not found: ${workflowId}`);
  }

  const execution: WorkflowExecution = {
    engagementId,
    workflowId,
    status: "running",
    results: {},
    findings: [],
    startedAt: new Date(),
  };

  try {
    // Execute steps in order
    for (const step of workflow.steps) {
      // Check dependencies
      if (step.dependsOn) {
        for (const dep of step.dependsOn) {
          if (!execution.results[dep]) {
            console.log(`Skipping step ${step.id}: dependency ${dep} not completed`);
            continue;
          }
        }
      }

      // Check condition
      if (step.condition && !step.condition(execution.results)) {
        console.log(`Skipping step ${step.id}: condition not met`);
        continue;
      }

      // Replace {target} placeholder
      const resolvedTarget = step.target.replace("{target}", target);

      // Create execution job
      const jobResult = await createExecutionJob({
        engagementId,
        phase: step.phase,
        tool: step.tool,
        target: resolvedTarget,
        parameters: step.parameters,
      });

      const jobId = (jobResult as any).insertId || 1;

      try {
        // Execute tool
        const toolRequest: ToolExecutionRequest = {
          tool: step.tool as any,
          phase: (step.phase !== 'reporting' ? step.phase : 'pentest') as any,
          target: resolvedTarget,
          parameters: step.parameters,
          userId,
        };

        const result = await executeTool(toolRequest);
        execution.results[step.id] = result;

        // Update job status
        await updateExecutionJobStatus(
          jobId,
          result.status === "success" ? "success" : "error",
          JSON.stringify(result.output),
          result.error || undefined,
          result.duration,
        );

        // Collect findings
        for (const finding of result.findings) {
          execution.findings.push({
            ...finding,
            source: `${step.tool}:${step.id}`,
          });

          // Store finding in database
          await createFinding({
            jobId,
            engagementId,
            title: finding.title,
            description: finding.description,
            severity: finding.severity,
          });
        }

        console.log(`Step ${step.id} completed: ${result.status}`);
      } catch (error) {
        console.error(`Step ${step.id} failed:`, error);
        await updateExecutionJobStatus(
          jobId,
          "error",
          undefined,
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    execution.status = "completed";
    execution.completedAt = new Date();
  } catch (error) {
    execution.status = "failed";
    execution.completedAt = new Date();
    throw error;
  }

  return execution;
}

/**
 * Generate AI-powered workflow recommendations
 */
export async function generateWorkflowRecommendations(
  target: string,
  targetType: "domain" | "ip" | "url" | "network",
): Promise<Array<{ workflowId: string; reason: string; priority: number }>> {
  const prompt = `
    You are a cybersecurity expert. Given a target for penetration testing, recommend the most appropriate workflows.
    
    Target: ${target}
    Target Type: ${targetType}
    
    Available workflows:
    ${Object.entries(PREDEFINED_WORKFLOWS)
      .map(([id, def]) => `- ${id}: ${def.description}`)
      .join("\n")}
    
    Return a JSON array with recommended workflows in order of priority (1=highest).
    Format: [{"workflowId": "...", "reason": "...", "priority": 1}]
  `;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a cybersecurity expert. Respond only with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "workflow_recommendations",
          strict: true,
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                workflowId: { type: "string" },
                reason: { type: "string" },
                priority: { type: "number" },
              },
              required: ["workflowId", "reason", "priority"],
            },
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    return JSON.parse(contentStr);
  } catch (error) {
    console.error("Failed to generate workflow recommendations:", error);
    return [];
  }
}

/**
 * Analyze workflow results and generate insights
 */
export async function analyzeWorkflowResults(execution: WorkflowExecution): Promise<{
  summary: string;
  riskLevel: "critical" | "high" | "medium" | "low";
  recommendations: string[];
  nextSteps: string[];
}> {
  const findingsSummary = execution.findings
    .map((f) => `${f.severity.toUpperCase()}: ${f.title}`)
    .join("\n");

  const prompt = `
    You are a cybersecurity expert analyzing penetration test results.
    
    Findings:
    ${findingsSummary}
    
    Provide:
    1. A brief executive summary (2-3 sentences)
    2. Overall risk level (critical/high/medium/low)
    3. Top 3 remediation recommendations
    4. Suggested next steps for the penetration test
    
    Format as JSON with keys: summary, riskLevel, recommendations (array), nextSteps (array)
  `;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a cybersecurity expert. Respond only with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "workflow_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              riskLevel: { type: "string", enum: ["critical", "high", "medium", "low"] },
              recommendations: { type: "array", items: { type: "string" } },
              nextSteps: { type: "array", items: { type: "string" } },
            },
            required: ["summary", "riskLevel", "recommendations", "nextSteps"],
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        summary: "Analysis failed",
        riskLevel: "medium",
        recommendations: [],
        nextSteps: [],
      };
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    return JSON.parse(contentStr);
  } catch (error) {
    console.error("Failed to analyze workflow results:", error);
    return {
      summary: "Analysis failed",
      riskLevel: "medium",
      recommendations: [],
      nextSteps: [],
    };
  }
}
