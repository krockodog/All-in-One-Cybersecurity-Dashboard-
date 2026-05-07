import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { exportISO27001JSON, exportISO27001HTML, exportISO27001CSV } from "@/lib/exportUtils";

interface Finding {
  toolId: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
}

interface ISO27001ReportData {
  target: string;
  generatedAt: string;
  riskSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  findings: Finding[];
  affectedControls: string[];
  complianceScore: number;
  recommendations: Array<{
    priority: string;
    action: string;
  }>;
}

interface ISO27001ReportProps {
  data: ISO27001ReportData;
}

export function ISO27001Report({ data }: ISO27001ReportProps) {
  const [hoveredControl, setHoveredControl] = useState<string | null>(null);

  const controlDescriptions: Record<string, string> = {
    "A.5.1.1": "Policies for information security - Documented policies and procedures",
    "A.6.1.1": "Information security roles and responsibilities - Clear assignment of responsibilities",
    "A.7.1.1": "Access control policy - Rules for granting and revoking access",
    "A.8.1.1": "Cryptography policy - Use of cryptographic controls",
    "A.9.1.1": "Physical security perimeter - Protection of facilities",
    "A.10.1.1": "Operational procedures - Documented procedures for operations",
    "A.12.1.1": "Change management - Controlled changes to systems",
    "A.12.2.1": "Monitoring - Monitoring of systems and activities",
    "A.12.3.1": "Logging - Recording of security events",
    "A.12.4.1": "Clock synchronization - Accurate time for logging",
    "A.12.5.1": "Malware protection - Protection against malicious code",
    "A.12.6.1": "Backup - Regular backups of data",
    "A.13.1.1": "Network security - Segregation of networks",
    "A.13.2.1": "Information transfer - Secure transfer of information",
    "A.14.1.1": "Security requirements - Security requirements in development",
    "A.14.2.1": "Secure development - Secure development practices",
    "A.15.1.1": "Supplier relationships - Security in supplier relationships",
    "A.16.1.1": "Incident management - Response to security incidents",
  };

  const severityColors = {
    critical: "bg-red-500/10 border-red-500/20 text-red-400",
    high: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    medium: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    low: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };

  const severityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "secondary";
      case "medium":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-[rgba(15,15,18,0.85)] backdrop-blur-sm border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ISO 27001 ISMS Assessment Report
          </CardTitle>
          <CardDescription>
            Target: {data.target} | Generated: {new Date(data.generatedAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Compliance Score */}
      <Card className="bg-gradient-to-r from-[rgba(15,15,18,0.85)] to-purple-900/30 backdrop-blur-sm border-purple-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-2">Overall Compliance Score</p>
              <p className="text-4xl font-bold text-white">{Math.round(data.complianceScore)}%</p>
            </div>
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(100, 116, 139, 0.3)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="8"
                  strokeDasharray={`${(data.complianceScore / 100) * 283} 283`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Summary */}
      <div>
        <h3 className="text-white font-semibold mb-3">Risk Summary</h3>
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="pt-6">
              <p className="text-red-400 text-sm font-semibold mb-2">Critical</p>
              <p className="text-3xl font-bold text-red-400">{data.riskSummary.critical}</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <p className="text-orange-400 text-sm font-semibold mb-2">High</p>
              <p className="text-3xl font-bold text-orange-400">{data.riskSummary.high}</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="pt-6">
              <p className="text-yellow-400 text-sm font-semibold mb-2">Medium</p>
              <p className="text-3xl font-bold text-yellow-400">{data.riskSummary.medium}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <p className="text-blue-400 text-sm font-semibold mb-2">Low</p>
              <p className="text-3xl font-bold text-blue-400">{data.riskSummary.low}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Findings */}
      <Card className="bg-[rgba(15,15,18,0.85)] backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Key Findings</CardTitle>
          <CardDescription>Top security issues identified during assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.findings.map((finding, i) => (
              <div
                key={i}
                className={`border rounded-lg p-4 ${severityColors[finding.severity]}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={severityBadgeVariant(finding.severity)}>
                        {finding.severity.toUpperCase()}
                      </Badge>
                      <p className="text-sm font-semibold text-white">{finding.title}</p>
                    </div>
                    <p className="text-xs text-slate-300">{finding.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Affected ISO 27001 Controls */}
      <Card className="bg-[rgba(15,15,18,0.85)] backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Affected ISO 27001 Controls</CardTitle>
          <CardDescription>Controls that require attention based on findings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {data.affectedControls.map((control, i) => (
              <div
                key={i}
                className="relative group"
                onMouseEnter={() => setHoveredControl(control)}
                onMouseLeave={() => setHoveredControl(null)}
              >
                <div className="bg-[rgba(15,15,18,0.85)] backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 hover:border-cyan-400/60 cursor-help transition-all hover:shadow-lg">
                  <p className="text-sm text-cyan-300 flex items-start gap-2">
                    <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    {control}
                  </p>
                </div>

                {/* Tooltip */}
                {hoveredControl === control && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-900 border border-cyan-500/50 rounded-lg p-3 shadow-lg z-50">
                    <p className="text-xs text-cyan-300">
                      {controlDescriptions[control] || `ISO 27001 Control ${control}`}
                    </p>
                    <div className="absolute top-full left-4 w-2 h-2 bg-slate-900 border-r border-b border-cyan-500/50 transform rotate-45"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-[rgba(15,15,18,0.85)] backdrop-blur-sm border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Remediation Recommendations</CardTitle>
          <CardDescription>Prioritized actions to improve security posture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recommendations.map((rec, i) => (
              <div
                key={i}
                className="bg-[rgba(15,15,18,0.85)] backdrop-blur-sm border border-emerald-500/30 rounded-lg p-4 flex gap-3 hover:border-emerald-400/60 transition-all"
              >
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">{rec.priority}</p>
                  <p className="text-sm text-slate-300">{rec.action}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Download Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
          onClick={() => exportISO27001JSON(data)}
        >
          <Download className="w-4 h-4 mr-2" />
          JSON
        </Button>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => exportISO27001HTML(data)}
        >
          <Download className="w-4 h-4 mr-2" />
          HTML
        </Button>
        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => exportISO27001CSV(data)}
        >
          <Download className="w-4 h-4 mr-2" />
          CSV
        </Button>
      </div>
    </div>
  );
}
