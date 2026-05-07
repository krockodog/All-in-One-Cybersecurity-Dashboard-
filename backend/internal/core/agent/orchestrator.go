package agent

import (
	"context"
	"time"
)

type Planner interface {
	Build(targetType string) []PlannedTask
}

type Executor interface {
	Execute(phase, tool, target string) TaskResult
}

type Analyst interface {
	Analyze(result TaskResult) []ClassifiedFinding
}

type Verifier interface {
	Verify(finding ClassifiedFinding) bool
}

type PhaseSummary struct {
	Phase     string `json:"phase"`
	ToolsUsed int    `json:"toolsUsed"`
}

type TaskExecution struct {
	Phase    string    `json:"phase"`
	Tool     string    `json:"tool"`
	Output   string    `json:"output"`
	Success  bool      `json:"success"`
	Finished time.Time `json:"finished"`
}

type RunSummary struct {
	Target        string              `json:"target"`
	TargetType    string              `json:"targetType"`
	ExecutedTasks int                 `json:"executedTasks"`
	Phases        []PhaseSummary      `json:"phases"`
	Executions    []TaskExecution     `json:"executions"`
	Findings      []ClassifiedFinding `json:"findings"`
	StartedAt     time.Time           `json:"startedAt"`
	FinishedAt    time.Time           `json:"finishedAt"`
}

type defaultPlanner struct{}

func (defaultPlanner) Build(targetType string) []PlannedTask {
	return BuildMitrePlan(targetType)
}

type defaultExecutor struct{}

func (defaultExecutor) Execute(phase, tool, target string) TaskResult {
	return ExecuteTask(phase, tool, target)
}

type defaultAnalyst struct{}

func (defaultAnalyst) Analyze(result TaskResult) []ClassifiedFinding {
	return AnalyzeResult(result)
}

type defaultVerifier struct{}

func (defaultVerifier) Verify(finding ClassifiedFinding) bool {
	return VerifyFinding(finding)
}

type Orchestrator struct {
	planner  Planner
	executor Executor
	analyst  Analyst
	verifier Verifier
}

func NewOrchestrator() *Orchestrator {
	return &Orchestrator{
		planner:  defaultPlanner{},
		executor: defaultExecutor{},
		analyst:  defaultAnalyst{},
		verifier: defaultVerifier{},
	}
}

func (o *Orchestrator) Run(ctx context.Context, target, targetType string) RunSummary {
	startedAt := time.Now().UTC()
	plan := o.planner.Build(targetType)
	findings := make([]ClassifiedFinding, 0, 16)
	executions := make([]TaskExecution, 0, 32)
	phases := make([]PhaseSummary, 0, len(plan))
	taskCount := 0

	for _, step := range plan {
		phaseRuns := 0
		for _, tool := range step.Tools {
			if ctx != nil {
				select {
				case <-ctx.Done():
					return RunSummary{
						Target:        target,
						TargetType:    targetType,
						ExecutedTasks: taskCount,
						Phases:        phases,
						Executions:    executions,
						Findings:      findings,
						StartedAt:     startedAt,
						FinishedAt:    time.Now().UTC(),
					}
				default:
				}
			}

			result := o.executor.Execute(step.Phase, tool, target)
			taskCount++
			phaseRuns++

			executions = append(executions, TaskExecution{
				Phase:    result.Phase,
				Tool:     result.Tool,
				Output:   result.Output,
				Success:  result.Success,
				Finished: result.Finished,
			})

			for _, finding := range o.analyst.Analyze(result) {
				if o.verifier.Verify(finding) {
					findings = append(findings, finding)
				}
			}
		}

		phases = append(phases, PhaseSummary{Phase: step.Phase, ToolsUsed: phaseRuns})
	}

	return RunSummary{
		Target:        target,
		TargetType:    targetType,
		ExecutedTasks: taskCount,
		Phases:        phases,
		Executions:    executions,
		Findings:      findings,
		StartedAt:     startedAt,
		FinishedAt:    time.Now().UTC(),
	}
}

func Run(target string, targetType string) RunSummary {
	orchestrator := NewOrchestrator()
	return orchestrator.Run(context.Background(), target, targetType)
}
