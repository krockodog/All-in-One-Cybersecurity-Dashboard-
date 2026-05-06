import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Pause, BarChart3, AlertCircle } from "lucide-react";

export default function EngagementDashboard() {
  const { user } = useAuth();
  const [selectedEngagement, setSelectedEngagement] = useState<number | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  // Fetch engagements
  const { data: engagements, isLoading: engagementsLoading } =
    trpc.engagements.list.useQuery();

  // Fetch workflows
  const { data: workflows } = trpc.workflows.listWorkflows.useQuery();

  // Fetch execution jobs for selected engagement
  const { data: executionJobs } = trpc.engagements.getExecutionJobs.useQuery(
    { engagementId: selectedEngagement || 0 },
    { enabled: !!selectedEngagement },
  );

  // Start workflow mutation
  const startWorkflow = trpc.workflows.startWorkflow.useMutation();

  const handleStartWorkflow = async (engagementId: number, workflowId: string) => {
    if (!engagements?.[0]) return;

    const target = engagements[0].scope?.domains?.[0] || "unknown";

    await startWorkflow.mutateAsync({
      engagementId,
      workflowId,
      target,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-400 opacity-70" />
          <h2 className="text-2xl font-bold text-foreground">Authentication Required</h2>
          <p className="text-muted-foreground">
            The Engagement Dashboard requires an active session. Use the main dashboard to access all cybersecurity tools without authentication.
          </p>
          <Link
            to="/"
            className="inline-block rounded-full border border-cyan-400/30 bg-cyan-500/10 px-5 py-2.5 text-sm text-cyan-100 transition hover:bg-cyan-500/20"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Engagement Dashboard</h1>
          <p className="text-muted-foreground">Manage pentesting engagements and workflows</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Engagements List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Engagements</CardTitle>
                <CardDescription>Your active projects</CardDescription>
              </CardHeader>
              <CardContent>
                {engagementsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : engagements && engagements.length > 0 ? (
                  <div className="space-y-2">
                    {engagements.map((engagement) => (
                      <button
                        key={engagement.id}
                        onClick={() => setSelectedEngagement(engagement.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedEngagement === engagement.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border hover:bg-accent"
                        }`}
                      >
                        <div className="font-medium">{engagement.name}</div>
                        <div className="text-sm opacity-75">{engagement.description}</div>
                        <div className="mt-2 flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {engagement.status}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No engagements found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {selectedEngagement ? (
              <>
                {/* Workflow Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Available Workflows</CardTitle>
                    <CardDescription>Select a workflow to execute</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {workflows && workflows.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {workflows.map((workflow) => (
                          <button
                            key={workflow.id}
                            onClick={() => setSelectedWorkflow(workflow.id)}
                            className={`p-4 rounded-lg border text-left transition-colors ${
                              selectedWorkflow === workflow.id
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border hover:bg-accent"
                            }`}
                          >
                            <div className="font-medium">{workflow.name}</div>
                            <div className="text-sm opacity-75 mt-1">{workflow.description}</div>
                            <div className="text-xs opacity-50 mt-2">{workflow.stepCount} steps</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No workflows available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Execution Controls */}
                {selectedWorkflow && (
                  <Card className="border-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5" />
                        Ready to Execute
                      </CardTitle>
                      <CardDescription>
                        Click to start the {workflows?.find((w) => w.id === selectedWorkflow)?.name} workflow
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() =>
                          handleStartWorkflow(selectedEngagement, selectedWorkflow)
                        }
                        disabled={startWorkflow.isPending}
                        className="w-full"
                        size="lg"
                      >
                        {startWorkflow.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Starting Workflow...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Start Workflow
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Execution Jobs */}
                {executionJobs && executionJobs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Execution History
                      </CardTitle>
                      <CardDescription>Recent tool executions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {executionJobs.map((job) => (
                          <div
                            key={job.id}
                            className="p-3 rounded-lg bg-card border border-border flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{job.tool}</div>
                              <div className="text-sm text-muted-foreground">{job.target}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={
                                  job.status === "success"
                                    ? "default"
                                    : job.status === "error"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {job.status}
                              </Badge>
                              {job.status === "running" && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="pt-8">
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select an engagement to get started</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
