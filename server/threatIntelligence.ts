/**
 * Threat Intelligence Service
 * Integrates CVE, Exploit-DB, and CISA KEV data for vulnerability lookups
 */

export interface CVERecord {
  id: string;
  description: string;
  cvssScore: number;
  cvssVector: string;
  publishedDate: string;
  lastModifiedDate: string;
  references: string[];
  cpeMatches: string[];
}

export interface ExploitRecord {
  id: string;
  title: string;
  description: string;
  author: string;
  type: string;
  platform: string;
  date: string;
  verified: boolean;
  url: string;
}

export interface CISAKEVRecord {
  cveId: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  dueDate: string;
  notes: string;
}

export interface ThreatIntelligenceData {
  cve?: CVERecord;
  exploits?: ExploitRecord[];
  cisaKev?: CISAKEVRecord;
  riskScore: number;
  isKnownExploited: boolean;
}

class ThreatIntelligenceService {
  private cveCache: Map<string, CVERecord> = new Map();
  private exploitCache: Map<string, ExploitRecord[]> = new Map();
  private cisaKevCache: Map<string, CISAKEVRecord> = new Map();

  /**
   * Look up CVE information from NVD
   * In production, this would call the actual NVD API
   */
  async lookupCVE(cveId: string): Promise<CVERecord | null> {
    // Check cache first
    if (this.cveCache.has(cveId)) {
      return this.cveCache.get(cveId) || null;
    }

    try {
      // Mock CVE data for demonstration
      // In production, call: https://services.nvd.nist.gov/rest/json/cves/1.0
      const mockCVE: CVERecord = {
        id: cveId,
        description: `Vulnerability in component related to ${cveId}`,
        cvssScore: 7.5,
        cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
        publishedDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString(),
        references: ["https://nvd.nist.gov/vuln/detail/" + cveId],
        cpeMatches: [],
      };

      this.cveCache.set(cveId, mockCVE);
      return mockCVE;
    } catch (error) {
      console.error(`[ThreatIntel] Failed to lookup CVE ${cveId}:`, error);
      return null;
    }
  }

  /**
   * Look up exploits from Exploit-DB
   * In production, this would call the Exploit-DB API
   */
  async lookupExploits(cveId: string): Promise<ExploitRecord[]> {
    // Check cache first
    if (this.exploitCache.has(cveId)) {
      return this.exploitCache.get(cveId) || [];
    }

    try {
      // Mock exploit data for demonstration
      // In production, call: https://www.exploit-db.com/api/search
      const mockExploits: ExploitRecord[] = [
        {
          id: "edb-12345",
          title: `Exploit for ${cveId}`,
          description: "Remote Code Execution vulnerability",
          author: "Security Researcher",
          type: "RCE",
          platform: "linux",
          date: new Date().toISOString(),
          verified: true,
          url: "https://www.exploit-db.com/exploits/12345",
        },
      ];

      this.exploitCache.set(cveId, mockExploits);
      return mockExploits;
    } catch (error) {
      console.error(`[ThreatIntel] Failed to lookup exploits for ${cveId}:`, error);
      return [];
    }
  }

  /**
   * Check if CVE is in CISA Known Exploited Vulnerabilities list
   */
  async checkCISAKEV(cveId: string): Promise<CISAKEVRecord | null> {
    // Check cache first
    if (this.cisaKevCache.has(cveId)) {
      return this.cisaKevCache.get(cveId) || null;
    }

    try {
      // Mock CISA KEV data for demonstration
      // In production, call: https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json
      const mockCISAKEV: CISAKEVRecord = {
        cveId,
        vendorProject: "Example Vendor",
        product: "Example Product",
        vulnerabilityName: `Vulnerability in ${cveId}`,
        dateAdded: new Date().toISOString(),
        shortDescription: "Known to be actively exploited",
        requiredAction: "Apply patches immediately",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "High priority - actively exploited in the wild",
      };

      this.cisaKevCache.set(cveId, mockCISAKEV);
      return mockCISAKEV;
    } catch (error) {
      console.error(`[ThreatIntel] Failed to check CISA KEV for ${cveId}:`, error);
      return null;
    }
  }

  /**
   * Get comprehensive threat intelligence for a CVE
   */
  async getThreatIntelligence(cveId: string): Promise<ThreatIntelligenceData> {
    const [cve, exploits, cisaKev] = await Promise.all([
      this.lookupCVE(cveId),
      this.lookupExploits(cveId),
      this.checkCISAKEV(cveId),
    ]);

    // Calculate risk score
    let riskScore = 0;
    if (cve) {
      riskScore = cve.cvssScore * 10;
    }
    if (exploits.length > 0) {
      riskScore += 20;
    }
    if (cisaKev) {
      riskScore += 30;
    }
    riskScore = Math.min(100, riskScore);

    return {
      cve: cve || undefined,
      exploits: exploits.length > 0 ? exploits : undefined,
      cisaKev: cisaKev || undefined,
      riskScore,
      isKnownExploited: !!cisaKev,
    };
  }

  /**
   * Clear caches (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cveCache.clear();
    this.exploitCache.clear();
    this.cisaKevCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { cves: number; exploits: number; cisaKev: number } {
    return {
      cves: this.cveCache.size,
      exploits: this.exploitCache.size,
      cisaKev: this.cisaKevCache.size,
    };
  }
}

// Singleton instance
let threatIntelService: ThreatIntelligenceService | null = null;

export function getThreatIntelligenceService(): ThreatIntelligenceService {
  if (!threatIntelService) {
    threatIntelService = new ThreatIntelligenceService();
  }
  return threatIntelService;
}

export function createThreatIntelligenceService(): ThreatIntelligenceService {
  return new ThreatIntelligenceService();
}
