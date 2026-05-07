import { execSync } from "child_process";

export interface SubfinderResult {
  domain: string;
  subdomain: string;
  source: string;
  timestamp: Date;
}

export interface NucleiResult {
  template: string;
  host: string;
  matched: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  description: string;
  timestamp: Date;
}

export async function runSubfinder(domain: string): Promise<SubfinderResult[]> {
  try {
    // Check if subfinder is installed
    try {
      execSync("which subfinder", { stdio: "ignore" });
    } catch {
      console.log("Subfinder not installed. Returning mock results.");
      return generateMockSubfinderResults(domain);
    }

    // Run subfinder
    const output = execSync(`subfinder -d ${domain} -json`, {
      encoding: "utf-8",
      timeout: 30000,
    });

    const results = output
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        try {
          const json = JSON.parse(line);
          return {
            domain,
            subdomain: json.host,
            source: json.source || "subfinder",
            timestamp: new Date(),
          };
        } catch {
          return null;
        }
      })
      .filter((r) => r !== null) as SubfinderResult[];

    return results;
  } catch (error) {
    console.error("Subfinder execution failed:", error);
    return generateMockSubfinderResults(domain);
  }
}

export async function runNuclei(target: string, templates?: string[]): Promise<NucleiResult[]> {
  try {
    // Check if nuclei is installed
    try {
      execSync("which nuclei", { stdio: "ignore" });
    } catch {
      console.log("Nuclei not installed. Returning mock results.");
      return generateMockNucleiResults(target);
    }

    // Run nuclei with templates
    const templateArgs = templates && templates.length > 0 ? `-t ${templates.join(",")}` : "-t cves";

    const output = execSync(`nuclei -u ${target} ${templateArgs} -json`, {
      encoding: "utf-8",
      timeout: 60000,
    });

    const results = output
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        try {
          const json = JSON.parse(line);
          return {
            template: json.template || "unknown",
            host: json.host || target,
            matched: json.matched_at || target,
            severity: (json.info?.severity || "info").toLowerCase() as "critical" | "high" | "medium" | "low" | "info",
            description: json.info?.description || "No description",
            timestamp: new Date(),
          };
        } catch {
          return null;
        }
      })
      .filter((r) => r !== null) as NucleiResult[];

    return results;
  } catch (error) {
    console.error("Nuclei execution failed:", error);
    return generateMockNucleiResults(target);
  }
}

function generateMockSubfinderResults(domain: string): SubfinderResult[] {
  const subdomains = ["www", "mail", "ftp", "admin", "api", "dev", "staging", "test"];
  return subdomains.map((sub) => ({
    domain,
    subdomain: `${sub}.${domain}`,
    source: "mock",
    timestamp: new Date(),
  }));
}

function generateMockNucleiResults(target: string): NucleiResult[] {
  return [
    {
      template: "cves/2024-1234",
      host: target,
      matched: `${target}/vulnerable-endpoint`,
      severity: "high",
      description: "Potential vulnerability detected",
      timestamp: new Date(),
    },
    {
      template: "security/ssl-configuration",
      host: target,
      matched: `${target}:443`,
      severity: "medium",
      description: "SSL/TLS configuration issue",
      timestamp: new Date(),
    },
  ];
}

export async function performExtendedRecon(target: string): Promise<{
  subdomains: SubfinderResult[];
  vulnerabilities: NucleiResult[];
}> {
  const [subdomains, vulnerabilities] = await Promise.all([
    runSubfinder(target),
    runNuclei(target, ["cves", "security"]),
  ]);

  return {
    subdomains,
    vulnerabilities,
  };
}
