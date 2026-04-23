import { getToolCredential } from "../db";
import { executeNmapScan, quickPortScan, aggressiveScan } from "./nmap";
import { shodanSearch, shodanHostInfo, shodanSearchCredentials } from "./shodan";
import { executeSQLMapScan, quickSQLInjectionTest } from "./sqlmap";
import { createBurpClient } from "./burp";

export type ToolType = "nmap" | "shodan" | "sqlmap" | "burp" | "nuclei" | "subfinder";
export type ToolPhase = "osint" | "recon" | "pentest" | "post_exploitation";

export interface ToolExecutionRequest {
  tool: ToolType;
  phase: ToolPhase;
  target: string;
  parameters: Record<string, any>;
  userId: number;
}

export interface ToolExecutionResult {
  tool: ToolType;
  target: string;
  status: "success" | "error";
  output: any;
  error?: string;
  duration: number;
  findings: Array<{
    severity: "critical" | "high" | "medium" | "low" | "info";
    title: string;
    description: string;
  }>;
}

/**
 * Execute a tool based on type and phase
 */
export async function executeTool(request: ToolExecutionRequest): Promise<ToolExecutionResult> {
  const startTime = Date.now();

  try {
    let output: any;
    let findings: ToolExecutionResult["findings"] = [];

    switch (request.tool) {
      case "nmap":
        output = await executeNmapTool(request.target, request.parameters);
        findings = extractNmapFindings(output);
        break;

      case "shodan":
        output = await executeShodanTool(request.target, request.parameters, request.userId);
        findings = extractShodanFindings(output);
        break;

      case "sqlmap":
        output = await executeSQLMapTool(request.target, request.parameters);
        findings = extractSQLMapFindings(output);
        break;

      case "burp":
        output = await executeBurpTool(request.target, request.parameters, request.userId);
        findings = extractBurpFindings(output);
        break;

      case "nuclei":
        output = await executeNucleiTool(request.target, request.parameters);
        findings = extractNucleiFindings(output);
        break;

      case "subfinder":
        output = await executeSubfinderTool(request.target, request.parameters);
        findings = extractSubfinderFindings(output);
        break;

      default:
        throw new Error(`Unknown tool: ${request.tool}`);
    }

    return {
      tool: request.tool,
      target: request.target,
      status: "success",
      output,
      duration: Date.now() - startTime,
      findings,
    };
  } catch (error) {
    return {
      tool: request.tool,
      target: request.target,
      status: "error",
      output: null,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
      findings: [],
    };
  }
}

/**
 * Execute Nmap tool
 */
async function executeNmapTool(
  target: string,
  parameters: Record<string, any>,
): Promise<any> {
  const scanType = parameters.scanType || "quick";

  if (scanType === "quick") {
    return quickPortScan(target);
  } else if (scanType === "aggressive") {
    return aggressiveScan(target);
  } else {
    return executeNmapScan(target, {
      ports: parameters.ports,
      aggressive: parameters.aggressive,
      osDetection: parameters.osDetection,
      versionDetection: parameters.versionDetection,
      scriptScan: parameters.scriptScan,
    });
  }
}

/**
 * Execute Shodan tool
 */
async function executeShodanTool(
  target: string,
  parameters: Record<string, any>,
  userId: number,
): Promise<any> {
  // Get Shodan API key from credentials
  const credential = await getToolCredential(userId, "shodan");
  if (!credential) {
    throw new Error("Shodan API key not configured");
  }

  const apiKey = credential.encryptedValue; // In production, decrypt this

  const searchType = parameters.searchType || "host";

  if (searchType === "host") {
    return shodanHostInfo(target, apiKey);
  } else if (searchType === "search") {
    return shodanSearch(target, apiKey, {
      page: parameters.page,
      limit: parameters.limit,
    });
  } else if (searchType === "credentials") {
    return shodanSearchCredentials(target, apiKey);
  } else {
    return shodanHostInfo(target, apiKey);
  }
}

/**
 * Execute SQLMap tool
 */
async function executeSQLMapTool(
  target: string,
  parameters: Record<string, any>,
): Promise<any> {
  const scanType = parameters.scanType || "quick";

  if (scanType === "quick") {
    return quickSQLInjectionTest(target);
  } else {
    return executeSQLMapScan(target, {
      method: parameters.method,
      data: parameters.data,
      headers: parameters.headers,
      dbs: parameters.dbs,
      tables: parameters.tables,
      columns: parameters.columns,
      dump: parameters.dump,
      level: parameters.level || 1,
      risk: parameters.risk || 1,
    });
  }
}

/**
 * Execute Burp tool
 */
async function executeBurpTool(
  target: string,
  parameters: Record<string, any>,
  userId: number,
): Promise<any> {
  // Get Burp credentials
  const credential = await getToolCredential(userId, "burp");
  if (!credential) {
    throw new Error("Burp Suite credentials not configured");
  }

  const burpUrl = parameters.burpUrl || "http://localhost:1337";
  const apiKey = credential.encryptedValue; // In production, decrypt this

  const burp = createBurpClient(burpUrl, apiKey);

  const scanType = parameters.scanType || "crawl_and_audit";
  const scanId = await burp.startScan(target, scanType);

  // Wait for scan to complete or return scan ID
  if (parameters.waitForCompletion) {
    let status = await burp.getScanStatus(scanId);
    while (status.status === "running" && status.progress < 100) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      status = await burp.getScanStatus(scanId);
    }
    return status;
  } else {
    return { scanId, status: "started" };
  }
}

/**
 * Execute Nuclei tool (placeholder)
 */
async function executeNucleiTool(
  target: string,
  parameters: Record<string, any>,
): Promise<any> {
  // Placeholder for Nuclei integration
  return {
    tool: "nuclei",
    target,
    templates: parameters.templates || "cves",
    status: "not_implemented",
  };
}

/**
 * Execute Subfinder tool (placeholder)
 */
async function executeSubfinderTool(
  target: string,
  parameters: Record<string, any>,
): Promise<any> {
  // Placeholder for Subfinder integration
  return {
    tool: "subfinder",
    target,
    status: "not_implemented",
  };
}

/**
 * Extract findings from Nmap results
 */
function extractNmapFindings(output: any): ToolExecutionResult["findings"] {
  const findings: ToolExecutionResult["findings"] = [];

  if (!output.hosts) return findings;

  for (const host of output.hosts) {
    // Open ports finding
    if (host.ports && host.ports.length > 0) {
      findings.push({
        severity: "medium",
        title: `${host.ports.length} Open Ports Detected on ${host.ip}`,
        description: `Found ${host.ports.length} open ports: ${host.ports.map((p: any) => `${p.port}/${p.protocol}`).join(", ")}`,
      });
    }

    // OS detection finding
    if (host.os) {
      findings.push({
        severity: "info",
        title: `OS Detected: ${host.os}`,
        description: `Operating system identified as: ${host.os}`,
      });
    }
  }

  return findings;
}

/**
 * Extract findings from Shodan results
 */
function extractShodanFindings(output: any): ToolExecutionResult["findings"] {
  const findings: ToolExecutionResult["findings"] = [];

  if (output.services && output.services.length > 0) {
    findings.push({
      severity: "medium",
      title: `${output.services.length} Services Exposed on ${output.ip}`,
      description: `Found ${output.services.length} exposed services`,
    });
  }

  if (output.vulnerabilities && output.vulnerabilities.length > 0) {
    findings.push({
      severity: "high",
      title: `${output.vulnerabilities.length} Known Vulnerabilities`,
      description: `Found ${output.vulnerabilities.length} CVEs affecting this host`,
    });
  }

  return findings;
}

/**
 * Extract findings from SQLMap results
 */
function extractSQLMapFindings(output: any): ToolExecutionResult["findings"] {
  const findings: ToolExecutionResult["findings"] = [];

  if (output.vulnerable) {
    findings.push({
      severity: "critical",
      title: "SQL Injection Vulnerability",
      description: `SQL injection detected on ${output.url}`,
    });

    if (output.injectionPoints && output.injectionPoints.length > 0) {
      findings.push({
        severity: "high",
        title: `${output.injectionPoints.length} Injection Points Found`,
        description: `Parameters: ${output.injectionPoints.map((p: any) => p.parameter).join(", ")}`,
      });
    }
  }

  return findings;
}

/**
 * Extract findings from Burp results
 */
function extractBurpFindings(output: any): ToolExecutionResult["findings"] {
  const findings: ToolExecutionResult["findings"] = [];

  if (output.summary) {
    if (output.summary.highSeverity > 0) {
      findings.push({
        severity: "high",
        title: `${output.summary.highSeverity} High Severity Issues Found`,
        description: `Burp scan detected ${output.summary.highSeverity} high severity vulnerabilities`,
      });
    }

    if (output.summary.mediumSeverity > 0) {
      findings.push({
        severity: "medium",
        title: `${output.summary.mediumSeverity} Medium Severity Issues Found`,
        description: `Burp scan detected ${output.summary.mediumSeverity} medium severity vulnerabilities`,
      });
    }
  }

  return findings;
}

/**
 * Extract findings from Nuclei results
 */
function extractNucleiFindings(output: any): ToolExecutionResult["findings"] {
  return [];
}

/**
 * Extract findings from Subfinder results
 */
function extractSubfinderFindings(output: any): ToolExecutionResult["findings"] {
  return [];
}
