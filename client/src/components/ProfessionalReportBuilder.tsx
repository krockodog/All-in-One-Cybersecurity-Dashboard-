/**
 * Professional Report Builder UI Component
 * Multi-report selection, consolidation, and export
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download, Eye, Trash2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Report {
  id: string;
  name: string;
  type: 'executive' | 'technical' | 'risk' | 'remediation' | 'red-team';
  createdAt: Date;
  findings: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface ConsolidationConfig {
  selectedReports: string[];
  mergeStrategy: 'comprehensive' | 'executive' | 'technical' | 'risk-focused';
  exportFormat: 'pdf' | 'html' | 'json' | 'docx' | 'csv' | 'txt';
  clientName: string;
  projectName: string;
}

export function ProfessionalReportBuilder() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'Executive Summary - Q1 2026',
      type: 'executive',
      createdAt: new Date(Date.now() - 86400000 * 7),
      findings: 12,
      severity: 'high',
    },
    {
      id: '2',
      name: 'Technical Assessment - Web Application',
      type: 'technical',
      createdAt: new Date(Date.now() - 86400000 * 5),
      findings: 28,
      severity: 'high',
    },
    {
      id: '3',
      name: 'Risk Assessment - Infrastructure',
      type: 'risk',
      createdAt: new Date(Date.now() - 86400000 * 3),
      findings: 15,
      severity: 'medium',
    },
    {
      id: '4',
      name: 'Remediation Roadmap - Q1 2026',
      type: 'remediation',
      createdAt: new Date(Date.now() - 86400000 * 1),
      findings: 12,
      severity: 'high',
    },
    {
      id: '5',
      name: 'Red Team Assessment',
      type: 'red-team',
      createdAt: new Date(),
      findings: 8,
      severity: 'critical',
    },
  ]);

  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [config, setConfig] = useState<ConsolidationConfig>({
    selectedReports: [],
    mergeStrategy: 'comprehensive',
    exportFormat: 'pdf',
    clientName: 'Acme Corporation',
    projectName: 'Security Assessment 2026',
  });

  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleReportSelection = (id: string) => {
    setSelectedReports((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  };

  const selectAllReports = () => {
    setSelectedReports(reports.map((r) => r.id));
  };

  const deselectAllReports = () => {
    setSelectedReports([]);
  };

  const handleGenerateReport = async () => {
    if (selectedReports.length === 0) {
      toast.error('Please select at least one report');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const fileName = `${config.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${config.exportFormat}`;

      toast.success(`Report generated: ${fileName}`);
      setShowPreview(true);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = () => {
    const fileName = `${config.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${config.exportFormat}`;
    toast.success(`Downloading: ${fileName}`);
  };

  const getReportIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      executive: '📊',
      technical: '🔧',
      risk: '⚠️',
      remediation: '🛠️',
      'red-team': '🎯',
    };
    return icons[type] || '📄';
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-amber-600',
      low: 'text-green-600',
    };
    return colors[severity] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Professional Report Builder</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Select and consolidate multiple reports into a single professional document
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Report Selection */}
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>
                {selectedReports.length} of {reports.length} selected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 mb-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={selectAllReports}
                  className="flex-1"
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={deselectAllReports}
                  className="flex-1"
                >
                  Deselect All
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-3 border rounded-lg cursor-pointer transition ${
                      selectedReports.includes(report.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => toggleReportSelection(report.id)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={() => {}}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getReportIcon(report.type)}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{report.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {report.createdAt.toLocaleDateString()} • {report.findings} findings
                            </p>
                          </div>
                          <span className={`text-sm font-medium ${getSeverityColor(report.severity)}`}>
                            {report.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Configuration */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Merge Strategy */}
              <div>
                <label className="block text-sm font-medium mb-2">Merge Strategy</label>
                <select
                  value={config.mergeStrategy}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      mergeStrategy: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                >
                  <option value="comprehensive">Comprehensive</option>
                  <option value="executive">Executive</option>
                  <option value="technical">Technical</option>
                  <option value="risk-focused">Risk-Focused</option>
                </select>
              </div>

              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium mb-2">Export Format</label>
                <select
                  value={config.exportFormat}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      exportFormat: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                >
                  <option value="pdf">PDF (Professional)</option>
                  <option value="html">HTML (Interactive)</option>
                  <option value="docx">DOCX (Editable)</option>
                  <option value="json">JSON (Data)</option>
                  <option value="csv">CSV (Spreadsheet)</option>
                  <option value="txt">TXT (Plain Text)</option>
                </select>
              </div>

              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Client Name</label>
                <input
                  type="text"
                  value={config.clientName}
                  onChange={(e) =>
                    setConfig({ ...config, clientName: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                  placeholder="e.g., Acme Corporation"
                />
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  type="text"
                  value={config.projectName}
                  onChange={(e) =>
                    setConfig({ ...config, projectName: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                  placeholder="e.g., Security Assessment 2026"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <Button
                  onClick={handleGenerateReport}
                  disabled={selectedReports.length === 0 || isGenerating}
                  className="w-full gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                </Button>

                {showPreview && (
                  <>
                    <Button
                      onClick={() => setShowPreview(false)}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>

                    <Button
                      onClick={handleDownloadReport}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>
                <strong>Reports Selected:</strong> {selectedReports.length}
              </div>
              <div>
                <strong>Format:</strong> {config.exportFormat.toUpperCase()}
              </div>
              <div>
                <strong>Strategy:</strong> {config.mergeStrategy}
              </div>
              {selectedReports.length > 0 && (
                <div>
                  <strong>Total Findings:</strong>{' '}
                  {reports
                    .filter((r) => selectedReports.includes(r.id))
                    .reduce((sum, r) => sum + r.findings, 0)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Report Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>
              Professional report ready for download and client delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg min-h-96 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  Report Preview: {config.projectName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Format: {config.exportFormat.toUpperCase()} | Strategy: {config.mergeStrategy}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
