import { AppFrame, EmptyState, SectionBadge } from "@/components/cyber/CyberShell";
import { useAudit } from "@/contexts/AuditContext";
import { Settings2, ShieldCheck, SlidersHorizontal, Zap, Info, Eye, EyeOff, ArrowUp, ArrowDown, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { AITokenDashboard } from "@/components/AITokenDashboard";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  defaultWidgets,
  getWidgetSizeLabel,
  loadDashboardWidgets,
  moveWidget,
  saveDashboardWidgets,
  updateWidgetSize,
  updateWidgetVisibility,
  widgetMeta,
  type WidgetConfig,
  type WidgetSize,
} from "@/lib/dashboard-layout";

function InfoTooltip({ text }: { text: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 transition hover:bg-cyan-500/20"
        aria-label="Info"
      >
        <Info className="h-3 w-3" />
      </button>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded-lg border border-cyan-400/30 bg-slate-900/95 px-3 py-2 text-xs text-slate-200 whitespace-nowrap shadow-lg z-50">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95" />
        </div>
      )}
    </div>
  );
}

/**
 * Design philosophy reminder — Forensischer Kontrollraum:
 * Settings sind keine generischen Formularseiten, sondern kontrollierte Panels mit technischer Klarheit,
 * dezentem Glas und strengem Informationsrhythmus.
 */
export default function SettingsPage() {
  const { settings, updateSettings, clearHistory } = useAudit();
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultWidgets);

  const userStorageId = user?.id != null ? String(user.id) : null;

  useEffect(() => {
    setWidgets(loadDashboardWidgets(userStorageId));
  }, [userStorageId]);

  useEffect(() => {
    saveDashboardWidgets(widgets, userStorageId);
  }, [userStorageId, widgets]);

  return (
    <AppFrame
      eyebrow="Configuration"
      title="Settings"
      action={
        <>
          <SectionBadge icon={<Settings2 className="h-3.5 w-3.5" />} label="Advisor Configuration" />
          <SectionBadge icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Authorized Controls" />
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr] mb-6">
        <section className="space-y-6">
          <div className="glass-panel px-5 py-5">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/75">Operational Preferences</p>
            <h2 className="mt-2 font-display text-3xl text-white">Konfiguration der Analyseumgebung</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              Diese Einstellungen steuern das Verhalten der simulierten Workspaces, Logging-Präferenzen und operative Standardpfade des Dashboards.
            </p>
            <div className="mt-6 space-y-4">
              <label className="block space-y-2">
                <div className="flex items-center">
                  <span className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-slate-400">Mode</span>
                  <InfoTooltip text="Wählt die KI-Strategie: advisor-controlled (KI-gesteuert), evidence-first (Daten-fokussiert), low-noise (weniger False Positives)" />
                </div>
                <select
                  value={settings.mode}
                  onChange={(event) => updateSettings({ mode: event.target.value })}
                  className="h-12 w-full rounded-2xl border border-white/8 bg-[rgba(10,14,20,0.8)] px-4 text-sm text-white outline-none transition focus:border-cyan-300/30 focus:ring-2 focus:ring-cyan-400/15"
                >
                  <option value="advisor-controlled">advisor-controlled</option>
                  <option value="evidence-first">evidence-first</option>
                  <option value="low-noise">low-noise</option>
                </select>
              </label>
              <label className="block space-y-2">
                <div className="flex items-center">
                  <span className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-slate-400">Routing</span>
                  <InfoTooltip text="segmented-workspaces: Nach Projekt organisiert | campaign-view: Nach Kampagne organisiert | asset-centric: Nach Ziel-Asset organisiert" />
                </div>
                <select
                  value={settings.routing}
                  onChange={(event) => updateSettings({ routing: event.target.value })}
                  className="h-12 w-full rounded-2xl border border-white/8 bg-[rgba(10,14,20,0.8)] px-4 text-sm text-white outline-none transition focus:border-cyan-300/30 focus:ring-2 focus:ring-cyan-400/15"
                >
                  <option value="segmented-workspaces">segmented-workspaces</option>
                  <option value="campaign-view">campaign-view</option>
                  <option value="asset-centric">asset-centric</option>
                </select>
              </label>
              <label className="block space-y-2">
                <div className="flex items-center">
                  <span className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-slate-400">Log Retention (Tage)</span>
                  <InfoTooltip text="Wie lange Audit-Logs und Scan-Ergebnisse gespeichert werden, bevor sie automatisch gelöscht werden" />
                </div>
                <input
                  type="range"
                  min={7}
                  max={90}
                  step={1}
                  value={settings.logRetention}
                  onChange={(event) => updateSettings({ logRetention: Number(event.target.value) })}
                  className="w-full accent-cyan-300"
                />
                <span className="text-sm text-slate-300">{settings.logRetention} Tage</span>
              </label>
            </div>
          </div>
          <div className="glass-panel px-5 py-5">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-5 w-5 text-emerald-300" />
              <div>
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-emerald-300/75">Behavior Toggles</p>
                <h3 className="mt-1 font-display text-2xl text-white">Workflow-Schalter</h3>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {[
                {
                  key: "alerts",
                  label: "Alert-Banner und Statushinweise aktivieren",
                  value: settings.alerts,
                },
                {
                  key: "evidenceSnapshots",
                  label: "Evidenz-Snapshots für Exporte vormerken",
                  value: settings.evidenceSnapshots,
                },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/25 px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-400">UI-seitige Präferenz für die simulierten Workspaces und den Reportbereich.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings({ [item.key]: !item.value } as Partial<typeof settings>)}
                    className={`relative h-7 w-14 rounded-full transition ${item.value ? "bg-cyan-400/80" : "bg-slate-700"}`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${item.value ? "left-8" : "left-1"}`}
                    />
                  </button>
                </label>
              ))}
            </div>
          </div>
        </section>
        <section className="space-y-6">
          <div className="glass-panel px-5 py-5">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/75">Current State</p>
            <h3 className="mt-2 font-display text-2xl text-white">Aktive Konfiguration</h3>
            <div className="mt-5 grid gap-3">
              {Object.entries(settings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/30 px-4 py-3">
                  <span className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-slate-400">{key}</span>
                  <span className="text-sm text-white">{String(value)}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={clearHistory}
              className="mt-5 rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-100 transition hover:bg-rose-500/16"
            >
              Verlauf leeren
            </button>
          </div>
          <div className="glass-panel px-5 py-5">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-5 w-5 text-yellow-300" />
              <div>
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-yellow-300/75">AI Integration</p>
                <h3 className="mt-1 font-display text-2xl text-white">KI-Assistenten</h3>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              Konfiguriere deine KI-Provider (ChatGPT, Claude, DeepSeek, etc.) für intelligente Analyse und Empfehlungen.
            </p>
            <Link to="/ai-settings">
              <button className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-100 transition hover:bg-yellow-500/16">
                AI Settings oeffnen &gt;
              </button>
            </Link>
          </div>
          <div className="glass-panel px-5 py-5">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-emerald-300/75">Token Management</p>
            <h3 className="mt-2 font-display text-2xl text-white">AI Token Dashboard</h3>
            <div className="mt-4">
              <AITokenDashboard />
            </div>
          </div>
        </section>
      </div>

      {/* Widget Layout Configuration */}
      <section className="mt-8 space-y-6">
        <div className="glass-panel px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/75">Dashboard Customization</p>
              <h2 className="mt-2 font-display text-3xl text-white">Widget-Layout konfigurieren</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
                Passe Reihenfolge, Sichtbarkeit und Größe der Dashboard-Widgets an. Die Konfiguration wird pro User im Browser gespeichert und vom Dashboard direkt übernommen.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] px-3 py-2 text-sm text-cyan-200 whitespace-nowrap">
              <Settings2 className="h-4 w-4" />
              {widgets.filter((w) => w.visible).length}/{widgets.length} aktiv · {userStorageId ? `User ${userStorageId.slice(0, 8)}` : "lokaler Gastmodus"}
            </div>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {widgets.map((widget, index) => {
              const meta = widgetMeta[widget.id];
              return (
                <div key={widget.id} className="rounded-lg border border-cyan-500/20 bg-[rgba(9,14,20,0.92)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{meta.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">{meta.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setWidgets((current) => updateWidgetVisibility(current, widget.id))}
                        className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-200 transition hover:bg-cyan-500/20"
                        aria-label={widget.visible ? `${meta.title} ausblenden` : `${meta.title} einblenden`}
                      >
                        {widget.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setWidgets((current) => moveWidget(current, index, -1))}
                        disabled={index === 0}
                        className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`${meta.title} nach oben verschieben`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setWidgets((current) => moveWidget(current, index, 1))}
                        disabled={index === widgets.length - 1}
                        className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`${meta.title} nach unten verschieben`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-[0.24em] text-slate-500">Widget-Größe</p>
                      <p className="mt-1 text-xs text-slate-400">Aktuell: {getWidgetSizeLabel(widget.size)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {(["compact", "standard", "wide"] as WidgetSize[]).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setWidgets((current) => updateWidgetSize(current, widget.id, size))}
                          className={`rounded-full border px-3 py-1.5 text-xs transition ${widget.size === size ? "border-cyan-300/40 bg-cyan-500/20 text-cyan-100" : "border-white/10 bg-black/20 text-slate-300 hover:bg-white/8"}`}
                          aria-label={`${meta.title} Größe ${getWidgetSizeLabel(size)}`}
                        >
                          {getWidgetSizeLabel(size)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="mt-8 space-y-6">
        <div className="glass-panel px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-emerald-300" />
              <div>
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-emerald-300/75">Notification Settings</p>
                <h3 className="mt-1 font-display text-2xl text-white">Benachrichtigungen konfigurieren</h3>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Passe deine Benachrichtigungseinstellungen an. Du erhältst Alerts für kritische Findings, Workflow-Abschlüsse und System-Events.
          </p>
          <div className="mt-5 space-y-4">
            {[
              {
                key: "emailNotifications",
                label: "Email-Benachrichtigungen aktivieren",
                description: "Erhalte wichtige Updates per E-Mail",
              },
              {
                key: "criticalFindings",
                label: "Alerts für kritische Findings",
                description: "Benachrichtigungen für CVSS >= 7.0",
              },
              {
                key: "workflowCompletion",
                label: "Workflow-Abschluss-Benachrichtigungen",
                description: "Alerts wenn Scans abgeschlossen sind",
              },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/25 px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.description}</p>
                </div>
                <button
                  type="button"
                  className="relative h-7 w-14 rounded-full transition bg-slate-700"
                  disabled
                >
                  <span className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white transition" />
                </button>
              </label>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Hinweis: Benachrichtigungseinstellungen sind derzeit schreibgeschützt. Sie werden in einer zukünftigen Version konfigurierbar.
          </p>
        </div>
      </section>
    </AppFrame>
  );
}
