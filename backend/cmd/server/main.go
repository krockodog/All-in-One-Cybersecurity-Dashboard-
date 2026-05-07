package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/rs/zerolog"
	"golang.org/x/crypto/bcrypt"

	"omnius/backend/internal/api/graph"
	"omnius/backend/internal/api/rest"
	"omnius/backend/internal/auth"
	"omnius/backend/internal/core/llm"
	"omnius/backend/internal/models"
	"omnius/backend/internal/store"
	"omnius/backend/internal/ws"
)

type app struct {
	store     *store.Store
	jwt       *auth.JWTManager
	gate      *auth.AuthorizationGate
	hub       *ws.Hub
	llmRouter *llm.Router
	log       zerolog.Logger
}

func main() {
	zerolog.TimeFieldFormat = time.RFC3339
	logger := zerolog.New(os.Stdout).With().Timestamp().Logger()

	jwtSecret := mustEnv("JWT_SECRET")
	adminEmail := mustEnv("ADMIN_EMAIL")
	adminPassword := mustEnv("ADMIN_PASSWORD")

	dataStore, err := store.New(adminEmail, adminPassword)
	if err != nil {
		logger.Fatal().Err(err).Msg("failed to initialize store")
	}

	hub := ws.NewHub()
	gate := auth.NewAuthorizationGate(func(pentestID string) {
		_, _ = dataStore.UpdatePentestStatus(pentestID, models.PentestStatusStopped, "kill-switch")
		hub.Broadcast(pentestID, "error", "Kill-switch activated: pentest stopped")
	})

	llmRouter := llm.NewRouter(250*time.Millisecond, buildProviders()...)

	a := &app{
		store:     dataStore,
		jwt:       auth.NewJWTManager(jwtSecret),
		gate:      gate,
		hub:       hub,
		llmRouter: llmRouter,
		log:       logger,
	}

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	r.Use(a.requestLogger)

	graphqlHandler, err := graph.NewHandler(a.store)
	if err != nil {
		logger.Fatal().Err(err).Msg("failed to initialize graphql")
	}

	r.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok", "service": "omnius-backend"})
	})

	r.Get("/playground", func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte(`<!doctype html>
<html><head><title>OMNIUS GraphQL Playground</title></head>
<body style="font-family: monospace; background:#0b0f14; color:#00ff41; padding:24px;">
<h2>OMNIUS GraphQL</h2>
<p>POST queries to <code>/graphql</code></p>
</body></html>`))
	})
	r.Handle("/graphql", graphqlHandler)
	r.Handle("/ws/pentest/{id}", a.hub)

	r.Route("/api/v1", func(api chi.Router) {
		api.Post("/auth/login", a.login)

		api.Group(func(protected chi.Router) {
			protected.Use(a.jwt.Middleware)

			protected.Mount("/targets", (&rest.TargetsHandler{Store: a.store}).Routes())
			protected.Mount("/pentests", (&rest.PentestsHandler{Store: a.store, Gate: a.gate, Hub: a.hub}).Routes())
			protected.Mount("/findings", (&rest.FindingsHandler{Store: a.store}).Routes())
			protected.Mount("/plugins", (&rest.PluginsHandler{Store: a.store}).Routes())
			protected.Mount("/settings", (&rest.SettingsHandler{Store: a.store}).Routes())
			protected.With(auth.RequireRole(models.RoleAdmin)).Mount("/users", (&rest.UsersHandler{Store: a.store}).Routes())

			protected.Get("/dashboard/stats", func(w http.ResponseWriter, _ *http.Request) {
				w.Header().Set("Content-Type", "application/json")
				_ = json.NewEncoder(w).Encode(map[string]any{"data": a.store.DashboardStats()})
			})

			protected.Post("/llm/complete", a.complete)
		})
	})

	port := mustEnv("PORT")
	server := &http.Server{
		Addr:              ":" + port,
		Handler:           r,
		ReadHeaderTimeout: 15 * time.Second,
	}

	go func() {
		logger.Info().Str("port", port).Msg("OMNIUS backend started")
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Fatal().Err(err).Msg("server crashed")
		}
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		logger.Error().Err(err).Msg("graceful shutdown failed")
	}
	logger.Info().Msg("server stopped")
}

func (a *app) requestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		a.log.Info().
			Str("method", r.Method).
			Str("path", r.URL.Path).
			Dur("duration", time.Since(start)).
			Msg("request")
	})
}

func (a *app) login(w http.ResponseWriter, r *http.Request) {
	var input models.LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	user, ok := a.store.FindUserByEmail(strings.TrimSpace(input.Email))
	if !ok {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}
	tokens, err := a.jwt.Generate(user.ID, user.Role)
	if err != nil {
		http.Error(w, "token generation failed", http.StatusInternalServerError)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     "omnius_access_token",
		Value:    tokens.AccessToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   24 * 60 * 60,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "omnius_refresh_token",
		Value:    tokens.RefreshToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   7 * 24 * 60 * 60,
	})
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"accessToken":  tokens.AccessToken,
		"refreshToken": tokens.RefreshToken,
		"expiresInSec": tokens.ExpiresInSec,
		"user": map[string]any{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"role":     user.Role,
		},
	})
}

func (a *app) complete(w http.ResponseWriter, r *http.Request) {
	var req llm.CompletionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 45*time.Second)
	defer cancel()
	response, err := a.llmRouter.Complete(ctx, req)
	if err != nil {
		http.Error(w, fmt.Sprintf("llm error: %v", err), http.StatusBadGateway)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"data": response, "costs": a.llmRouter.Costs()})
}

func buildProviders() []llm.Provider {
	emergentKey := os.Getenv("EMERGENT_LLM_KEY")
	providers := make([]llm.Provider, 0, 5)

	if endpoint := os.Getenv("OPENAI_ENDPOINT"); endpoint != "" {
		apiKey := os.Getenv("OPENAI_API_KEY")
		if apiKey == "" {
			apiKey = emergentKey
		}
		if apiKey != "" {
			providers = append(providers, llm.NewOpenAIProvider(endpoint, apiKey))
		}
	}
	if endpoint := os.Getenv("ANTHROPIC_ENDPOINT"); endpoint != "" {
		apiKey := os.Getenv("ANTHROPIC_API_KEY")
		if apiKey == "" {
			apiKey = emergentKey
		}
		if apiKey != "" {
			providers = append(providers, llm.NewAnthropicProvider(endpoint, apiKey))
		}
	}
	if endpoint := os.Getenv("GOOGLE_ENDPOINT"); endpoint != "" {
		apiKey := os.Getenv("GOOGLE_API_KEY")
		if apiKey == "" {
			apiKey = emergentKey
		}
		if apiKey != "" {
			providers = append(providers, llm.NewGoogleProvider(endpoint, apiKey))
		}
	}
	if endpoint := os.Getenv("OLLAMA_ENDPOINT"); endpoint != "" {
		providers = append(providers, llm.NewOllamaProvider(endpoint, "local"))
	}
	if endpoint := os.Getenv("OPENROUTER_ENDPOINT"); endpoint != "" {
		if apiKey := os.Getenv("OPENROUTER_API_KEY"); apiKey != "" {
			providers = append(providers, llm.NewOpenRouterProvider(endpoint, apiKey))
		}
	}

	return providers
}

func mustEnv(key string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		panic(fmt.Sprintf("missing required env: %s", key))
	}
	return value
}
