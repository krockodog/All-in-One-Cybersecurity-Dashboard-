/**
 * LeakIX Service
 * Integration with LeakIX API for OSINT intelligence gathering
 * Features: Exposed Services, Vulnerabilities, Credentials, SSL Certificates, DNS/Network Intelligence
 */

import axios, { AxiosInstance } from 'axios';

export interface LeakIXExposedService {
  ip: string;
  port: number;
  protocol: string;
  service: string;
  version?: string;
  lastSeen: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
}

export interface LeakIXVulnerability {
  id: string;
  cve: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvssScore: number;
  affectedServices: string[];
  exploitAvailable: boolean;
}

export interface LeakIXCredentialLeak {
  id: string;
  email: string;
  username?: string;
  source: string;
  leakDate: string;
  credentialType: 'email' | 'password' | 'api_key' | 'token' | 'other';
  compromised: boolean;
  relatedBreaches: string[];
}

export interface LeakIXSSLCertificate {
  domain: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  fingerprint: string;
  altNames: string[];
  selfSigned: boolean;
  expired: boolean;
  weakAlgorithm: boolean;
  certificateTransparency: boolean;
}

export interface LeakIXDNSRecord {
  domain: string;
  recordType: 'A' | 'AAAA' | 'MX' | 'NS' | 'TXT' | 'CNAME' | 'SOA';
  value: string;
  ttl: number;
  lastUpdated: string;
  suspicious: boolean;
}

export interface LeakIXSearchResult {
  exposedServices: LeakIXExposedService[];
  vulnerabilities: LeakIXVulnerability[];
  credentialLeaks: LeakIXCredentialLeak[];
  sslCertificates: LeakIXSSLCertificate[];
  dnsRecords: LeakIXDNSRecord[];
  summary: {
    totalExposedServices: number;
    criticalVulnerabilities: number;
    credentialLeaksFound: number;
    certificateIssues: number;
    dnsAnomalies: number;
    overallRiskScore: number;
  };
}

export class LeakIXService {
  private client: AxiosInstance;
  private baseURL = 'https://api.leakix.net';

  constructor(apiKey?: string) {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'api-key': apiKey }),
      },
    });
  }

  /**
   * Search for exposed services by IP or domain
   */
  async searchExposedServices(target: string): Promise<LeakIXExposedService[]> {
    try {
      const response = await this.client.get(`/search`, {
        params: {
          q: `host:${target}`,
          scope: 'services',
          limit: 100,
        },
      });

      return this.parseExposedServices(response.data);
    } catch (error) {
      console.error('LeakIX exposed services search failed:', error);
      return [];
    }
  }

  /**
   * Search for vulnerabilities related to target
   */
  async searchVulnerabilities(target: string): Promise<LeakIXVulnerability[]> {
    try {
      const response = await this.client.get(`/search`, {
        params: {
          q: `host:${target}`,
          scope: 'vulnerabilities',
          limit: 100,
        },
      });

      return this.parseVulnerabilities(response.data);
    } catch (error) {
      console.error('LeakIX vulnerability search failed:', error);
      return [];
    }
  }

  /**
   * Search for credential leaks
   */
  async searchCredentialLeaks(email: string): Promise<LeakIXCredentialLeak[]> {
    try {
      const response = await this.client.get(`/search`, {
        params: {
          q: `email:${email}`,
          scope: 'credentials',
          limit: 100,
        },
      });

      return this.parseCredentialLeaks(response.data);
    } catch (error) {
      console.error('LeakIX credential leak search failed:', error);
      return [];
    }
  }

  /**
   * Search for SSL certificate issues
   */
  async searchSSLCertificates(domain: string): Promise<LeakIXSSLCertificate[]> {
    try {
      const response = await this.client.get(`/search`, {
        params: {
          q: `domain:${domain}`,
          scope: 'certificates',
          limit: 100,
        },
      });

      return this.parseSSLCertificates(response.data);
    } catch (error) {
      console.error('LeakIX SSL certificate search failed:', error);
      return [];
    }
  }

  /**
   * Search for DNS records and anomalies
   */
  async searchDNSRecords(domain: string): Promise<LeakIXDNSRecord[]> {
    try {
      const response = await this.client.get(`/search`, {
        params: {
          q: `domain:${domain}`,
          scope: 'dns',
          limit: 100,
        },
      });

      return this.parseDNSRecords(response.data);
    } catch (error) {
      console.error('LeakIX DNS search failed:', error);
      return [];
    }
  }

  /**
   * Comprehensive search combining all LeakIX features
   */
  async comprehensiveSearch(target: string, email?: string): Promise<LeakIXSearchResult> {
    const [exposedServices, vulnerabilities, sslCerts, dnsRecords] = await Promise.all([
      this.searchExposedServices(target),
      this.searchVulnerabilities(target),
      this.searchSSLCertificates(target),
      this.searchDNSRecords(target),
    ]);

    const credentialLeaks = email ? await this.searchCredentialLeaks(email) : [];

    const criticalVulns = vulnerabilities.filter((v) => v.severity === 'critical').length;
    const expiredCerts = sslCerts.filter((c) => c.expired).length;
    const suspiciousDNS = dnsRecords.filter((d) => d.suspicious).length;

    const overallRiskScore = this.calculateRiskScore({
      exposedServices: exposedServices.length,
      criticalVulnerabilities: criticalVulns,
      credentialLeaks: credentialLeaks.length,
      certificateIssues: expiredCerts,
      dnsAnomalies: suspiciousDNS,
    });

    return {
      exposedServices,
      vulnerabilities,
      credentialLeaks,
      sslCertificates: sslCerts,
      dnsRecords,
      summary: {
        totalExposedServices: exposedServices.length,
        criticalVulnerabilities: criticalVulns,
        credentialLeaksFound: credentialLeaks.length,
        certificateIssues: expiredCerts,
        dnsAnomalies: suspiciousDNS,
        overallRiskScore,
      },
    };
  }

  /**
   * Parse exposed services from API response
   */
  private parseExposedServices(data: any[]): LeakIXExposedService[] {
    return (data || []).map((item) => ({
      ip: item.ip || item.host,
      port: item.port || 0,
      protocol: item.protocol || 'unknown',
      service: item.service || 'unknown',
      version: item.version,
      lastSeen: item.last_seen || new Date().toISOString(),
      severity: this.determineSeverity(item),
      tags: item.tags || [],
    }));
  }

  /**
   * Parse vulnerabilities from API response
   */
  private parseVulnerabilities(data: any[]): LeakIXVulnerability[] {
    return (data || []).map((item) => ({
      id: item.id || item.cve,
      cve: item.cve || 'N/A',
      title: item.title || 'Unknown Vulnerability',
      description: item.description || '',
      severity: this.determineSeverity(item),
      cvssScore: item.cvss_score || item.severity_score || 0,
      affectedServices: item.affected_services || [],
      exploitAvailable: item.exploit_available || false,
    }));
  }

  /**
   * Parse credential leaks from API response
   */
  private parseCredentialLeaks(data: any[]): LeakIXCredentialLeak[] {
    return (data || []).map((item) => ({
      id: item.id,
      email: item.email || item.username,
      username: item.username,
      source: item.source || 'unknown',
      leakDate: item.leak_date || new Date().toISOString(),
      credentialType: this.determineCredentialType(item),
      compromised: item.compromised || true,
      relatedBreaches: item.related_breaches || [],
    }));
  }

  /**
   * Parse SSL certificates from API response
   */
  private parseSSLCertificates(data: any[]): LeakIXSSLCertificate[] {
    return (data || []).map((item) => ({
      domain: item.domain || item.cn,
      issuer: item.issuer || 'unknown',
      validFrom: item.valid_from || new Date().toISOString(),
      validTo: item.valid_to || new Date().toISOString(),
      fingerprint: item.fingerprint || item.sha256 || '',
      altNames: item.alt_names || item.san || [],
      selfSigned: item.self_signed || false,
      expired: new Date(item.valid_to || 0) < new Date(),
      weakAlgorithm: item.weak_algorithm || false,
      certificateTransparency: item.ct_logs || false,
    }));
  }

  /**
   * Parse DNS records from API response
   */
  private parseDNSRecords(data: any[]): LeakIXDNSRecord[] {
    return (data || []).map((item) => ({
      domain: item.domain,
      recordType: (item.type || 'A').toUpperCase() as any,
      value: item.value || item.data,
      ttl: item.ttl || 3600,
      lastUpdated: item.last_updated || new Date().toISOString(),
      suspicious: this.isSuspiciousDNS(item),
    }));
  }

  /**
   * Determine severity level
   */
  private determineSeverity(item: any): 'critical' | 'high' | 'medium' | 'low' {
    const severity = item.severity?.toLowerCase() || '';
    const score = item.cvss_score || item.severity_score || 0;

    if (severity.includes('critical') || score >= 9) return 'critical';
    if (severity.includes('high') || score >= 7) return 'high';
    if (severity.includes('medium') || score >= 4) return 'medium';
    return 'low';
  }

  /**
   * Determine credential type
   */
  private determineCredentialType(
    item: any
  ): 'email' | 'password' | 'api_key' | 'token' | 'other' {
    const type = item.type?.toLowerCase() || '';
    if (type.includes('api')) return 'api_key';
    if (type.includes('token')) return 'token';
    if (type.includes('password')) return 'password';
    if (type.includes('email')) return 'email';
    return 'other';
  }

  /**
   * Check if DNS record is suspicious
   */
  private isSuspiciousDNS(item: any): boolean {
    const value = (item.value || '').toLowerCase();
    const suspiciousPatterns = [
      'parked',
      'for sale',
      'malware',
      'phishing',
      'suspicious',
      'sinkhole',
    ];
    return suspiciousPatterns.some((pattern) => value.includes(pattern));
  }

  /**
   * Calculate overall risk score
   */
  private calculateRiskScore(metrics: {
    exposedServices: number;
    criticalVulnerabilities: number;
    credentialLeaks: number;
    certificateIssues: number;
    dnsAnomalies: number;
  }): number {
    const weights = {
      exposedServices: 0.2,
      criticalVulnerabilities: 0.35,
      credentialLeaks: 0.25,
      certificateIssues: 0.1,
      dnsAnomalies: 0.1,
    };

    const normalizedMetrics = {
      exposedServices: Math.min(metrics.exposedServices / 10, 1),
      criticalVulnerabilities: Math.min(metrics.criticalVulnerabilities / 5, 1),
      credentialLeaks: Math.min(metrics.credentialLeaks / 10, 1),
      certificateIssues: Math.min(metrics.certificateIssues / 5, 1),
      dnsAnomalies: Math.min(metrics.dnsAnomalies / 5, 1),
    };

    const score =
      (normalizedMetrics.exposedServices * weights.exposedServices +
        normalizedMetrics.criticalVulnerabilities * weights.criticalVulnerabilities +
        normalizedMetrics.credentialLeaks * weights.credentialLeaks +
        normalizedMetrics.certificateIssues * weights.certificateIssues +
        normalizedMetrics.dnsAnomalies * weights.dnsAnomalies) *
      100;

    return Math.min(Math.round(score), 100);
  }
}

export const leakixService = new LeakIXService(process.env.LEAKIX_API_KEY);
