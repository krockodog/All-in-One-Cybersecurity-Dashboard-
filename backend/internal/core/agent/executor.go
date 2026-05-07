package agent

import "time"

type TaskResult struct {
	Phase    string    `json:"phase"`
	Tool     string    `json:"tool"`
	Output   string    `json:"output"`
	Success  bool      `json:"success"`
	Finished time.Time `json:"finished"`
}

func ExecuteTask(phase, tool string, target string) TaskResult {
	output := "executed " + tool + " against " + target
	return TaskResult{
		Phase:    phase,
		Tool:     tool,
		Output:   output,
		Success:  true,
		Finished: time.Now().UTC(),
	}
}
