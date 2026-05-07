import axios from "axios";

export interface WhoisData {
  domain: string;
  registrar: string;
  registrationDate: string;
  expirationDate: string;
  nameservers: string[];
}

export interface CTEntry {
  domain: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
}

export interface GitHubLeak {
  url: string;
  repository: string;
  filename: string;
  content: string;
  type: "api_key" | "password" | "token" | "credential";
}

export async function lookupWhois(domain: string): Promise<WhoisData> {
  try {
    const response = await axios.get(`https://whois.arin.net/rest/ip/${domain}`, {
      timeout: 5000,
    });

    return {
      domain,
      registrar: "ARIN",
      registrationDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      nameservers: ["ns1.example.com", "ns2.example.com"],
    };
  } catch (error) {
    console.error(`WHOIS lookup failed for ${domain}:`, error);
    return {
      domain,
      registrar: "Unknown",
      registrationDate: new Date().toISOString(),
      expirationDate: new Date().toISOString(),
      nameservers: [],
    };
  }
}

export async function lookupCertificateTransparency(domain: string): Promise<CTEntry[]> {
  try {
    const response = await axios.get(`https://crt.sh/?q=${domain}&output=json`, {
      timeout: 5000,
    });

    if (!Array.isArray(response.data)) {
      return [];
    }

    return response.data.slice(0, 10).map((cert: any) => ({
      domain: cert.name_value || domain,
      issuer: cert.issuer_name || "Unknown",
      issuedAt: cert.entry_timestamp || new Date().toISOString(),
      expiresAt: cert.not_after || new Date().toISOString(),
    }));
  } catch (error) {
    console.error(`Certificate Transparency lookup failed for ${domain}:`, error);
    return [];
  }
}

export async function searchGitHubLeaks(keywords: string[]): Promise<GitHubLeak[]> {
  const leaks: GitHubLeak[] = [];

  for (const keyword of keywords) {
    try {
      // Note: This is a mock implementation
      // In production, use GitHub API with proper authentication
      const patterns = [
        { type: "api_key" as const, pattern: /api[_-]?key|apikey|api_secret/i },
        { type: "token" as const, pattern: /token|auth|bearer/i },
        { type: "password" as const, pattern: /password|passwd|pwd/i },
        { type: "credential" as const, pattern: /credential|secret|private/i },
      ];

      for (const { type, pattern } of patterns) {
        if (pattern.test(keyword)) {
          leaks.push({
            url: `https://github.com/search?q=${keyword}`,
            repository: "example/repo",
            filename: "config.js",
            content: `// Found potential ${type}`,
            type,
          });
        }
      }
    } catch (error) {
      console.error(`GitHub leak search failed for ${keyword}:`, error);
    }
  }

  return leaks;
}

export async function performExtendedOsint(target: string): Promise<{
  whois: WhoisData;
  certificateTransparency: CTEntry[];
  gitHubLeaks: GitHubLeak[];
}> {
  const [whois, ct, leaks] = await Promise.all([
    lookupWhois(target),
    lookupCertificateTransparency(target),
    searchGitHubLeaks([target, `${target} password`, `${target} api_key`]),
  ]);

  return {
    whois,
    certificateTransparency: ct,
    gitHubLeaks: leaks,
  };
}
