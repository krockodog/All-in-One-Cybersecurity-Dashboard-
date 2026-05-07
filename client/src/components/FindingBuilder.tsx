/**
 * Finding Builder Component
 * Create and structure findings with PoC, CVSS scoring, and references
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Trash2, Eye, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Finding {
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cvssScore: number;
  description: string;
  impact: string;
  affectedSystems: string[];
  poc: {
    title: string;
    steps: string[];
    code?: string;
    screenshots?: string[];
  };
  remediation: string;
  remediationEffort: 'low' | 'medium' | 'high';
  cveId?: string;
  cweId?: string;
}

const CVSS_SEVERITY_MAP: Record<number, 'critical' | 'high' | 'medium' | 'low' | 'info'> = {
  0: 'info',
  1: 'low',
  2: 'low',
  3: 'low',
  4: 'medium',
  5: 'medium',
  6: 'medium',
  7: 'high',
  8: 'high',
  9: 'critical',
  10: 'critical',
};

export function FindingBuilder() {
  const [finding, setFinding] = useState<Finding>({
    title: '',
    severity: 'medium',
    cvssScore: 5.0,
    description: '',
    impact: '',
    affectedSystems: [],
    poc: {
      title: '',
      steps: [],
    },
    remediation: '',
    remediationEffort: 'medium',
  });

  const [newSystem, setNewSystem] = useState('');
  const [newStep, setNewStep] = useState('');
  const [preview, setPreview] = useState(false);

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return colors[severity] || colors.medium;
  };

  const handleCVSSChange = (score: number) => {
    const rounded = Math.round(score);
    setFinding({
      ...finding,
      cvssScore: score,
      severity: CVSS_SEVERITY_MAP[rounded],
    });
  };

  const handleAddSystem = () => {
    if (newSystem.trim()) {
      setFinding({
        ...finding,
        affectedSystems: [...finding.affectedSystems, newSystem],
      });
      setNewSystem('');
    }
  };

  const handleRemoveSystem = (index: number) => {
    setFinding({
      ...finding,
      affectedSystems: finding.affectedSystems.filter((_, i) => i !== index),
    });
  };

  const handleAddStep = () => {
    if (newStep.trim()) {
      setFinding({
        ...finding,
        poc: {
          ...finding.poc,
          steps: [...finding.poc.steps, newStep],
        },
      });
      setNewStep('');
    }
  };

  const handleRemoveStep = (index: number) => {
    setFinding({
      ...finding,
      poc: {
        ...finding.poc,
        steps: finding.poc.steps.filter((_, i) => i !== index),
      },
    });
  };

  const handleSaveFinding = async () => {
    if (!finding.title || !finding.description || !finding.impact || !finding.remediation) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // In production, call API to save finding
      toast.success('Finding saved successfully');
    } catch (error) {
      toast.error('Failed to save finding');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔍 Finding Builder</span>
          </CardTitle>
          <CardDescription>
            Create structured findings with PoC, CVSS scoring, and professional formatting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="poc">PoC</TabsTrigger>
              <TabsTrigger value="systems">Systems</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  placeholder="e.g., SQL Injection in Login Form"
                  value={finding.title}
                  onChange={(e) => setFinding({ ...finding, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">CVSS Score (0-10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={finding.cvssScore}
                    onChange={(e) => handleCVSSChange(parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Severity</label>
                  <div className="pt-2">
                    <Badge className={getSeverityColor(finding.severity)}>
                      {finding.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">CVE ID (Optional)</label>
                  <Input
                    placeholder="CVE-2024-1234"
                    value={finding.cveId || ''}
                    onChange={(e) => setFinding({ ...finding, cveId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CWE ID (Optional)</label>
                  <Input
                    placeholder="CWE-89"
                    value={finding.cweId || ''}
                    onChange={(e) => setFinding({ ...finding, cweId: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  placeholder="Detailed technical description of the vulnerability"
                  value={finding.description}
                  onChange={(e) => setFinding({ ...finding, description: e.target.value })}
                  className="min-h-24"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Impact *</label>
                <Textarea
                  placeholder="Business and technical impact of this vulnerability"
                  value={finding.impact}
                  onChange={(e) => setFinding({ ...finding, impact: e.target.value })}
                  className="min-h-24"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Remediation *</label>
                <Textarea
                  placeholder="Step-by-step remediation instructions"
                  value={finding.remediation}
                  onChange={(e) => setFinding({ ...finding, remediation: e.target.value })}
                  className="min-h-24"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Remediation Effort</label>
                <Select
                  value={finding.remediationEffort}
                  onValueChange={(value) =>
                    setFinding({
                      ...finding,
                      remediationEffort: value as 'low' | 'medium' | 'high',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (less than 1 hour)</SelectItem>
                    <SelectItem value="medium">Medium (1-8 hours)</SelectItem>
                    <SelectItem value="high">High (more than 8 hours)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* PoC Tab */}
            <TabsContent value="poc" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">PoC Title</label>
                <Input
                  placeholder="e.g., SQL Injection Attack Steps"
                  value={finding.poc.title}
                  onChange={(e) =>
                    setFinding({
                      ...finding,
                      poc: { ...finding.poc, title: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">PoC Steps</label>
                <div className="space-y-2">
                  {finding.poc.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 pt-2 min-w-6">
                        {idx + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="text-sm">{step}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveStep(idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Input
                    placeholder="Add a new step..."
                    value={newStep}
                    onChange={(e) => setNewStep(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
                  />
                  <Button onClick={handleAddStep} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Code (Optional)</label>
                <Textarea
                  placeholder="Exploit code or payload"
                  value={finding.poc.code || ''}
                  onChange={(e) =>
                    setFinding({
                      ...finding,
                      poc: { ...finding.poc, code: e.target.value },
                    })
                  }
                  className="font-mono min-h-32"
                />
              </div>
            </TabsContent>

            {/* Systems Tab */}
            <TabsContent value="systems" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Affected Systems</label>
                <div className="space-y-2">
                  {finding.affectedSystems.map((system, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded"
                    >
                      <span className="text-sm">{system}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveSystem(idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Input
                    placeholder="Add system (IP, domain, hostname)"
                    value={newSystem}
                    onChange={(e) => setNewSystem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSystem()}
                  />
                  <Button onClick={handleAddSystem} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4">
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="text-lg font-bold">{finding.title || 'Untitled Finding'}</h3>
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(finding.severity)}>
                    {finding.severity.toUpperCase()} - CVSS {finding.cvssScore}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Description</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{finding.description}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Impact</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{finding.impact}</p>
                </div>

                {finding.affectedSystems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Affected Systems</h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                      {finding.affectedSystems.map((sys, idx) => (
                        <li key={idx}>{sys}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Remediation</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{finding.remediation}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleSaveFinding} className="w-full mt-6">
            <Save className="w-4 h-4 mr-2" />
            Save Finding
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
