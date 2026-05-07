package graph

import (
	"net/http"

	"github.com/graphql-go/graphql"
	"github.com/graphql-go/handler"

	"omnius/backend/internal/models"
	"omnius/backend/internal/store"
)

func NewHandler(dataStore *store.Store) (http.Handler, error) {
	targetType := graphql.NewObject(graphql.ObjectConfig{
		Name: "Target",
		Fields: graphql.Fields{
			"id":            &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"name":          &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"type":          &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"value":         &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"tags":          &graphql.Field{Type: graphql.NewList(graphql.String)},
			"findingsCount": &graphql.Field{Type: graphql.NewNonNull(graphql.Int)},
			"createdAt":     &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
		},
	})

	pentestType := graphql.NewObject(graphql.ObjectConfig{
		Name: "Pentest",
		Fields: graphql.Fields{
			"id":        &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"name":      &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"mode":      &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"status":    &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"targetIds": &graphql.Field{Type: graphql.NewList(graphql.String)},
			"toolIds":   &graphql.Field{Type: graphql.NewList(graphql.String)},
			"createdAt": &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
		},
	})

	findingType := graphql.NewObject(graphql.ObjectConfig{
		Name: "Finding",
		Fields: graphql.Fields{
			"id":        &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"name":      &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"severity":  &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"cvss":      &graphql.Field{Type: graphql.NewNonNull(graphql.Float)},
			"epss":      &graphql.Field{Type: graphql.NewNonNull(graphql.Float)},
			"cve":       &graphql.Field{Type: graphql.String},
			"tool":      &graphql.Field{Type: graphql.String},
			"pentestId": &graphql.Field{Type: graphql.String},
			"targetId":  &graphql.Field{Type: graphql.String},
			"createdAt": &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
		},
	})

	statsType := graphql.NewObject(graphql.ObjectConfig{
		Name: "DashboardStats",
		Fields: graphql.Fields{
			"totalPentests":    &graphql.Field{Type: graphql.NewNonNull(graphql.Int)},
			"activePentests":   &graphql.Field{Type: graphql.NewNonNull(graphql.Int)},
			"criticalFindings": &graphql.Field{Type: graphql.NewNonNull(graphql.Int)},
			"highFindings":     &graphql.Field{Type: graphql.NewNonNull(graphql.Int)},
			"mediumFindings":   &graphql.Field{Type: graphql.NewNonNull(graphql.Int)},
		},
	})

	queryType := graphql.NewObject(graphql.ObjectConfig{
		Name: "Query",
		Fields: graphql.Fields{
			"targets": &graphql.Field{
				Type: graphql.NewNonNull(graphql.NewList(graphql.NewNonNull(targetType))),
				Resolve: func(_ graphql.ResolveParams) (interface{}, error) {
					return dataStore.ListTargets(), nil
				},
			},
			"pentests": &graphql.Field{
				Type: graphql.NewNonNull(graphql.NewList(graphql.NewNonNull(pentestType))),
				Resolve: func(_ graphql.ResolveParams) (interface{}, error) {
					return dataStore.ListPentests(), nil
				},
			},
			"findings": &graphql.Field{
				Type: graphql.NewNonNull(graphql.NewList(graphql.NewNonNull(findingType))),
				Resolve: func(_ graphql.ResolveParams) (interface{}, error) {
					return dataStore.ListFindings(), nil
				},
			},
			"dashboardStats": &graphql.Field{
				Type: graphql.NewNonNull(statsType),
				Resolve: func(_ graphql.ResolveParams) (interface{}, error) {
					return dataStore.DashboardStats(), nil
				},
			},
		},
	})

	createTargetInput := graphql.NewInputObject(graphql.InputObjectConfig{
		Name: "CreateTargetInput",
		Fields: graphql.InputObjectConfigFieldMap{
			"name":  &graphql.InputObjectFieldConfig{Type: graphql.NewNonNull(graphql.String)},
			"type":  &graphql.InputObjectFieldConfig{Type: graphql.NewNonNull(graphql.String)},
			"value": &graphql.InputObjectFieldConfig{Type: graphql.NewNonNull(graphql.String)},
			"tags":  &graphql.InputObjectFieldConfig{Type: graphql.NewList(graphql.String)},
		},
	})

	createPentestInput := graphql.NewInputObject(graphql.InputObjectConfig{
		Name: "CreatePentestInput",
		Fields: graphql.InputObjectConfigFieldMap{
			"name":      &graphql.InputObjectFieldConfig{Type: graphql.NewNonNull(graphql.String)},
			"mode":      &graphql.InputObjectFieldConfig{Type: graphql.NewNonNull(graphql.String)},
			"targetIds": &graphql.InputObjectFieldConfig{Type: graphql.NewNonNull(graphql.NewList(graphql.NewNonNull(graphql.String)))},
			"toolIds":   &graphql.InputObjectFieldConfig{Type: graphql.NewList(graphql.String)},
		},
	})

	createFindingInput := graphql.NewInputObject(graphql.InputObjectConfig{
		Name: "CreateFindingInput",
		Fields: graphql.InputObjectConfigFieldMap{
			"name":      &graphql.InputObjectFieldConfig{Type: graphql.NewNonNull(graphql.String)},
			"severity":  &graphql.InputObjectFieldConfig{Type: graphql.NewNonNull(graphql.String)},
			"cvss":      &graphql.InputObjectFieldConfig{Type: graphql.NewNonNull(graphql.Float)},
			"epss":      &graphql.InputObjectFieldConfig{Type: graphql.NewNonNull(graphql.Float)},
			"pentestId": &graphql.InputObjectFieldConfig{Type: graphql.NewNonNull(graphql.String)},
			"targetId":  &graphql.InputObjectFieldConfig{Type: graphql.NewNonNull(graphql.String)},
			"tool":      &graphql.InputObjectFieldConfig{Type: graphql.NewNonNull(graphql.String)},
		},
	})

	mutationType := graphql.NewObject(graphql.ObjectConfig{
		Name: "Mutation",
		Fields: graphql.Fields{
			"createTarget": &graphql.Field{
				Type: graphql.NewNonNull(targetType),
				Args: graphql.FieldConfigArgument{
					"input": &graphql.ArgumentConfig{Type: graphql.NewNonNull(createTargetInput)},
				},
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					input := p.Args["input"].(map[string]interface{})
					tags := make([]string, 0)
					if rawTags, ok := input["tags"].([]interface{}); ok {
						for _, tag := range rawTags {
							tags = append(tags, tag.(string))
						}
					}
					created := dataStore.CreateTarget(models.CreateTargetInput{
						Name:  input["name"].(string),
						Type:  models.TargetType(input["type"].(string)),
						Value: input["value"].(string),
						Tags:  tags,
					}, "graphql")
					return created, nil
				},
			},
			"createPentest": &graphql.Field{
				Type: graphql.NewNonNull(pentestType),
				Args: graphql.FieldConfigArgument{
					"input": &graphql.ArgumentConfig{Type: graphql.NewNonNull(createPentestInput)},
				},
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					input := p.Args["input"].(map[string]interface{})
					targetIDs := make([]string, 0)
					if rawTargets, ok := input["targetIds"].([]interface{}); ok {
						for _, value := range rawTargets {
							targetIDs = append(targetIDs, value.(string))
						}
					}
					toolIDs := make([]string, 0)
					if rawTools, ok := input["toolIds"].([]interface{}); ok {
						for _, value := range rawTools {
							toolIDs = append(toolIDs, value.(string))
						}
					}
					created := dataStore.CreatePentest(models.CreatePentestInput{
						Name:      input["name"].(string),
						Mode:      models.PentestMode(input["mode"].(string)),
						TargetIDs: targetIDs,
						ToolIDs:   toolIDs,
					}, "graphql")
					return created, nil
				},
			},
			"createFinding": &graphql.Field{
				Type: graphql.NewNonNull(findingType),
				Args: graphql.FieldConfigArgument{
					"input": &graphql.ArgumentConfig{Type: graphql.NewNonNull(createFindingInput)},
				},
				Resolve: func(p graphql.ResolveParams) (interface{}, error) {
					input := p.Args["input"].(map[string]interface{})
					created := dataStore.CreateFinding(models.CreateFindingInput{
						Name:      input["name"].(string),
						Severity:  models.Severity(input["severity"].(string)),
						CVSS:      input["cvss"].(float64),
						EPSS:      input["epss"].(float64),
						PentestID: input["pentestId"].(string),
						TargetID:  input["targetId"].(string),
						Tool:      input["tool"].(string),
					}, "graphql")
					return created, nil
				},
			},
		},
	})

	schema, err := graphql.NewSchema(graphql.SchemaConfig{Query: queryType, Mutation: mutationType})
	if err != nil {
		return nil, err
	}

	return handler.New(&handler.Config{Schema: &schema, Pretty: true, GraphiQL: false}), nil
}
