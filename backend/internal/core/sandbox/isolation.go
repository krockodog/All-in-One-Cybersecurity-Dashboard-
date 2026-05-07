package sandbox

type IsolationProfile struct {
	ReadOnlyRootFS bool   `json:"readOnlyRootFs"`
	NetworkMode    string `json:"networkMode"`
	CPULimit       string `json:"cpuLimit"`
	MemoryLimit    string `json:"memoryLimit"`
}

func DefaultIsolation() IsolationProfile {
	return IsolationProfile{
		ReadOnlyRootFS: true,
		NetworkMode:    "internal",
		CPULimit:       "1.0",
		MemoryLimit:    "1g",
	}
}
