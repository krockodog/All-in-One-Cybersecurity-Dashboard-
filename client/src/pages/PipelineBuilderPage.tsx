import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Play, Save, Copy, ChevronDown, ChevronUp } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { toolCatalog } from "@/lib/cyber-data";
import { PipelineVisualization, PipelineDataFlow } from "@/components/PipelineVisualization";

interface PipelineStep {
  id: string;
  toolId: string;
  toolName: string;
  dependencies: string[];
  parallel: boolean;
}

interface Pipeline {
  id: string;
  name: string;
  description: string;
  steps: PipelineStep[];
  scope: string;
}

export default function PipelineBuilderPage() {
  const [pipeline, setPipeline] = useState<Pipeline>({
    id: `pipeline-${Date.now()}`,
    name: "New Pipeline",
    description: "",
    steps: [],
    scope: "",
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionSteps, setExecutionSteps] = useState<any[]>([]);

  const createPipelineMutation = trpc.pipelines.create.useMutation();
  const executePipelineMutation = trpc.pipelines.execute.useMutation();
  const getTemplatesMutation = trpc.pipelines.getTemplates.useQuery();

  const addStep = (toolId: string) => {
    const tool = toolCatalog.find((t) => t.id === toolId);
    if (!tool) return;

    const newStep: PipelineStep = {
      id: `step-${pipeline.steps.length}`,
      toolId,
      toolName: tool.name,
      dependencies: pipeline.steps.length > 0 ? [`step-${pipeline.steps.length - 1}`] : [],
      parallel: false,
    };

    setPipeline((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
  };

  const removeStep = (stepId: string) => {
    setPipeline((prev) => ({
      ...prev,
      steps: prev.steps.filter((s) => s.id !== stepId),
    }));
  };

  const toggleParallel = (stepId: string) => {
    setPipeline((prev) => ({
      ...prev,
      steps: prev.steps.map((s) =>
        s.id === stepId ? { ...s, parallel: !s.parallel } : s
      ),
    }));
  };

  const handleExecute = async () => {
    if (pipeline.steps.length === 0) {
      // Show error in UI instead of alert
      console.warn("Pipeline muss mindestens einen Tool enthalten");
      return;
    }

    setIsExecuting(true);
    try {
      const result = await executePipelineMutation.mutateAsync(pipeline as any);
      setExecutionSteps(result.steps);
      // Show success message in UI
      console.log(`Pipeline ausgeführt! Execution ID: ${result.executionId}`);
    } catch (error) {
      // Show error in UI instead of alert
      console.error("Pipeline-Ausführung fehlgeschlagen:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSave = async () => {
    try {
      const result = await createPipelineMutation.mutateAsync({
        name: pipeline.name,
        description: pipeline.description,
        steps: pipeline.steps.map((s) => ({
          toolId: s.toolId,
          dependencies: s.dependencies,
          parallel: s.parallel,
        })),
        scope: pipeline.scope,
      });
      // Show success in console instead of alert
      console.log("Pipeline gespeichert!");
    } catch (error) {
      // Show error in console instead of alert
      console.error("Pipeline speichern fehlgeschlagen:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-6 p-6 bg-background">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pipeline Builder</h1>
            <p className="text-muted-foreground">
              Erstelle Tool-Chains mit automatischer Daten-Weitergabe
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} variant="outline" className="gap-2">
              <Save className="w-4 h-4" />
              Speichern
            </Button>
            <Button
              onClick={handleExecute}
              disabled={isExecuting || pipeline.steps.length === 0}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              {isExecuting ? "Läuft..." : "Ausführen"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Pipeline Configuration */}
          <div className="col-span-2 space-y-6">
            {/* Pipeline Info */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline-Informationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={pipeline.name}
                    onChange={(e) =>
                      setPipeline((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="z.B. Full Reconnaissance"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Beschreibung</label>
                  <Input
                    value={pipeline.description}
                    onChange={(e) =>
                      setPipeline((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="z.B. Nmap → Nikto → SQLMap"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Scope/Target</label>
                  <Input
                    value={pipeline.scope}
                    onChange={(e) =>
                      setPipeline((prev) => ({ ...prev, scope: e.target.value }))
                    }
                    placeholder="z.B. example.com oder 10.0.0.1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pipeline Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline-Schritte ({pipeline.steps.length})</CardTitle>
                <CardDescription>Tools werden in definierter Reihenfolge ausgeführt</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pipeline.steps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keine Tools hinzugefügt</p>
                ) : (
                  pipeline.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs bg-slate-200 px-2 py-1 rounded">
                            Step {index + 1}
                          </span>
                          <span className="font-medium">{step.toolName}</span>
                          {step.parallel && (
                            <Badge variant="outline" className="text-xs">
                              Parallel
                            </Badge>
                          )}
                        </div>
                        {step.dependencies.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Abhängig von: {step.dependencies.join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleParallel(step.id)}
                          title={step.parallel ? "Sequenziell" : "Parallel"}
                        >
                          {step.parallel ? "∥" : "→"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeStep(step.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Tool Selection */}
          <div className="space-y-6">
            {/* Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vorlagen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    const template = getTemplatesMutation.data?.reconnaissance;
                    if (template) {
                      setPipeline((prev) => ({
                        ...prev,
                        name: "Full Reconnaissance",
                        steps: template.steps as any,
                      }));
                    }
                  }}
                >
                  🔍 Reconnaissance
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    const template = getTemplatesMutation.data?.webAppPentest;
                    if (template) {
                      setPipeline((prev) => ({
                        ...prev,
                        name: "Web App Pentest",
                        steps: template.steps as any,
                      }));
                    }
                  }}
                >
                  🕷️ Web App Pentest
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    const template = getTemplatesMutation.data?.osint;
                    if (template) {
                      setPipeline((prev) => ({
                        ...prev,
                        name: "OSINT Investigation",
                        steps: template.steps as any,
                      }));
                    }
                  }}
                >
                  🔎 OSINT
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    const template = getTemplatesMutation.data?.cloudSecurity;
                    if (template) {
                      setPipeline((prev) => ({
                        ...prev,
                        name: "Cloud Security",
                        steps: template.steps as any,
                      }));
                    }
                  }}
                >
                  ☁️ Cloud Security
                </Button>
              </CardContent>
            </Card>

            {/* Tool Catalog */}
            <Card className="max-h-96 overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-base">Verfügbare Tools</CardTitle>
                <CardDescription>{toolCatalog.length} Tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {toolCatalog.slice(0, 30).map((tool) => (
                  <Button
                    key={tool.id}
                    variant="outline"
                    className="w-full justify-between text-xs"
                    onClick={() => addStep(tool.id)}
                  >
                    <span className="truncate">{tool.name}</span>
                    <Plus className="w-3 h-3" />
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pipeline Visualization */}
        {executionSteps.length > 0 && (
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Execution Visualization</h2>
            <PipelineVisualization
              steps={executionSteps.map((s) => ({
                id: s.stepId,
                toolName: s.toolName,
                status: s.status,
                output: s.output,
                findings: s.findings,
                startTime: s.startTime ? new Date(s.startTime) : undefined,
                endTime: s.endTime ? new Date(s.endTime) : undefined,
                error: s.error,
              }))}
              title="Pipeline Execution Flow"
            />
            <PipelineDataFlow
              steps={executionSteps.map((s) => ({
                id: s.stepId,
                toolName: s.toolName,
                status: s.status,
                output: s.output,
                findings: s.findings,
              }))}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
