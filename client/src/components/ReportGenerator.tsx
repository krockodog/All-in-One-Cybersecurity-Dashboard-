/**
 * Professional Report Generator UI
 * Multi-format report generation with AI analysis
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, FileText, BarChart3, Zap, Shield } from 'lucide-react';
import { toast } from 'sonner';

export type ReportType =
  | 'executive_summary'
  | 'technical'
  | 'risk_assessment'
  | 'remediation_roadmap'
  | 'red_team';

export type ReportFormat = 'pdf' | 'docx' | 'html' | 'json';

interface ReportGeneratorProps {
  engagementId: string;
  findingsCount: number;
  onReportGenerated?: (reportId: string) => void;
}

const REPORT_TYPES: Record<ReportType, { label: string; description: string; icon: React.ReactNode }> = {
  executive_summary: {
    label: 'Executive Summary',
    description: 'High-level overview for management',
    icon: <BarChart3 className="w-4 h-4" />,
  },
  technical: {
    label: 'Technical Report',
    description: 'Detailed technical findings',
    icon: <FileText className="w-4 h-4" />,
  },
  risk_assessment: {
    label: 'Risk Assessment',
    description: 'Risk scoring and prioritization',
    icon: <Shield className="w-4 h-4" />,
  },
  remediation_roadmap: {
    label: 'Remediation Roadmap',
    description: 'Phased remediation plan',
    icon: <Zap className="w-4 h-4" />,
  },
  red_team: {
    label: 'Red Team Report',
    description: 'Attack chains and exploitation paths',
    icon: <Shield className="w-4 h-4" />,
  },
};

const REPORT_FORMATS: Record<ReportFormat, string> = {
  pdf: 'PDF (Professional)',
  docx: 'DOCX (Editable)',
  html: 'HTML (Interactive)',
  json: 'JSON (Data)',
};

export function ReportGenerator({ engagementId, findingsCount, onReportGenerated }: ReportGeneratorProps) {
  const [selectedReports, setSelectedReports] = useState<ReportType[]>(['executive_summary']);
  const [selectedFormats, setSelectedFormats] = useState<ReportFormat[]>(['pdf']);
  const [includeAIAnalysis, setIncludeAIAnalysis] = useState(true);
  const [includeRedTeamAnalysis, setIncludeRedTeamAnalysis] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const toggleReportType = (type: ReportType) => {
    setSelectedReports((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleFormat = (format: ReportFormat) => {
    setSelectedFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  };

  const handleGenerateReports = async () => {
    if (selectedReports.length === 0) {
      toast.error('Please select at least one report type');
      return;
    }

    if (selectedFormats.length === 0) {
      toast.error('Please select at least one export format');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate report generation with progress
      for (let i = 0; i <= 100; i += 10) {
        setGenerationProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      toast.success(`Generated ${selectedReports.length} report(s) in ${selectedFormats.length} format(s)`);
      onReportGenerated?.(`report-${Date.now()}`);
    } catch (error) {
      toast.error('Failed to generate reports');
      console.error(error);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Report Types</CardTitle>
          <CardDescription>Select one or more report formats to generate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.entries(REPORT_TYPES) as [ReportType, (typeof REPORT_TYPES)[ReportType]][]).map(
              ([type, config]) => (
                <div
                  key={type}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedReports.includes(type)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => toggleReportType(type)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedReports.includes(type)}
                      onChange={() => toggleReportType(type)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {config.icon}
                        <h3 className="font-semibold">{config.label}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{config.description}</p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Format Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Export Formats</CardTitle>
          <CardDescription>Choose how to export your reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.entries(REPORT_FORMATS) as [ReportFormat, string][]).map(([format, label]) => (
              <Button
                key={format}
                variant={selectedFormats.includes(format) ? 'default' : 'outline'}
                onClick={() => toggleFormat(format)}
                className="justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Options */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Analysis</CardTitle>
          <CardDescription>Enhance reports with AI insights and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Checkbox
                checked={includeAIAnalysis}
                onChange={(e) => setIncludeAIAnalysis((e.target as HTMLInputElement).checked)}
              />
              <div className="flex-1">
                <h4 className="font-semibold">Report Review & Enhancement</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI analyzes findings for completeness, accuracy, and provides improvement suggestions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Checkbox
                checked={includeRedTeamAnalysis}
                onChange={(e) => setIncludeRedTeamAnalysis((e.target as HTMLInputElement).checked)}
              />
              <div className="flex-1">
                <h4 className="font-semibold">Red Team Tactics Analysis</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Identify MITRE ATT&CK tactics, exploitation paths, and attack chains
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Report Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Reports</p>
              <p className="text-2xl font-bold">{selectedReports.length}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Formats</p>
              <p className="text-2xl font-bold">{selectedFormats.length}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Findings</p>
              <p className="text-2xl font-bold">{findingsCount}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Analysis</p>
              <p className="text-2xl font-bold">{includeAIAnalysis ? '✓' : '✗'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Progress */}
      {isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-semibold">Generating reports...</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{generationProgress}% complete</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleGenerateReports}
          disabled={isGenerating || selectedReports.length === 0}
          size="lg"
          className="flex-1"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Generate Reports
            </>
          )}
        </Button>
      </div>

      {/* Report Features Info */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">Professional Report Features</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>✓ CVSS v3.1 scoring and risk assessment</p>
          <p>✓ CWE and MITRE ATT&CK mapping</p>
          <p>✓ Executive summary with key metrics</p>
          <p>✓ Detailed remediation roadmap with timelines</p>
          <p>✓ Attack chain analysis and exploitation paths</p>
          <p>✓ Compliance mapping (SOC 2, ISO 27001, PCI-DSS)</p>
          <p>✓ Professional branding and formatting</p>
          <p>✓ AI-powered enhancement and review</p>
        </CardContent>
      </Card>
    </div>
  );
}
