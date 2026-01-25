package main

import (
	"fmt"
	"os"
	"strings"
)

func generateOpenAPIFiles(config ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := capitalize(singular)
	plural := config.PluralName
	
	// Generate OpenAPI schema for the entity
	var entityProperties []string
	var exampleProperties []string
	
	// Add standard properties
	entityProperties = append(entityProperties, "    id:")
	entityProperties = append(entityProperties, "      type: integer")
	entityProperties = append(entityProperties, "      description: Уникальный идентификатор")
	entityProperties = append(entityProperties, "      example: 1")
	
	entityProperties = append(entityProperties, "    name:")
	entityProperties = append(entityProperties, "      type: string")
	entityProperties = append(entityProperties, "      description: Наименование")
	entityProperties = append(entityProperties, "      example: \"Пример "+singular+"\"")
	
	entityProperties = append(entityProperties, "    search:")
	entityProperties = append(entityProperties, "      type: string")
	entityProperties = append(entityProperties, "      description: Поисковая строка")
	entityProperties = append(entityProperties, "      example: \"пример "+singular+"\"")
	
	entityProperties = append(entityProperties, "    createdAt:")
	entityProperties = append(entityProperties, "      type: string")
	entityProperties = append(entityProperties, "      format: date-time")
	entityProperties = append(entityProperties, "      description: Дата создания")
	entityProperties = append(entityProperties, "      example: '2024-10-10T10:00:01'")
	
	entityProperties = append(entityProperties, "    createdBy:")
	entityProperties = append(entityProperties, "      type: string")
	entityProperties = append(entityProperties, "      description: Создано кем")
	entityProperties = append(entityProperties, "      example: Иванов")
	
	entityProperties = append(entityProperties, "    updatedAt:")
	entityProperties = append(entityProperties, "      type: string")
	entityProperties = append(entityProperties, "      format: date-time")
	entityProperties = append(entityProperties, "      description: Дата обновления")
	entityProperties = append(entityProperties, "      example: '2024-09-09T09:09:09'")
	
	entityProperties = append(entityProperties, "    updatedBy:")
	entityProperties = append(entityProperties, "      type: string")
	entityProperties = append(entityProperties, "      description: Обновлено кем")
	entityProperties = append(entityProperties, "      example: Петров")
	
	// Add additional fields from migration
	for _, field := range config.TableFields {
		fieldName := field.Name
		fieldType := mapSQLToOpenAPIType(field.Type)
		fieldExample := mapSQLToOpenAPIExample(field.Type, field.Default)
		
		entityProperties = append(entityProperties, fmt.Sprintf("    %s:", fieldName))
		entityProperties = append(entityProperties, fmt.Sprintf("      type: %s", fieldType))
		
		if fieldType == "date-time" {
			entityProperties = append(entityProperties, "      format: date-time")
		}
		
		entityProperties = append(entityProperties, "      description: "+capitalize(fieldName))
		entityProperties = append(entityProperties, "      example: "+fieldExample)
	}
	
	// Build example object
	exampleProperties = append(exampleProperties, "        id: 1")
	exampleProperties = append(exampleProperties, "        name: \""+singularCap+" 1\"")
	exampleProperties = append(exampleProperties, "        search: \""+singularCap+" 1 иванов петров\"")
	exampleProperties = append(exampleProperties, "        createdAt: '2024-10-10T10:00:01'")
	exampleProperties = append(exampleProperties, "        createdBy: Иванов")
	exampleProperties = append(exampleProperties, "        updatedAt: '2024-09-09T09:09:09'")
	exampleProperties = append(exampleProperties, "        updatedBy: Петров")
	
	// Add example values for additional fields
	for _, field := range config.TableFields {
		fieldName := field.Name
		fieldExample := mapSQLToOpenAPIExample(field.Type, field.Default)
		exampleProperties = append(exampleProperties, fmt.Sprintf("        %s: %s", fieldName, fieldExample))
	}
	
	// Generate OpenAPI content
	openapiContent := fmt.Sprintf(`  /%s:
    get:
      servers:
        - url: https://roualty.rasu.local/api/v1/
      description: Список %s
      tags:
        - %s
      security:
        - authJWT:
          - read
      parameters:
        - in: query
          name: name
          schema:
            type: string
          required: false
          description: Фильтр по наименованию
          example: %s1
        - in: query
          name: offset
          schema: 
            type: number
          required: false
          description: Смещение относительно начала списка %s
          example: 0
        - in: query
          name: limit
          schema:
            type: number
          required: false
          description: Количество строк в результирующей выборке
          example: 10
        - in: query
          name: sort
          schema:
            type: string
          required: false
          description: Поле сортировки результата
          example: name
        - in: query
          name: order
          schema:
            type: string
            enum:
              - desc
              - asc
          required: false
          description: Направление сортировки результата
          example: desc
      responses:
        '200':
          description: Успешный ответ
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/%s'
              examples:
                %sExample:
                  summary: Пример ответа на запрос списка %s
                  value:
%s
    post:
      servers:
        - url: https://roualty.rasu.local/api/v1/
      description: Создание %s
      tags:
        - %s
      security:
        - authJWT:
          - write
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/%s'
            examples:
              %sExample:
                summary: Пример создания %s
                value:
                  name: "%s 1"
%s
      responses:
        '201':
          description: %s успешно создан
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/%s'
              examples:
                %sExample:
                  summary: Пример ответа на создание %s
                  value:
%s
  /%s/{id}:
    get:
      servers:
        - url: https://roualty.rasu.local/api/v1/
      description: Получение %s по ID
      tags:
        - %s
      security:
        - authJWT:
          - read
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
          description: Уникальный идентификатор %s
          example: 1
      responses:
        '200':
          description: Успешный ответ
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/%s'
              examples:
                %sExample:
                  summary: Пример ответа на получение %s
                  value:
%s
        '404':
          description: %s не найден
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
    put:
      servers:
        - url: https://roualty.rasu.local/api/v1/
      description: Обновление %s
      tags:
        - %s
      security:
        - authJWT:
          - write
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
          description: Уникальный идентификатор %s
          example: 1
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/%s'
            examples:
              %sExample:
                summary: Пример обновления %s
                value:
                  name: "%s 1 (обновленный)"
%s
      responses:
        '200':
          description: %s успешно обновлен
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/%s'
              examples:
                %sExample:
                  summary: Пример ответа на обновление %s
                  value:
%s
    delete:
      servers:
        - url: https://roualty.rasu.local/api/v1/
      description: Удаление %s
      tags:
        - %s
      security:
        - authJWT:
          - delete
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
          description: Уникальный идентификатор %s
          example: 1
      responses:
        '204':
          description: %s успешно удален
        '404':
          description: %s не найден
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'`,
		plural, plural, plural, singular, plural, singularCap, singularCap, plural, strings.Join(exampleProperties, "\n"),
		singular, plural, singularCap, singularCap, singular, strings.Join(getCreateExampleFields(config.TableFields), "\n"),
		singularCap, singularCap, strings.Join(exampleProperties, "\n"),
		plural, singular, plural, singular, strings.Join(exampleProperties, "\n"),
		singular, singular, strings.Join(exampleProperties, "\n"),
		singular, plural, singular, strings.Join(exampleProperties, "\n"),
		singular, plural, singular, strings.Join(exampleProperties, "\n"),
		singular, plural, singular, strings.Join(exampleProperties, "\n"),
		singular, plural, singular, strings.Join(exampleProperties, "\n"))
	
	// Generate schema content
	schemaContent := fmt.Sprintf(`  %s:
    type: object
    properties:
%s
    required:
      - name`, singularCap, strings.Join(entityProperties, "\n"))
	
	// Write to OpenAPI file
	openapiPath := fmt.Sprintf("../../api/v1/openapi/openapi.yaml")
	
	// Read existing content and append new content
	if err := appendToOpenAPIFile(openapiPath, openapiContent, schemaContent); err != nil {
		fmt.Printf("Error updating OpenAPI file: %v\n", err)
	} else {
		fmt.Printf("Updated OpenAPI documentation: %s\n", openapiPath)
	}
}

func mapSQLToOpenAPIType(sqlType string) string {
	sqlType = strings.ToLower(sqlType)
	
	switch {
	case strings.Contains(sqlType, "int"), strings.Contains(sqlType, "serial"):
		return "integer"
	case strings.Contains(sqlType, "varchar"), strings.Contains(sqlType, "text"), strings.Contains(sqlType, "char"):
		return "string"
	case strings.Contains(sqlType, "bool"):
		return "boolean"
	case strings.Contains(sqlType, "date"), strings.Contains(sqlType, "timestamp"):
		return "date-time"
	case strings.Contains(sqlType, "decimal"), strings.Contains(sqlType, "numeric"), strings.Contains(sqlType, "float"), strings.Contains(sqlType, "double"):
		return "number"
	default:
		return "string"
	}
}

func mapSQLToOpenAPIExample(sqlType string, defaultValue string) string {
	sqlType = strings.ToLower(sqlType)
	
	if defaultValue != "" && defaultValue != "NULL" {
		if strings.Contains(defaultValue, "'") {
			return defaultValue
		}
		return fmt.Sprintf("\"%s\"", defaultValue)
	}
	
	switch {
	case strings.Contains(sqlType, "int"), strings.Contains(sqlType, "serial"):
		return "123"
	case strings.Contains(sqlType, "varchar"), strings.Contains(sqlType, "text"), strings.Contains(sqlType, "char"):
		return "\"пример текста\""
	case strings.Contains(sqlType, "bool"):
		return "true"
	case strings.Contains(sqlType, "date"), strings.Contains(sqlType, "timestamp"):
		return "'2024-10-10T10:00:01'"
	case strings.Contains(sqlType, "decimal"), strings.Contains(sqlType, "numeric"), strings.Contains(sqlType, "float"), strings.Contains(sqlType, "double"):
		return "123.45"
	default:
		return "\"пример текста\""
	}
}

func getCreateExampleFields(fields []TableField) []string {
	var result []string
	for _, field := range fields {
		example := mapSQLToOpenAPIExample(field.Type, field.Default)
		result = append(result, fmt.Sprintf("                  %s: %s", field.Name, example))
	}
	return result
}

func appendToOpenAPIFile(path, pathsContent, schemaContent string) error {
	// Read the entire file
	content, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("failed to read OpenAPI file: %w", err)
	}
	
	// Convert to string and split by lines
	lines := strings.Split(string(content), "\n")
	
	// Find the sections to modify
	var result []string
	inComponents := false
	inSchemas := false
	pathsInserted := false
	schemasInserted := false
	
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		
		// Track sections
		if trimmed == "paths:" {
			inComponents = false
			inSchemas = false
			result = append(result, line)
			continue
		}
		if trimmed == "components:" {
			inComponents = true
			inSchemas = false
			// Insert paths before components
			if !pathsInserted {
				result = append(result, pathsContent)
				pathsInserted = true
			}
			result = append(result, line)
			continue
		}
		if inComponents && trimmed == "schemas:" {
			inComponents = true
			inSchemas = true
			result = append(result, line)
			continue
		}
		
		// Insert schemas after the schemas: line
		if inSchemas && !schemasInserted && (strings.HasPrefix(trimmed, "  ") && !strings.HasPrefix(trimmed, "    #")) {
			// Insert new schema before the first schema
			result = append(result, schemaContent)
			schemasInserted = true
		}
		
		result = append(result, line)
	}
	
	// Write the modified content back
	finalContent := strings.Join(result, "\n")
	if err := os.WriteFile(path, []byte(finalContent), 0644); err != nil {
		return fmt.Errorf("failed to write OpenAPI file: %w", err)
	}
	
	return nil
}
