import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";

export const QuickActions = (): ReactElement => {
  const navigate = useNavigate();

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" data-testid="dashboard-quick-actions">
      <button data-testid="quick-action-new-pentest" onClick={() => navigate("/pentests")} className="rounded-xl border border-neon/40 bg-neon/10 p-4 text-left transition hover:bg-neon/20">
        New Pentest
      </button>
      <button data-testid="quick-action-new-target" onClick={() => navigate("/targets")} className="rounded-xl border border-cyan/40 bg-cyan/10 p-4 text-left transition hover:bg-cyan/20">
        New Target
      </button>
      <button data-testid="quick-action-view-report" onClick={() => navigate("/reports")} className="rounded-xl border border-magenta/40 bg-magenta/10 p-4 text-left transition hover:bg-magenta/20">
        View Latest Report
      </button>
      <button data-testid="quick-action-generate-report" onClick={() => navigate("/reports")} className="rounded-xl border border-white/20 bg-white/5 p-4 text-left transition hover:bg-white/10">
        Generate Report
      </button>
    </section>
  );
};
