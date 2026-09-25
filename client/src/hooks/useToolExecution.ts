import { useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { type ToolDefinition } from "@/lib/cyber-data";
import { useLegalScanConsent } from "@/components/legal/LegalScanConsent";

export function useToolExecution() {
  const runToolMutation = trpc.tools.run.useMutation();
  const requestScanConsent = useLegalScanConsent();

  const executeToolWithFallback = useCallback(
    async (tool: ToolDefinition, payload: { target: string; options: string }) => {
      const target = payload.target.trim() || "example.com";
      const options = payload.options.trim() || "";

      // External tools require a native binary or hardware — never send to server
      if (tool.executionMode === "external") {
        const timestamp = new Date().toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        return {
          success: true,
          output: [
            `[${timestamp}] ${tool.name} requires a local installation`,
            `[${timestamp}] target: ${target}`,
            `[${timestamp}] mode: external — run this tool in an authorized lab environment`,
            `[${timestamp}] result: external tool cannot be executed inside the dashboard`,
          ].join("\n"),
          executedAt: Date.now(),
        };
      }

      if (!(await requestScanConsent({ target, tool: tool.name }))) {
        return {
          success: false,
          output: `[abgebrochen] ${tool.name}: Die Berechtigung für das Ziel wurde nicht bestätigt. Es wurde kein Scan gestartet.`,
          executedAt: Date.now(),
        };
      }

      try {
        // Versuche, das Tool über tRPC auszuführen
        const result = await runToolMutation.mutateAsync({
          toolId: tool.id,
          toolName: tool.name,
          baseCommand: tool.commandTemplate || tool.name,
          target,
          options,
          category: tool.category,
          legalConsent: true,
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
    [requestScanConsent, runToolMutation],
  );

  return {
    executeToolWithFallback,
    isLoading: runToolMutation.isPending,
  };
}
