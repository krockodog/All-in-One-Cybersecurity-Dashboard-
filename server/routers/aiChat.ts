import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { toolCatalog } from "../../client/src/lib/cyber-data";
import { runTool } from "../toolRunner";

const chatMessageSchema = z.object({
  message: z.string().min(1),
  conversationHistory: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
});

const executeScanFromChatSchema = z.object({
  target: z.string().min(1),
  scope: z.string(),
  toolIds: z.array(z.string()).optional(),
});

export const aiChatRouter = router({
  // Chat with AI that can execute scans
  chat: protectedProcedure
    .input(chatMessageSchema)
    .mutation(async ({ input }) => {
      const systemPrompt = `Du bist ein Cybersecurity-Experte und KI-Assistent für ein Penetration Testing Dashboard.
Du kannst automatisierte Sicherheitsscans durchführen und ISO 27001 Reports erstellen.

Verfügbare Tools: ${toolCatalog.length} Security Tools
Kategorien: OSINT, Pentest, Reconnaissance, Cloud Security, Forensics, Binary Analysis

Deine Aufgaben:
1. Nutzer-Anfragen verstehen und validieren
2. Automatisierte Scans mit relevanten Tools starten
3. Ergebnisse analysieren und dokumentieren
4. ISO 27001 Reports mit Risikomatrix erstellen
5. Empfehlungen geben

Wenn der Nutzer einen Scan anfordert, antworte mit:
{
  "action": "execute_scan",
  "target": "target.com",
  "scope": "Beschreibung des Scopes",
  "toolIds": ["tool-id-1", "tool-id-2"]
}

Wenn der Nutzer Fragen stellt, antworte normal mit hilfreichen Informationen.`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...input.conversationHistory,
        { role: "user" as const, content: input.message },
      ];

      const response = await invokeLLM({
        messages: messages as Array<{
          role: "system" | "user" | "assistant";
          content: string;
        }>,
      });

      const assistantMessage =
        typeof response.choices[0]?.message?.content === "string"
          ? response.choices[0].message.content
          : "";

      // Check if response contains scan execution request
      let action = null;
      let actionData = null;

      try {
        if (
          typeof assistantMessage === "string" &&
          assistantMessage.includes('"action": "execute_scan"')
        ) {
          const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.action === "execute_scan") {
              action = "execute_scan";
              actionData = parsed;
            }
          }
        }
      } catch (e) {
        // JSON parsing failed, treat as normal response
      }

      return {
        message: assistantMessage,
        action,
        actionData,
      };
    }),

  // Execute scan based on chat request
  executeScanFromChat: protectedProcedure
    .input(executeScanFromChatSchema)
    .mutation(async ({ input }) => {
      const toolIds = input.toolIds || toolCatalog.map((t) => t.id).slice(0, 20); // Default: first 20 tools

      const toolResults = [];
      const documentation: string[] = [
        `# Automated Security Assessment Report`,
        `**Target:** ${input.target}`,
        `**Scope:** ${input.scope}`,
        `**Timestamp:** ${new Date().toISOString()}`,
        `**Tools Executed:** ${toolIds.length}`,
        ``,
        `## Execution Summary`,
      ];

      // Execute tools
      for (const toolId of toolIds) {
        const tool = toolCatalog.find((t) => t.id === toolId);
        if (!tool) continue;

        try {
          if (tool.executionMode === "external") {
            toolResults.push({
              toolId,
              status: "skipped",
              reason: "External tool",
            });
            continue;
          }

          const result = await runTool({
            toolId: tool.id,
            toolName: tool.name,
            baseCommand: tool.commandTemplate || tool.name,
            target: input.target,
            options: "",
            category: tool.category,
          });

          toolResults.push({
            toolId,
            status: result.status,
            output: result.output,
            findings: result.findings,
          });

          documentation.push(
            `- **${tool.name}**: ${result.status} (${result.findings?.length || 0} findings)`
          );
        } catch (error) {
          toolResults.push({
            toolId,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          });
          documentation.push(`- **${tool.name}**: error`);
        }
      }

      return {
        target: input.target,
        scope: input.scope,
        toolResults,
        documentation: documentation.join("\n"),
        timestamp: new Date().toISOString(),
      };
    }),

  // Generate ISO 27001 report from chat context
  generateISO27001FromChat: protectedProcedure
    .input(
      z.object({
        target: z.string(),
        findings: z.array(z.string()),
        scope: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Analyze findings and create risk matrix
      const riskMatrix = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      };

      const criticalKeywords = [
        "sql injection",
        "rce",
        "authentication bypass",
        "privilege escalation",
      ];
      const highKeywords = ["xss", "csrf", "insecure deserialization"];
      const mediumKeywords = ["weak password", "outdated software"];

      for (const finding of input.findings) {
        const lower = finding.toLowerCase();
        if (criticalKeywords.some((kw) => lower.includes(kw))) {
          riskMatrix.critical++;
        } else if (highKeywords.some((kw) => lower.includes(kw))) {
          riskMatrix.high++;
        } else if (mediumKeywords.some((kw) => lower.includes(kw))) {
          riskMatrix.medium++;
        } else {
          riskMatrix.low++;
        }
      }

      const complianceScore = Math.max(
        0,
        100 - (riskMatrix.critical * 20 + riskMatrix.high * 10 + riskMatrix.medium * 5)
      );

      return {
        target: input.target,
        scope: input.scope,
        riskMatrix,
        complianceScore,
        reportGenerated: true,
        timestamp: new Date().toISOString(),
      };
    }),
});
