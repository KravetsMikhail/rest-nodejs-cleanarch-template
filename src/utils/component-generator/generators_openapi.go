package main

import (
	"fmt"
)

func generateOpenAPIFiles(config ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := capitalize(singular)
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
	
	fmt.Printf("=== Example Generated Annotations ===\n")
	fmt.Printf("/**\n")
	fmt.Printf(" * @swagger\n")
	fmt.Printf(" * /%s:\n", plural)
	fmt.Printf(" *   get:\n")
	fmt.Printf(" *     summary: Get list of %s\n", plural)
	fmt.Printf(" *     tags: [%s]\n", plural)
	fmt.Printf(" *     security:\n")
	fmt.Printf(" *       - JWT: [read]\n")
	fmt.Printf(" *     responses:\n")
	fmt.Printf(" *       200:\n")
	fmt.Printf(" *         description: List of %s\n", plural)
	fmt.Printf(" */\n")
}