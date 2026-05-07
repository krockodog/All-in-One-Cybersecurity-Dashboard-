package rest

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"omnius/backend/internal/auth"
	"omnius/backend/internal/models"
	"omnius/backend/internal/store"
)

type SettingsHandler struct {
	Store *store.Store
}

func (h *SettingsHandler) Routes() chi.Router {
	r := chi.NewRouter()
	r.Get("/", h.get)
	r.Put("/", h.update)
	return r
}

func (h *SettingsHandler) get(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.ClaimsFromContext(r.Context())
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	settings := h.Store.GetSettings(claims.UserID)
	writeJSON(w, http.StatusOK, map[string]any{"data": settings})
}

func (h *SettingsHandler) update(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.ClaimsFromContext(r.Context())
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	var settings models.Settings
	if err := decodeJSON(r, &settings); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	updated := h.Store.UpsertSettings(claims.UserID, settings)
	writeJSON(w, http.StatusOK, map[string]any{"data": updated})
}
