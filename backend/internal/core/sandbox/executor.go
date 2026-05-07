package sandbox

import (
	"fmt"
	"strings"
	"time"
)

type ExecResult struct {
	Stdout   string    `json:"stdout"`
	Stderr   string    `json:"stderr"`
	ExitCode int       `json:"exitCode"`
	Finished time.Time `json:"finished"`
}

func Execute(spec ContainerSpec) ExecResult {
	if err := ValidateSpec(spec); err != nil {
		return ExecResult{
			Stdout:   "",
			Stderr:   err.Error(),
			ExitCode: 1,
			Finished: time.Now().UTC(),
		}
	}

	command := strings.Join(spec.Command, " ")
	summary := fmt.Sprintf("sandbox execution dispatched: %s", command)
	if spec.Image != "" {
		summary = fmt.Sprintf("%s (image=%s)", summary, spec.Image)
	}

	return ExecResult{
		Stdout:   summary,
		Stderr:   "",
		ExitCode: 0,
		Finished: time.Now().UTC(),
	}
}
