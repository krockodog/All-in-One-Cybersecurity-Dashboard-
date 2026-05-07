import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Zap, BarChart3, CheckCircle2, Download } from "lucide-react";
import { exportPentestJSON, exportPentestHTML, exportPentestCSV, exportISO27001JSON, exportISO27001HTML, exportISO27001CSV } from "@/lib/exportUtils";

interface NextStepsSectionProps {
  onGenerateReport: () => void;
  onDeepAnalysis: () => void;
  onCreateISO27001: () => void;
  onReviewFindings: () => void;
  pentestData?: any;
  iso27001Data?: any;
}

export function NextStepsSection({
  onGenerateReport,
  onDeepAnalysis,
  onCreateISO27001,
  onReviewFindings,
  pentestData,
  iso27001Data,
}: NextStepsSectionProps) {
  const steps = [
    {
      icon: FileText,
      title: "Ergebnisse auswerten",
      description: "Detaillierte Analyse der Scan-Ergebnisse durchführen",
      action: "Auswerten",
      onClick: onReviewFindings,
      color: "bg-blue-500/10 border-blue-500/20",
    },
    {
      icon: BarChart3,
      title: "Report generieren",
      description: "Professionellen Pentest-Report erstellen",
      action: "Report erstellen",
      onClick: onGenerateReport,
      color: "bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: Zap,
      title: "Tiefere Analyse",
      description: "Erweiterte Analyse mit zusätzlichen Tools",
      action: "Analyse starten",
      onClick: onDeepAnalysis,
      color: "bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: CheckCircle2,
      title: "ISO 27001 Report",
      description: "Compliance-Report mit Risikomatrix erstellen",
      action: "ISO Report",
      onClick: onCreateISO27001,
      color: "bg-green-500/10 border-green-500/20",
    },
  ];

  return (
    <Card className="bg-[rgba(15,15,18,0.85)] backdrop-blur-sm border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Nächste Schritte
        </CardTitle>
        <CardDescription>Empfohlene Aktionen basierend auf den Scan-Ergebnissen</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Options */}
        {(pentestData || iso27001Data) && (
          <div className="border-t border-slate-700/50 pt-4">
            <p className="text-sm font-semibold text-cyan-300 mb-3">📥 Export Optionen</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {pentestData && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs bg-[rgba(15,15,18,0.85)] border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                    onClick={() => exportPentestJSON(pentestData)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    JSON
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs bg-[rgba(15,15,18,0.85)] border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                    onClick={() => exportPentestCSV(pentestData)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs bg-[rgba(15,15,18,0.85)] border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                    onClick={() => exportPentestHTML(pentestData)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    HTML
                  </Button>
                </>
              )}
              {iso27001Data && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs bg-[rgba(15,15,18,0.85)] border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                    onClick={() => exportISO27001JSON(iso27001Data)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    ISO JSON
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs bg-[rgba(15,15,18,0.85)] border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                    onClick={() => exportISO27001CSV(iso27001Data)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    ISO CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs bg-[rgba(15,15,18,0.85)] border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                    onClick={() => exportISO27001HTML(iso27001Data)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    ISO HTML
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className={`border rounded-lg p-4 ${step.color} flex flex-col justify-between`}
              >
                <div className="mb-4">
                  <div className="flex items-start gap-3 mb-2">
                    <Icon className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">{step.title}</p>
                      <p className="text-sm text-slate-300 mt-1">{step.description}</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={step.onClick}
                  variant="outline"
                  className="w-full gap-2 text-white border-white/20 hover:bg-white/10"
                >
                  {step.action}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
