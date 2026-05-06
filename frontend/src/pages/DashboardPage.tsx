import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/utils/api";
import { DashboardStats } from "@/types";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";

export default function DashboardPage() {
  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiFetch<{ data: DashboardStats }>("/api/v1/dashboard/stats")
  });

  const values = stats.data?.data ?? {
    totalPentests: 0,
    activePentests: 0,
    criticalFindings: 0,
    highFindings: 0,
    mediumFindings: 0
  };

  return (
    <div className="space-y-4" data-testid="dashboard-page">
      <StatsCards stats={values} />
      <QuickActions />
      <ActivityFeed />
    </div>
  );
}
