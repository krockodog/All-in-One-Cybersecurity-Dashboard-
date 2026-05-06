import {
  AppFrame,
  PageIntro,
  SectionBadge,
  ToolGrid,
} from "@/components/cyber/CyberShell";
import { toolsByCategory } from "@/lib/cyber-data";
import { Globe, Radar, ShieldEllipsis, TerminalSquare } from "lucide-react";
import { LeakIXOSINT } from "@/components/LeakIXOSINT";
import { useState } from "react";

/**
 * Design philosophy reminder — Forensischer Kontrollraum:
 * Karten bleiben technisch, dicht und glaubwürdig; Glassmorphism nur für die UI-Hüllen,
 * niemals für die Terminal-Konsole. Akzentfarben signalisieren Arbeitsmodus.
 */
export function OsintToolsPage() {
  const [activeTab, setActiveTab] = useState<'tools' | 'leakix'>('tools');

  return (
    <AppFrame
      eyebrow="Passive Intelligence"
      title="OSINT Tools"
      action={
        <>
          <SectionBadge icon={<Globe className="h-3.5 w-3.5" />} label="Passive Collection" />
          <SectionBadge icon={<TerminalSquare className="h-3.5 w-3.5" />} label="Command Preview" />
        </>
      }
    >
      <PageIntro
        badge="Open Source Intelligence"
        title="Oeffentliche Quellen, Entitaeten und historische Spuren strukturiert auswerten"
        description="Diese Ansicht buendelt die OSINT-Werkzeuge des Advisors. Jede Karte besitzt Eingabefelder, Optionskontrolle, Befehlsvorschau, einen Run-Trigger sowie terminalartige Simulationsausgabe fuer autorisierte Untersuchungen."
      />
      
      <div className="mb-6 flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('tools')}
          className={`px-4 py-2 font-mono text-sm transition ${
            activeTab === 'tools'
              ? 'border-b-2 border-cyan-400 text-cyan-300'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Standard Tools
        </button>
        <button
          onClick={() => setActiveTab('leakix')}
          className={`px-4 py-2 font-mono text-sm transition ${
            activeTab === 'leakix'
              ? 'border-b-2 border-cyan-400 text-cyan-300'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          LeakIX / ShadowFinder / Unfurl
        </button>
      </div>

      {activeTab === 'tools' && <ToolGrid tools={toolsByCategory.osint} accent="cyan" />}
      {activeTab === 'leakix' && <LeakIXOSINT />}
    </AppFrame>
  );
}

export function PentestToolsPage() {
  return (
    <AppFrame
      eyebrow="Controlled Validation"
      title="Pentest Tools"
      action={
        <>
          <SectionBadge icon={<ShieldEllipsis className="h-3.5 w-3.5" />} label="Active Validation" />
          <SectionBadge icon={<TerminalSquare className="h-3.5 w-3.5" />} label="Evidence Ready" />
        </>
      }
    >
      <PageIntro
        badge="Authorized Pentest Workflow"
        title="Kontrollierte technische Validierung mit auditierbarer Befehlslogik"
        description="Die Pentest-Werkzeuge simulieren aktive Prüfpfade für genehmigte Ziele. Das Interface zeigt pro Karte die operative Richtung, den Risikograd, den generierten Shell-Befehl und eine report-taugliche Terminalspur."
      />
      <ToolGrid tools={toolsByCategory.pentest} accent="emerald" />
    </AppFrame>
  );
}

export function ReconnaissancePage() {
  return (
    <AppFrame
      eyebrow="Surface Mapping"
      title="Reconnaissance"
      action={
        <>
          <SectionBadge icon={<Radar className="h-3.5 w-3.5" />} label="Discovery Chain" />
          <SectionBadge icon={<TerminalSquare className="h-3.5 w-3.5" />} label="Triaged Follow-up" />
        </>
      }
    >
      <PageIntro
        badge="Recon & Surface Discovery"
        title="Subdomains, Live Hosts, Templates und Fuzzing in einer operativen Entdeckungskette"
        description="Reconnaissance dient als Brücke zwischen passiver Sammlung und kontrollierter Validierung. Die Karten in dieser Ansicht helfen dabei, Asset-Oberflächen zu priorisieren, bevor detaillierte Tests oder Reports entstehen."
      />
      <ToolGrid tools={toolsByCategory.recon} accent="cyan" />
    </AppFrame>
  );
}
