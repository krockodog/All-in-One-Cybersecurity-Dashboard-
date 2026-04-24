import { useState } from "react";
import { AppFrame, SectionBadge, PageIntro } from "@/components/cyber/CyberShell";
import { categoryLabel, riskColor, riskLabel, toolsByCategory } from "@/lib/cyber-data";
import { BookOpenText, Globe, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function OsintGuidePage() {
  const [showPentestGuide, setShowPentestGuide] = useState(false);

  return (
    <AppFrame
      eyebrow="Guidebook"
      title="OSINT Tools & Pentest Guide"
      action={
        <>
          <SectionBadge icon={<BookOpenText className="h-3.5 w-3.5" />} label="Tool Reference" />
          <SectionBadge icon={<Globe className="h-3.5 w-3.5" />} label="Passive Sources" />
        </>
      }
    >
      {/* Navigation Tabs */}
      <div className="mb-4 sm:mb-6 flex gap-2 sm:gap-4 border-b border-white/10 overflow-x-auto">
        <button
          onClick={() => setShowPentestGuide(false)}
          type="button"
          className={`px-3 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm uppercase tracking-wider transition active:opacity-75 flex-shrink-0 ${
            !showPentestGuide
              ? "border-b-2 border-cyan-400 text-cyan-300"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          OSINT
        </button>
        <button
          onClick={() => setShowPentestGuide(true)}
          type="button"
          className={`px-3 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm uppercase tracking-wider transition active:opacity-75 flex-shrink-0 ${
            showPentestGuide
              ? "border-b-2 border-cyan-400 text-cyan-300"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Pentest
        </button>
      </div>

      {!showPentestGuide ? (
        <>
          {/* OSINT Tools Section */}
          <PageIntro
            badge="Operational Reference"
            title="OSINT Tool Catalog"
            description="Passive information gathering tools for authorized reconnaissance. Each tool is configured for controlled execution within scope."
          />
          <div className="space-y-3 sm:space-y-4">
            {toolsByCategory.osint.map((tool) => (
              <article key={tool.id} className="glass-panel px-3 sm:px-5 py-4 sm:py-5">
                <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg sm:text-xl text-white truncate">{tool.name}</h3>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-6 text-slate-300">{tool.description}</p>
                  </div>
                  <div className={`shrink-0 font-mono text-xs uppercase tracking-wider ${riskColor(tool.risk)} mt-2 sm:mt-0`}>
                    {riskLabel(tool.risk)}
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/8 bg-black/25 px-3 sm:px-4 py-2 sm:py-3">
                    <p className="font-mono text-[0.65rem] sm:text-[0.7rem] uppercase tracking-widest text-cyan-300/75">Mode</p>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-200">{tool.executionMode}</p>
                  </div>
                  <div className="rounded-lg border border-white/8 bg-black/25 px-3 sm:px-4 py-2 sm:py-3">
                    <p className="font-mono text-[0.65rem] sm:text-[0.7rem] uppercase tracking-widest text-emerald-300/75">Category</p>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-200">{categoryLabel(tool.category)}</p>
                  </div>
                </div>
                {tool.inputFields.length > 0 && (
                  <div className="mt-3 sm:mt-4 rounded-lg border border-white/8 bg-black/25 px-3 sm:px-4 py-2 sm:py-3">
                    <p className="font-mono text-[0.65rem] sm:text-[0.7rem] uppercase tracking-widest text-slate-400">Input</p>
                    <ul className="mt-1 sm:mt-2 space-y-1 text-xs sm:text-sm text-slate-300">
                      {tool.inputFields.map((field) => (
                        <li key={field.name}>• {field.label}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Pentest Guide Section */}
          <PageIntro
            badge="Operational Roadmap"
            title="Pentest Roadmap"
            description="Ein strukturierter roter Faden für professionelle Penetrationstests — von der Vorbereitung bis zum Report"
          />
          <div className="space-y-3 sm:space-y-4">
            {/* Phase 1 */}
            <div className="glass-panel px-3 sm:px-5 py-4 sm:py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-full bg-cyan-500 text-white font-bold text-sm sm:text-base flex-shrink-0">1</div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base sm:text-xl text-white truncate">Vorbereitung & Authorization</h3>
                      <p className="text-xs sm:text-sm text-slate-400">1-2 Tage</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300">Scope Definition, RoE, Engagement Setup</p>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="glass-panel px-3 sm:px-5 py-4 sm:py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-full bg-cyan-500 text-white font-bold text-sm sm:text-base flex-shrink-0">2</div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base sm:text-xl text-white truncate">OSINT</h3>
                      <p className="text-xs sm:text-sm text-slate-400">2-3 Tage</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300">Domain-Info, Subdomains, Credential Leaks</p>
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="glass-panel px-3 sm:px-5 py-4 sm:py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-full bg-cyan-500 text-white font-bold text-sm sm:text-base flex-shrink-0">3</div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base sm:text-xl text-white truncate">Reconnaissance</h3>
                      <p className="text-xs sm:text-sm text-slate-400">2-3 Tage</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300">Nmap Scans, Service Fingerprinting, CVE Checks</p>
                </div>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="glass-panel px-3 sm:px-5 py-4 sm:py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-full bg-cyan-500 text-white font-bold text-sm sm:text-base flex-shrink-0">4</div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base sm:text-xl text-white truncate">Vulnerability Assessment</h3>
                      <p className="text-xs sm:text-sm text-slate-400">3-5 Tage</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300">Web Vulns, SQL Injection, XSS, CSRF</p>
                </div>
              </div>
            </div>

            {/* Phase 5 */}
            <div className="glass-panel px-3 sm:px-5 py-4 sm:py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-full bg-cyan-500 text-white font-bold text-sm sm:text-base flex-shrink-0">5</div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base sm:text-xl text-white truncate">Exploitation & Post-Exploitation</h3>
                      <p className="text-xs sm:text-sm text-slate-400">2-4 Tage</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300">Initial Access, Privilege Escalation, Lateral Movement</p>
                </div>
              </div>
            </div>

            {/* Phase 6 */}
            <div className="glass-panel px-3 sm:px-5 py-4 sm:py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-full bg-cyan-500 text-white font-bold text-sm sm:text-base flex-shrink-0">6</div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base sm:text-xl text-white truncate">Reporting & Remediation</h3>
                      <p className="text-xs sm:text-sm text-slate-400">2-3 Tage</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300">CVSS Scoring, Risk Classification, Remediation Steps</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link to="/pentest-guide" className="block">
              <button type="button" className="w-full glass-panel px-3 sm:px-5 py-4 sm:py-5 text-left hover:border-cyan-400/30 transition active:opacity-75">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base sm:text-xl text-white truncate">Detaillierte Pentest Roadmap</h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-300 truncate">Mit Best Practices, Common Pitfalls und Live-Beispielen</p>
                  </div>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 flex-shrink-0" />
                </div>
              </button>
            </Link>
          </div>
        </>
      )}
    </AppFrame>
  );
}
