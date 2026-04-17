import { AppFrame, PageIntro, SectionBadge } from "@/components/cyber/CyberShell";
import { categoryLabel, riskColor, riskLabel, toolsByCategory } from "@/lib/cyber-data";
import { BookOpenText, Globe } from "lucide-react";

export default function OsintGuidePage() {
  return (
    <AppFrame
      eyebrow="Guidebook"
      title="OSINT Tools"
      action={
        <>
          <SectionBadge icon={<BookOpenText className="h-3.5 w-3.5" />} label="Tool Reference" />
          <SectionBadge icon={<Globe className="h-3.5 w-3.5" />} label="Passive Sources" />
        </>
      }
    >
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
    </AppFrame>
  );
}
