import {
  AppFrame,
  GuideColumn,
  HeroPanel,
  JobsPanel,
  QuickLaunchPanel,
  SectionBadge,
  StatStrip,
} from "@/components/cyber/CyberShell";
import { pentestGuideSections, osintGuideSections } from "@/lib/cyber-data";
import { Binary, ShieldCheck } from "lucide-react";

/**
 * Design philosophy reminder — Forensischer Kontrollraum:
 * asymmetrische Kontrollraum-Logik, tiefe dunkle Glasflächen, präzise Typografie,
 * zentrale Operations-Achse mit evidenzorientierten Nebenschienen.
 */
export default function DashboardPage() {
  return (
    <AppFrame
      eyebrow="Operations Overview"
      title="Dashboard"
      action={
        <>
          <SectionBadge icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Authorized Workflows" />
          <SectionBadge icon={<Binary className="h-3.5 w-3.5" />} label="Simulated Evidence Chain" />
        </>
      }
    >
      <div className="space-y-6">
        <HeroPanel />
        <StatStrip />
        <QuickLaunchPanel />
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.2fr_0.95fr]">
          <GuideColumn
            title="Pentest Guide"
            eyebrow="Linke Rail"
            sections={pentestGuideSections}
            accent="emerald"
          />
          <JobsPanel compact />
          <GuideColumn
            title="OSINT Guide"
            eyebrow="Rechte Rail"
            sections={osintGuideSections}
            accent="cyan"
          />
        </section>
      </div>
    </AppFrame>
  );
}
