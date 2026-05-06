package engine

import "omnius/backend/internal/core/agent"

func BuildAutomatedPipeline(name, targetType string) Pipeline {
	plan := agent.BuildMitrePlan(targetType)
	steps := make([]Step, 0, 64)
	for _, phase := range plan {
		for _, tool := range phase.Tools {
			steps = append(steps, Step{Tool: tool, DependsOn: []string{}, Parameters: map[string]string{"phase": phase.Phase}})
		}
	}
	return Pipeline{Name: name, Steps: steps}
}
