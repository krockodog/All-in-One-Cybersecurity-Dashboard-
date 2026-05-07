package llm

import "context"

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type CompletionRequest struct {
	Provider    string    `json:"provider"`
	Model       string    `json:"model"`
	Messages    []Message `json:"messages"`
	Temperature float64   `json:"temperature"`
	MaxTokens   int       `json:"maxTokens"`
}

type CompletionResponse struct {
	Provider   string  `json:"provider"`
	Model      string  `json:"model"`
	Content    string  `json:"content"`
	PromptCost float64 `json:"promptCost"`
	TotalCost  float64 `json:"totalCost"`
}

type Provider interface {
	Name() string
	Complete(ctx context.Context, req CompletionRequest) (CompletionResponse, error)
}
