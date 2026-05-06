package agent

type RunSummary struct {
	Target        string             `json:"target"`
	ExecutedTasks int                `json:"executedTasks"`
	Findings      []ClassifiedFinding `json:"findings"`
}

func Run(target string, targetType string) RunSummary {
	plan := BuildMitrePlan(targetType)
	findings := make([]ClassifiedFinding, 0, 16)
	runs := 0
	for _, step := range plan {
		for _, tool := range step.Tools {
			result := ExecuteTask(step.Phase, tool, target)
			runs++
			for _, finding := range AnalyzeResult(result) {
				if VerifyFinding(finding) {
					findings = append(findings, finding)
				}
			}
		}
	}
	return RunSummary{Target: target, ExecutedTasks: runs, Findings: findings}
}
