import { AppFrame, GuideColumn, PageIntro, SectionBadge } from "@/components/cyber/CyberShell";
import { osintGuideSections, toolsByCategory } from "@/lib/cyber-data";
import { BookOpenText, Globe, ScanSearch } from "lucide-react";

/**
 * Design philosophy reminder — Forensischer Kontrollraum:
 * Guide-Inhalte wirken wie Analysten-Dossiers: großzügige Typografie, matte Evidenzflächen,
 * klare Akzente und keine überladene Dokumentationsoptik.
 */
export default function OsintGuidePage() {
  return (
    <AppFrame
      eyebrow="Guidebook"
      title="OSINT Guide"
      action={
        <>
          <SectionBadge icon={<BookOpenText className="h-3.5 w-3.5" />} label="Comprehensive Guide" />
          <SectionBadge icon={<Globe className="h-3.5 w-3.5" />} label="Passive Sources" />
        </>
      }
    >
      <PageIntro
        badge="Operational Playbook"
        title="Umfassender Leitfaden zu allen OSINT-Werkzeugen im Dashboard"
        description="Der Guide verbindet Tool-Ziele, praktische Einsatzschritte und analystische Hinweise. So entsteht aus einzelnen Abfragen ein belastbares Lagebild für autorisierte Assessments und spätere Reports."
      />
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <GuideColumn
          title="OSINT Methodik"
          eyebrow="Leitprinzipien"
          sections={osintGuideSections}
          accent="cyan"
        />
        <div className="space-y-4">
          {toolsByCategory.osint.map((tool) => (
            <article key={tool.id} className="glass-panel px-5 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-black/25 text-2xl">
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-white">{tool.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{tool.description}</p>
                  </div>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.24em] text-cyan-100">
                  {tool.baseCommand}
                </div>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="rounded-2xl border border-white/8 bg-black/25 px-4 py-4">
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-cyan-300/75">Zielsetzung</p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">{tool.guide.objective}</p>
                  <p className="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.3em] text-slate-400">Beispiel</p>
                  <code className="mt-2 block whitespace-pre-wrap break-all font-mono text-[0.8rem] leading-6 text-cyan-100">
                    {`${tool.baseCommand} ${tool.defaultOptions} ${tool.sampleTarget}`}
                  </code>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/25 px-4 py-4">
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-emerald-300/75">Workflow</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                    {tool.guide.workflow.map((step) => (
                      <li key={step} className="flex gap-2">
                        <ScanSearch className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Analyst Notes</p>
                    <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-300">
                      {tool.guide.notes.map((note) => (
                        <li key={note}>• {note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppFrame>
  );
}
