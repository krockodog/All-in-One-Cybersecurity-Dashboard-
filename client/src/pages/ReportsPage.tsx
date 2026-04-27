import { AppFrame, EmptyState, ExportButton, JobsPanel, SectionBadge } from "@/components/cyber/CyberShell";
import { useAudit, useReportSummary } from "@/contexts/AuditContext";
import { FileText, ShieldCheck, TriangleAlert } from "lucide-react";

/**
 * Design philosophy reminder — Forensischer Kontrollraum:
 * Reports erscheinen wie evidenzreiche Dossiers: klare Tabellen, matte Flächen,
 * gezielte Akzentfarben für Priorität statt bunte Visualisierung.
 */
export default function ReportsPage() {
  const { jobs } = useAudit();
  const summary = useReportSummary();

  function downloadFile(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function buildHtmlContent() {
    const generatedAt = new Date().toLocaleString("de-DE");
    const rows = jobs
      .map(
        (job) => `
        <tr>
          <td>${job.toolName}</td>
          <td>${job.category}</td>
          <td class="mono">${job.target}</td>
          <td><span class="badge badge-${job.status}">${job.status}</span></td>
          <td>${job.summary}</td>
        </tr>
        <tr class="output-row">
          <td colspan="5"><pre>${job.output}</pre></td>
        </tr>`,
      )
      .join("");

    return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cybersecurity Advisor Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #04070a; color: #cbd5e1; padding: 2rem; }
    h1 { color: #fff; font-size: 2rem; margin-bottom: 0.5rem; }
    .meta { font-family: monospace; font-size: 0.75rem; letter-spacing: 0.1em; color: #64748b; margin-bottom: 2rem; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .stat { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem; }
    .stat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.2em; color: #64748b; }
    .stat-value { font-size: 2.5rem; font-weight: 700; color: #fff; margin-top: 0.5rem; }
    table { width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.02); border-radius: 12px; overflow: hidden; }
    th { background: rgba(255,255,255,0.06); padding: 0.75rem 1rem; text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.18em; color: #94a3b8; }
    td { padding: 0.75rem 1rem; border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.875rem; vertical-align: top; }
    .mono { font-family: monospace; font-size: 0.75rem; color: #67e8f9; }
    .output-row td { background: #05090d; padding: 0.5rem 1rem 1rem; }
    pre { font-family: monospace; font-size: 0.75rem; color: #6ee7b7; white-space: pre-wrap; word-break: break-all; }
    .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.18em; }
    .badge-success { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); color: #6ee7b7; }
    .badge-error { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5; }
    .badge-scanning { background: rgba(34,211,238,0.12); border: 1px solid rgba(34,211,238,0.25); color: #67e8f9; }
    .badge-idle { background: rgba(148,163,184,0.1); border: 1px solid rgba(148,163,184,0.2); color: #cbd5e1; }
  </style>
</head>
<body>
  <h1>Cybersecurity Advisor Report</h1>
  <p class="meta">Generiert: ${generatedAt} &nbsp;·&nbsp; Gesamt: ${summary.total} &nbsp;·&nbsp; Erfolgreich: ${summary.completed} &nbsp;·&nbsp; Markiert: ${summary.flagged}</p>
  <div class="summary">
    <div class="stat"><div class="stat-label">Total</div><div class="stat-value">${summary.total}</div></div>
    <div class="stat"><div class="stat-label">Completed</div><div class="stat-value">${summary.completed}</div></div>
    <div class="stat"><div class="stat-label">Flagged</div><div class="stat-value">${summary.flagged}</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Tool</th><th>Kategorie</th><th>Target</th><th>Status</th><th>Summary</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
  }

  function exportHtml() {
    downloadFile("cybersecurity-report.html", buildHtmlContent(), "text/html;charset=utf-8");
  }

  function exportPdf() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(buildHtmlContent());
    win.document.close();
    win.focus();
    win.print();
    win.close();
  }

  return (
    <AppFrame
      eyebrow="Evidence & Export"
      title="Reports"
      action={
        <>
          <ExportButton label="Export HTML" onClick={exportHtml} />
          <ExportButton label="Export PDF" onClick={exportPdf} />
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-6">
          <div className="glass-panel px-5 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/75">Result Overview</p>
                <h2 className="mt-2 font-display text-3xl text-white">Ergebnis-Übersicht und Export</h2>
              </div>
              <SectionBadge icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Audit Evidence" />
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-white/8 bg-black/30 p-4">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-slate-400">Total</p>
                <p className="mt-3 font-display text-4xl text-white">{summary.total}</p>
              </article>
              <article className="rounded-2xl border border-emerald-400/15 bg-emerald-500/8 p-4">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-emerald-300/80">Completed</p>
                <p className="mt-3 font-display text-4xl text-white">{summary.completed}</p>
              </article>
              <article className="rounded-2xl border border-rose-400/15 bg-rose-500/8 p-4">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-rose-300/80">Flagged</p>
                <p className="mt-3 font-display text-4xl text-white">{summary.flagged}</p>
              </article>
            </div>
          </div>
          {jobs.length === 0 ? (
            <EmptyState
              title="Noch keine Reports vorhanden"
              body="Sobald ein Tool-Lauf simuliert wurde, erscheinen hier Exportdaten, strukturierte Findings und terminalartige Evidenzspuren."
            />
          ) : (
            <div className="glass-panel overflow-hidden px-0 py-0">
              <div className="border-b border-white/8 px-5 py-4">
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/75">Latest Findings</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm text-slate-200">
                  <thead className="bg-white/[0.04] text-[0.72rem] uppercase tracking-[0.24em] text-slate-400">
                    <tr>
                      <th className="px-5 py-4 font-medium">Tool</th>
                      <th className="px-5 py-4 font-medium">Kategorie</th>
                      <th className="px-5 py-4 font-medium">Target</th>
                      <th className="px-5 py-4 font-medium">Status</th>
                      <th className="px-5 py-4 font-medium">Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-t border-white/6 align-top">
                        <td className="px-5 py-4 font-display text-white">{job.toolName}</td>
                        <td className="px-5 py-4">{job.category}</td>
                        <td className="px-5 py-4 font-mono text-xs tracking-[0.18em] text-cyan-100/80">{job.target}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] ${
                              job.status === "success"
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                                : job.status === "error"
                                  ? "border-rose-400/20 bg-rose-400/10 text-rose-100"
                                  : job.status === "scanning"
                                    ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                                    : "border-white/10 bg-white/[0.03] text-slate-200"
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 leading-6 text-slate-300">{job.summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
        <section className="space-y-6">
          <div className="glass-panel px-5 py-5">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-cyan-300" />
              <div>
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/75">Export Notes</p>
                <h3 className="mt-1 font-display text-2xl text-white">Report-Disziplin</h3>
              </div>
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
              <li className="flex gap-3">
                <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                Jede Ausführung bleibt an Ziel, Befehl, Status und Zeitmarken gekoppelt.
              </li>
              <li className="flex gap-3">
                <TriangleAlert className="mt-1 h-4 w-4 shrink-0 text-amber-300" />
                Aktive Schritte werden in diesem Frontend als autorisierte Simulation mit Evidenzfokus dargestellt.
              </li>
              <li className="flex gap-3">
                <FileText className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />
                HTML erzeugt ein vollständiges, druckfertiges Dossier; PDF öffnet den Browser-Druckdialog für direkte Ausgabe oder Archivierung.
              </li>
            </ul>
          </div>
          <JobsPanel />
        </section>
      </div>
    </AppFrame>
  );
}
