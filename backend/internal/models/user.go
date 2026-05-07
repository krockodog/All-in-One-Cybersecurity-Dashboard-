package models

import "time"

type UserRole string

const (
	RoleAdmin     UserRole = "admin"
	RolePentester UserRole = "pentester"
	RoleViewer    UserRole = "viewer"
	RoleAuditor   UserRole = "auditor"
)

type LLMConfig struct {
	Provider    string  `json:"provider"`
	Model       string  `json:"model"`
	APIKeyRef   string  `json:"apiKeyRef"`
	Temperature float64 `json:"temperature"`
	MaxTokens   int     `json:"maxTokens"`
	Endpoint    string  `json:"endpoint,omitempty"`
}

type User struct {
	ID         string              `json:"id"`
	Username   string              `json:"username"`
	Email      string              `json:"email"`
	Password   string              `json:"-"`
	Role       UserRole            `json:"role"`
	LLMConfigs map[string]LLMConfig `json:"llmConfigs"`
	APIKeys    map[string]string   `json:"apiKeys"`
	CreatedAt  time.Time           `json:"createdAt"`
}

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
