import { ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/utils/api";

type QualityState = "pass" | "warn" | "fail";

interface QualityCheck {
  id: string;
  label: string;
  status: QualityState;
  lastRun: string;
  detail: string;
}

interface QualityCycle {
  id: string;
  title: string;
  status: QualityState;
  critical: number;
  important: number;
  notes: string;
}

interface QualityMetrics {
  targets: number;
  pentests: number;
  findings: number;
  activePentests: number;
  criticalFindings: number;
}

interface QualityPayload {
  updatedAt: string;
  checks: QualityCheck[];
  reviewCycles: QualityCycle[];
  metrics: QualityMetrics;
}

interface QualityResponse {
  data: QualityPayload;
}

interface QualityHeaderProps {
  updatedAt: string;
  onRefresh: () => void;
}

interface QualityChecksProps {
  checks: QualityCheck[];
}

interface QualityMetricsProps {
  metrics: QualityMetrics;
}

interface QualityReviewCyclesProps {
  reviewCycles: QualityCycle[];
}

const statusBadgeClass: Record<QualityState, string> = {
  pass: "bg-emerald-500/20 text-emerald-300",
  warn: "bg-amber-500/20 text-amber-300",
  fail: "bg-red-500/20 text-red-300",
};

const EMPTY_METRICS: QualityMetrics = {
  targets: 0,
  pentests: 0,
  findings: 0,
  activePentests: 0,
  criticalFindings: 0,
};

const QualityHeader = ({ updatedAt, onRefresh }: QualityHeaderProps): ReactElement => (
  <header className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2 className="text-2xl font-semibold" data-testid="quality-status-title">Code Quality Status</h2>
      <p className="text-sm text-slate-300" data-testid="quality-status-updated-at">Letztes Update: {updatedAt}</p>
    </div>
    <button
      data-testid="quality-status-refresh-button"
      className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
      onClick={onRefresh}
    >
      Aktualisieren
    </button>
  </header>
);

const QualityChecks = ({ checks }: QualityChecksProps): ReactElement => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="quality-checks-grid">
    {checks.map((check: QualityCheck) => (
      <article key={check.id} className="rounded-xl border border-white/10 bg-black/20 p-4" data-testid={`quality-check-card-${check.id}`}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-slate-200">{check.label}</h3>
          <span className={`rounded-full px-2 py-1 text-xs uppercase ${statusBadgeClass[check.status]}`} data-testid={`quality-check-status-${check.id}`}>
            {check.status}
          </span>
        </div>
        <p className="text-xs text-slate-400" data-testid={`quality-check-detail-${check.id}`}>{check.detail}</p>
        <p className="mt-2 text-xs text-slate-500" data-testid={`quality-check-last-run-${check.id}`}>{check.lastRun}</p>
      </article>
    ))}
  </div>
);

const QualityMetricsGrid = ({ metrics }: QualityMetricsProps): ReactElement => (
  <div className="grid gap-3 md:grid-cols-5" data-testid="quality-metrics-grid">
    <div className="rounded-lg border border-white/10 p-3 text-sm" data-testid="quality-metric-targets">Targets: {metrics.targets}</div>
    <div className="rounded-lg border border-white/10 p-3 text-sm" data-testid="quality-metric-pentests">Pentests: {metrics.pentests}</div>
    <div className="rounded-lg border border-white/10 p-3 text-sm" data-testid="quality-metric-findings">Findings: {metrics.findings}</div>
    <div className="rounded-lg border border-white/10 p-3 text-sm" data-testid="quality-metric-active">Aktiv: {metrics.activePentests}</div>
    <div className="rounded-lg border border-white/10 p-3 text-sm" data-testid="quality-metric-critical">Kritisch: {metrics.criticalFindings}</div>
  </div>
);

const QualityReviewCycles = ({ reviewCycles }: QualityReviewCyclesProps): ReactElement => (
  <div className="rounded-xl border border-white/10" data-testid="quality-review-table">
    <div className="border-b border-white/10 p-3 text-sm font-medium">Review-Zyklen</div>
    <div className="divide-y divide-white/10">
      {reviewCycles.map((cycle: QualityCycle) => (
        <div key={cycle.id} className="grid gap-2 p-3 md:grid-cols-[1.4fr_0.7fr_0.6fr_0.6fr_2fr]" data-testid={`quality-review-row-${cycle.id}`}>
          <span>{cycle.title}</span>
          <span className={`w-fit rounded-full px-2 py-1 text-xs uppercase ${statusBadgeClass[cycle.status]}`} data-testid={`quality-review-status-${cycle.id}`}>
            {cycle.status}
          </span>
          <span data-testid={`quality-review-critical-${cycle.id}`}>Critical: {cycle.critical}</span>
          <span data-testid={`quality-review-important-${cycle.id}`}>Important: {cycle.important}</span>
          <span className="text-slate-300" data-testid={`quality-review-notes-${cycle.id}`}>{cycle.notes}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function QualityPage(): ReactElement {
  const quality = useQuery({
    queryKey: ["quality-status"],
    queryFn: () => apiFetch<QualityResponse>("/api/v1/quality/status"),
  });

  const payload = quality.data?.data;
  const checks: QualityCheck[] = payload?.checks ?? [];
  const reviewCycles: QualityCycle[] = payload?.reviewCycles ?? [];
  const metrics: QualityMetrics = payload?.metrics ?? EMPTY_METRICS;
  const updatedAt: string = payload?.updatedAt ?? "wird geladen...";

  return (
    <section className="space-y-5" data-testid="quality-status-page">
      <QualityHeader updatedAt={updatedAt} onRefresh={() => quality.refetch()} />
      <QualityChecks checks={checks} />
      <QualityMetricsGrid metrics={metrics} />
      <QualityReviewCycles reviewCycles={reviewCycles} />
    </section>
  );
}