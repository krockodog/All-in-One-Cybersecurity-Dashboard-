package plugins

import "omnius/backend/internal/models"

type Registry struct {
	plugins map[string]models.Plugin
}

func NewRegistry() *Registry {
	return &Registry{plugins: map[string]models.Plugin{}}
}

func (r *Registry) Set(plugin models.Plugin) {
	r.plugins[plugin.Name] = plugin
}

func (r *Registry) Remove(name string) {
	delete(r.plugins, name)
}

func (r *Registry) List() []models.Plugin {
	out := make([]models.Plugin, 0, len(r.plugins))
	for _, plugin := range r.plugins {
		out = append(out, plugin)
	}
	return out
}
