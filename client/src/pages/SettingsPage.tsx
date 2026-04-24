import { AppFrame, EmptyState, SectionBadge } from "@/components/cyber/CyberShell";
import { useAudit } from "@/contexts/AuditContext";
import { Settings2, ShieldCheck, SlidersHorizontal, Zap } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Design philosophy reminder — Forensischer Kontrollraum:
 * Settings sind keine generischen Formularseiten, sondern kontrollierte Panels mit technischer Klarheit,
 * dezentem Glas und strengem Informationsrhythmus.
 */
export default function SettingsPage() {
  const { settings, updateSettings, clearHistory } = useAudit();

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
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-6">
          <div className="glass-panel px-5 py-5">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/75">Operational Preferences</p>
            <h2 className="mt-2 font-display text-3xl text-white">Konfiguration der Analyseumgebung</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              Diese Einstellungen steuern das Verhalten der simulierten Workspaces, Logging-Präferenzen und operative Standardpfade des Dashboards.
            </p>
            <div className="mt-6 space-y-4">
              <label className="block space-y-2">
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-slate-400">Mode</span>
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
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-slate-400">Routing</span>
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
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-slate-400">Log Retention (Tage)</span>
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
                AI Settings öffnen →
              </button>
            </Link>
          </div>
        </section>
      </div>
    </AppFrame>
  );
}
