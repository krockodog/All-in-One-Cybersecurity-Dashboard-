import { useSettings } from "@/hooks/useSettings";

export const LLMSettings = () => {
  const { settings } = useSettings();
  const llmConfig = settings.data?.data.llm ?? {};

  return (
    <section className="space-y-3 rounded-xl border border-white/10 p-4" data-testid="llm-settings">
      <h3 className="text-lg font-semibold">LLM Providers</h3>
      <p className="text-sm text-slate-400" data-testid="llm-settings-description">
        Configure OpenAI, Anthropic, Google, Ollama and OpenRouter keys per user.
      </p>
      <pre className="overflow-auto rounded-lg bg-black/30 p-3 text-xs" data-testid="llm-settings-json">
        {JSON.stringify(llmConfig, null, 2)}
      </pre>
    </section>
  );
};
