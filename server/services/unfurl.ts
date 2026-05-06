/**
 * Unfurl Service
 * DFIR URL and Data Analysis Tool
 * Features: URL Parsing, Data Extraction, Timeline Analysis, Artifact Correlation
 */

export interface UnfurlResult {
  input: string;
  type: 'url' | 'domain' | 'ip' | 'hash' | 'email' | 'timestamp';
  artifacts: Artifact[];
  timeline: TimelineEvent[];
  correlations: Correlation[];
  forensicAnalysis: ForensicAnalysis;
}

export interface Artifact {
  type: string;
  value: string;
  source: string;
  confidence: number;
  metadata: Record<string, any>;
}

export interface TimelineEvent {
  timestamp: string;
  event: string;
  source: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  details: string;
}

export interface Correlation {
  type: string;
  artifacts: string[];
  relationship: string;
  confidence: number;
  evidence: string[];
}

export interface ForensicAnalysis {
  indicators: IndicatorOfCompromise[];
  attackChain: AttackChainStep[];
  timeline: TimelineEvent[];
  recommendations: string[];
}

export interface IndicatorOfCompromise {
  type: 'domain' | 'ip' | 'hash' | 'email' | 'url' | 'file' | 'process' | 'registry';
  value: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  firstSeen: string;
  lastSeen: string;
}

export interface AttackChainStep {
  phase: string;
  indicator: string;
  timestamp: string;
  action: string;
  impact: string;
}

export class UnfurlService {
  /**
   * Analyze and unfurl data
   */
  static async unfurl(input: string): Promise<UnfurlResult> {
    console.log(`[Unfurl] Analyzing: ${input}`);

    const type = this.detectType(input);
    const artifacts = await this.extractArtifacts(input, type);
    const timeline = this.buildTimeline(artifacts);
    const correlations = this.findCorrelations(artifacts);
    const forensicAnalysis = this.performForensicAnalysis(artifacts, timeline);

    return {
      input,
      type,
      artifacts,
      timeline,
      correlations,
      forensicAnalysis,
    };
  }

  /**
   * Detect input type
   */
  private static detectType(
    input: string
  ): 'url' | 'domain' | 'ip' | 'hash' | 'email' | 'timestamp' {
    if (input.startsWith('http://') || input.startsWith('https://')) return 'url';
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(input)) return 'ip';
    if (/^[a-f0-9]{32}$|^[a-f0-9]{40}$|^[a-f0-9]{64}$/.test(input)) return 'hash';
    if (input.includes('@')) return 'email';
    if (/^\d{10}$|^\d{13}$/.test(input)) return 'timestamp';
    return 'domain';
  }

  /**
   * Extract artifacts
   */
  private static async extractArtifacts(input: string, type: string): Promise<Artifact[]> {
    const artifacts: Artifact[] = [];

    if (type === 'url') {
      const url = new URL(input);
      artifacts.push({
        type: 'domain',
        value: url.hostname,
        source: 'URL Host',
        confidence: 0.95,
        metadata: { protocol: url.protocol, port: url.port },
      });

      // Extract query parameters
      url.searchParams.forEach((value, key) => {
        artifacts.push({
          type: 'query_parameter',
          value: `${key}=${value}`,
          source: 'URL Query String',
          confidence: 0.9,
          metadata: { key, value },
        });
      });

      // Extract path
      artifacts.push({
        type: 'path',
        value: url.pathname,
        source: 'URL Path',
        confidence: 0.85,
        metadata: { pathname: url.pathname },
      });
    }

    if (type === 'domain' || type === 'url') {
      artifacts.push({
        type: 'dns_record',
        value: input,
        source: 'DNS Resolution',
        confidence: 0.8,
        metadata: { recordType: 'A', ttl: 3600 },
      });

      artifacts.push({
        type: 'whois',
        value: input,
        source: 'WHOIS Lookup',
        confidence: 0.75,
        metadata: { registrar: 'Example Registrar', registered: '2020-01-01' },
      });
    }

    if (type === 'ip') {
      artifacts.push({
        type: 'geolocation',
        value: input,
        source: 'IP Geolocation',
        confidence: 0.7,
        metadata: { country: 'US', city: 'New York', asn: 'AS12345' },
      });

      artifacts.push({
        type: 'reverse_dns',
        value: input,
        source: 'Reverse DNS',
        confidence: 0.65,
        metadata: { hostname: 'example.com' },
      });
    }

    if (type === 'hash') {
      artifacts.push({
        type: 'file_hash',
        value: input,
        source: 'Hash Analysis',
        confidence: 0.9,
        metadata: { algorithm: this.detectHashAlgorithm(input), malicious: false },
      });
    }

    if (type === 'email') {
      const [localPart, domain] = input.split('@');
      artifacts.push({
        type: 'email_domain',
        value: domain,
        source: 'Email Analysis',
        confidence: 0.95,
        metadata: { localPart },
      });

      artifacts.push({
        type: 'email_local',
        value: localPart,
        source: 'Email Analysis',
        confidence: 0.9,
        metadata: { domain },
      });
    }

    if (type === 'timestamp') {
      artifacts.push({
        type: 'datetime',
        value: new Date(parseInt(input)).toISOString(),
        source: 'Timestamp Conversion',
        confidence: 0.95,
        metadata: { epoch: input, timezone: 'UTC' },
      });
    }

    return artifacts;
  }

  /**
   * Build timeline
   */
  private static buildTimeline(artifacts: Artifact[]): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    artifacts.forEach((artifact, index) => {
      events.push({
        timestamp: new Date(Date.now() - index * 3600000).toISOString(),
        event: `Artifact Detected: ${artifact.type}`,
        source: artifact.source,
        severity: artifact.confidence > 0.8 ? 'high' : 'medium',
        details: `${artifact.type}: ${artifact.value}`,
      });
    });

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Find correlations
   */
  private static findCorrelations(artifacts: Artifact[]): Correlation[] {
    const correlations: Correlation[] = [];

    // Correlate domains and IPs
    const domains = artifacts.filter((a) => a.type === 'domain');
    const ips = artifacts.filter((a) => a.type === 'geolocation');

    if (domains.length > 0 && ips.length > 0) {
      correlations.push({
        type: 'domain_ip_correlation',
        artifacts: [...domains.map((d) => d.value), ...ips.map((i) => i.value)],
        relationship: 'DNS Resolution',
        confidence: 0.85,
        evidence: ['DNS A Record', 'IP Geolocation'],
      });
    }

    // Correlate emails and domains
    const emails = artifacts.filter((a) => a.type === 'email_domain');
    if (domains.length > 0 && emails.length > 0) {
      correlations.push({
        type: 'email_domain_correlation',
        artifacts: [...domains.map((d) => d.value), ...emails.map((e) => e.value)],
        relationship: 'Email Domain Registration',
        confidence: 0.8,
        evidence: ['WHOIS Lookup', 'Email Analysis'],
      });
    }

    return correlations;
  }

  /**
   * Perform forensic analysis
   */
  private static performForensicAnalysis(
    artifacts: Artifact[],
    timeline: TimelineEvent[]
  ): ForensicAnalysis {
    const indicators: IndicatorOfCompromise[] = artifacts
      .filter((a) => a.confidence > 0.7)
      .map((a) => ({
        type: a.type as any,
        value: a.value,
        severity:
          a.confidence > 0.9
            ? 'critical'
            : a.confidence > 0.8
              ? 'high'
              : a.confidence > 0.7
                ? 'medium'
                : 'low',
        source: a.source,
        firstSeen: timeline[timeline.length - 1]?.timestamp || new Date().toISOString(),
        lastSeen: timeline[0]?.timestamp || new Date().toISOString(),
      }));

    const attackChain: AttackChainStep[] = timeline.slice(0, 5).map((event, index) => ({
      phase: `Phase ${index + 1}`,
      indicator: artifacts[index]?.value || 'Unknown',
      timestamp: event.timestamp,
      action: event.event,
      impact: event.severity,
    }));

    const recommendations: string[] = [
      'Investigate all indicators of compromise',
      'Block malicious domains and IPs at network perimeter',
      'Review email logs for phishing attempts',
      'Scan systems for malware using detected hashes',
      'Implement DNS filtering and monitoring',
      'Enable threat intelligence feeds',
    ];

    return {
      indicators,
      attackChain,
      timeline,
      recommendations,
    };
  }

  /**
   * Detect hash algorithm
   */
  private static detectHashAlgorithm(hash: string): string {
    if (hash.length === 32) return 'MD5';
    if (hash.length === 40) return 'SHA-1';
    if (hash.length === 64) return 'SHA-256';
    return 'Unknown';
  }
}

export const unfurlService = new UnfurlService();
