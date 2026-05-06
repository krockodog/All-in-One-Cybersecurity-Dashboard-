package engine

func BuildManualPipeline(name string, selectedTools []string) Pipeline {
	steps := make([]Step, 0, len(selectedTools))
	for _, tool := range selectedTools {
		steps = append(steps, Step{Tool: tool, DependsOn: []string{}, Parameters: map[string]string{}})
	}
	return Pipeline{Name: name, Steps: steps}
}
