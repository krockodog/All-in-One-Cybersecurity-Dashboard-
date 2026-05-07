/**
 * Professional Report Generation Page
 * Multi-format report generation with AI analysis
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportGenerator } from '@/components/ReportGenerator';
import { AttackChainVisualizer } from '@/components/AttackChainVisualizer';
import { Loader2, FileText, Eye, Download, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedReport {
  id: string;
  type: string;
  formats: string[];
  generatedAt: Date;
  status: 'generating' | 'ready' | 'error';
}

export default function ReportPage() {
  const [engagementId] = useState('engagement-001');
  const [findingsCount] = useState(42);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleReportGenerated = (reportId: string) => {
    const newReport: GeneratedReport = {
      id: reportId,
      type: 'multi-format',
      formats: ['pdf', 'html', 'json', 'txt', 'csv', 'docx'],
      generatedAt: new Date(),
      status: 'ready',
    };

    setGeneratedReports((prev) => [newReport, ...prev]);
    setSelectedReport(newReport);
    toast.success('Report generated successfully!');
  };

  const handleDownloadReport = async (format: string) => {
    if (!selectedReport) return;

    setIsDownloading(true);
    try {
      // Simulate download
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const formatExtensions: Record<string, string> = {
        pdf: 'pdf',
        html: 'html',
        json: 'json',
        txt: 'txt',
        csv: 'csv',
        docx: 'docx'
      };
      
      const ext = formatExtensions[format] || format;
      const filename = `report_${selectedReport.id}_${format}.${ext}`;
      toast.success(`Downloaded ${filename}`);
    } catch (error) {
      toast.error('Failed to download report');
    } finally {
      setIsDownloading(false);
    }
  };

  const mockAttackChainNodes = [
    {
      id: 'node-1',
      phase: 'reconnaissance',
      name: 'Network Scanning',
      description: 'Attacker performs network reconnaissance to identify targets',
      severity: 'high' as const,
      exploitability: 0.8,
      detectionMethods: ['Network IDS', 'Flow Analysis'],
      evasionTechniques: ['Slow Scan', 'Randomized Ports'],
    },
    {
      id: 'node-2',
      phase: 'weaponization',
      name: 'Exploit Development',
      description: 'Develop custom exploit for identified vulnerability',
      severity: 'critical' as const,
      exploitability: 0.9,
      detectionMethods: ['Endpoint Detection', 'Behavior Analysis'],
      evasionTechniques: ['Code Obfuscation', 'Polymorphism'],
    },
    {
      id: 'node-3',
      phase: 'delivery',
      name: 'Phishing Campaign',
      description: 'Send malicious email with weaponized attachment',
      severity: 'high' as const,
      exploitability: 0.7,
      detectionMethods: ['Email Gateway', 'User Training'],
      evasionTechniques: ['Spoofing', 'Social Engineering'],
    },
    {
      id: 'node-4',
      phase: 'exploitation',
      name: 'Remote Code Execution',
      description: 'Execute malicious code on target system',
      severity: 'critical' as const,
      exploitability: 0.95,
      detectionMethods: ['EDR', 'Process Monitoring'],
      evasionTechniques: ['Living off the Land', 'Obfuscation'],
    },
    {
      id: 'node-5',
      phase: 'installation',
      name: 'Persistence Mechanism',
      description: 'Install backdoor for continued access',
      severity: 'critical' as const,
      exploitability: 0.85,
      detectionMethods: ['File Integrity Monitoring', 'Registry Monitoring'],
      evasionTechniques: ['Rootkit', 'Scheduled Tasks'],
    },
    {
      id: 'node-6',
      phase: 'command_and_control',
      name: 'C2 Communication',
      description: 'Establish command and control channel',
      severity: 'critical' as const,
      exploitability: 0.8,
      detectionMethods: ['Network Monitoring', 'DNS Sinkhole'],
      evasionTechniques: ['Encrypted Channel', 'Domain Flux'],
    },
    {
      id: 'node-7',
      phase: 'actions_on_objectives',
      name: 'Data Exfiltration',
      description: 'Steal sensitive data from target',
      severity: 'critical' as const,
      exploitability: 0.75,
      detectionMethods: ['DLP', 'Network Monitoring'],
      evasionTechniques: ['Compression', 'Encryption'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Professional Report Generation</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate enterprise-grade security reports with AI-powered analysis and Red Team insights
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="generator" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">
            <FileText className="w-4 h-4 mr-2" />
            Generate Reports
          </TabsTrigger>
          <TabsTrigger value="visualization">
            <Eye className="w-4 h-4 mr-2" />
            Attack Chains
          </TabsTrigger>
          <TabsTrigger value="history">
            <Download className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Report Generator Tab */}
        <TabsContent value="generator" className="space-y-4">
          <ReportGenerator
            engagementId={engagementId}
            findingsCount={findingsCount}
            onReportGenerated={handleReportGenerated}
          />
        </TabsContent>

        {/* Attack Chain Visualization Tab */}
        <TabsContent value="visualization" className="space-y-4">
          <AttackChainVisualizer
            nodes={mockAttackChainNodes}
            title="Cyber Kill Chain Analysis"
            description="Detailed visualization of attack progression and exploitation paths"
          />
        </TabsContent>

        {/* Report History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>View and download previously generated reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedReports.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No reports generated yet</p>
                  <p className="text-sm text-gray-500">Generate your first report to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {generatedReports.map((report) => (
                    <div
                      key={report.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedReport?.id === report.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {report.status === 'ready' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          )}
                          <div>
                            <h4 className="font-semibold">{report.type}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {report.generatedAt.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {report.formats.map((format) => (
                            <span
                              key={format}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium"
                            >
                              {format.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedReport && (
                <div className="mt-6 pt-6 border-t space-y-3">
                  <h4 className="font-semibold">Download Report</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedReport.formats.map((format) => (
                      <Button
                        key={format}
                        variant="outline"
                        size="sm"
                        disabled={isDownloading}
                        onClick={() => handleDownloadReport(format)}
                        className="justify-center"
                      >
                        {isDownloading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-1" />
                            {format.toUpperCase()}
                          </>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Features Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle>Enterprise Report Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Report Types</h4>
              <ul className="space-y-1 text-sm">
                <li>✓ Executive Summary</li>
                <li>✓ Technical Assessment</li>
                <li>✓ Risk Assessment</li>
                <li>✓ Remediation Roadmap</li>
                <li>✓ Red Team Report</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Export Formats</h4>
              <ul className="space-y-1 text-sm">
                <li>✓ PDF (Professional)</li>
                <li>✓ DOCX (Editable)</li>
                <li>✓ HTML (Interactive)</li>
                <li>✓ JSON (Data)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">AI Analysis</h4>
              <ul className="space-y-1 text-sm">
                <li>✓ Report Review & Enhancement</li>
                <li>✓ CVSS v3.1 Scoring</li>
                <li>✓ MITRE ATT&CK Mapping</li>
                <li>✓ Exploitation Path Analysis</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Red Team Features</h4>
              <ul className="space-y-1 text-sm">
                <li>✓ Attack Chain Visualization</li>
                <li>✓ Lateral Movement Analysis</li>
                <li>✓ Persistence Mechanisms</li>
                <li>✓ Evasion Techniques</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
