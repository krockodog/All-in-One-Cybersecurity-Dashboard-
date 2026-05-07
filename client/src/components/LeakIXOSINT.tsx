/**
 * LeakIX OSINT Component
 * Comprehensive OSINT intelligence gathering with LeakIX + Shodan
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Search,
  Loader2,
  Globe,
  Shield,
  Lock,
  Database,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface SearchResult {
  type: 'services' | 'vulnerabilities' | 'credentials' | 'ssl' | 'dns' | 'combined';
  data: any;
  timestamp: Date;
}

export function LeakIXOSINT() {
  const [target, setTarget] = useState('');
  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeTab, setActiveTab] = useState('search');

  const handleSearch = async (type: string) => {
    if (!target && type !== 'credentials') {
      toast.error('Please enter a target');
      return;
    }
    if (type === 'credentials' && !email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSearching(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockData = {
        services: {
          count: 12,
          items: [
            { port: 22, service: 'SSH', severity: 'high' },
            { port: 80, service: 'HTTP', severity: 'medium' },
            { port: 443, service: 'HTTPS', severity: 'low' },
          ],
        },
        vulnerabilities: {
          count: 5,
          critical: 2,
          items: [
            { cve: 'CVE-2024-1234', severity: 'critical', exploitable: true },
            { cve: 'CVE-2024-5678', severity: 'high', exploitable: false },
          ],
        },
        credentials: {
          count: 3,
          compromised: 2,
          items: [
            { source: 'Breach A', type: 'password', date: '2024-01-15' },
            { source: 'Breach B', type: 'api_key', date: '2024-02-20' },
          ],
        },
        ssl: {
          count: 2,
          expired: 1,
          items: [
            { domain: target, issuer: 'Let\'s Encrypt', expired: false },
            { domain: `*.${target}`, issuer: 'DigiCert', expired: true },
          ],
        },
        dns: {
          count: 8,
          suspicious: 1,
          items: [
            { type: 'A', value: '192.168.1.1', ttl: 3600 },
            { type: 'MX', value: 'mail.example.com', ttl: 3600 },
            { type: 'TXT', value: 'v=spf1 mx -all', suspicious: true },
          ],
        },
        combined: {
          count: 28,
          critical: 2,
          high: 5,
          medium: 8,
          low: 13,
          items: [
            { type: 'vulnerability', cve: 'CVE-2024-1234', severity: 'critical', source: 'LeakIX + Shodan' },
            { type: 'service', port: 22, service: 'SSH', severity: 'high', source: 'LeakIX' },
            { type: 'credential', credentialSource: 'Breach A', severity: 'high', source: 'LeakIX' },
            { type: 'ssl', domain: target, severity: 'medium', source: 'LeakIX' },
            { type: 'dns', record: 'TXT', severity: 'medium', suspicious: true, source: 'LeakIX' },
          ],
          correlations: [
            { finding1: 'CVE-2024-1234', finding2: 'Port 22 SSH', confidence: 0.95 },
            { finding1: 'Credential Leak', finding2: 'Breach A', confidence: 0.88 },
          ],
        },
      };

      const newResult: SearchResult = {
        type: type as any,
        data: mockData[type as keyof typeof mockData],
        timestamp: new Date(),
      };

      setResults([newResult, ...results]);
      toast.success(`${type} search completed`);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return colors[severity] || colors.medium;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">
            <Search className="w-4 h-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="results">
            <Globe className="w-4 h-4 mr-2" />
            Results
          </TabsTrigger>
          <TabsTrigger value="combined">
            <Shield className="w-4 h-4 mr-2" />
            Combined
          </TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LeakIX OSINT Search</CardTitle>
              <CardDescription>
                Search for exposed services, vulnerabilities, credentials, SSL issues, and DNS anomalies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Target (IP or Domain)</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="192.168.1.1 or example.com"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Email (Optional)</label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Search Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  disabled={isSearching}
                  onClick={() => handleSearch('services')}
                  className="justify-center"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  Exposed Services
                </Button>
                <Button
                  variant="outline"
                  disabled={isSearching}
                  onClick={() => handleSearch('vulnerabilities')}
                  className="justify-center"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                  Vulnerabilities
                </Button>
                <Button
                  variant="outline"
                  disabled={isSearching}
                  onClick={() => handleSearch('credentials')}
                  className="justify-center"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Credentials
                </Button>
                <Button
                  variant="outline"
                  disabled={isSearching}
                  onClick={() => handleSearch('ssl')}
                  className="justify-center"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  SSL Certs
                </Button>
                <Button
                  variant="outline"
                  disabled={isSearching}
                  onClick={() => handleSearch('dns')}
                  className="justify-center"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  DNS Records
                </Button>
                <Button
                  disabled={isSearching}
                  onClick={() => handleSearch('combined')}
                  className="justify-center bg-blue-600 hover:bg-blue-700"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Combined Scan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          {results.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">No search results yet</p>
              </CardContent>
            </Card>
          ) : (
            results.map((result, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize">{result.type} Results</CardTitle>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.data?.items && (
                    <div className="space-y-2">
                      {result.data.items.map((item: any, i: number) => (
                        <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              {item.cve && <p className="font-mono text-sm">{item.cve}</p>}
                              {item.port && <p className="font-mono text-sm">Port {item.port}: {item.service}</p>}
                              {item.domain && <p className="font-mono text-sm">{item.domain}</p>}
                              {item.type && <p className="font-mono text-sm">{item.type} Record</p>}
                            </div>
                            {item.severity && (
                              <Badge className={getSeverityColor(item.severity)}>
                                {item.severity.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!result.data?.items && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">No items found in results</p>
                    </div>
                  )}
                  <div className="pt-2 border-t text-sm text-gray-600 dark:text-gray-400">
                    Found {result.data?.count || 0} items
                    {result.data?.critical && ` (${result.data.critical} critical)`}
                    {result.data?.compromised && ` (${result.data.compromised} compromised)`}
                    {result.data?.expired && ` (${result.data.expired} expired)`}
                    {result.data?.high && ` (${result.data.high} high)`}
                    {result.data?.medium && ` (${result.data.medium} medium)`}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Combined Tab */}
        <TabsContent value="combined" className="space-y-4">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardHeader>
              <CardTitle>LeakIX + Shodan Integration</CardTitle>
              <CardDescription>
                Combined intelligence from LeakIX and Shodan for comprehensive threat assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    LeakIX Features
                  </h4>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Exposed Services</li>
                    <li>✓ Vulnerability Database</li>
                    <li>✓ Credential Leaks</li>
                    <li>✓ SSL Certificates</li>
                    <li>✓ DNS Intelligence</li>
                  </ul>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Shodan Features
                  </h4>
                  <ul className="space-y-1 text-sm">
                    <li>✓ Service Detection</li>
                    <li>✓ Vulnerability Mapping</li>
                    <li>✓ Exploit Availability</li>
                    <li>✓ Historical Data</li>
                    <li>✓ Correlation Analysis</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Combined Benefits
                </h4>
                <ul className="space-y-1 text-sm">
                  <li>✓ Cross-source correlation of findings</li>
                  <li>✓ Enhanced threat assessment accuracy</li>
                  <li>✓ Reduced false positives</li>
                  <li>✓ Comprehensive attack surface mapping</li>
                  <li>✓ Prioritized remediation recommendations</li>
                </ul>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isSearching || !target}
                onClick={() => handleSearch('combined')}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Execute Combined Scan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
