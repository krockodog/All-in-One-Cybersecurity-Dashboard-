package llm

func NewAnthropicProvider(endpoint, apiKey string) Provider {
	return NewHTTPProvider("anthropic", endpoint, apiKey)
}
