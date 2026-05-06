import React, { useEffect, useMemo, useState } from "react";
import {
  AppFrame,
  HeroPanel,
  JobsPanel,
  QuickLaunchPanel,
  SectionBadge,
  StatStrip,
  TrygitBanner,
} from "@/components/cyber/CyberShell";
import { InvestigationSnapshotsPanel } from "@/components/cyber/InvestigationSnapshotsPanel";
import { OperationalIntelligencePanel } from "@/components/cyber/OperationalIntelligencePanel";
import { WorkflowAutomationManager } from "@/components/WorkflowAutomationManager";
import { useAuth } from "@/_core/hooks/useAuth";
import { defaultWidgets, getWidgetSpanClass, loadDashboardWidgets, type WidgetId } from "@/lib/dashboard-layout";
import { Binary, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { user } = useAuth();
  const userStorageId = user?.id != null ? String(user.id) : null;
  const [widgets, setWidgets] = useState(defaultWidgets);

  useEffect(() => {
    setWidgets(loadDashboardWidgets(userStorageId));
  }, [userStorageId]);

  const scrollToAutomation = () => {
    const section = document.getElementById("workflow-automation-manager");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderedWidgets = useMemo<Record<WidgetId, React.ReactNode>>(
    () => ({
      hero: <HeroPanel />,
      stats: <StatStrip />,
      "quick-launch": <QuickLaunchPanel />,
      "automated-pentest": (
        <section className="glass-panel border-l-4 border-l-purple-500 px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-purple-300/75">Enterprise Feature</p>
              <h3 className="mt-2 font-display text-2xl text-white">Automatisierter Pentest</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Intelligente Multi-Stage Pentest-Planung mit KI-Validierung, automatischer Tool-Auswahl,
                Selection Reasoning, manueller Tool-Steuerung und Live-Execution.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <Link
                to="/automated-pentest"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:from-purple-500 hover:to-purple-600 hover:shadow-purple-500/50"
              >
                <span>Starten</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-purple-400/20 bg-purple-500/10 p-3">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-purple-300/75">Phase 1</p>
              <p className="mt-1 text-sm font-medium text-white">Scope Definition</p>
              <p className="mt-1 text-xs text-purple-200/70">Domain, IP, Netzwerk, Applikation</p>
            </div>
            <div className="rounded-lg border border-purple-400/20 bg-purple-500/10 p-3">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-purple-300/75">Phase 2</p>
              <p className="mt-1 text-sm font-medium text-white">Validierung & Steuerung</p>
              <p className="mt-1 text-xs text-purple-200/70">Jurisdiktion, Scope-Enforcement, Override</p>
            </div>
            <div className="rounded-lg border border-purple-400/20 bg-purple-500/10 p-3">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-purple-300/75">Phase 3</p>
              <p className="mt-1 text-sm font-medium text-white">Plan-Generator</p>
              <p className="mt-1 text-xs text-purple-200/70">128 Tools, Selection Reasoning, Tool-Versionen</p>
            </div>
            <div className="rounded-lg border border-purple-400/20 bg-purple-500/10 p-3">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-purple-300/75">Phase 4</p>
              <p className="mt-1 text-sm font-medium text-white">Execution & Reporting</p>
              <p className="mt-1 text-xs text-purple-200/70">Retry, Alerts, CVSS, ISO 27001</p>
            </div>
          </div>
        </section>
      ),
      operations: <OperationalIntelligencePanel />,
      snapshots: <InvestigationSnapshotsPanel />,
      banner: <TrygitBanner />,
      jobs: <JobsPanel compact />,
      automation: (
        <section id="workflow-automation-manager">
          <WorkflowAutomationManager />
        </section>
      ),
    }),
    []
  );

  return (
    <AppFrame
      eyebrow="Operations Overview"
      title="Dashboard"
      action={
        <>
          <SectionBadge icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Authorized Workflows" />
          <SectionBadge icon={<Binary className="h-3.5 w-3.5" />} label="Live Evidence Chain" />
          <button
            type="button"
            onClick={scrollToAutomation}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300 transition hover:bg-cyan-500/20"
          >
            <Zap className="h-3.5 w-3.5" />
            Automation
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <header className="sr-only">
          <h2>OSINT-, Reconnaissance- und Pentest-Dashboard für autorisierte Sicherheitsanalysen</h2>
        </header>
        <div className="grid gap-6 xl:grid-cols-2">
          {widgets.filter((widget) => widget.visible).map((widget) => (
            <section key={widget.id} className={getWidgetSpanClass(widget.size)}>
              {renderedWidgets[widget.id as WidgetId]}
            </section>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}
