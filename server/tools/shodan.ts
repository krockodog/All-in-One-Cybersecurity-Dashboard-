import axios from "axios";

export interface ShodanResult {
  ip: string;
  ports: number[];
  hostnames: string[];
  organization: string;
  isp: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  services: Array<{
    port: number;
    protocol: string;
    banner: string;
    product?: string;
    version?: string;
    cpe?: string[];
  }>;
  vulnerabilities: Array<{
    cve: string;
    cvss: number;
    description: string;
  }>;
}

const SHODAN_API_BASE = "https://api.shodan.io";

/**
 * Search Shodan for hosts matching a query
 */
export async function shodanSearch(
  query: string,
  apiKey: string,
  options: {
    page?: number;
    limit?: number;
  } = {},
): Promise<{
  results: Array<{
    ip_str: string;
    port: number;
    hostnames: string[];
    org: string;
    data: string;
  }>;
  total: number;
}> {
  try {
    const params = {
      query,
      key: apiKey,
      page: options.page || 1,
      limit: Math.min(options.limit || 100, 100),
    };

    const response = await axios.get(`${SHODAN_API_BASE}/shodan/host/search`, {
      params,
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `Shodan search failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Get detailed information about a specific IP
 */
export async function shodanHostInfo(ip: string, apiKey: string): Promise<ShodanResult> {
  try {
    const response = await axios.get(`${SHODAN_API_BASE}/shodan/host/${ip}`, {
      params: { key: apiKey },
      timeout: 30000,
    });

    const data = response.data;

    return {
      ip: data.ip_str,
      ports: data.ports || [],
      hostnames: data.hostnames || [],
      organization: data.org || "Unknown",
      isp: data.isp || "Unknown",
      country: data.country_name || "Unknown",
      city: data.city || "Unknown",
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      services: (data.data || []).map((service: any) => ({
        port: service.port,
        protocol: service.transport,
        banner: service.data,
        product: service.product,
        version: service.version,
        cpe: service.cpe,
      })),
      vulnerabilities: (data.vulns || []).map((vuln: string) => ({
        cve: vuln,
        cvss: 0, // Would need to fetch from CVE database
        description: "",
      })),
    };
  } catch (error) {
    throw new Error(
      `Shodan host info failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Search for exposed credentials
 */
export async function shodanSearchCredentials(
  domain: string,
  apiKey: string,
): Promise<Array<{
  type: string;
  value: string;
  source: string;
}>> {
  try {
    const queries = [
      `"${domain}" password`,
      `"${domain}" api_key`,
      `"${domain}" token`,
      `"${domain}" secret`,
    ];

    const results: Array<{
      type: string;
      value: string;
      source: string;
    }> = [];

    for (const query of queries) {
      const searchResults = await shodanSearch(query, apiKey, { limit: 10 });

      for (const result of searchResults.results) {
        // Parse banner for credentials
        const credentialPatterns = [
          { type: "password", regex: /password[:\s=]+([^\s]+)/i },
          { type: "api_key", regex: /api[_-]?key[:\s=]+([^\s]+)/i },
          { type: "token", regex: /token[:\s=]+([^\s]+)/i },
          { type: "secret", regex: /secret[:\s=]+([^\s]+)/i },
        ];

        for (const pattern of credentialPatterns) {
          const match = result.data.match(pattern.regex);
          if (match) {
            results.push({
              type: pattern.type,
              value: match[1],
              source: `${result.ip_str}:${result.port}`,
            });
          }
        }
      }
    }

    return results;
  } catch (error) {
    throw new Error(
      `Shodan credential search failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Get DNS records for a domain
 */
export async function shodanDNSLookup(domain: string, apiKey: string): Promise<{
  domain: string;
  records: Array<{
    type: string;
    value: string;
  }>;
}> {
  try {
    const response = await axios.get(`${SHODAN_API_BASE}/dns/resolve`, {
      params: {
        hostnames: domain,
        key: apiKey,
      },
      timeout: 30000,
    });

    const records: Array<{ type: string; value: string }> = [];

    if (response.data[domain]) {
      records.push({
        type: "A",
        value: response.data[domain],
      });
    }

    return {
      domain,
      records,
    };
  } catch (error) {
    throw new Error(
      `Shodan DNS lookup failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
