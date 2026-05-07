import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Loader, Bot, User } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hallo! Ich bin dein KI-Assistent für Penetration Testing. Ich kann automatisierte Sicherheitsscans durchführen und ISO 27001 Reports erstellen. Was möchtest du tun?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.aiChat.chat.useMutation();
  const executeScanMutation = trpc.aiChat.executeScanFromChat.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatMutation.mutateAsync({
        message: userMessage,
        conversationHistory: messages,
      });

      setMessages((prev) => [...prev, { role: "assistant", content: response.message }]);

      // If AI wants to execute a scan
      if (response.action === "execute_scan" && response.actionData) {
        const scanResult = await executeScanMutation.mutateAsync({
          target: response.actionData.target,
          scope: response.actionData.scope,
          toolIds: response.actionData.toolIds,
        });

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `✅ Scan abgeschlossen!\n\n**Target:** ${scanResult.target}\n**Tools ausgeführt:** ${scanResult.toolResults.length}\n\n${scanResult.documentation}`,
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Entschuldigung, es gab einen Fehler. Bitte versuche es erneut.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-700 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          AI Security Assistant
        </CardTitle>
        <CardDescription>Automatisierte Scans und ISO 27001 Reports</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
              )}
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-slate-800 text-slate-100 rounded-bl-none"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <Loader className="w-4 h-4 text-purple-400 animate-spin" />
                </div>
              </div>
              <div className="bg-slate-800 text-slate-100 px-4 py-2 rounded-lg rounded-bl-none">
                <p className="text-sm">Verarbeitung...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Scan starten, Report erstellen, Fragen stellen..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleSendMessage();
              }
            }}
            disabled={isLoading}
            className="bg-slate-800 border-slate-700 text-white"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 space-y-2">
          <p className="text-xs text-slate-400">Schnelle Befehle:</p>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-purple-500/20"
              onClick={() => setInput("Starte einen Scan für example.com")}
            >
              Scan starten
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-purple-500/20"
              onClick={() => setInput("Erstelle einen ISO 27001 Report")}
            >
              ISO Report
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-purple-500/20"
              onClick={() => setInput("Welche Tools sind verfügbar?")}
            >
              Tools
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
