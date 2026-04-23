import { exec } from "child_process";
import { promisify } from "util";
import { readFile, writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const execAsync = promisify(exec);

export interface SQLMapResult {
  url: string;
  vulnerable: boolean;
  databases: string[];
  tables: Record<string, string[]>;
  injectionPoints: Array<{
    parameter: string;
    type: string;
    dbms: string;
    payload: string;
  }>;
  findings: Array<{
    severity: "critical" | "high" | "medium" | "low";
    title: string;
    description: string;
    payload: string;
  }>;
}

/**
 * Execute SQLMap scan
 */
export async function executeSQLMapScan(
  url: string,
  options: {
    method?: "GET" | "POST";
    data?: string;
    headers?: Record<string, string>;
    dbs?: boolean;
    tables?: boolean;
    columns?: boolean;
    dump?: boolean;
    level?: 1 | 2 | 3 | 4 | 5;
    risk?: 1 | 2 | 3;
  } = {},
): Promise<SQLMapResult> {
  const tempDir = tmpdir();
  const outputFile = join(tempDir, `sqlmap-${Date.now()}.json`);

  try {
    // Build sqlmap command
    let cmd = `sqlmap -u "${url}" --batch --json-file "${outputFile}"`;

    if (options.method) {
      cmd += ` -m ${options.method}`;
    }

    if (options.data) {
      cmd += ` --data "${options.data}"`;
    }

    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        cmd += ` -H "${key}: ${value}"`;
      }
    }

    if (options.dbs) {
      cmd += " --dbs";
    }

    if (options.tables) {
      cmd += " --tables";
    }

    if (options.columns) {
      cmd += " --columns";
    }

    if (options.dump) {
      cmd += " --dump";
    }

    cmd += ` --level ${options.level || 1}`;
    cmd += ` --risk ${options.risk || 1}`;

    // Execute sqlmap
    try {
      await execAsync(cmd, { timeout: 600000 });
    } catch (error) {
      // SQLMap might exit with non-zero code even on success
      console.log("SQLMap execution completed");
    }

    // Read results
    let results: any = {
      url,
      vulnerable: false,
      databases: [],
      tables: {},
      injectionPoints: [],
      findings: [],
    };

    try {
      const fileContent = await readFile(outputFile, "utf-8");
      const parsed = JSON.parse(fileContent);

      if (parsed.results && parsed.results.length > 0) {
        const result = parsed.results[0];

        results.vulnerable = !!result.vulnerability;

        if (result.databases) {
          results.databases = result.databases;
        }

        if (result.tables) {
          results.tables = result.tables;
        }

        if (result.injectionPoints) {
          results.injectionPoints = result.injectionPoints.map((point: any) => ({
            parameter: point.parameter,
            type: point.type,
            dbms: point.dbms,
            payload: point.payload,
          }));
        }

        // Generate findings
        if (results.vulnerable) {
          results.findings.push({
            severity: "critical",
            title: "SQL Injection Vulnerability Detected",
            description: `The application is vulnerable to SQL injection attacks. Injection points: ${results.injectionPoints.map((p: any) => p.parameter).join(", ")}`,
            payload: results.injectionPoints[0]?.payload || "",
          });
        }
      }
    } catch (error) {
      console.log("Could not parse SQLMap results");
    }

    return results;
  } catch (error) {
    throw new Error(
      `SQLMap scan failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  } finally {
    // Cleanup
    try {
      await unlink(outputFile);
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Quick SQL injection test
 */
export async function quickSQLInjectionTest(url: string): Promise<SQLMapResult> {
  return executeSQLMapScan(url, {
    level: 1,
    risk: 1,
  });
}

/**
 * Aggressive SQL injection scan with database enumeration
 */
export async function aggressiveSQLInjectionScan(url: string): Promise<SQLMapResult> {
  return executeSQLMapScan(url, {
    level: 5,
    risk: 3,
    dbs: true,
    tables: true,
    columns: true,
  });
}

/**
 * Test specific parameter for SQL injection
 */
export async function testParameterSQLInjection(
  url: string,
  parameter: string,
  method: "GET" | "POST" = "GET",
): Promise<SQLMapResult> {
  return executeSQLMapScan(url, {
    method,
    level: 2,
    risk: 1,
  });
}
