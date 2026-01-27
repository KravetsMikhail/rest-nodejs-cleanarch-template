package main

import (
	"fmt"
	"os"
	"strings"

	"component-generator/internal/generator"
	"component-generator/internal/migration"
	"component-generator/internal/model"

	"github.com/spf13/cobra"
)

func main() {
	var rootCmd = &cobra.Command{
		Use:   "component-generator",
		Short: "Generate new API component structure",
		Long:  "A CLI tool to generate new API components following clean architecture pattern",
	}

	var generateCmd = &cobra.Command{
		Use:   "generate",
		Short: "Generate a new component",
		Run:   generateComponent,
	}

	generateCmd.Flags().String("singular", "", "Component name in singular form (required)")
	generateCmd.Flags().String("plural", "", "Component name in plural form (required)")
	generateCmd.Flags().String("version", "v1", "API version (default: v1)")
	generateCmd.Flags().String("migration", "", "Migration file path (optional)")

	generateCmd.MarkFlagRequired("singular")
	generateCmd.MarkFlagRequired("plural")

	rootCmd.AddCommand(generateCmd)
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func generateComponent(cmd *cobra.Command, args []string) {
	singular, _ := cmd.Flags().GetString("singular")
	plural, _ := cmd.Flags().GetString("plural")
	version, _ := cmd.Flags().GetString("version")
	migrationFile, _ := cmd.Flags().GetString("migration")

	config := model.ComponentConfig{
		SingularName:  strings.ToLower(singular),
		PluralName:    strings.ToLower(plural),
		ApiVersion:    version,
		MigrationFile: migrationFile,
		TableFields:   []model.TableField{},
	}

	// Parse migration file if provided
	if migrationFile != "" {
		fields, err := migration.ParseMigrationFile(migrationFile)
		if err != nil {
			fmt.Printf("Error parsing migration file: %v\n", err)
			return
		}
		config.TableFields = fields
		fmt.Printf("Parsed %d fields from migration file\n", len(fields))
	}

	fmt.Printf("Generating component: %s (%s) for API version %s\n", config.SingularName, config.PluralName, config.ApiVersion)
	if migrationFile != "" {
		fmt.Printf("Using migration file: %s\n", migrationFile)
	}

	svc := generator.NewService()
	if err := svc.Generate(config); err != nil {
		fmt.Printf("Error generating component: %v\n", err)
		os.Exit(1)
	}
}
