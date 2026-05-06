package sandbox

import "time"

type ExecResult struct {
	Stdout   string    `json:"stdout"`
	Stderr   string    `json:"stderr"`
	ExitCode int       `json:"exitCode"`
	Finished time.Time `json:"finished"`
}

func Execute(spec ContainerSpec) ExecResult {
	_ = spec
	return ExecResult{
		Stdout:   "sandbox execution dispatched",
		Stderr:   "",
		ExitCode: 0,
		Finished: time.Now().UTC(),
	}
}
