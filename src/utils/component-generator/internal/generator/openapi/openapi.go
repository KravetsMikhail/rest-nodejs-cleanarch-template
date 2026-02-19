package openapi

import (
	"fmt"

	"component-generator/internal/generator/domain"
	"component-generator/internal/model"
)

// GenerateOpenAPIFiles currently outputs integration info to console.
func GenerateOpenAPIFiles(config model.ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := domain.Capitalize(singular)
	plural := config.PluralName

	fmt.Printf("=== OpenAPI Documentation Generated ===\n")
	fmt.Printf("Component: %s (%s)\n\n", singularCap, plural)

	fmt.Printf("=== Manual Integration Required ===\n")
	fmt.Printf("The component generator now creates controllers with Swagger JSDoc annotations.\n")
	fmt.Printf("These annotations are automatically processed by swagger-jsdoc.\n\n")

	fmt.Printf("=== Generated Files with Swagger Support ===\n")
	fmt.Printf("1. Controller: %s/interface/%s.controller.ts (with JSDoc annotations)\n", basePath, singular)
	fmt.Printf("2. Swagger UI: http://localhost:1234/api-docs\n")
	fmt.Printf("3. JSON Spec: http://localhost:1234/api-docs.json\n\n")

	fmt.Printf("=== Integration Notes ===\n")
	fmt.Printf("• Controllers include @swagger annotations for all CRUD operations\n")
	fmt.Printf("• swagger-jsdoc automatically generates OpenAPI from JSDoc comments\n")
	fmt.Printf("• Schema definitions are managed in src/api/v1/openapi/openapi.yaml\n")
	fmt.Printf("• No manual OpenAPI editing required - use JSDoc annotations instead\n\n")

	fmt.Printf("=== GET list response (pagination) ===\n")
	fmt.Printf("GET /%s returns { data: %s[], pagination: { total, offset, limit } }\n", plural, singular)
	fmt.Printf("Ensure 'Pagination' schema is in src/config/openapi.ts (components.schemas).\n")
}
