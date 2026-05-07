package models

import "time"

type TargetType string

const (
	TargetTypeDomain   TargetType = "domain"
	TargetTypeIP       TargetType = "ip"
	TargetTypeCIDR     TargetType = "cidr"
	TargetTypeURL      TargetType = "url"
	TargetTypeEmail    TargetType = "email"
	TargetTypeUsername TargetType = "username"
	TargetTypePhone    TargetType = "phone"
	TargetTypeAddress  TargetType = "address"
)

type Target struct {
	ID           string            `json:"id"`
	Name         string            `json:"name"`
	Type         TargetType        `json:"type"`
	Value        string            `json:"value"`
	Tags         []string          `json:"tags"`
	Metadata     map[string]string `json:"metadata"`
	LastScanAt   *time.Time        `json:"lastScanAt,omitempty"`
	FindingsCount int              `json:"findingsCount"`
	CreatedAt    time.Time         `json:"createdAt"`
	UpdatedAt    time.Time         `json:"updatedAt"`
	UserID       string            `json:"userId"`
}

type CreateTargetInput struct {
	Name     string            `json:"name"`
	Type     TargetType        `json:"type"`
	Value    string            `json:"value"`
	Tags     []string          `json:"tags"`
	Metadata map[string]string `json:"metadata"`
}
