import { exec } from "child_process";
import { promisify } from "util";
import { parseStringPromise } from "xml2js";

const execAsync = promisify(exec);

export interface NmapResult {
  hosts: Array<{
    ip: string;
    hostname?: string;
    status: string;
    ports: Array<{
      port: number;
      protocol: string;
      state: string;
      service: string;
      version?: string;
    }>;
    os?: string;
  }>;
  summary: {
    startTime: string;
    endTime: string;
    duration: number;
    hostsUp: number;
    hostsDown: number;
  };
}

/**
 * Execute Nmap scan and parse results
 */
export async function executeNmapScan(
  target: string,
  options: {
    ports?: string;
    aggressive?: boolean;
    osDetection?: boolean;
    versionDetection?: boolean;
    scriptScan?: boolean;
  } = {},
): Promise<NmapResult> {
  try {
    // Build nmap command
    let cmd = `nmap -oX - ${target}`;

    if (options.ports) {
      cmd += ` -p ${options.ports}`;
    }

    if (options.aggressive) {
      cmd += " -A";
    }

    if (options.osDetection) {
      cmd += " -O";
    }

    if (options.versionDetection) {
      cmd += " -sV";
    }

    if (options.scriptScan) {
      cmd += " --script default";
    }

    // Execute nmap
    const { stdout } = await execAsync(cmd, { timeout: 300000 });

    // Parse XML output
    const parsed = await parseStringPromise(stdout);

    // Extract results
    const result: NmapResult = {
      hosts: [],
      summary: {
        startTime: parsed.nmaprun.$.starttime || new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 0,
        hostsUp: 0,
        hostsDown: 0,
      },
    };

    // Process each host
    if (parsed.nmaprun.host) {
      for (const host of parsed.nmaprun.host) {
        const hostStatus = host.status?.[0]?.$?.state || "unknown";

        if (hostStatus === "up") {
          result.summary.hostsUp++;
        } else {
          result.summary.hostsDown++;
        }

        const hostEntry: (typeof result.hosts)[0] = {
          ip: host.address?.[0]?.$?.addr || "unknown",
          hostname: host.hostnames?.[0]?.hostname?.[0]?.$?.name,
          status: hostStatus,
          ports: [],
        };

        // Extract ports
        if (host.ports?.[0]?.port) {
          for (const port of host.ports[0].port) {
            hostEntry.ports.push({
              port: parseInt(port.$.portid.split("/")[0]),
              protocol: port.$.protocol,
              state: port.state?.[0]?.$?.state || "unknown",
              service: port.service?.[0]?.$?.name || "unknown",
              version: port.service?.[0]?.$?.product,
            });
          }
        }

        // Extract OS
        if (host.os?.[0]?.osmatch?.[0]) {
          hostEntry.os = host.os[0].osmatch[0].$.name;
        }

        result.hosts.push(hostEntry);
      }
    }

    return result;
  } catch (error) {
    throw new Error(`Nmap scan failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Quick port scan (top 1000 ports)
 */
export async function quickPortScan(target: string): Promise<NmapResult> {
  return executeNmapScan(target, {
    ports: "1-1000",
    versionDetection: true,
  });
}

/**
 * Aggressive scan (OS detection, version detection, script scan)
 */
export async function aggressiveScan(target: string): Promise<NmapResult> {
  return executeNmapScan(target, {
    aggressive: true,
    osDetection: true,
    versionDetection: true,
    scriptScan: true,
  });
}
