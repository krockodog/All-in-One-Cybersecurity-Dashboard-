package rest

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"omnius/backend/internal/auth"
	"omnius/backend/internal/models"
	"omnius/backend/internal/store"
)

type UsersHandler struct {
	Store *store.Store
}

func (h *UsersHandler) Routes() chi.Router {
	r := chi.NewRouter()
	r.Get("/", h.list)
	r.Patch("/{id}/role", h.updateRole)
	r.Get("/audit", h.audit)
	return r
}

func (h *UsersHandler) list(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"data": h.Store.ListUsers()})
}

func (h *UsersHandler) updateRole(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.ClaimsFromContext(r.Context())
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	var payload struct {
		Role models.UserRole `json:"role"`
	}
	if err := decodeJSON(r, &payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	updated, err := h.Store.UpdateUserRole(chi.URLParam(r, "id"), payload.Role, claims.UserID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"data": updated})
}

func (h *UsersHandler) audit(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"data": h.Store.AuditEntries()})
}
