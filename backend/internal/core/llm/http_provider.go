package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type HTTPProvider struct {
	providerName string
	baseURL      string
	apiKey       string
	client       *http.Client
}

func NewHTTPProvider(name, baseURL, apiKey string) *HTTPProvider {
	return &HTTPProvider{
		providerName: name,
		baseURL:      baseURL,
		apiKey:       apiKey,
		client:       &http.Client{Timeout: 45 * time.Second},
	}
}

func (p *HTTPProvider) Name() string {
	return p.providerName
}

func (p *HTTPProvider) Complete(ctx context.Context, req CompletionRequest) (CompletionResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return CompletionResponse{}, err
	}
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, p.baseURL, bytes.NewReader(body))
	if err != nil {
		return CompletionResponse{}, err
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", p.apiKey))

	res, err := p.client.Do(httpReq)
	if err != nil {
		return CompletionResponse{}, err
	}
	defer res.Body.Close()

	if res.StatusCode >= 300 {
		return CompletionResponse{}, fmt.Errorf("provider %s returned status %d", p.providerName, res.StatusCode)
	}

	var parsed CompletionResponse
	if err := json.NewDecoder(res.Body).Decode(&parsed); err != nil {
		return CompletionResponse{}, err
	}
	if parsed.Provider == "" {
		parsed.Provider = p.providerName
	}
	return parsed, nil
}
