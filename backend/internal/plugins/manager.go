package plugins

import (
	"path/filepath"

	"omnius/backend/internal/models"
)

type Manager struct {
	registry *Registry
}

func NewManager(registry *Registry) *Manager {
	return &Manager{registry: registry}
}

func (m *Manager) LoadDirectory(path string) ([]models.Plugin, error) {
	matches, err := filepath.Glob(filepath.Join(path, "*.yaml"))
	if err != nil {
		return nil, err
	}
	loaded := make([]models.Plugin, 0, len(matches))
	for _, file := range matches {
		plugin, parseErr := ParsePluginFile(file)
		if parseErr != nil {
			continue
		}
		m.registry.Set(plugin)
		loaded = append(loaded, plugin)
	}
	return loaded, nil
}

func (m *Manager) Enable(name string) {
	pluginList := m.registry.List()
	for _, plugin := range pluginList {
		if plugin.Name == name {
			plugin.Enabled = true
			m.registry.Set(plugin)
		}
	}
}
