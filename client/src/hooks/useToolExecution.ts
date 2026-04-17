import { useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { type ToolDefinition } from "@/lib/cyber-data";

export function useToolExecution() {
  const runToolMutation = trpc.tools.run.useMutation();

  const executeToolWithFallback = useCallback(
    async (tool: ToolDefinition, payload: { target: string; options: string }) => {
      const target = payload.target.trim() || "example.com";
      const options = payload.options.trim() || "";

      try {
        // Versuche, das Tool über tRPC auszuführen
        const result = await runToolMutation.mutateAsync({
          toolId: tool.id,
          toolName: tool.name,
          baseCommand: tool.commandTemplate || tool.name,
          target,
          options,
          category: tool.category,
        });

        return {
          success: true,
          output: result.output || `[success] ${tool.name} executed successfully`,
          executedAt: result.executedAt,
        };
      } catch (error) {
        // Fallback: Simuliere die Ausführung lokal
        console.warn("tRPC execution failed, using local simulation:", error);
        const timestamp = new Date().toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        
        return {
          success: false,
          output: `[${timestamp}] ${tool.name} simulation (backend unavailable)\n[${timestamp}] target: ${target}\n[${timestamp}] status: simulated execution`,
          executedAt: Date.now(),
        };
      }
    },
    [runToolMutation],
  );

  return {
    executeToolWithFallback,
    isLoading: runToolMutation.isPending,
  };
}
