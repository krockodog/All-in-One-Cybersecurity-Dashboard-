package engine

type Step struct {
	Tool       string   `json:"tool"`
	DependsOn  []string `json:"dependsOn"`
	Parameters map[string]string `json:"parameters"`
}

type Pipeline struct {
	Name  string `json:"name"`
	Steps []Step `json:"steps"`
}
