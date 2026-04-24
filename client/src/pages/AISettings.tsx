import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Trash2, Save } from "lucide-react";

const AI_PROVIDERS = [
  { id: "chatgpt", name: "ChatGPT", icon: "🤖", color: "from-green-500 to-green-600" },
  { id: "claude", name: "Claude", icon: "🧠", color: "from-purple-500 to-purple-600" },
  { id: "deepseek", name: "DeepSeek", icon: "🔍", color: "from-blue-500 to-blue-600" },
  { id: "kimi", name: "Kimi (Moonshot)", icon: "🌙", color: "from-violet-500 to-violet-600" },
  { id: "nemotron", name: "Nemotron", icon: "⚡", color: "from-orange-500 to-orange-600" },
  { id: "gemini", name: "Gemini", icon: "✨", color: "from-red-500 to-red-600" },
  { id: "meta", name: "Meta Llama", icon: "🦙", color: "from-indigo-500 to-indigo-600" },
  { id: "mistral", name: "Mistral", icon: "🌪️", color: "from-yellow-500 to-yellow-600" },
  { id: "perplexity", name: "Perplexity", icon: "🔮", color: "from-pink-500 to-pink-600" },
  { id: "hermes", name: "Hermes", icon: "💫", color: "from-cyan-500 to-cyan-600" },
];

export default function AISettings() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [savedMessage, setSavedMessage] = useState("");

  const toggleKeyVisibility = (provider: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(provider)) {
      newVisible.delete(provider);
    } else {
      newVisible.add(provider);
    }
    setVisibleKeys(newVisible);
  };

  const updateApiKey = (provider: string, value: string) => {
    setApiKeys((prev) => ({ ...prev, [provider]: value }));
  };

  const deleteApiKey = (provider: string) => {
    setApiKeys((prev) => {
      const newKeys = { ...prev };
      delete newKeys[provider];
      return newKeys;
    });
  };

  const saveApiKeys = () => {
    // In a real app, this would send to backend
    localStorage.setItem("ai-api-keys", JSON.stringify(apiKeys));
    setSavedMessage("API Keys saved successfully!");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">AI Integration Settings</h1>
          <p className="text-muted-foreground">
            Configure your AI provider API keys for intelligent analysis and recommendations
          </p>
        </div>

        {/* Success Message */}
        {savedMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {savedMessage}
          </div>
        )}

        {/* AI Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {AI_PROVIDERS.map((provider) => (
            <Card key={provider.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{provider.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {apiKeys[provider.id] ? "✓ Configured" : "Not configured"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                <div className="relative">
                  <Input
                    type={visibleKeys.has(provider.id) ? "text" : "password"}
                    placeholder="Enter API Key"
                    value={apiKeys[provider.id] || ""}
                    onChange={(e) => updateApiKey(provider.id, e.target.value)}
                    className="pr-10"
                  />
                  <button
                    onClick={() => toggleKeyVisibility(provider.id)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {visibleKeys.has(provider.id) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {apiKeys[provider.id] && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteApiKey(provider.id)}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setApiKeys({})}>
            Clear All
          </Button>
          <Button onClick={saveApiKeys} className="gap-2">
            <Save className="h-4 w-4" />
            Save API Keys
          </Button>
        </div>

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Get API Keys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-1">ChatGPT (OpenAI)</h3>
              <p className="text-muted-foreground">
                Visit{" "}
                <a href="https://platform.openai.com/api-keys" className="text-primary hover:underline">
                  platform.openai.com
                </a>{" "}
                and create an API key
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Claude (Anthropic)</h3>
              <p className="text-muted-foreground">
                Visit{" "}
                <a href="https://console.anthropic.com" className="text-primary hover:underline">
                  console.anthropic.com
                </a>{" "}
                and generate an API key
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Kimi (Moonshot AI)</h3>
              <p className="text-muted-foreground">
                Visit{" "}
                <a href="https://platform.moonshot.cn" className="text-primary hover:underline">
                  platform.moonshot.cn
                </a>{" "}
                and create an API key
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Other Providers</h3>
              <p className="text-muted-foreground">
                Visit each provider's console to generate API keys. All keys are stored securely in your browser.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
