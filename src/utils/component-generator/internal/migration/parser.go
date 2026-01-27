package migration

import (
	"bufio"
	"fmt"
	"os"
	"regexp"
	"strings"

	"component-generator/internal/model"
)

// ParseMigrationFile parses SQL migration and extracts table columns.
func ParseMigrationFile(filePath string) ([]model.TableField, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open migration file: %w", err)
	}
	defer file.Close()

	var fields []model.TableField
	scanner := bufio.NewScanner(file)

	// Regex to match CREATE TABLE columns
	// Matches: "column_name" TYPE [NOT NULL] [DEFAULT value]
	// Column name may be quoted or unquoted.
	columnRegex := regexp.MustCompile(`^\s*"?(\w+)"?\s+(\w+(?:\(\d+(?:,\s*\d+)?\))?)\s*(NOT NULL)?\s*(DEFAULT\s+[^,\s]+)?`)

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
				name := strings.Trim(matches[1], `"`)

				field := model.TableField{
					Name:     name,
					Type:     matches[2],
					Nullable: matches[3] != "NOT NULL",
					Default:  strings.TrimSpace(strings.TrimPrefix(matches[4], "DEFAULT ")),
				}

				// All fields defined in migration are passed to generator.
				fields = append(fields, field)
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading migration file: %w", err)
	}

	return fields, nil
}

// MapSQLTypeToTypeScript maps SQL type to TypeScript type.
func MapSQLTypeToTypeScript(sqlType string) string {
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

// MapSQLTypeToDbTypes maps SQL type to DbTypes enum used in reflections.
func MapSQLTypeToDbTypes(sqlType string) string {
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

