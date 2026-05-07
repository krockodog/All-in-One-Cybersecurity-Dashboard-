import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface PipelineStep {
  id: string;
  toolName: string;
  status: "pending" | "running" | "completed" | "failed";
  output?: string;
  findings?: any[];
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

interface PipelineVisualizationProps {
  steps: PipelineStep[];
  title?: string;
}

export function PipelineVisualization({ steps, title = "Pipeline Execution" }: PipelineVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = Math.max(800, steps.length * 150);
    canvas.height = 300;

    // Draw background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "rgba(148, 163, 184, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    // Draw steps
    const stepWidth = 120;
    const stepHeight = 80;
    const startY = (canvas.height - stepHeight) / 2;
    const padding = 30;

    steps.forEach((step, index) => {
      const x = padding + index * (stepWidth + 40);
      const y = startY;

      // Draw connection line
      if (index > 0) {
        ctx.strokeStyle = "rgba(34, 211, 238, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 20, y + stepHeight / 2);
        ctx.lineTo(x - 5, y + stepHeight / 2);
        ctx.stroke();

        // Draw arrow
        ctx.fillStyle = "rgba(34, 211, 238, 0.5)";
        ctx.beginPath();
        ctx.moveTo(x - 5, y + stepHeight / 2);
        ctx.lineTo(x - 12, y + stepHeight / 2 - 5);
        ctx.lineTo(x - 12, y + stepHeight / 2 + 5);
        ctx.closePath();
        ctx.fill();
      }

      // Draw step box
      const statusColors: Record<string, string> = {
        pending: "rgba(100, 116, 139, 0.5)",
        running: "rgba(34, 211, 238, 0.5)",
        completed: "rgba(16, 185, 129, 0.5)",
        failed: "rgba(239, 68, 68, 0.5)",
      };

      const borderColors: Record<string, string> = {
        pending: "#64748b",
        running: "#22d3ee",
        completed: "#10b981",
        failed: "#ef4444",
      };

      ctx.fillStyle = statusColors[step.status] || statusColors.pending;
      ctx.strokeStyle = borderColors[step.status] || borderColors.pending;
      ctx.lineWidth = 2;

      // Draw rounded rectangle
      const radius = 8;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + stepWidth - radius, y);
      ctx.quadraticCurveTo(x + stepWidth, y, x + stepWidth, y + radius);
      ctx.lineTo(x + stepWidth, y + stepHeight - radius);
      ctx.quadraticCurveTo(x + stepWidth, y + stepHeight, x + stepWidth - radius, y + stepHeight);
      ctx.lineTo(x + radius, y + stepHeight);
      ctx.quadraticCurveTo(x, y + stepHeight, x, y + stepHeight - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw status icon
      const iconY = y + 15;
      const icons: Record<string, string> = {
        pending: "⏳",
        running: "⚙️",
        completed: "✓",
        failed: "✕",
      };

      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.fillText(icons[step.status] || "?", x + stepWidth / 2, iconY);

      // Draw tool name
      ctx.font = "bold 12px Arial";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(step.toolName, x + stepWidth / 2, y + 50);

      // Draw status text
      ctx.font = "10px Arial";
      ctx.fillStyle = "rgba(226, 232, 240, 0.8)";
      ctx.fillText(step.status, x + stepWidth / 2, y + 65);

      // Draw duration if completed
      if (step.startTime && step.endTime) {
        const duration = Math.round((step.endTime.getTime() - step.startTime.getTime()) / 1000);
        ctx.font = "9px Arial";
        ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
        ctx.fillText(`${duration}s`, x + stepWidth / 2, y + 78);
      }
    });

    // Draw title
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.fillText(title, 20, 30);
  }, [steps, title]);

  return (
    <Card className="w-full bg-slate-900 border-slate-700 p-4">
      <canvas
        ref={canvasRef}
        className="w-full border border-slate-700 rounded-lg bg-slate-950"
      />
    </Card>
  );
}

export function PipelineDataFlow({ steps }: { steps: PipelineStep[] }) {
  return (
    <Card className="w-full bg-slate-900 border-slate-700 p-4">
      <div className="space-y-4">
        <h3 className="font-semibold text-white">Daten-Flow</h3>

        {steps.map((step, index) => (
          <div key={step.id} className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-mono text-slate-300">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{step.toolName}</p>
                <p className="text-xs text-slate-400">{step.status}</p>
              </div>
              {step.status === "completed" && step.findings && (
                <div className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">
                  {step.findings.length} Findings
                </div>
              )}
              {step.status === "failed" && (
                <div className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                  Error
                </div>
              )}
            </div>

            {/* Output preview */}
            {step.output && (
              <div className="ml-11 p-2 bg-slate-800 rounded text-xs text-slate-300 font-mono max-h-20 overflow-y-auto">
                <p className="text-slate-400 mb-1">Output:</p>
                <p className="text-slate-200 whitespace-pre-wrap break-words">
                  {step.output.substring(0, 200)}
                  {step.output.length > 200 ? "..." : ""}
                </p>
              </div>
            )}

            {/* Arrow to next step */}
            {index < steps.length - 1 && (
              <div className="ml-11 flex items-center gap-2 text-slate-500 text-xs py-1">
                <div className="flex-1 border-t border-dashed border-slate-600" />
                <span>↓ Output → Input</span>
                <div className="flex-1 border-t border-dashed border-slate-600" />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
