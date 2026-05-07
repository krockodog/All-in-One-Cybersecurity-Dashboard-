package models

import "time"

type ToolDefinition struct {
	Name         string            `json:"name" yaml:"name"`
	Description  string            `json:"description" yaml:"description"`
	Category     string            `json:"category" yaml:"category"`
	Container    string            `json:"container" yaml:"container"`
	Command      string            `json:"command" yaml:"command"`
	OutputParser string            `json:"outputParser" yaml:"output_parser"`
	TimeoutSec   int               `json:"timeoutSec" yaml:"timeout"`
	Parameters   map[string]string `json:"parameters" yaml:"parameters"`
}

type Plugin struct {
	Name        string            `json:"name" yaml:"name"`
	Version     string            `json:"version" yaml:"version"`
	Description string            `json:"description" yaml:"description"`
	Author      string            `json:"author" yaml:"author"`
	Category    string            `json:"category" yaml:"category"`
	Container   string            `json:"container" yaml:"container"`
	Enabled     bool              `json:"enabled" yaml:"enabled"`
	Config      map[string]string `json:"config" yaml:"config"`
	Tools       []ToolDefinition  `json:"tools" yaml:"tools"`
	CreatedAt   time.Time         `json:"createdAt"`
	UpdatedAt   time.Time         `json:"updatedAt"`
}
