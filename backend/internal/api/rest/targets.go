package rest

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"omnius/backend/internal/auth"
	"omnius/backend/internal/models"
	"omnius/backend/internal/store"
)

type TargetsHandler struct {
	Store *store.Store
}

func (h *TargetsHandler) Routes() chi.Router {
	r := chi.NewRouter()
	r.Get("/", h.list)
	r.Post("/", h.create)
	r.Delete("/{id}", h.remove)
	return r
}

func (h *TargetsHandler) list(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"data": h.Store.ListTargets()})
}

func (h *TargetsHandler) create(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.ClaimsFromContext(r.Context())
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	var input models.CreateTargetInput
	if err := decodeJSON(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	if input.Name == "" || input.Value == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "name and value are required"})
		return
	}
	created := h.Store.CreateTarget(input, claims.UserID)
	writeJSON(w, http.StatusCreated, map[string]any{"data": created})
}

func (h *TargetsHandler) remove(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.ClaimsFromContext(r.Context())
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	if !h.Store.DeleteTarget(chi.URLParam(r, "id"), claims.UserID) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "target not found"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}
