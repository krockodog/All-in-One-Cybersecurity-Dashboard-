import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";

interface ActionItem {
  testId: string;
  label: string;
  path: string;
  className: string;
}

const actionItems: ActionItem[] = [
  {
    testId: "quick-action-new-pentest",
    label: "New Pentest",
    path: "/pentests",
    className: "rounded-xl border border-neon/40 bg-neon/10 p-4 text-left transition hover:bg-neon/20",
  },
  {
    testId: "quick-action-new-target",
    label: "New Target",
    path: "/targets",
    className: "rounded-xl border border-cyan/40 bg-cyan/10 p-4 text-left transition hover:bg-cyan/20",
  },
  {
    testId: "quick-action-view-report",
    label: "View Latest Report",
    path: "/reports",
    className: "rounded-xl border border-magenta/40 bg-magenta/10 p-4 text-left transition hover:bg-magenta/20",
  },
  {
    testId: "quick-action-generate-report",
    label: "Generate Report",
    path: "/reports",
    className: "rounded-xl border border-white/20 bg-white/5 p-4 text-left transition hover:bg-white/10",
  },
];

export const QuickActions = (): ReactElement => {
  const navigate = useNavigate();

  const handleNavigate = (path: string): void => {
    navigate(path);
  };

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" data-testid="dashboard-quick-actions">
      {actionItems.map((item) => (
        <button key={item.testId} data-testid={item.testId} onClick={() => handleNavigate(item.path)} className={item.className}>
          {item.label}
        </button>
      ))}
    </section>
  );
};
