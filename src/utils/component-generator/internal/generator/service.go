package generator

import (
	"fmt"
	"os"

	"component-generator/internal/generator/domain"
	"component-generator/internal/generator/infrastructure"
	"component-generator/internal/generator/interfaceapi"
	"component-generator/internal/generator/openapi"
	"component-generator/internal/generator/usecase"
	"component-generator/internal/model"
)

// Service orchestrates generation of all layers for a component.
type Service struct{}

func NewService() *Service {
	return &Service{}
}

// Generate creates directory structure and all code files for component.
func (s *Service) Generate(config model.ComponentConfig) error {
	basePath := fmt.Sprintf("../../api/%s/components/%s", config.ApiVersion, config.PluralName)

	dirs := []string{
		fmt.Sprintf("%s/domain/entities", basePath),
		fmt.Sprintf("%s/domain/valueobjects", basePath),
		fmt.Sprintf("%s/domain/events", basePath),
		fmt.Sprintf("%s/domain/repositories", basePath),
		fmt.Sprintf("%s/domain/datasources", basePath),
		fmt.Sprintf("%s/domain/types", basePath),
		fmt.Sprintf("%s/infrastructure", basePath),
		fmt.Sprintf("%s/interface", basePath),
		fmt.Sprintf("%s/usecases", basePath),
	}

	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return fmt.Errorf("error creating directory %s: %w", dir, err)
		}
		fmt.Printf("Created directory: %s\n", dir)
	}

	// Domain layer
	domain.GenerateEntityFiles(config, basePath)
	domain.GenerateValueObjectFiles(config, basePath)
	domain.GenerateEventFiles(config, basePath)
	domain.GenerateRepositoryFiles(config, basePath)
	domain.GenerateDatasourceFiles(config, basePath)
	domain.GenerateTypeFiles(config, basePath)

	// Infrastructure layer
	infrastructure.GenerateInfrastructureFiles(config, basePath)

	// Interface layer
	interfaceapi.GenerateInterfaceFiles(config, basePath)

	// Use cases
	usecase.GenerateUseCaseFiles(config, basePath)

	// OpenAPI integration (currently console output only)
	openapi.GenerateOpenAPIFiles(config, basePath)

	fmt.Printf("\n✅ Component '%s' generated successfully!\n", config.SingularName)
	fmt.Printf("📁 Location: %s\n", basePath)

	return nil
}

