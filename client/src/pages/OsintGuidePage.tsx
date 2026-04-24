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
      <div className="mb-6 flex gap-4 border-b border-white/10">
        <button
          onClick={() => setShowPentestGuide(false)}
          className={`px-4 py-3 font-mono text-sm uppercase tracking-wider transition ${
            !showPentestGuide
              ? "border-b-2 border-cyan-400 text-cyan-300"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          OSINT Tools
        </button>
        <button
          onClick={() => setShowPentestGuide(true)}
          className={`px-4 py-3 font-mono text-sm uppercase tracking-wider transition ${
            showPentestGuide
              ? "border-b-2 border-cyan-400 text-cyan-300"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Pentest Roadmap
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
          <div className="space-y-4">
            {toolsByCategory.osint.map((tool) => (
              <article key={tool.id} className="glass-panel px-5 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <h3 className="font-display text-xl text-white">{tool.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{tool.description}</p>
                  </div>
                  <div className={`shrink-0 font-mono text-xs uppercase tracking-wider ${riskColor(tool.risk)}`}>
                    {riskLabel(tool.risk)}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-lg border border-white/8 bg-black/25 px-4 py-3">
                    <p className="font-mono text-[0.7rem] uppercase tracking-widest text-cyan-300/75">Execution Mode</p>
                    <p className="mt-2 text-sm text-slate-200">{tool.executionMode}</p>
                  </div>
                  <div className="rounded-lg border border-white/8 bg-black/25 px-4 py-3">
                    <p className="font-mono text-[0.7rem] uppercase tracking-widest text-emerald-300/75">Category</p>
                    <p className="mt-2 text-sm text-slate-200">{categoryLabel(tool.category)}</p>
                  </div>
                </div>
                {tool.inputFields.length > 0 && (
                  <div className="mt-4 rounded-lg border border-white/8 bg-black/25 px-4 py-3">
                    <p className="font-mono text-[0.7rem] uppercase tracking-widest text-slate-400">Input Fields</p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-300">
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
          <div className="space-y-4">
            {/* Phase 1 */}
            <div className="glass-panel px-5 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-white font-bold">1</div>
                    <div>
                      <h3 className="font-display text-xl text-white">Vorbereitung & Authorization</h3>
                      <p className="text-sm text-slate-400">1-2 Tage</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">Scope Definition, RoE, Engagement Setup</p>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="glass-panel px-5 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-white font-bold">2</div>
                    <div>
                      <h3 className="font-display text-xl text-white">OSINT</h3>
                      <p className="text-sm text-slate-400">2-3 Tage</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">Domain-Info, Subdomains, Credential Leaks</p>
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="glass-panel px-5 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-white font-bold">3</div>
                    <div>
                      <h3 className="font-display text-xl text-white">Reconnaissance</h3>
                      <p className="text-sm text-slate-400">2-3 Tage</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">Nmap Scans, Service Fingerprinting, CVE Checks</p>
                </div>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="glass-panel px-5 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-white font-bold">4</div>
                    <div>
                      <h3 className="font-display text-xl text-white">Vulnerability Assessment</h3>
                      <p className="text-sm text-slate-400">3-5 Tage</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">Web Vulns, SQL Injection, XSS, CSRF</p>
                </div>
              </div>
            </div>

            {/* Phase 5 */}
            <div className="glass-panel px-5 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-white font-bold">5</div>
                    <div>
                      <h3 className="font-display text-xl text-white">Exploitation & Post-Exploitation</h3>
                      <p className="text-sm text-slate-400">2-4 Tage</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">Initial Access, Privilege Escalation, Lateral Movement</p>
                </div>
              </div>
            </div>

            {/* Phase 6 */}
            <div className="glass-panel px-5 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-white font-bold">6</div>
                    <div>
                      <h3 className="font-display text-xl text-white">Reporting & Remediation</h3>
                      <p className="text-sm text-slate-400">2-3 Tage</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">CVSS Scoring, Risk Classification, Remediation Steps</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link to="/pentest-guide">
              <button className="w-full glass-panel px-5 py-5 text-left hover:border-cyan-400/30 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl text-white">Detaillierte Pentest Roadmap</h3>
                    <p className="mt-1 text-sm text-slate-300">Mit Best Practices, Common Pitfalls und Live-Beispielen</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-cyan-400" />
                </div>
              </button>
            </Link>
          </div>
        </>
      )}
    </AppFrame>
  );
}
