package llm

func NewOpenAIProvider(endpoint, apiKey string) Provider {
	return NewHTTPProvider("openai", endpoint, apiKey)
}
