package plugins

import (
	"os"

	"gopkg.in/yaml.v3"

	"omnius/backend/internal/models"
)

func ParsePluginFile(path string) (models.Plugin, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return models.Plugin{}, err
	}
	var plugin models.Plugin
	if err := yaml.Unmarshal(raw, &plugin); err != nil {
		return models.Plugin{}, err
	}
	return plugin, nil
}
