/**
 * AI Token Management Dashboard
 * Centralized management of AI provider tokens and usage
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Key, Activity, AlertTriangle, CheckCircle2, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Provider {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  tokenStatus: 'valid' | 'expired' | 'invalid';
  usageStats: {
    tokensThisMonth: number;
    requestsThisMonth: number;
    costThisMonth: number;
  };
  config: {
    maxTokens?: number;
    rateLimit?: number;
  };
}

interface Alert {
  id: string;
  providerID: string;
  type: 'quota_exceeded' | 'rate_limit' | 'expiration' | 'error';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  resolved: boolean;
}

export function AITokenDashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProviders();
    loadAlerts();
  }, []);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      // Mock data
      const mockProviders: Provider[] = [
        {
          id: 'openai',
          name: 'OpenAI GPT-4',
          status: 'active',
          tokenStatus: 'valid',
          usageStats: {
            tokensThisMonth: 45000,
            requestsThisMonth: 1250,
            costThisMonth: 125.5,
          },
          config: { maxTokens: 1000000, rateLimit: 3500 },
        },
        {
          id: 'anthropic',
          name: 'Anthropic Claude',
          status: 'inactive',
          tokenStatus: 'invalid',
          usageStats: {
            tokensThisMonth: 0,
            requestsThisMonth: 0,
            costThisMonth: 0,
          },
          config: { maxTokens: 100000, rateLimit: 5000 },
        },
        {
          id: 'google',
          name: 'Google Gemini',
          status: 'active',
          tokenStatus: 'valid',
          usageStats: {
            tokensThisMonth: 28000,
            requestsThisMonth: 850,
            costThisMonth: 42.0,
          },
          config: { maxTokens: 32000, rateLimit: 2000 },
        },
        {
          id: 'deepseek',
          name: 'DeepSeek',
          status: 'error',
          tokenStatus: 'expired',
          usageStats: {
            tokensThisMonth: 0,
            requestsThisMonth: 0,
            costThisMonth: 0,
          },
          config: { maxTokens: 4096, rateLimit: 1000 },
        },
      ];
      setProviders(mockProviders);
    } catch (error) {
      toast.error('Failed to load providers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const mockAlerts: Alert[] = [
        {
          id: 'alert-1',
          providerID: 'openai',
          type: 'quota_exceeded',
          severity: 'warning',
          message: 'Usage at 85% of monthly quota',
          resolved: false,
        },
        {
          id: 'alert-2',
          providerID: 'deepseek',
          type: 'expiration',
          severity: 'critical',
          message: 'API key expired',
          resolved: false,
        },
      ];
      setAlerts(mockAlerts);
    } catch (error) {
      toast.error('Failed to load alerts');
    }
  };

  const handleUpdateProvider = async (providerId: string) => {
    if (!apiKey) {
      toast.error('Please enter an API key');
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Updated ${providerId} API key`);
      setApiKey('');
      setSelectedProvider(null);
      loadProviders();
    } catch (error) {
      toast.error('Failed to update provider');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[status] || colors.inactive;
  };

  const getTokenStatusIcon = (status: string) => {
    if (status === 'valid') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (status === 'expired') return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  const calculateUsagePercent = (provider: Provider) => {
    if (!provider.config.maxTokens) return 0;
    return (provider.usageStats.tokensThisMonth / provider.config.maxTokens) * 100;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="providers">
            <Key className="w-4 h-4 mr-2" />
            Providers
          </TabsTrigger>
          <TabsTrigger value="usage">
            <Activity className="w-4 h-4 mr-2" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((provider) => (
              <Card key={provider.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <Badge className={getStatusColor(provider.status)}>
                      {provider.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {getTokenStatusIcon(provider.tokenStatus)}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Token: {provider.tokenStatus}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Usage Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Monthly Usage</span>
                      <span className="font-semibold">
                        {calculateUsagePercent(provider).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${calculateUsagePercent(provider)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <p className="text-gray-600 dark:text-gray-400">Requests</p>
                      <p className="font-semibold">{provider.usageStats.requestsThisMonth}</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <p className="text-gray-600 dark:text-gray-400">Cost</p>
                      <p className="font-semibold">${provider.usageStats.costThisMonth.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Config */}
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    {provider.config.maxTokens && (
                      <p>Max Tokens: {provider.config.maxTokens.toLocaleString()}</p>
                    )}
                    {provider.config.rateLimit && (
                      <p>Rate Limit: {provider.config.rateLimit}/min</p>
                    )}
                  </div>

                  {/* Actions */}
                  {selectedProvider === provider.id ? (
                    <div className="space-y-2">
                      <Input
                        type="password"
                        placeholder="Enter API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateProvider(provider.id)}
                          className="flex-1"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProvider(null);
                            setApiKey('');
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedProvider(provider.id)}
                      className="w-full"
                    >
                      Update API Key
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Summary</CardTitle>
              <CardDescription>Monthly usage across all providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {providers.map((provider) => (
                <div key={provider.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{provider.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {provider.usageStats.tokensThisMonth.toLocaleString()} tokens
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                      style={{ width: `${calculateUsagePercent(provider)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{provider.usageStats.requestsThisMonth} requests</span>
                    <span>${provider.usageStats.costThisMonth.toFixed(2)}</span>
                  </div>
                </div>
              ))}

              {/* Total Summary */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Total This Month
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">
                      {providers.reduce((sum, p) => sum + p.usageStats.tokensThisMonth, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tokens</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {providers.reduce((sum, p) => sum + p.usageStats.requestsThisMonth, 0)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Requests</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      ${providers.reduce((sum, p) => sum + p.usageStats.costThisMonth, 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cost</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <p className="text-gray-600 dark:text-gray-400">No active alerts</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => {
              const provider = providers.find((p) => p.id === alert.providerID);
              const severityColor =
                alert.severity === 'critical'
                  ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                  : alert.severity === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
                    : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';

              return (
                <Card key={alert.id} className={`border ${severityColor}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {alert.severity === 'critical' ? (
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        )}
                        <div>
                          <p className="font-semibold">{provider?.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Type: {alert.type}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Resolve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
