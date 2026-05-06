/**
 * ISO 27001 Report Generator Page
 * ISMS Template, Risk Assessment, Gap Analysis, Action Plan
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface ISMSControl {
  id: string;
  name: string;
  description: string;
  status: 'implemented' | 'partial' | 'not_implemented';
  findings: string[];
  riskScore: number;
}

interface RiskAssessment {
  controlId: string;
  likelihood: number;
  impact: number;
  riskScore: number;
  treatment: 'mitigate' | 'accept' | 'avoid' | 'transfer';
}

interface ActionPlan {
  id: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'completed';
}

const MOCK_CONTROLS: ISMSControl[] = [
  {
    id: 'A.5.1.1',
    name: 'Information Security Policies',
    description: 'Policies for information security management',
    status: 'implemented',
    findings: [],
    riskScore: 0,
  },
  {
    id: 'A.6.1.1',
    name: 'Internal Organization',
    description: 'Management of information security',
    status: 'partial',
    findings: ['Missing security awareness training', 'No incident response plan'],
    riskScore: 7.5,
  },
  {
    id: 'A.7.1.1',
    name: 'Access Control',
    description: 'User access management',
    status: 'not_implemented',
    findings: ['No MFA enabled', 'Weak password policy'],
    riskScore: 9.2,
  },
];

const MOCK_ACTION_PLAN: ActionPlan[] = [
  {
    id: 'AP-001',
    description: 'Implement Multi-Factor Authentication (MFA)',
    priority: 'critical',
    owner: 'IT Security',
    dueDate: '2026-06-01',
    status: 'in_progress',
  },
  {
    id: 'AP-002',
    description: 'Develop Incident Response Plan',
    priority: 'high',
    owner: 'Security Team',
    dueDate: '2026-05-15',
    status: 'open',
  },
  {
    id: 'AP-003',
    description: 'Conduct Security Awareness Training',
    priority: 'high',
    owner: 'HR & Security',
    dueDate: '2026-05-30',
    status: 'open',
  },
];

export default function ISO27001ReportPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [controls, setControls] = useState<ISMSControl[]>(MOCK_CONTROLS);
  const [actionPlan, setActionPlan] = useState<ActionPlan[]>(MOCK_ACTION_PLAN);

  const implementedCount = controls.filter((c) => c.status === 'implemented').length;
  const partialCount = controls.filter((c) => c.status === 'partial').length;
  const notImplementedCount = controls.filter((c) => c.status === 'not_implemented').length;
  const averageRiskScore =
    controls.reduce((sum, c) => sum + c.riskScore, 0) / controls.length;

  const handleExportReport = (format: 'pdf' | 'docx' | 'html') => {
    console.log(`Exporting ISO 27001 Report as ${format.toUpperCase()}`);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-6 p-6 bg-background">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">ISO 27001 ISMS Report</h1>
          <p className="text-muted-foreground">
            Information Security Management System Assessment & Gap Analysis
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            <TabsTrigger value="gap">Gap Analysis</TabsTrigger>
            <TabsTrigger value="action">Action Plan</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Implemented</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{implementedCount}</div>
                  <p className="text-xs text-muted-foreground">
                    {((implementedCount / controls.length) * 100).toFixed(0)}% of controls
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Partial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{partialCount}</div>
                  <p className="text-xs text-muted-foreground">Requires improvement</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Not Implemented</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{notImplementedCount}</div>
                  <p className="text-xs text-muted-foreground">Critical gaps</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageRiskScore.toFixed(1)}/10</div>
                  <p className="text-xs text-muted-foreground">Overall risk level</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>ISO 27001 Annex A Controls Implementation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Implementation Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {((implementedCount / controls.length) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(implementedCount / controls.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Risk Mitigation</span>
                    <span className="text-sm text-muted-foreground">
                      {(100 - averageRiskScore * 10).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${100 - averageRiskScore * 10}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={() => handleExportReport('pdf')} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export as PDF
              </Button>
              <Button onClick={() => handleExportReport('docx')} variant="outline" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Export as DOCX
              </Button>
              <Button onClick={() => handleExportReport('html')} variant="outline" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Export as HTML
              </Button>
            </div>
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ISO 27001 Annex A Controls</CardTitle>
                <CardDescription>Implementation status of security controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {controls.map((control) => (
                  <div key={control.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">
                          {control.id}: {control.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{control.description}</p>
                      </div>
                      <Badge
                        variant={
                          control.status === 'implemented'
                            ? 'default'
                            : control.status === 'partial'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {control.status === 'implemented'
                          ? 'Implemented'
                          : control.status === 'partial'
                            ? 'Partial'
                            : 'Not Implemented'}
                      </Badge>
                    </div>
                    {control.findings.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {control.findings.map((finding, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            {finding}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Assessment Tab */}
          <TabsContent value="risk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment Matrix</CardTitle>
                <CardDescription>Likelihood × Impact = Risk Score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Risk assessment data from pentest findings</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gap Analysis Tab */}
          <TabsContent value="gap" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gap Analysis</CardTitle>
                <CardDescription>Differences between current and desired state</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {controls
                  .filter((c) => c.status !== 'implemented')
                  .map((control) => (
                    <div key={control.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <h4 className="font-semibold">{control.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Current: {control.status === 'partial' ? 'Partially Implemented' : 'Not Implemented'}
                      </p>
                      <p className="text-sm text-muted-foreground">Desired: Fully Implemented</p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Action Plan Tab */}
          <TabsContent value="action" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Action Plan</CardTitle>
                <CardDescription>Remediation steps to close gaps</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {actionPlan.map((action) => (
                  <div key={action.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{action.description}</h4>
                        <p className="text-sm text-muted-foreground">Owner: {action.owner}</p>
                      </div>
                      <Badge
                        variant={
                          action.priority === 'critical'
                            ? 'destructive'
                            : action.priority === 'high'
                              ? 'secondary'
                              : 'default'
                        }
                      >
                        {action.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">Due: {action.dueDate}</span>
                      <Badge
                        variant={
                          action.status === 'completed'
                            ? 'default'
                            : action.status === 'in_progress'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {action.status === 'completed'
                          ? 'Completed'
                          : action.status === 'in_progress'
                            ? 'In Progress'
                            : 'Open'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
