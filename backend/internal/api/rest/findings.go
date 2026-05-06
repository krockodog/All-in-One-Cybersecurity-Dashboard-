package rest

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"omnius/backend/internal/auth"
	"omnius/backend/internal/models"
	"omnius/backend/internal/store"
)

type FindingsHandler struct {
	Store *store.Store
}

func (h *FindingsHandler) Routes() chi.Router {
	r := chi.NewRouter()
	r.Get("/", h.list)
	r.Post("/", h.create)
	r.Get("/risk-matrix", h.riskMatrix)
	return r
}

func (h *FindingsHandler) list(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"data": h.Store.ListFindings()})
}

func (h *FindingsHandler) create(w http.ResponseWriter, r *http.Request) {
	claims, ok := auth.ClaimsFromContext(r.Context())
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	var input models.CreateFindingInput
	if err := decodeJSON(r, &input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	if input.Name == "" || input.PentestID == "" || input.TargetID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "name, pentestId and targetId are required"})
		return
	}
	created := h.Store.CreateFinding(input, claims.UserID)
	writeJSON(w, http.StatusCreated, map[string]any{"data": created})
}

func (h *FindingsHandler) riskMatrix(w http.ResponseWriter, _ *http.Request) {
	findings := h.Store.ListFindings()
	grid := make([][]int, 5)
	for i := range grid {
		grid[i] = make([]int, 5)
	}
	for _, finding := range findings {
		x, y := 2, 2
		switch finding.Severity {
		case models.SeverityCritical:
			x, y = 4, 4
		case models.SeverityHigh:
			x, y = 3, 3
		case models.SeverityMedium:
			x, y = 2, 2
		case models.SeverityLow:
			x, y = 1, 1
		case models.SeverityInfo:
			x, y = 0, 0
		}
		grid[y][x]++
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"labels": map[string][]string{
			"likelihood": {"Very Unlikely", "Unlikely", "Possible", "Likely", "Almost Certain"},
			"impact":     {"Negligible", "Minor", "Moderate", "Major", "Catastrophic"},
		},
		"matrix": grid,
	})
}
