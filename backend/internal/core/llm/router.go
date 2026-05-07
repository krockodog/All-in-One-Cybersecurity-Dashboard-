package llm

import (
	"context"
	"errors"
	"sync"
	"time"
)

type Router struct {
	providers map[string]Provider
	order     []string
	mu        sync.Mutex
	costs     map[string]float64
	lastHit   map[string]time.Time
	minGap    time.Duration
}

func NewRouter(minGap time.Duration, providers ...Provider) *Router {
	m := map[string]Provider{}
	order := make([]string, 0, len(providers))
	for _, provider := range providers {
		m[provider.Name()] = provider
		order = append(order, provider.Name())
	}
	return &Router{
		providers: m,
		order:     order,
		costs:     map[string]float64{},
		lastHit:   map[string]time.Time{},
		minGap:    minGap,
	}
}

func (r *Router) Complete(ctx context.Context, req CompletionRequest) (CompletionResponse, error) {
	if req.Provider != "" {
		provider, ok := r.providers[req.Provider]
		if !ok {
			return CompletionResponse{}, errors.New("provider not registered")
		}
		return r.callProvider(ctx, provider, req)
	}

	var lastErr error
	for _, name := range r.order {
		provider := r.providers[name]
		response, err := r.callProvider(ctx, provider, req)
		if err == nil {
			return response, nil
		}
		lastErr = err
	}
	if lastErr == nil {
		lastErr = errors.New("no provider available")
	}
	return CompletionResponse{}, lastErr
}

func (r *Router) callProvider(ctx context.Context, provider Provider, req CompletionRequest) (CompletionResponse, error) {
	r.mu.Lock()
	last := r.lastHit[provider.Name()]
	if since := time.Since(last); since < r.minGap {
		wait := r.minGap - since
		r.mu.Unlock()
		select {
		case <-ctx.Done():
			return CompletionResponse{}, ctx.Err()
		case <-time.After(wait):
		}
		r.mu.Lock()
	}
	r.lastHit[provider.Name()] = time.Now().UTC()
	r.mu.Unlock()

	response, err := provider.Complete(ctx, req)
	if err != nil {
		return CompletionResponse{}, err
	}
	r.mu.Lock()
	r.costs[provider.Name()] += response.TotalCost
	r.mu.Unlock()
	return response, nil
}

func (r *Router) Costs() map[string]float64 {
	r.mu.Lock()
	defer r.mu.Unlock()
	out := make(map[string]float64, len(r.costs))
	for name, cost := range r.costs {
		out[name] = cost
	}
	return out
}
