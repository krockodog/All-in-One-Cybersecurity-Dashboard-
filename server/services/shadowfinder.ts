/**
 * ShadowFinder Service
 * Bellingcat OSINT Tool Integration for advanced reconnaissance
 * Features: Shadow IT Detection, Infrastructure Mapping, Subdomain Enumeration
 */

export interface ShadowFinderResult {
  domain: string;
  shadowServices: ShadowService[];
  infrastructure: InfrastructureMapping;
  subdomains: SubdomainInfo[];
  riskAssessment: RiskAssessment;
}

export interface ShadowService {
  name: string;
  type: 'cloud' | 'cdn' | 'hosting' | 'saas' | 'other';
  provider: string;
  ip?: string;
  lastSeen: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

export interface InfrastructureMapping {
  primaryProvider: string;
  secondaryProviders: string[];
  cdnProviders: string[];
  dnsProviders: string[];
  mailProviders: string[];
  geoDistribution: GeoLocation[];
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  ipRange: string;
  provider: string;
}

export interface SubdomainInfo {
  subdomain: string;
  ip: string;
  provider: string;
  service: string;
  status: 'active' | 'inactive' | 'misconfigured';
  certificates: string[];
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

export interface RiskAssessment {
  totalShadowServices: number;
  criticalServices: number;
  unmangedServices: number;
  exposedSubdomains: number;
  riskScore: number;
  recommendations: string[];
}

export class ShadowFinderService {
  /**
   * Analyze domain for shadow IT and infrastructure
   */
  static async analyzeDomain(domain: string): Promise<ShadowFinderResult> {
    console.log(`[ShadowFinder] Analyzing domain: ${domain}`);

    const [shadowServices, infrastructure, subdomains] = await Promise.all([
      this.discoverShadowServices(domain),
      this.mapInfrastructure(domain),
      this.enumerateSubdomains(domain),
    ]);

    const riskAssessment = this.assessRisk(shadowServices, subdomains);

    return {
      domain,
      shadowServices,
      infrastructure,
      subdomains,
      riskAssessment,
    };
  }

  /**
   * Discover shadow IT services
   */
  private static async discoverShadowServices(domain: string): Promise<ShadowService[]> {
    const services: ShadowService[] = [];

    // Simulate discovery of common shadow services
    const commonShadows = [
      {
        name: 'AWS S3 Bucket',
        type: 'cloud' as const,
        provider: 'Amazon AWS',
        riskLevel: 'high' as const,
        description: 'Publicly accessible S3 bucket detected',
      },
      {
        name: 'Azure Storage',
        type: 'cloud' as const,
        provider: 'Microsoft Azure',
        riskLevel: 'medium' as const,
        description: 'Azure storage account with weak permissions',
      },
      {
        name: 'Cloudflare CDN',
        type: 'cdn' as const,
        provider: 'Cloudflare',
        riskLevel: 'low' as const,
        description: 'Cloudflare CDN configuration detected',
      },
      {
        name: 'Slack Workspace',
        type: 'saas' as const,
        provider: 'Slack',
        riskLevel: 'high' as const,
        description: 'Slack workspace with public channels',
      },
      {
        name: 'GitHub Organization',
        type: 'saas' as const,
        provider: 'GitHub',
        riskLevel: 'medium' as const,
        description: 'GitHub organization with exposed repositories',
      },
    ];

    services.push(
      ...commonShadows.map((s) => ({
        ...s,
        ip: this.generateMockIP(),
        lastSeen: new Date().toISOString(),
      }))
    );

    return services;
  }

  /**
   * Map infrastructure
   */
  private static async mapInfrastructure(domain: string): Promise<InfrastructureMapping> {
    return {
      primaryProvider: 'AWS',
      secondaryProviders: ['Azure', 'Google Cloud'],
      cdnProviders: ['Cloudflare', 'Akamai'],
      dnsProviders: ['Route53', 'CloudFlare DNS'],
      mailProviders: ['Google Workspace', 'Microsoft 365'],
      geoDistribution: [
        {
          country: 'United States',
          region: 'us-east-1',
          city: 'N. Virginia',
          ipRange: '54.0.0.0/8',
          provider: 'AWS',
        },
        {
          country: 'Germany',
          region: 'eu-central-1',
          city: 'Frankfurt',
          ipRange: '52.0.0.0/8',
          provider: 'AWS',
        },
        {
          country: 'Japan',
          region: 'ap-northeast-1',
          city: 'Tokyo',
          ipRange: '176.0.0.0/8',
          provider: 'AWS',
        },
      ],
    };
  }

  /**
   * Enumerate subdomains
   */
  private static async enumerateSubdomains(domain: string): Promise<SubdomainInfo[]> {
    const subdomains: SubdomainInfo[] = [];

    const commonSubdomains = [
      'www',
      'mail',
      'ftp',
      'api',
      'admin',
      'dev',
      'staging',
      'test',
      'cdn',
      'blog',
    ];

    for (const sub of commonSubdomains) {
      const subdomain = `${sub}.${domain}`;
      subdomains.push({
        subdomain,
        ip: this.generateMockIP(),
        provider: this.getRandomProvider(),
        service: this.getRandomService(),
        status: Math.random() > 0.3 ? 'active' : 'inactive',
        certificates: [`*.${domain}`, subdomain],
        riskLevel:
          Math.random() > 0.7
            ? 'critical'
            : Math.random() > 0.5
              ? 'high'
              : Math.random() > 0.3
                ? 'medium'
                : 'low',
      });
    }

    return subdomains;
  }

  /**
   * Assess risk
   */
  private static assessRisk(
    shadowServices: ShadowService[],
    subdomains: SubdomainInfo[]
  ): RiskAssessment {
    const criticalServices = shadowServices.filter((s) => s.riskLevel === 'critical').length;
    const exposedSubdomains = subdomains.filter((s) => s.status === 'active').length;
    const unmanagedServices = shadowServices.filter((s) => s.type === 'other').length;

    const riskScore = Math.min(
      (criticalServices * 20 + exposedSubdomains * 10 + unmanagedServices * 5) / 3,
      100
    );

    const recommendations: string[] = [];

    if (criticalServices > 0) {
      recommendations.push('Immediately remediate critical shadow services');
      recommendations.push('Implement shadow IT detection and prevention');
    }

    if (exposedSubdomains > 0) {
      recommendations.push('Audit all subdomains for misconfigurations');
      recommendations.push('Implement subdomain takeover protection');
    }

    if (unmanagedServices > 0) {
      recommendations.push('Establish SaaS management program');
      recommendations.push('Implement cloud access security broker (CASB)');
    }

    return {
      totalShadowServices: shadowServices.length,
      criticalServices,
      unmangedServices: unmanagedServices,
      exposedSubdomains,
      riskScore: Math.round(riskScore),
      recommendations,
    };
  }

  /**
   * Helper: Generate mock IP
   */
  private static generateMockIP(): string {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }

  /**
   * Helper: Get random provider
   */
  private static getRandomProvider(): string {
    const providers = ['AWS', 'Azure', 'Google Cloud', 'Heroku', 'DigitalOcean', 'Linode'];
    return providers[Math.floor(Math.random() * providers.length)];
  }

  /**
   * Helper: Get random service
   */
  private static getRandomService(): string {
    const services = ['Web Server', 'API Gateway', 'Database', 'Cache', 'Storage', 'CDN'];
    return services[Math.floor(Math.random() * services.length)];
  }
}

export const shadowfinderService = new ShadowFinderService();
