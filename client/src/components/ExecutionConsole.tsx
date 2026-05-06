import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, X } from "lucide-react";

interface ConsoleOutput {
  timestamp: number;
  level: "info" | "success" | "warning" | "error";
  message: string;
  data?: Record<string, unknown>;
}

interface ExecutionConsoleProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ExecutionConsole({ jobId, isOpen, onClose }: ExecutionConsoleProps) {
  const [outputs, setOutputs] = useState<ConsoleOutput[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"running" | "completed" | "failed" | "paused">("running");

  useEffect(() => {
    if (!isOpen) return;

    // Simulate real-time output updates
    const interval = setInterval(() => {
      // In production, fetch from WebSocket or Server-Sent Events
      setProgress((prev) => Math.min(prev + Math.random() * 15, 100));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "success":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      default:
        return "text-cyan-400";
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case "success":
        return "bg-green-500/10";
      case "warning":
        return "bg-yellow-500/10";
      case "error":
        return "bg-red-500/10";
      default:
        return "bg-cyan-500/10";
    }
  };

  const copyToClipboard = () => {
    const text = outputs.map((o) => `[${o.level.toUpperCase()}] ${o.message}`).join("\n");
    navigator.clipboard.writeText(text);
  };

  const downloadLogs = () => {
    const text = outputs.map((o) => `[${new Date(o.timestamp).toISOString()}] [${o.level}] ${o.message}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `execution-${jobId}.log`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle>Execution Console</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Job ID: {jobId}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Status */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <span
              className={`px-2 py-1 rounded text-xs font-mono ${
                status === "running"
                  ? "bg-blue-500/20 text-blue-400"
                  : status === "completed"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
              }`}
            >
              {status.toUpperCase()}
            </span>
          </div>

          {/* Console Output */}
          <div className="flex-1 overflow-y-auto bg-slate-950 rounded-lg p-4 font-mono text-sm border border-slate-800 mb-4">
            {outputs.length === 0 ? (
              <div className="text-slate-500">Waiting for output...</div>
            ) : (
              outputs.map((output, idx) => (
                <div key={idx} className={`mb-2 ${getLevelBg(output.level)} p-2 rounded`}>
                  <span className={`${getLevelColor(output.level)} font-bold`}>[{output.level.toUpperCase()}]</span>
                  <span className="text-slate-300 ml-2">{output.message}</span>
                  {output.data && (
                    <div className="text-slate-400 text-xs mt-1 ml-4">
                      {JSON.stringify(output.data, null, 2)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={downloadLogs} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
