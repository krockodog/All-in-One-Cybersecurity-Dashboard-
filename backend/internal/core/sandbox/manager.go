package sandbox

import "fmt"

type ContainerSpec struct {
	Image     string           `json:"image"`
	Command   []string         `json:"command"`
	TimeoutSec int             `json:"timeoutSec"`
	Profile   IsolationProfile `json:"profile"`
}

func BuildContainerSpec(image string, command []string) ContainerSpec {
	return ContainerSpec{
		Image:      image,
		Command:    command,
		TimeoutSec: 900,
		Profile:    DefaultIsolation(),
	}
}

func ValidateSpec(spec ContainerSpec) error {
	if spec.Image == "" {
		return fmt.Errorf("image is required")
	}
	if len(spec.Command) == 0 {
		return fmt.Errorf("command is required")
	}
	return nil
}
