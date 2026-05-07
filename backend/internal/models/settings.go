package models

type GeneralSettings struct {
	Theme              string `json:"theme"`
	Language           string `json:"language"`
	RateLimitRPS       int    `json:"rateLimitRps"`
	TimeoutSec         int    `json:"timeoutSec"`
	OutputVerbosity    string `json:"outputVerbosity"`
	NotificationsEmail bool   `json:"notificationsEmail"`
	NotificationsInApp bool   `json:"notificationsInApp"`
}

type Settings struct {
	General   GeneralSettings   `json:"general"`
	LLM       map[string]LLMConfig `json:"llm"`
	External  map[string]string `json:"external"`
}
