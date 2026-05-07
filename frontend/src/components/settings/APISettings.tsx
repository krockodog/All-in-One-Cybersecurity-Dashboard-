import { ReactElement } from "react";

const providers: string[] = ["Shodan", "Censys", "VirusTotal", "SecurityTrails", "Hunter", "HaveIBeenPwned", "Dehashed"];

export const APISettings = (): ReactElement => {
  return (
    <section className="space-y-3 rounded-xl border border-white/10 p-4" data-testid="api-settings">
      <h3 className="text-lg font-semibold">External API Keys</h3>
      <div className="grid gap-3 md:grid-cols-2" data-testid="api-settings-grid">
        {providers.map((provider) => (
          <label key={provider} className="space-y-1" data-testid={`api-setting-${provider.toLowerCase()}`}>
            <span className="text-sm text-slate-300">{provider}</span>
            <input data-testid={`api-key-input-${provider.toLowerCase()}`} className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2" placeholder={`${provider} API Key`} />
          </label>
        ))}
      </div>
    </section>
  );
};
