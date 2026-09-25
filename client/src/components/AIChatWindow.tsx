import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

function describeChatError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (/KI-Dienst|KI-Modell|Ollama/.test(message)) return message;
  return "";
}

// Stays well within the server caps in server/_core/inputLimits.ts
const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 2000;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIChatWindow() {
  const chatMutation = trpc.aiChat.chat.useMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // All chat requests go to the server's own Ollama backend (no browser-side
  // provider keys involved), so the window is always available and shows the
  // backend that actually answers.
  const backendLabel = "Ollama (Server)";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // No-login mode: works anonymously via the (rate-limited) public tRPC endpoint.
      const data = await chatMutation.mutateAsync({
        message: userMessage.content,
        // Server caps history length; send only the most recent turns.
        conversationHistory: messages
          .slice(-MAX_HISTORY_MESSAGES)
          .map(m => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) })),
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "Keine Antwort vom KI-Provider",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: describeChatError(error) || "Fehler beim Verbinden mit dem KI-Provider. Bitte versuche es später erneut.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:opacity-75"
        title="KI-Assistent"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-24px)] h-96 flex flex-col bg-slate-950 border-cyan-500/30 shadow-2xl z-40">
          {/* Header */}
          <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center">
            <h3 className="font-mono text-sm font-bold text-cyan-300">KI-Assistent</h3>
            <span className="text-xs text-slate-400">{backendLabel}</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 text-sm mt-8">
                <p>Hallo! Ich bin dein KI-Assistent.</p>
                <p className="text-xs mt-2">Ich kann dir bei der Nutzung des Frameworks helfen.</p>
              </div>
            )}
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200 border border-cyan-500/20"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 px-3 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-cyan-500/20 flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Nachricht..."
              maxLength={8000}
              className="text-sm bg-slate-900 border-cyan-500/30 text-white placeholder-slate-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !input.trim()}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      )}
    </>
  );
}
