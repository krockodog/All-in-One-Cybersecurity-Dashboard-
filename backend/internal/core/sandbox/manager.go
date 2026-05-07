package sandbox

import (
	"fmt"
	"strings"
)

type ContainerSpec struct {
	Image      string           `json:"image"`
	Command    []string         `json:"command"`
	WorkingDir string           `json:"workingDir"`
	Env        map[string]string `json:"env"`
	TimeoutSec int             `json:"timeoutSec"`
	Profile    IsolationProfile `json:"profile"`
}

type ExecutionRequest struct {
	Image   string            `json:"image"`
	Tool    string            `json:"tool"`
	Target  string            `json:"target"`
	Args    []string          `json:"args"`
	Env     map[string]string `json:"env"`
	Profile *IsolationProfile `json:"profile,omitempty"`
}

type Manager struct {
	defaultTimeoutSec int
	defaultProfile    IsolationProfile
}

func NewManager() *Manager {
	return &Manager{
		defaultTimeoutSec: 900,
		defaultProfile:    DefaultIsolation(),
	}
}

func BuildContainerSpec(image string, command []string) ContainerSpec {
	manager := NewManager()
	return manager.BuildSpec(ExecutionRequest{
		Image: image,
		Args:  command,
	})
}

func ValidateSpec(spec ContainerSpec) error {
	return validateSpec(spec)
}

func (m *Manager) BuildSpec(request ExecutionRequest) ContainerSpec {
	command := buildCommand(request.Tool, request.Target, request.Args)
	profile := m.defaultProfile
	if request.Profile != nil {
		profile = *request.Profile
	}

	return ContainerSpec{
		Image:      request.Image,
		Command:    command,
		WorkingDir: "/workspace",
		Env:        request.Env,
		TimeoutSec: m.defaultTimeoutSec,
		Profile:    profile,
	}
}

func (m *Manager) PrepareSpec(request ExecutionRequest) (ContainerSpec, error) {
	spec := m.BuildSpec(request)
	if err := validateSpec(spec); err != nil {
		return ContainerSpec{}, err
	}
	return spec, nil
}

func validateSpec(spec ContainerSpec) error {
	if strings.TrimSpace(spec.Image) == "" {
		return fmt.Errorf("image is required")
	}
	if len(spec.Command) == 0 {
		return fmt.Errorf("command is required")
	}
	if spec.TimeoutSec <= 0 {
		return fmt.Errorf("timeoutSec must be > 0")
	}
	if strings.TrimSpace(spec.Profile.NetworkMode) == "" {
		return fmt.Errorf("profile.networkMode is required")
	}
	return nil
}

func buildCommand(tool, target string, args []string) []string {
	parts := make([]string, 0, len(args)+2)
	if trimmedTool := strings.TrimSpace(tool); trimmedTool != "" {
		parts = append(parts, trimmedTool)
	}
	if trimmedTarget := strings.TrimSpace(target); trimmedTarget != "" {
		parts = append(parts, trimmedTarget)
	}
	parts = append(parts, args...)
	return parts
}
