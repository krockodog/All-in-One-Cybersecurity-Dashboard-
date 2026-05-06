package llm

func NewGoogleProvider(endpoint, apiKey string) Provider {
	return NewHTTPProvider("google", endpoint, apiKey)
}
