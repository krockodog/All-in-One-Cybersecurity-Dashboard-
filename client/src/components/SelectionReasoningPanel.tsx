/**
 * Selection Reasoning Panel
 * Displays AI-generated reasoning for tool selection in pentest plans
 */

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Brain, Target, AlertCircle } from "lucide-react";
import { useState } from "react";

export interface ToolReasoning {
  toolId: string;
  toolName: string;
  category: string;
  reason: string;
  relevance: number; // 0-100
  alternatives?: string[];
  riskLevel: "low" | "medium" | "high";
  estimatedDuration: number; // minutes
}

export interface SelectionReasoningPanelProps {
  tools: ToolReasoning[];
  totalTools: number;
  estimatedTotalTime: number;
}

export function SelectionReasoningPanel({
  tools,
  totalTools,
  estimatedTotalTime,
}: SelectionReasoningPanelProps) {
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  const toggleExpanded = (toolId: string) => {
    const newExpanded = new Set(expandedTools);
    if (newExpanded.has(toolId)) {
      newExpanded.delete(toolId);
    } else {
      newExpanded.add(toolId);
    }
    setExpandedTools(newExpanded);
  };

  const avgRelevance = Math.round(
    tools.reduce((sum, t) => sum + t.relevance, 0) / Math.max(tools.length, 1)
  );

  const highRiskTools = tools.filter((t) => t.riskLevel === "high").length;

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-slate-700 bg-slate-800/50 p-3">
          <p className="text-xs font-mono uppercase tracking-[0.1em] text-slate-400">
            Tools Selected
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{totalTools}</p>
        </Card>
        <Card className="border-slate-700 bg-slate-800/50 p-3">
          <p className="text-xs font-mono uppercase tracking-[0.1em] text-slate-400">
            Avg Relevance
          </p>
          <p className="mt-1 text-2xl font-bold text-cyan-400">{avgRelevance}%</p>
        </Card>
        <Card className="border-slate-700 bg-slate-800/50 p-3">
          <p className="text-xs font-mono uppercase tracking-[0.1em] text-slate-400">
            Est. Duration
          </p>
          <p className="mt-1 text-2xl font-bold text-white">
            {Math.round(estimatedTotalTime / 60)}h
          </p>
        </Card>
        <Card className="border-slate-700 bg-slate-800/50 p-3">
          <p className="text-xs font-mono uppercase tracking-[0.1em] text-slate-400">
            High Risk
          </p>
          <p className="mt-1 text-2xl font-bold text-red-400">{highRiskTools}</p>
        </Card>
      </div>

      {/* Tool Reasoning List */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-300">Tool Selection Reasoning</h3>
        {tools.map((tool, index) => (
          <Card
            key={tool.toolId}
            className="border-slate-700 bg-slate-800/30 p-4 transition hover:bg-slate-800/50"
          >
            <div
              className="flex cursor-pointer items-start justify-between gap-3"
              onClick={() => toggleExpanded(tool.toolId)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h4 className="font-semibold text-white">{tool.toolName}</h4>
                  <Badge variant="outline" className="text-xs">
                    {tool.category}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-cyan-400" />
                    <span className="text-xs font-mono text-cyan-400">
                      {tool.relevance}%
                    </span>
                  </div>
                </div>

                {/* Collapsed Summary */}
                {!expandedTools.has(tool.toolId) && (
                  <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                    {tool.reason}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {tool.riskLevel === "high" && (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                {expandedTools.has(tool.toolId) ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedTools.has(tool.toolId) && (
              <div className="mt-4 space-y-3 border-t border-slate-700 pt-4">
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.1em] text-slate-400">
                    Reasoning
                  </p>
                  <p className="mt-1 text-sm text-slate-300">{tool.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-[0.1em] text-slate-400">
                      Risk Level
                    </p>
                    <Badge
                      variant={
                        tool.riskLevel === "high"
                          ? "destructive"
                          : tool.riskLevel === "medium"
                            ? "secondary"
                            : "outline"
                      }
                      className="mt-1"
                    >
                      {tool.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-[0.1em] text-slate-400">
                      Est. Duration
                    </p>
                    <p className="mt-1 text-sm font-mono text-white">
                      {tool.estimatedDuration}m
                    </p>
                  </div>
                </div>

                {tool.alternatives && tool.alternatives.length > 0 && (
                  <div>
                    <p className="text-xs font-mono uppercase tracking-[0.1em] text-slate-400">
                      Alternatives Considered
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tool.alternatives.map((alt) => (
                        <Badge key={alt} variant="outline" className="text-xs">
                          {alt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* AI Reasoning Summary */}
      <Card className="border-cyan-500/30 bg-cyan-500/10 p-4">
        <div className="flex items-start gap-3">
          <Brain className="h-5 w-5 shrink-0 text-cyan-400" />
          <div>
            <p className="text-sm font-semibold text-cyan-300">AI Selection Strategy</p>
            <p className="mt-1 text-sm text-cyan-200/70">
              Diese Tool-Auswahl wurde basierend auf dem definierten Scope, den
              Zielzielen und bekannten Schwachstellen optimiert. Die Reihenfolge
              berücksichtigt Abhängigkeiten und maximiert die Erkennungsrate.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
