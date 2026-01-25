package main

import (
	"bufio"
	"fmt"
	"os"
	"regexp"
	"strings"

	"github.com/spf13/cobra"
)

type ComponentConfig struct {
	SingularName   string
	PluralName     string
	ApiVersion     string
	MigrationFile  string
	TableFields    []TableField
}

type TableField struct {
	Name     string
	Type     string
	Nullable bool
	Default  string
}

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

	config := ComponentConfig{
		SingularName:  strings.ToLower(singular),
		PluralName:    strings.ToLower(plural),
		ApiVersion:    version,
		MigrationFile: migrationFile,
		TableFields:   []TableField{},
	}

	// Parse migration file if provided
	if migrationFile != "" {
		fields, err := parseMigrationFile(migrationFile)
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
		if err := os.MkdirAll(dir, 0755); err != nil {
			fmt.Printf("Error creating directory %s: %v\n", dir, err)
			return
		}
		fmt.Printf("Created directory: %s\n", dir)
	}

	generateEntityFiles(config, basePath)
	generateValueObjectFiles(config, basePath)
	generateEventFiles(config, basePath)
	generateRepositoryFiles(config, basePath)
	generateDatasourceFiles(config, basePath)
	generateTypeFiles(config, basePath)
	generateInfrastructureFiles(config, basePath)
	generateInterfaceFiles(config, basePath)
	generateUseCaseFiles(config, basePath)
	generateOpenAPIFiles(config, basePath)

	fmt.Printf("\n✅ Component '%s' generated successfully!\n", config.SingularName)
	fmt.Printf("📁 Location: %s\n", basePath)
}

func capitalize(s string) string {
	return strings.Title(s)
}

func writeFile(path, content string) {
	if err := os.WriteFile(path, []byte(content), 0644); err != nil {
		fmt.Printf("Error writing file %s: %v\n", path, err)
	} else {
		fmt.Printf("Created file: %s\n", path)
	}
}

func parseMigrationFile(filePath string) ([]TableField, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open migration file: %w", err)
	}
	defer file.Close()

	var fields []TableField
	scanner := bufio.NewScanner(file)
	
	// Regex to match CREATE TABLE columns
	// Matches: column_name TYPE [NOT NULL] [DEFAULT value]
	columnRegex := regexp.MustCompile(`^\s*(\w+)\s+(\w+(?:\(\d+(?:,\s*\d+)?\))?)\s*(NOT NULL)?\s*(DEFAULT\s+[^,\s]+)?`)
	
	inCreateTable := false
	
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		
		// Skip comments and empty lines
		if strings.HasPrefix(line, "--") || line == "" {
			continue
		}
		
		// Check if we're in CREATE TABLE block
		if strings.Contains(strings.ToUpper(line), "CREATE TABLE") {
			inCreateTable = true
			continue
		}
		
		// End of CREATE TABLE block
		if inCreateTable && strings.Contains(line, ");") {
			break
		}
		
		// Parse column definitions
		if inCreateTable {
			matches := columnRegex.FindStringSubmatch(line)
			if len(matches) >= 3 {
				field := TableField{
					Name:     matches[1],
					Type:     matches[2],
					Nullable: matches[3] != "NOT NULL",
					Default:  strings.TrimSpace(strings.TrimPrefix(matches[4], "DEFAULT ")),
				}
				
				// Skip common system fields
				if !strings.EqualFold(field.Name, "id") && 
				   !strings.EqualFold(field.Name, "created_at") && 
				   !strings.EqualFold(field.Name, "updated_at") &&
				   !strings.EqualFold(field.Name, "createdby") &&
				   !strings.EqualFold(field.Name, "updatedby") {
					fields = append(fields, field)
				}
			}
		}
	}
	
	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading migration file: %w", err)
	}
	
	return fields, nil
}

func mapSQLTypeToTypeScript(sqlType string) string {
	sqlType = strings.ToLower(sqlType)
	
	switch {
	case strings.Contains(sqlType, "int"), strings.Contains(sqlType, "serial"):
		return "number"
	case strings.Contains(sqlType, "varchar"), strings.Contains(sqlType, "text"), strings.Contains(sqlType, "char"):
		return "string"
	case strings.Contains(sqlType, "bool"):
		return "boolean"
	case strings.Contains(sqlType, "date"), strings.Contains(sqlType, "timestamp"):
		return "Date"
	case strings.Contains(sqlType, "decimal"), strings.Contains(sqlType, "numeric"), strings.Contains(sqlType, "float"), strings.Contains(sqlType, "double"):
		return "number"
	default:
		return "any"
	}
}

func mapSQLTypeToDbTypes(sqlType string) string {
	sqlType = strings.ToLower(sqlType)
	
	switch {
	case strings.Contains(sqlType, "int"), strings.Contains(sqlType, "serial"):
		return "DbTypes.Number"
	case strings.Contains(sqlType, "varchar"), strings.Contains(sqlType, "text"), strings.Contains(sqlType, "char"):
		return "DbTypes.String"
	case strings.Contains(sqlType, "bool"):
		return "DbTypes.Boolean"
	case strings.Contains(sqlType, "date"), strings.Contains(sqlType, "timestamp"):
		return "DbTypes.Date"
	case strings.Contains(sqlType, "decimal"), strings.Contains(sqlType, "numeric"), strings.Contains(sqlType, "float"), strings.Contains(sqlType, "double"):
		return "DbTypes.Number"
	default:
		return "DbTypes.String"
	}
}
