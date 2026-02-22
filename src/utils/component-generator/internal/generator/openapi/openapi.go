package openapi

import (
	"fmt"
	"os"
	"strings"

	"component-generator/internal/generator/domain"
	"component-generator/internal/migration"
	"component-generator/internal/model"
)

// GenerateOpenAPIFiles generates {singular}.openapi.ts and prints integration steps.
func GenerateOpenAPIFiles(config model.ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := domain.Capitalize(singular)
	plural := config.PluralName

	// Generate domain/entities/{singular}.openapi.ts
	content := buildOpenAPISchemeContent(config, singular, singularCap)
	openapiPath := fmt.Sprintf("%s/domain/entities/%s.openapi.ts", basePath, singular)
	if err := os.WriteFile(openapiPath, []byte(content), 0o644); err != nil {
		fmt.Printf("Warning: could not write %s: %v\n", openapiPath, err)
	} else {
		fmt.Printf("Created file: %s\n", openapiPath)
	}

	fmt.Printf("\n=== OpenAPI / Swagger ===\n")
	fmt.Printf("• Controller: %s/interface/%s.controller.ts (JSDoc @swagger)\n", basePath, singular)
	fmt.Printf("• Schema: %s/domain/entities/%s.openapi.ts\n", basePath, singular)
	fmt.Printf("• Config: src/config/openapi.ts (apis pattern: dist/api/v1/components/<name>/interface/*.js)\n\n")

	fmt.Printf("=== Required: register schema in src/config/openapi.ts ===\n")
	fmt.Printf("1. Add import: import { %sOpenapiScheme } from '../api/v1/components/%s/domain/entities/%s.openapi'\n", singularCap, plural, singular)
	fmt.Printf("2. In definition.components.schemas add: %s: %sOpenapiScheme,\n\n", singularCap, singularCap)

	fmt.Printf("=== JSDoc note ===\n")
	fmt.Printf("• Do not use the sequence */ inside JSDoc comment text (e.g. use <path> instead of * in path examples).\n\n")

	fmt.Printf("=== Links ===\n")
	fmt.Printf("• Swagger UI: http://localhost:1234/api-docs\n")
	fmt.Printf("• JSON spec: http://localhost:1234/api-docs.json\n")
}

// buildOpenAPISchemeContent returns TypeScript content for the OpenAPI scheme object.
func buildOpenAPISchemeContent(config model.ComponentConfig, singular, singularCap string) string {
	var b strings.Builder
	b.WriteString(fmt.Sprintf("export const %sOpenapiScheme = {\n", singularCap))
	b.WriteString("    type: 'object',\n")
	b.WriteString("    properties: {\n")

	fields := config.TableFields
	if len(fields) == 0 {
		b.WriteString("        id: { type: 'integer', description: 'Id' },\n")
		b.WriteString("        name: { type: 'string', description: 'Name' }\n")
		b.WriteString("    },\n    required: ['name']\n}\n")
		return b.String()
	}

	for _, f := range fields {
		tsType := migration.MapSQLTypeToTypeScript(f.Type)
		openapiType, format := tsToOpenAPI(tsType)
		line := fmt.Sprintf("        %s: { type: '%s'", f.Name, openapiType)
		if format != "" {
			line += fmt.Sprintf(", format: '%s'", format)
		}
		line += fmt.Sprintf(", description: '%s' },\n", f.Name)
		b.WriteString(line)
	}
	b.WriteString("    },\n")

	// required: non-nullable fields or just first non-id
	var required []string
	for _, f := range fields {
		if strings.EqualFold(f.Name, "id") {
			continue
		}
		if !f.Nullable {
			required = append(required, f.Name)
		}
	}
	if len(required) == 0 && len(fields) > 0 {
		for _, f := range fields {
			if !strings.EqualFold(f.Name, "id") {
				required = []string{f.Name}
				break
			}
		}
	}
	b.WriteString("    required: ")
	if len(required) == 0 {
		b.WriteString("[]\n}\n")
	} else {
		quoted := make([]string, len(required))
		for i, r := range required {
			quoted[i] = "'" + r + "'"
		}
		b.WriteString(fmt.Sprintf("[%s]\n}\n", strings.Join(quoted, ", ")))
	}
	return b.String()
}

func tsToOpenAPI(tsType string) (openapiType, format string) {
	switch tsType {
	case "number":
		return "integer", ""
	case "string":
		return "string", ""
	case "boolean":
		return "boolean", ""
	case "Date":
		return "string", "date-time"
	default:
		return "string", ""
	}
}
