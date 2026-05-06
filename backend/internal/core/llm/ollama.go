package llm

func NewOllamaProvider(endpoint, apiKey string) Provider {
	return NewHTTPProvider("ollama", endpoint, apiKey)
}
