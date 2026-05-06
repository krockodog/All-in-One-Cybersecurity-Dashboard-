import { ReactElement } from "react";
import { DashboardStats } from "@/types";

const cardConfig: Array<{ key: keyof DashboardStats; label: string }> = [
  { key: "totalPentests", label: "Total Pentests" },
  { key: "activePentests", label: "Active Pentests" },
  { key: "criticalFindings", label: "Critical Findings" },
  { key: "highFindings", label: "High Findings" },
  { key: "mediumFindings", label: "Medium Findings" }
];

interface StatsCardsProps {
  stats: DashboardStats;
}

export const StatsCards = ({ stats }: StatsCardsProps): ReactElement => {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5" data-testid="dashboard-stats-cards">
      {cardConfig.map((card) => (
        <article key={card.key} className="rounded-xl border border-white/10 bg-black/20 p-4" data-testid={`stats-card-${card.key}`}>
          <p className="text-xs text-slate-400">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-neon" data-testid={`stats-value-${card.key}`}>
            {stats[card.key]}
          </p>
        </article>
      ))}
    </section>
  );
};
