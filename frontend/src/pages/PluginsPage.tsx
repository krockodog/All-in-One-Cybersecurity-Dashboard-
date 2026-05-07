import { ReactElement } from "react";

export default function PluginsPage(): ReactElement {
  return (
    <section className="space-y-3" data-testid="plugins-page">
      <h2 className="text-2xl font-semibold">Plugins</h2>
      <p className="text-sm text-slate-400">Install, remove and configure YAML-defined plugins for tool orchestration.</p>
      <div className="rounded-xl border border-white/10 p-4" data-testid="plugins-placeholder">
        Plugin management foundation is active in this milestone.
      </div>
    </section>
  );
}
