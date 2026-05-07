import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Trash2, Save, MessageSquare, ExternalLink } from "lucide-react";
import { AppFrame, SectionBadge } from "@/components/cyber/CyberShell";

const AI_PROVIDERS = [
  { id: "chatgpt", name: "ChatGPT", icon: "🤖", color: "border-green-400/20 bg-green-500/8", docsUrl: "https://platform.openai.com/api-keys", docsLabel: "platform.openai.com" },
  { id: "claude", name: "Claude", icon: "🧠", color: "border-purple-400/20 bg-purple-500/8", docsUrl: "https://console.anthropic.com", docsLabel: "console.anthropic.com" },
  { id: "deepseek", name: "DeepSeek", icon: "🔍", color: "border-blue-400/20 bg-blue-500/8", docsUrl: "https://platform.deepseek.com", docsLabel: "platform.deepseek.com" },
  { id: "kimi", name: "Kimi (Moonshot)", icon: "🌙", color: "border-violet-400/20 bg-violet-500/8", docsUrl: "https://platform.moonshot.cn", docsLabel: "platform.moonshot.cn" },
  { id: "nemotron", name: "Nemotron", icon: "⚡", color: "border-orange-400/20 bg-orange-500/8", docsUrl: "https://build.nvidia.com", docsLabel: "build.nvidia.com" },
  { id: "gemini", name: "Gemini", icon: "✨", color: "border-red-400/20 bg-red-500/8", docsUrl: "https://aistudio.google.com/apikey", docsLabel: "aistudio.google.com" },
  { id: "meta", name: "Meta Llama", icon: "🦙", color: "border-indigo-400/20 bg-indigo-500/8", docsUrl: "https://api.together.xyz", docsLabel: "api.together.xyz" },
  { id: "mistral", name: "Mistral", icon: "🌪️", color: "border-yellow-400/20 bg-yellow-500/8", docsUrl: "https://console.mistral.ai/api-keys", docsLabel: "console.mistral.ai" },
  { id: "perplexity", name: "Perplexity", icon: "🔮", color: "border-pink-400/20 bg-pink-500/8", docsUrl: "https://www.perplexity.ai/settings/api", docsLabel: "perplexity.ai/settings" },
  { id: "hermes", name: "Hermes", icon: "💫", color: "border-cyan-400/20 bg-cyan-500/8", docsUrl: "https://api.together.xyz", docsLabel: "api.together.xyz" },
];

function loadKeys(): Record<string, string> {
  try {
    const raw = localStorage.getItem("ai-api-keys");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function AISettings() {
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(loadKeys);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) =>
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const update = (id: string, value: string) =>
    setApiKeys((prev) => ({ ...prev, [id]: value }));

  const remove = (id: string) =>
    setApiKeys((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  const save = (andNavigate?: boolean) => {
    localStorage.setItem("ai-api-keys", JSON.stringify(apiKeys));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (andNavigate) navigate("/ai-chat");
  };

  const configured = AI_PROVIDERS.filter((p) => apiKeys[p.id]);

  return (
    <AppFrame
      eyebrow="Configuration"
      title="AI Settings"
      action={
        <>
          <SectionBadge icon={<span className="text-[0.9rem]">🤖</span>} label={`${configured.length} Provider aktiv`} />
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* ── Left: Provider cards ─────────────────────── */}
        <div className="space-y-4">
          <div className="glass-panel px-5 py-5">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/75">API Keys</p>
            <h2 className="mt-2 font-display text-3xl text-white">Provider konfigurieren</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Speichere deine API-Keys sicher im Browser. Sie werden nur lokal gespeichert und niemals an Server übertragen.
            </p>
          </div>

          {saved && (
            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              Keys gespeichert.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {AI_PROVIDERS.map((provider) => {
              const hasKey = Boolean(apiKeys[provider.id]);
              return (
                <article
                  key={provider.id}
                  className={`rounded-2xl border px-4 py-4 transition ${provider.color} ${hasKey ? "opacity-100" : "opacity-75 hover:opacity-100"}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{provider.icon}</span>
                      <span className="font-display text-base text-white">{provider.name}</span>
                    </div>
                    <div className={`rounded-full border px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] ${hasKey ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300" : "border-white/8 text-slate-500"}`}>
                      {hasKey ? "aktiv" : "–"}
                    </div>
                  </div>

                  <div className="relative flex items-center gap-2">
                    <input
                      type={visibleKeys.has(provider.id) ? "text" : "password"}
                      placeholder="API Key eingeben…"
                      value={apiKeys[provider.id] ?? ""}
                      onChange={(e) => update(provider.id, e.target.value)}
                      className="h-10 flex-1 min-w-0 rounded-xl border border-white/8 bg-[rgba(10,14,20,0.8)] px-3 text-sm text-white outline-none transition focus:border-cyan-300/30 focus:ring-2 focus:ring-cyan-400/15"
                    />
                    <button
                      type="button"
                      onClick={() => toggle(provider.id)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-slate-400 transition hover:text-white"
                      aria-label="Toggle visibility"
                    >
                      {visibleKeys.has(provider.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {hasKey && (
                      <button
                        type="button"
                        onClick={() => remove(provider.id)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-500/10 text-rose-300 transition hover:bg-rose-500/20"
                        aria-label="Remove key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <a
                    href={provider.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-slate-500 transition hover:text-cyan-300"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {provider.docsLabel}
                  </a>
                </article>
              );
            })}
          </div>
        </div>

        {/* ── Right: Actions + Info ─────────────────────── */}
        <div className="space-y-4">
          <div className="glass-panel px-5 py-5">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/75">Aktionen</p>
            <h3 className="mt-2 font-display text-2xl text-white">Speichern & Nutzen</h3>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => save(true)}
                className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-full bg-cyan-400/90 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
              >
                <MessageSquare className="h-4 w-4" />
                Speichern & Chat öffnen
              </button>
              <button
                type="button"
                onClick={() => save(false)}
                className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-slate-200 transition hover:border-cyan-400/20 hover:text-white"
              >
                <Save className="h-4 w-4" />
                Nur speichern
              </button>
              <button
                type="button"
                onClick={() => { setApiKeys({}); localStorage.removeItem("ai-api-keys"); }}
                className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-full border border-rose-400/15 bg-rose-500/8 px-5 py-3 text-sm text-rose-200 transition hover:bg-rose-500/15"
              >
                <Trash2 className="h-4 w-4" />
                Alle löschen
              </button>
            </div>
          </div>

          <div className="glass-panel px-5 py-5">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-emerald-300/70">Aktive Provider</p>
            <div className="mt-3 space-y-2">
              {configured.length === 0 ? (
                <p className="text-sm text-slate-500">Noch kein Provider konfiguriert.</p>
              ) : (
                configured.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm text-slate-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    {p.icon} {p.name}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel px-5 py-5">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-slate-400">Sicherheitshinweis</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              API-Keys werden ausschließlich in deinem Browser-localStorage gespeichert. Kein Key verlässt dein Gerät über dieses Dashboard.
            </p>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
