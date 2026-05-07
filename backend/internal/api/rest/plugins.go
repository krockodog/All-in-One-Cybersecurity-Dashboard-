package rest

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"omnius/backend/internal/auth"
	"omnius/backend/internal/models"
	"omnius/backend/internal/store"
)

type PluginsHandler struct {
	Store *store.Store
}

func (h *PluginsHandler) Routes() chi.Router {
	r := chi.NewRouter()
	r.Get("/", h.list)
	r.Post("/", h.install)
	r.Delete("/{name}", h.remove)
	return r
}

func (h *PluginsHandler) list(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"data": h.Store.ListPlugins()})
}

func (h *PluginsHandler) install(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.ClaimsFromContext(r.Context())
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	var plugin models.Plugin
	if err := decodeJSON(r, &plugin); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	if plugin.Name == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "plugin name is required"})
		return
	}
	plugin.Enabled = true
	plugin.UpdatedAt = time.Now().UTC()
	stored := h.Store.UpsertPlugin(plugin, claims.UserID)
	writeJSON(w, http.StatusCreated, map[string]any{"data": stored})
}

func (h *PluginsHandler) remove(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.ClaimsFromContext(r.Context())
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	if !h.Store.RemovePlugin(chi.URLParam(r, "name"), claims.UserID) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "plugin not found"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"removed": true})
}
