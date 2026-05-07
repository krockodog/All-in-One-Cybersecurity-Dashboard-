import axios from "axios";

export interface BurpIssue {
  issueId: number;
  name: string;
  severity: "High" | "Medium" | "Low" | "Information";
  confidence: "Certain" | "Firm" | "Tentative";
  url: string;
  issueBackground: string;
  remediationBackground: string;
  evidence: string;
}

export interface BurpScanResult {
  scanId: string;
  url: string;
  status: "running" | "completed" | "paused" | "stopped";
  progress: number;
  issues: BurpIssue[];
  summary: {
    highSeverity: number;
    mediumSeverity: number;
    lowSeverity: number;
    infoSeverity: number;
  };
}

/**
 * Burp Suite Enterprise API wrapper
 */
export class BurpClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Start a new scan
   */
  async startScan(url: string, scanType: "crawl" | "audit" | "crawl_and_audit" = "crawl_and_audit"): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/scans`,
        {
          scan_type: scanType,
          urls: [url],
        },
        { headers: this.getHeaders(), timeout: 30000 },
      );

      return response.data.scan_id;
    } catch (error) {
      throw new Error(
        `Burp scan start failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get scan status and issues
   */
  async getScanStatus(scanId: string): Promise<BurpScanResult> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/scans/${scanId}`, {
        headers: this.getHeaders(),
        timeout: 30000,
      });

      const data = response.data;

      return {
        scanId,
        url: data.urls?.[0] || "",
        status: data.scan_status || "running",
        progress: data.scan_progress || 0,
        issues: data.issues || [],
        summary: {
          highSeverity: (data.issues || []).filter((i: any) => i.severity === "High").length,
          mediumSeverity: (data.issues || []).filter((i: any) => i.severity === "Medium").length,
          lowSeverity: (data.issues || []).filter((i: any) => i.severity === "Low").length,
          infoSeverity: (data.issues || []).filter((i: any) => i.severity === "Information").length,
        },
      };
    } catch (error) {
      throw new Error(
        `Burp scan status failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get detailed issue information
   */
  async getIssueDetails(scanId: string, issueId: number): Promise<BurpIssue> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/scans/${scanId}/issues/${issueId}`,
        { headers: this.getHeaders(), timeout: 30000 },
      );

      return response.data;
    } catch (error) {
      throw new Error(
        `Burp issue details failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Pause a scan
   */
  async pauseScan(scanId: string): Promise<void> {
    try {
      await axios.put(
        `${this.baseUrl}/api/v1/scans/${scanId}/pause`,
        {},
        { headers: this.getHeaders(), timeout: 30000 },
      );
    } catch (error) {
      throw new Error(
        `Burp scan pause failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Resume a scan
   */
  async resumeScan(scanId: string): Promise<void> {
    try {
      await axios.put(
        `${this.baseUrl}/api/v1/scans/${scanId}/resume`,
        {},
        { headers: this.getHeaders(), timeout: 30000 },
      );
    } catch (error) {
      throw new Error(
        `Burp scan resume failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Stop a scan
   */
  async stopScan(scanId: string): Promise<void> {
    try {
      await axios.put(
        `${this.baseUrl}/api/v1/scans/${scanId}/stop`,
        {},
        { headers: this.getHeaders(), timeout: 30000 },
      );
    } catch (error) {
      throw new Error(
        `Burp scan stop failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Export scan report
   */
  async exportScanReport(
    scanId: string,
    format: "html" | "xml" | "json" = "html",
  ): Promise<Buffer> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/scans/${scanId}/report`,
        {
          headers: this.getHeaders(),
          params: { format },
          responseType: "arraybuffer",
          timeout: 60000,
        },
      );

      return response.data;
    } catch (error) {
      throw new Error(
        `Burp report export failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

/**
 * Create a Burp client instance
 */
export function createBurpClient(baseUrl: string, apiKey: string): BurpClient {
  return new BurpClient(baseUrl, apiKey);
}
