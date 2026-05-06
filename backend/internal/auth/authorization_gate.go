package auth

import (
	"errors"
	"sync"
	"time"

	"omnius/backend/internal/models"
)

type AuthorizationGate struct {
	mu         sync.RWMutex
	records    map[string]models.AuthorizationRecord
	auditLogs  []map[string]string
	killSwitch func(string)
}

func NewAuthorizationGate(killSwitch func(string)) *AuthorizationGate {
	return &AuthorizationGate{
		records:    map[string]models.AuthorizationRecord{},
		auditLogs:  make([]map[string]string, 0, 64),
		killSwitch: killSwitch,
	}
}

func (g *AuthorizationGate) Authorize(pentestID, userID string, agreed bool, scope []string, scopeDocument string) (models.AuthorizationRecord, error) {
	if !agreed {
		return models.AuthorizationRecord{}, errors.New("tos confirmation is required")
	}
	if len(scope) == 0 {
		return models.AuthorizationRecord{}, errors.New("scope is required")
	}
	if scopeDocument == "" {
		return models.AuthorizationRecord{}, errors.New("scope document is required")
	}
	record := models.AuthorizationRecord{
		AgreedToTerms:  true,
		Scope:          scope,
		ScopeDocument:  scopeDocument,
		AuthorizedAt:   time.Now().UTC(),
		ExpiresAt:      time.Now().UTC().Add(24 * time.Hour),
		AuthorizedByID: userID,
	}

	g.mu.Lock()
	g.records[pentestID] = record
	g.auditLogs = append(g.auditLogs, map[string]string{
		"event":     "authorize",
		"pentestId": pentestID,
		"userId":    userID,
		"at":        record.AuthorizedAt.Format(time.RFC3339),
	})
	g.mu.Unlock()

	return record, nil
}

func (g *AuthorizationGate) Validate(pentestID string) bool {
	g.mu.RLock()
	record, ok := g.records[pentestID]
	g.mu.RUnlock()
	if !ok {
		return false
	}
	return time.Now().UTC().Before(record.ExpiresAt)
}

func (g *AuthorizationGate) Revoke(pentestID, userID string) {
	g.mu.Lock()
	delete(g.records, pentestID)
	g.auditLogs = append(g.auditLogs, map[string]string{
		"event":     "revoke",
		"pentestId": pentestID,
		"userId":    userID,
		"at":        time.Now().UTC().Format(time.RFC3339),
	})
	g.mu.Unlock()

	if g.killSwitch != nil {
		g.killSwitch(pentestID)
	}
}

func (g *AuthorizationGate) AuditLogs() []map[string]string {
	g.mu.RLock()
	defer g.mu.RUnlock()
	out := make([]map[string]string, len(g.auditLogs))
	copy(out, g.auditLogs)
	return out
}
