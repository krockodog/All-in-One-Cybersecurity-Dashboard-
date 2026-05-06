package store

import (
	"errors"
	"sync"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"omnius/backend/internal/models"
)

type DashboardStats struct {
	TotalPentests    int `json:"totalPentests"`
	ActivePentests   int `json:"activePentests"`
	CriticalFindings int `json:"criticalFindings"`
	HighFindings     int `json:"highFindings"`
	MediumFindings   int `json:"mediumFindings"`
}

type Store struct {
	mu       sync.RWMutex
	Targets  map[string]models.Target
	Pentests map[string]models.Pentest
	Findings map[string]models.Finding
	Plugins  map[string]models.Plugin
	Users    map[string]models.User
	Settings map[string]models.Settings
	AuditLog []map[string]string
}

func New(adminEmail, adminPassword string) (*Store, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	admin := models.User{
		ID:         uuid.NewString(),
		Username:   "admin",
		Email:      adminEmail,
		Password:   string(hash),
		Role:       models.RoleAdmin,
		LLMConfigs: map[string]models.LLMConfig{},
		APIKeys:    map[string]string{},
		CreatedAt:  now,
	}

	defaultSettings := models.Settings{
		General: models.GeneralSettings{
			Theme:              "dark",
			Language:           "en",
			RateLimitRPS:       5,
			TimeoutSec:         900,
			OutputVerbosity:    "normal",
			NotificationsEmail: true,
			NotificationsInApp: true,
		},
		LLM:      map[string]models.LLMConfig{},
		External: map[string]string{},
	}

	return &Store{
		Targets:  map[string]models.Target{},
		Pentests: map[string]models.Pentest{},
		Findings: map[string]models.Finding{},
		Plugins:  map[string]models.Plugin{},
		Users:    map[string]models.User{admin.ID: admin},
		Settings: map[string]models.Settings{admin.ID: defaultSettings},
		AuditLog: make([]map[string]string, 0, 128),
	}, nil
}

func (s *Store) ListTargets() []models.Target {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.Target, 0, len(s.Targets))
	for _, target := range s.Targets {
		out = append(out, target)
	}
	return out
}

func (s *Store) CreateTarget(input models.CreateTargetInput, userID string) models.Target {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now().UTC()
	t := models.Target{
		ID:            uuid.NewString(),
		Name:          input.Name,
		Type:          input.Type,
		Value:         input.Value,
		Tags:          input.Tags,
		Metadata:      input.Metadata,
		FindingsCount: 0,
		CreatedAt:     now,
		UpdatedAt:     now,
		UserID:        userID,
	}
	s.Targets[t.ID] = t
	s.appendAudit("target.create", userID, t.ID)
	return t
}

func (s *Store) DeleteTarget(id, userID string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.Targets[id]; !ok {
		return false
	}
	delete(s.Targets, id)
	s.appendAudit("target.delete", userID, id)
	return true
}

func (s *Store) CreatePentest(input models.CreatePentestInput, userID string) models.Pentest {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now().UTC()
	p := models.Pentest{
		ID:        uuid.NewString(),
		Name:      input.Name,
		Mode:      input.Mode,
		Status:    models.PentestStatusDraft,
		TargetIDs: input.TargetIDs,
		ToolIDs:   input.ToolIDs,
		Pipeline:  input.Pipeline,
		CreatedAt: now,
		UpdatedAt: now,
		UserID:    userID,
	}
	s.Pentests[p.ID] = p
	s.appendAudit("pentest.create", userID, p.ID)
	return p
}

func (s *Store) ListPentests() []models.Pentest {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.Pentest, 0, len(s.Pentests))
	for _, pentest := range s.Pentests {
		out = append(out, pentest)
	}
	return out
}

func (s *Store) UpdatePentestStatus(id string, status models.PentestStatus, userID string) (models.Pentest, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	p, ok := s.Pentests[id]
	if !ok {
		return models.Pentest{}, errors.New("pentest not found")
	}
	now := time.Now().UTC()
	p.Status = status
	p.UpdatedAt = now
	if status == models.PentestStatusRunning {
		p.StartedAt = &now
	}
	if status == models.PentestStatusCompleted || status == models.PentestStatusStopped {
		p.CompletedAt = &now
	}
	s.Pentests[id] = p
	s.appendAudit("pentest.status", userID, id)
	return p, nil
}

func (s *Store) SetAuthorization(id string, record models.AuthorizationRecord, userID string) (models.Pentest, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	p, ok := s.Pentests[id]
	if !ok {
		return models.Pentest{}, errors.New("pentest not found")
	}
	p.Authorization = &record
	p.Status = models.PentestStatusAuthorized
	p.UpdatedAt = time.Now().UTC()
	s.Pentests[id] = p
	s.appendAudit("pentest.authorize", userID, id)
	return p, nil
}

func (s *Store) CreateFinding(input models.CreateFindingInput, userID string) models.Finding {
	s.mu.Lock()
	defer s.mu.Unlock()
	f := models.Finding{
		ID:          uuid.NewString(),
		Name:        input.Name,
		Description: input.Description,
		Severity:    input.Severity,
		CVSS:        input.CVSS,
		EPSS:        input.EPSS,
		CVE:         input.CVE,
		CWE:         input.CWE,
		NIST:        input.NIST,
		Tool:        input.Tool,
		TargetID:    input.TargetID,
		PentestID:   input.PentestID,
		Evidence:    input.Evidence,
		Remediation: input.Remediation,
		Status:      models.FindingStatusOpen,
		CreatedAt:   time.Now().UTC(),
	}
	s.Findings[f.ID] = f
	if target, ok := s.Targets[f.TargetID]; ok {
		target.FindingsCount++
		s.Targets[f.TargetID] = target
	}
	s.appendAudit("finding.create", userID, f.ID)
	return f
}

func (s *Store) ListFindings() []models.Finding {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.Finding, 0, len(s.Findings))
	for _, finding := range s.Findings {
		out = append(out, finding)
	}
	return out
}

func (s *Store) ListPlugins() []models.Plugin {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.Plugin, 0, len(s.Plugins))
	for _, plugin := range s.Plugins {
		out = append(out, plugin)
	}
	return out
}

func (s *Store) UpsertPlugin(plugin models.Plugin, userID string) models.Plugin {
	s.mu.Lock()
	defer s.mu.Unlock()
	plugin.UpdatedAt = time.Now().UTC()
	if plugin.CreatedAt.IsZero() {
		plugin.CreatedAt = plugin.UpdatedAt
	}
	s.Plugins[plugin.Name] = plugin
	s.appendAudit("plugin.upsert", userID, plugin.Name)
	return plugin
}

func (s *Store) RemovePlugin(name, userID string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.Plugins[name]; !ok {
		return false
	}
	delete(s.Plugins, name)
	s.appendAudit("plugin.remove", userID, name)
	return true
}

func (s *Store) FindUserByEmail(email string) (models.User, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, user := range s.Users {
		if user.Email == email {
			return user, true
		}
	}
	return models.User{}, false
}

func (s *Store) ListUsers() []models.User {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]models.User, 0, len(s.Users))
	for _, user := range s.Users {
		user.Password = ""
		out = append(out, user)
	}
	return out
}

func (s *Store) UpdateUserRole(id string, role models.UserRole, actorID string) (models.User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	user, ok := s.Users[id]
	if !ok {
		return models.User{}, errors.New("user not found")
	}
	user.Role = role
	s.Users[id] = user
	s.appendAudit("user.role", actorID, id)
	user.Password = ""
	return user, nil
}

func (s *Store) GetSettings(userID string) models.Settings {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if value, ok := s.Settings[userID]; ok {
		return value
	}
	return models.Settings{}
}

func (s *Store) UpsertSettings(userID string, settings models.Settings) models.Settings {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.Settings[userID] = settings
	s.appendAudit("settings.update", userID, userID)
	return settings
}

func (s *Store) DashboardStats() DashboardStats {
	s.mu.RLock()
	defer s.mu.RUnlock()
	stats := DashboardStats{TotalPentests: len(s.Pentests)}
	for _, pentest := range s.Pentests {
		if pentest.Status == models.PentestStatusRunning {
			stats.ActivePentests++
		}
	}
	for _, finding := range s.Findings {
		switch finding.Severity {
		case models.SeverityCritical:
			stats.CriticalFindings++
		case models.SeverityHigh:
			stats.HighFindings++
		case models.SeverityMedium:
			stats.MediumFindings++
		}
	}
	return stats
}

func (s *Store) AuditEntries() []map[string]string {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]map[string]string, len(s.AuditLog))
	copy(out, s.AuditLog)
	return out
}

func (s *Store) appendAudit(action, userID, objectID string) {
	s.AuditLog = append(s.AuditLog, map[string]string{
		"action":   action,
		"userId":   userID,
		"objectId": objectID,
		"at":       time.Now().UTC().Format(time.RFC3339),
	})
}
