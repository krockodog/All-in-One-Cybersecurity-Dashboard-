package llm

func NewOpenRouterProvider(endpoint, apiKey string) Provider {
	return NewHTTPProvider("openrouter", endpoint, apiKey)
}
