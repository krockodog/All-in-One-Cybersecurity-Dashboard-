import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Binary,
  BookOpenText,
  ChevronRight,
  Download,
  Gauge,
  Globe,
  Radar,
  ScanSearch,
  Settings2,
  ShieldCheck,
  ShieldEllipsis,
  TerminalSquare,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAudit, type AuditJob } from "@/contexts/AuditContext";
import {
  assetUrls,
  categoryLabel,
  dashboardHighlights,
  overviewMetrics,
  quickLaunchTargets,
  riskLabel,
  type GuideSection,
  type JobStatus,
  type ToolCategory,
  type ToolDefinition,
} from "@/lib/cyber-data";

const navigationItems = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/osint-tools", label: "OSINT Tools", icon: Globe },
  { to: "/pentest-tools", label: "Pentest Tools", icon: ShieldEllipsis },
  { to: "/reconnaissance", label: "Reconnaissance", icon: Radar },
  { to: "/reports", label: "Reports", icon: Download },
  { to: "/settings", label: "Settings", icon: Settings2 },
  { to: "/osint-guide", label: "OSINT Guide", icon: BookOpenText },
];

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function LoadingScreen() {
  return (
    <div className="loading-screen relative min-h-screen overflow-hidden bg-[#04070a] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_24%),linear-gradient(180deg,rgba(4,7,10,0.98),rgba(4,7,10,0.92))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(148,163,184,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.35)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="relative flex w-full max-w-4xl flex-col items-center justify-center">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.52em] text-cyan-200/55 sm:text-[0.72rem]">
            Authorized Use Only
          </p>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-[0.12em] text-white sm:text-6xl">
            OSINT Framework Pro
          </h1>
          <div className="relative mt-10 flex h-[300px] w-[300px] items-center justify-center sm:h-[420px] sm:w-[420px]">
            <div className="absolute h-[72%] w-[72%] rounded-full bg-cyan-400/8 blur-3xl" />
            <img
              src={assetUrls.earth}
              alt="Cyber Earth"
              className="relative z-10 h-full w-full object-contain drop-shadow-[0_0_28px_rgba(34,211,238,0.18)]"
            />
          </div>
          <div className="mt-10 flex items-center gap-3 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.34em] text-slate-300/80 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Loading
          </div>
        </div>
      </div>
      <p className="absolute bottom-5 right-5 z-20 font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
        written by krockodog
      </p>
    </div>
  );
}

export function MatrixRain({ dense = false }: { dense?: boolean }) {
  const columns = dense ? 26 : 16;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-45" aria-hidden="true">
      {Array.from({ length: columns }).map((_, index) => (
        <span
          key={`matrix-${index}`}
          className="matrix-column absolute top-[-30%] font-mono text-[10px] leading-4 text-emerald-300/50"
          style={{
            left: `${(index / columns) * 100}%`,
            animationDelay: `${(index % 8) * 0.6}s`,
            animationDuration: `${8 + (index % 5)}s`,
          }}
        >
          {"101100101011001011001001010110010110100101001101001011010010110100101001"}
        </span>
      ))}
    </div>
  );
}

export function AppFrame({ children, title, eyebrow, action }: { children: React.ReactNode; title: string; eyebrow: string; action?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#030608] text-slate-100">
      <div className="fixed inset-0 -z-20 bg-[linear-gradient(135deg,#030608_0%,#06111a_38%,#020609_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,rgba(34,211,238,0.12),transparent_22%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.12),transparent_18%),radial-gradient(circle_at_55%_55%,rgba(15,23,42,0.55),transparent_38%)]" />
      <div className="fixed inset-0 -z-10 opacity-[0.08] mix-blend-screen [background-image:linear-gradient(rgba(148,163,184,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.28)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <SidebarNav />
        <main className="flex-1 px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pt-6">
          <DisclaimerBanner />
          <header className="glass-panel mb-6 flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/75">{eyebrow}</p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
            </div>
            {action ? <div className="flex flex-wrap items-center gap-3">{action}</div> : null}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

export function SidebarNav() {
  return (
    <aside className="sticky top-0 z-20 border-b border-white/8 bg-[rgba(4,8,12,0.9)] px-4 py-4 backdrop-blur-xl lg:h-screen lg:w-[290px] lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <div className="glass-panel glass-panel-strong flex flex-col gap-6 px-5 py-5">
        <div>
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-cyan-300/70">Cybersecurity Advisor</p>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">Control Nexus</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Glass-basierte Kommandooberfläche für autorisierte OSINT-, Recon- und Pentest-Workflows.
              </p>
            </div>
            <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-emerald-200">
              Live
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-[linear-gradient(160deg,rgba(3,10,14,0.88),rgba(4,12,10,0.78))] p-4">
          <div className="flex h-40 items-center justify-center rounded-xl border border-cyan-400/10 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-6 py-4">
            <img
              src={assetUrls.krockodogLogo}
              alt="krockodog Logo"
              className="h-full w-full object-contain opacity-95 drop-shadow-[0_0_24px_rgba(34,211,238,0.14)]"
            />
          </div>
        </div>
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cx(
                    "group flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition duration-300",
                    isActive
                      ? "border-cyan-400/35 bg-cyan-400/12 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_12px_40px_rgba(6,182,212,0.16)]"
                      : "border-white/5 bg-white/[0.03] text-slate-300 hover:border-emerald-400/20 hover:bg-white/[0.05] hover:text-white",
                  )
                }
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                <ChevronRight className="h-4 w-4 opacity-50 transition duration-300 group-hover:translate-x-1" />
              </NavLink>
            );
          })}
        </nav>
        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/8 px-4 py-4 text-sm leading-6 text-emerald-100/85">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-emerald-300/70">Audit Safety</p>
          <p className="mt-2">Aktive Validierungen werden in der UI immer als kontrollierte Simulation innerhalb genehmigter Scopes dargestellt.</p>
        </div>
      </div>
    </aside>
  );
}

export function DisclaimerBanner() {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-400/20 bg-[rgba(53,32,7,0.45)] px-4 py-3 text-sm text-amber-50/90 shadow-[0_10px_40px_rgba(80,45,4,0.18)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
        <p className="leading-6">
          <span className="font-semibold text-amber-100">Authorized Use Only.</span> Dieses Dashboard ist für eigene Netzwerke oder Ziele mit expliziter Erlaubnis vorgesehen und simuliert Workflows für Security Assessments, Evidenzsammlung und Reporting.
        </p>
      </div>
      <div className="rounded-full border border-amber-300/20 px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-amber-200">
        Scope-gesteuert
      </div>
    </div>
  );
}

export function StatStrip() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {overviewMetrics.map((metric) => (
        <article key={metric.label} className="glass-panel px-5 py-5">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-slate-400">{metric.label}</p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <strong className="font-display text-4xl font-semibold text-white">{metric.value}</strong>
            <span
              className={cx(
                "rounded-full border px-3 py-1 text-[0.72rem] uppercase tracking-[0.22em]",
                metric.tone === "cyan" && "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
                metric.tone === "emerald" && "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
                metric.tone === "amber" && "border-amber-400/20 bg-amber-400/10 text-amber-100",
              )}
            >
              {metric.delta}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

export function HeroPanel() {
  return (
    <section className="glass-panel relative overflow-hidden px-6 py-8">
      <MatrixRain />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.14),transparent_26%)]" />
      <div className="relative grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
        <div>
          <p className="font-mono text-[0.74rem] uppercase tracking-[0.34em] text-cyan-300/75">Unified Operations Console</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Ein All-in-One Cybersecurity Dashboard für strukturierte OSINT-, Recon- und Pentest-Beratung.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Die Oberfläche verbindet Quick-Launch, aktive Jobs, Tool-Simulation, Evidenzketten und Report-Export in einem dunklen Kontrollraum mit konsequenter Glassmorphism-Ästhetik.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {dashboardHighlights.map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/8 bg-black/30 p-4 backdrop-blur-sm">
                <h3 className="font-display text-lg text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(160deg,rgba(4,8,12,0.82),rgba(5,14,18,0.94))] p-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_72%_78%,rgba(16,185,129,0.12),transparent_24%)]" />
          <div className="relative z-10 flex h-full flex-col gap-4">
            <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-6 backdrop-blur-sm">
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-cyan-300/75">Brand Signature</p>
              <div className="mt-4 flex items-center justify-center rounded-[20px] border border-cyan-400/10 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_48%),rgba(2,9,14,0.72)] p-6">
                <img
                  src={assetUrls.krockodogLogo}
                  alt="krockodog Logo"
                  className="h-40 w-full object-contain drop-shadow-[0_0_28px_rgba(34,211,238,0.14)] sm:h-48"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-cyan-400/15 bg-[rgba(2,8,14,0.7)] p-4 backdrop-blur-sm">
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-cyan-300/75">Command Chain</p>
                <p className="mt-3 text-sm leading-6 text-slate-200">Route-basierte Workspaces, simulierte Kommandoausführung, Status-basierte Pwnagotchi-Faces und Report-fähige Output-Konsolen.</p>
              </div>
              <div className="rounded-2xl border border-emerald-400/15 bg-[rgba(3,11,10,0.74)] p-4 backdrop-blur-sm">
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-emerald-300/75">Evidence Ready</p>
                <p className="mt-3 text-sm leading-6 text-slate-200">JSON- und Markdown-Export, priorisierte Findings, zentrale Job-Übersicht und OSINT-/Pentest-Guides mit operativem Kontext.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function QuickLaunchPanel() {
  const navigate = useNavigate();

  return (
    <section className="glass-panel px-5 py-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/75">Quick Launch</p>
          <h3 className="mt-2 font-display text-2xl text-white">Schnellstart für häufige Zielräume</h3>
        </div>
        <Link to="/reports" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-300/25 hover:text-white">
          Reports öffnen
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        {quickLaunchTargets.map((target, index) => (
          <button
            key={target}
            type="button"
            onClick={() => navigate(index % 2 === 0 ? "/reconnaissance" : "/osint-tools")}
            className="group rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-left transition duration-300 hover:border-cyan-400/20 hover:bg-cyan-400/8"
          >
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-slate-400">Target #{index + 1}</p>
            <p className="mt-3 font-display text-xl text-white">{target}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Öffnet den passenden Workspace mit vorverlagerter Analyseausrichtung.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-200 transition group-hover:translate-x-1">
              Workspace öffnen
              <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function JobsPanel({ compact = false }: { compact?: boolean }) {
  const { jobs } = useAudit();
  const visibleJobs = compact ? jobs.slice(0, 5) : jobs;

  return (
    <section className="glass-panel px-5 py-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/75">Aktive Jobs</p>
          <h3 className="mt-2 font-display text-2xl text-white">Zentrale Einsatzübersicht</h3>
        </div>
        <div className="rounded-full border border-white/10 px-3 py-1 font-mono text-[0.72rem] uppercase tracking-[0.28em] text-slate-300">
          {jobs.length} Einträge
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {visibleJobs.map((job) => (
          <JobRow key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}

function JobRow({ job }: { job: AuditJob }) {
  return (
    <article className="rounded-2xl border border-white/8 bg-black/35 px-4 py-4 transition duration-300 hover:border-cyan-400/18 hover:bg-black/45">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-xl">
            {job.icon}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-display text-lg text-white">{job.toolName}</h4>
              <StatusPill status={job.status} />
              <span className="rounded-full border border-white/8 px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
                {categoryLabel(job.category)}
              </span>
            </div>
            <p className="mt-2 font-mono text-xs tracking-[0.22em] text-cyan-200/75">{job.target}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{job.summary}</p>
          </div>
        </div>
        <div className="w-full xl:max-w-md">
          <TerminalOutput output={job.output} compact />
        </div>
      </div>
    </article>
  );
}

export function GuideColumn({ title, eyebrow, sections, accent }: { title: string; eyebrow: string; sections: GuideSection[]; accent: "cyan" | "emerald" }) {
  return (
    <section className="glass-panel px-5 py-5">
      <p className={cx("font-mono text-[0.72rem] uppercase tracking-[0.34em]", accent === "cyan" ? "text-cyan-300/75" : "text-emerald-300/75")}>{eyebrow}</p>
      <h3 className="mt-2 font-display text-2xl text-white">{title}</h3>
      <div className="mt-5 space-y-4">
        {sections.map((section) => (
          <article key={section.title} className="rounded-2xl border border-white/8 bg-black/30 p-4">
            <h4 className="font-display text-lg text-white">{section.title}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-300">{section.summary}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              {section.checkpoints.map((checkpoint) => (
                <li key={checkpoint} className="flex gap-2">
                  <span className={cx("mt-1.5 h-2 w-2 rounded-full", accent === "cyan" ? "bg-cyan-300" : "bg-emerald-300")} />
                  <span className="leading-6">{checkpoint}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PageIntro({ title, description, badge }: { title: string; description: string; badge: string }) {
  return (
    <div className="glass-panel mb-6 px-5 py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/75">{badge}</p>
          <h2 className="mt-2 font-display text-3xl text-white">{title}</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">{description}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/25 px-4 py-3 text-sm leading-6 text-slate-300">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-emerald-300/75">Interface Logic</p>
          <p className="mt-2">Jede Karte erzeugt eine Befehlsvorschau, startet eine autorisierte Simulation und schreibt terminalartige Evidenz in die zentrale Verlaufsspur.</p>
        </div>
      </div>
    </div>
  );
}

export function ToolGrid({ tools, accent }: { tools: ToolDefinition[]; accent: "cyan" | "emerald" }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} accent={accent} />
      ))}
    </div>
  );
}

export function ToolCard({ tool, accent }: { tool: ToolDefinition; accent: "cyan" | "emerald" }) {
  const { runTool } = useAudit();
  const [target, setTarget] = useState(tool.sampleTarget);
  const [options, setOptions] = useState(tool.defaultOptions);
  const [status, setStatus] = useState<JobStatus>("idle");
  const [output, setOutput] = useState(
    "[ready] Tool-Simulation bereit. Ziel anpassen, Optionen prüfen und autorisierten Lauf starten.",
  );

  const preview = useMemo(() => {
    const normalizedOptions = options.trim();
    const suffix = normalizedOptions.length > 0 ? ` ${normalizedOptions}` : "";
    return `${tool.baseCommand}${suffix} ${target}`.trim();
  }, [options, target, tool.baseCommand]);

  async function handleRun() {
    setStatus("scanning");
    setOutput(`[dispatch] ${tool.name} initialisiert autorisierte Prüfung für ${target} ...`);
    const result = await runTool(tool, { target, options });
    setStatus(result.status);
    setOutput(result.output);
  }

  return (
    <article className="glass-panel glass-panel-hover flex flex-col overflow-hidden px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-2xl shadow-[0_10px_30px_rgba(2,8,16,0.35)]">
            {tool.icon}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-2xl text-white">{tool.name}</h3>
              <span
                className={cx(
                  "rounded-full border px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.24em]",
                  accent === "cyan" ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
                )}
              >
                {categoryLabel(tool.category)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{tool.description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="rounded-full border border-white/8 px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">
            {riskLabel(tool.risk)}
          </span>
          <PwnagotchiFace status={status} className="mt-3" />
        </div>
      </div>
      <div className="mt-5 grid gap-4">
        <label className="space-y-2">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-slate-400">Target</span>
          <input
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            className="h-12 w-full rounded-2xl border border-white/8 bg-[rgba(10,14,20,0.8)] px-4 text-sm text-white outline-none transition focus:border-cyan-300/30 focus:ring-2 focus:ring-cyan-400/15"
            placeholder={tool.sampleTarget}
          />
        </label>
        <label className="space-y-2">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-slate-400">Optionen</span>
          <textarea
            value={options}
            onChange={(event) => setOptions(event.target.value)}
            className="min-h-[92px] w-full rounded-2xl border border-white/8 bg-[rgba(10,14,20,0.8)] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/30 focus:ring-2 focus:ring-cyan-400/15"
          />
        </label>
      </div>
      <div className="mt-5 rounded-2xl border border-white/8 bg-black/30 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-slate-400">Command Preview</span>
          <StatusLoader category={tool.category} status={status} />
        </div>
        <code className="mt-3 block overflow-x-auto whitespace-pre-wrap break-all font-mono text-[0.8rem] leading-6 text-cyan-100">{preview}</code>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tool.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/8 px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-slate-300">
              {tag}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={handleRun}
          className={cx(
            "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition duration-300",
            accent === "cyan"
              ? "bg-cyan-400/90 text-slate-950 hover:bg-cyan-300"
              : "bg-emerald-400/90 text-slate-950 hover:bg-emerald-300",
          )}
        >
          <TerminalSquare className="h-4 w-4" />
          Run
        </button>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <TerminalOutput output={output} />
        <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-slate-400">Guide Notes</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">{tool.guide.objective}</p>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-200">
            {tool.guide.workflow.map((step) => (
              <li key={step} className="flex gap-2">
                <Binary className="mt-1 h-4 w-4 shrink-0 text-cyan-300/80" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

export function TerminalOutput({ output, compact = false }: { output: string; compact?: boolean }) {
  return (
    <div className={cx("terminal-console rounded-2xl border border-[#1f2a33] bg-[#05090d] px-4 py-4", compact ? "min-h-[170px]" : "min-h-[210px]")}>
      <div className="mb-3 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-rose-400/90" />
        <span className="h-3 w-3 rounded-full bg-amber-400/90" />
        <span className="h-3 w-3 rounded-full bg-emerald-400/90" />
        <span className="ml-3 font-mono text-[0.68rem] uppercase tracking-[0.28em] text-slate-500">simulated terminal output</span>
      </div>
      <pre className={cx("overflow-x-auto whitespace-pre-wrap break-words font-mono text-[0.78rem] leading-6 text-emerald-300", compact ? "line-clamp-6 min-h-[128px]" : "min-h-[164px]")}>
        {output}
      </pre>
    </div>
  );
}

export function StatusPill({ status }: { status: JobStatus }) {
  return (
    <span
      className={cx(
        "rounded-full border px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.24em]",
        status === "idle" && "border-slate-400/20 bg-slate-400/10 text-slate-200",
        status === "scanning" && "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
        status === "success" && "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
        status === "error" && "border-rose-400/20 bg-rose-400/10 text-rose-100",
      )}
    >
      {status}
    </span>
  );
}

export function StatusLoader({ category, status }: { category: ToolCategory; status: JobStatus }) {
  if (status !== "scanning") {
    return <StatusPill status={status} />;
  }

  if (category === "osint") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.22em] text-cyan-100">
        <span className="magnifier-loader" />
        OSINT Loading
      </div>
    );
  }

  if (category === "pentest") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.22em] text-emerald-100">
        <span className="mask-loader">
          <svg viewBox="0 0 48 48" className="h-4 w-4">
            <path d="M24 6c10 0 16 4 16 10 0 14-7 24-16 24S8 30 8 16c0-6 6-10 16-10Z" fill="currentColor" opacity="0.18" />
            <path d="M24 8c8.7 0 14 3.2 14 8 0 12.2-5.8 22-14 22S10 28.2 10 16c0-4.8 5.3-8 14-8Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M17 18c2 0 3 1.4 3 3s-1 3-3 3-3-1.4-3-3 1-3 3-3Zm14 0c2 0 3 1.4 3 3s-1 3-3 3-3-1.4-3-3 1-3 3-3Zm-10 9c1.4 1 2.7 1.4 4 1.4s2.6-.4 4-1.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </span>
        Pentest Loading
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.22em] text-cyan-100">
      <span className="relative flex h-4 w-4 items-center justify-center">
        <span className="absolute h-4 w-4 rounded-full border border-cyan-300/70 animate-ping" />
        <ScanSearch className="h-4 w-4" />
      </span>
      Recon Loading
    </div>
  );
}

export function PwnagotchiFace({ status, className }: { status: JobStatus; className?: string }) {
  const face =
    status === "idle"
      ? "(◕‿‿◕)"
      : status === "scanning"
        ? "(⌐■_■)"
        : status === "success"
          ? "(ᵔ◡◡ᵔ)"
          : "(×_×)";

  return (
    <div className={cx("rounded-2xl border border-white/8 bg-black/30 px-3 py-2 font-mono text-sm tracking-[0.18em] text-cyan-100", className)}>
      {face}
    </div>
  );
}

export function ExportButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-sm text-cyan-100 transition hover:bg-cyan-400/16"
    >
      <Download className="h-4 w-4" />
      {label}
    </button>
  );
}

export function SectionBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[0.72rem] uppercase tracking-[0.3em] text-slate-300">
      {icon}
      {label}
    </span>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass-panel px-6 py-10 text-center">
      <Activity className="mx-auto h-10 w-10 text-cyan-300/70" />
      <h3 className="mt-4 font-display text-2xl text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">{body}</p>
    </div>
  );
}
