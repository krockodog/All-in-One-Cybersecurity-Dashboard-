import {
  AppFrame,
  HeroPanel,
  JobsPanel,
  QuickLaunchPanel,
  SectionBadge,
  StatStrip,
  TrygitBanner,
} from "@/components/cyber/CyberShell";
import { Binary, ShieldCheck } from "lucide-react";

export default function DashboardPage() {
  return (
    <AppFrame
      eyebrow="Operations Overview"
      title="Dashboard"
      action={
        <>
          <SectionBadge icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Authorized Workflows" />
          <SectionBadge icon={<Binary className="h-3.5 w-3.5" />} label="Live Evidence Chain" />
        </>
      }
    >
      <div className="space-y-6">
        <HeroPanel />
        <StatStrip />
        <QuickLaunchPanel />
        <TrygitBanner />
        <JobsPanel compact />
      </div>
    </AppFrame>
  );
}
