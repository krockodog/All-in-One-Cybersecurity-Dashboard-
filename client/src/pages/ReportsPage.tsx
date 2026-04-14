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

  function exportJson() {
    downloadFile(
      "cybersecurity-report.json",
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          summary,
          jobs,
        },
        null,
        2,
      ),
      "application/json",
    );
  }

  function exportMarkdown() {
    const markdown = [
      "# Cybersecurity Advisor Report",
      "",
      `- Generiert: ${new Date().toLocaleString("de-DE")}`,
      `- Gesamtjobs: ${summary.total}`,
      `- Erfolgreich: ${summary.completed}`,
      `- Markiert zur Prüfung: ${summary.flagged}`,
      "",
      "## Findings",
      ...jobs.map(
        (job) =>
          `- **${job.toolName}** | Status: ${job.status} | Target: ${job.target} | Summary: ${job.summary}`,
      ),
      "",
      "## Terminal Output",
      ...jobs.map((job) => `### ${job.toolName}\n\n\`\`\`text\n${job.output}\n\`\`\``),
    ].join("\n");

    downloadFile("cybersecurity-report.md", markdown, "text/markdown;charset=utf-8");
  }

  return (
    <AppFrame
      eyebrow="Evidence & Export"
      title="Reports"
      action={
        <>
          <ExportButton label="Export JSON" onClick={exportJson} />
          <ExportButton label="Export Markdown" onClick={exportMarkdown} />
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
                JSON eignet sich für Weiterverarbeitung; Markdown für Review, Freigabe und Berichtsentwürfe.
              </li>
            </ul>
          </div>
          <JobsPanel />
        </section>
      </div>
    </AppFrame>
  );
}
