import { ReactElement } from "react";

const events: string[] = [
  "Finding detected: SQL Injection in login form",
  "Pentest started for staging-api.example.com",
  "New target imported via CSV",
  "Plugin update available: nuclei"
];

export const ActivityFeed = (): ReactElement => {
  return (
    <section className="rounded-xl border border-white/10 bg-black/20 p-4" data-testid="dashboard-activity-feed">
      <h3 className="mb-3 text-sm uppercase tracking-[0.2em] text-cyan">Live Activity</h3>
      <ul className="space-y-2 text-sm">
        {events.map((event: string, index: number) => (
          <li key={event} className="flex items-start justify-between gap-2" data-testid={`activity-event-${index}`}>
            <span>{event}</span>
            <span className="text-xs text-slate-400">{new Date().toLocaleTimeString()}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
