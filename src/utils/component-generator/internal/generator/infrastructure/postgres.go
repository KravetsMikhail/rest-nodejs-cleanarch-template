package infrastructure

import (
	"fmt"
	"os"
	"strings"

	"component-generator/internal/model"
)

// local helpers (isolated from domain package)
func capitalize(s string) string {
	return strings.Title(s)
}

func writeFile(path, content string) {
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		fmt.Printf("Error writing file %s: %v\n", path, err)
	} else {
		fmt.Printf("Created file: %s\n", path)
	}
}

// GenerateInfrastructureFiles generates PostgreSQL datasource implementation.
func GenerateInfrastructureFiles(config model.ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := capitalize(singular)
	plural := config.PluralName
	tableName := capitalize(plural)

	var pgContent strings.Builder
	pgContent.WriteString(fmt.Sprintf("import { I%sDatasource } from '../domain/datasources/i.%s.datasource'\n", singularCap, singular))
	pgContent.WriteString(fmt.Sprintf("import { %sEntity } from '../domain/entities/%s.entity'\n", singularCap, singular))
	pgContent.WriteString("import { PostgresService } from '../../../infrastructure/postgresql/postgresql'\n")
	pgContent.WriteString("import { EnvConfig } from '../../../../../config/env'\n")
	pgContent.WriteString("import { QueryResult } from 'pg'\n")
	pgContent.WriteString("import { ID, IFindOptions, IPagination } from '../../../../../core/domain/types/types'\n")
	pgContent.WriteString("import { Helpers } from '../../../../../core/utils/helpers'\n\n")

	pgContent.WriteString(fmt.Sprintf("export class PostgreSQL%sDataSource implements I%sDatasource {\n", singularCap, singularCap))
	pgContent.WriteString("    private readonly postgresService: PostgresService\n\n")
	pgContent.WriteString("    constructor() {\n")
	pgContent.WriteString("        this.postgresService = PostgresService.getInstance()\n")
	pgContent.WriteString("    }\n\n")

	pgContent.WriteString(fmt.Sprintf("    async create(value: Partial<%sEntity>): Promise<%sEntity> {\n", singularCap, singularCap))
	pgContent.WriteString("        const _currentDate = new Date().toISOString().replace('T', ' ')\n")
	
	// Generate field mappings and values
	var fieldNames []string
	var valuePlaceholders []string
	var fieldMappings []string
	
	// Always include system fields
	fieldNames = append(fieldNames, "\"name\"", "\"search\"", "\"createdBy\"", "\"updatedBy\"", "\"createdAt\"", "\"updatedAt\"")
	valuePlaceholders = append(valuePlaceholders, "$1", "$2", "$3", "$4", "$5", "$6")
	fieldMappings = append(fieldMappings, 
		"let _name = value.name?.value ? value.name.value : \"<empty>\"",
		"let _search = value.search?.value ? value.search.value : \"\"",
		"let _createdBy = value?.createdBy ? value.createdBy : \"\"",
		"let _updatedBy = value?.updatedBy ? value.updatedBy : \"\"")
	
	// Add additional fields from migration
	for _, field := range config.TableFields {
		if field.Name == "name" || field.Name == "created_at" || field.Name == "updated_at" || 
		   field.Name == "createdby" || field.Name == "updatedby" || 
		   field.Name == "createdBy" || field.Name == "updatedBy" {
			continue
		}
		
		fieldNames = append(fieldNames, fmt.Sprintf("\"%s\"", field.Name))
		valuePlaceholders = append(valuePlaceholders, fmt.Sprintf("$%d", len(fieldNames)))
		camelFieldName := toCamelCase(field.Name)
		fieldMappings = append(fieldMappings, fmt.Sprintf("let _%s = value.%s ? value.%s : %s", 
			camelFieldName, camelFieldName, camelFieldName, getDefaultValueForField(field.Type)))
	}
	
	// Write field mappings
	for _, mapping := range fieldMappings {
		pgContent.WriteString(fmt.Sprintf("        %s\n", mapping))
	}
	
	// Build values array
	pgContent.WriteString("        const values = [")
	var valueVars []string
	valueVars = append(valueVars, "_name", "_search", "_createdBy", "_updatedBy", "_currentDate", "_currentDate")
	for _, field := range config.TableFields {
		if field.Name == "name" || field.Name == "created_at" || field.Name == "updated_at" || 
		   field.Name == "createdby" || field.Name == "updatedby" || 
		   field.Name == "createdBy" || field.Name == "updatedBy" {
			continue
		}
		camelFieldName := toCamelCase(field.Name)
		valueVars = append(valueVars, fmt.Sprintf("_%s", camelFieldName))
	}
	pgContent.WriteString(strings.Join(valueVars, ", "))
	pgContent.WriteString("]\n")
	
	// Build SQL
	pgContent.WriteString(fmt.Sprintf("        const response: QueryResult = await this.postgresService.query(`INSERT INTO ${EnvConfig.postgres.schema}.\"%s\"(\n", tableName))
	pgContent.WriteString("            " + strings.Join(fieldNames, ", ") + ")\n")
	pgContent.WriteString("            VALUES (" + strings.Join(valuePlaceholders, ", ") + ") RETURNING *`, values)\n")
	pgContent.WriteString(fmt.Sprintf("        return response.rows[0] as %sEntity\n", singularCap))
	pgContent.WriteString("    }\n\n")

	pgContent.WriteString(fmt.Sprintf("    async createMany(values: Partial<%sEntity>[]): Promise<%sEntity[]> {\n", singularCap, singularCap))
	pgContent.WriteString("        // TODO: implement batch insert if needed\n")
	pgContent.WriteString("        throw new Error('Method not implemented.')\n")
	pgContent.WriteString("    }\n\n")

	pgContent.WriteString(fmt.Sprintf("    async update(id: ID, newValue: Partial<%sEntity>): Promise<%sEntity> {\n", singularCap, singularCap))
	pgContent.WriteString("        const _currentDate = new Date().toISOString().replace('T', ' ')\n")
	
	// Generate field mappings and values for update
	var updateFieldNames []string
	var updateValuePlaceholders []string
	var updateFieldMappings []string
	
	// Always include system fields
	updateFieldNames = append(updateFieldNames, "\"name\"", "\"search\"", "\"createdBy\"", "\"updatedBy\"", "\"createdAt\"", "\"updatedAt\"")
	updateValuePlaceholders = append(updateValuePlaceholders, "$1", "$2", "$3", "$4", "$5", "$6")
	updateFieldMappings = append(updateFieldMappings, 
		"let _name = newValue.name?.value ? newValue.name.value : \"<empty>\"",
		"let _search = newValue.search?.value ? newValue.search.value : \"\"",
		"let _createdBy = newValue?.createdBy ? newValue.createdBy : \"\"",
		"let _updatedBy = newValue?.updatedBy ? newValue.updatedBy : \"\"")
	
	// Add additional fields from migration
	for _, field := range config.TableFields {
		if field.Name == "name" || field.Name == "created_at" || field.Name == "updated_at" || 
		   field.Name == "createdby" || field.Name == "updatedby" || 
		   field.Name == "createdBy" || field.Name == "updatedBy" {
			continue
		}
		
		updateFieldNames = append(updateFieldNames, fmt.Sprintf("\"%s\"", field.Name))
		updateValuePlaceholders = append(updateValuePlaceholders, fmt.Sprintf("$%d", len(updateFieldNames)))
		camelFieldName := toCamelCase(field.Name)
		updateFieldMappings = append(updateFieldMappings, fmt.Sprintf("let _%s = newValue.%s ? newValue.%s : %s", 
			camelFieldName, camelFieldName, camelFieldName, getDefaultValueForField(field.Type)))
	}
	
	// Write field mappings
	for _, mapping := range updateFieldMappings {
		pgContent.WriteString(fmt.Sprintf("        %s\n", mapping))
	}
	
	// Build values array
	pgContent.WriteString("        const values = [")
	var updateValueVars []string
	updateValueVars = append(updateValueVars, "_name", "_search", "_createdBy", "_updatedBy", "_currentDate", "_currentDate")
	for _, field := range config.TableFields {
		if field.Name == "name" || field.Name == "created_at" || field.Name == "updated_at" || 
		   field.Name == "createdby" || field.Name == "updatedby" || 
		   field.Name == "createdBy" || field.Name == "updatedBy" {
			continue
		}
		camelFieldName := toCamelCase(field.Name)
		updateValueVars = append(updateValueVars, fmt.Sprintf("_%s", camelFieldName))
	}
	pgContent.WriteString(strings.Join(updateValueVars, ", "))
	pgContent.WriteString("]\n")
	
	// Build SQL
	pgContent.WriteString(fmt.Sprintf("        const response: QueryResult = await this.postgresService.query(`UPDATE ${EnvConfig.postgres.schema}.\"%s\" SET \n", tableName))
	pgContent.WriteString("(" + strings.Join(updateFieldNames, ", ") + ") = (" + strings.Join(updateValuePlaceholders, ", ") + ")\n")
	pgContent.WriteString(fmt.Sprintf(" WHERE id=${id} RETURNING *`, values)\n"))
	pgContent.WriteString(fmt.Sprintf("        return response.rows[0] as %sEntity\n", singularCap))
	pgContent.WriteString("    }\n\n")

	pgContent.WriteString("    async delete(id: ID): Promise<any> {\n")
	pgContent.WriteString("        const values = [id ? id.toString() : '0']\n")
	pgContent.WriteString(fmt.Sprintf("        const response: QueryResult = await this.postgresService.query(`DELETE FROM ${EnvConfig.postgres.schema}.\"%s\" n WHERE n.\"id\"=$1 RETURNING *;`, values)\n", tableName))
	pgContent.WriteString("        return response.rows[0]\n")
	pgContent.WriteString("    }\n\n")

	pgContent.WriteString(fmt.Sprintf("    async find(options?: IFindOptions<%sEntity, any>): Promise<%sEntity[]> {\n", singularCap, singularCap))
	pgContent.WriteString("        const { data } = await this.findAndCount(options)\n")
	pgContent.WriteString("        return data\n")
	pgContent.WriteString("    }\n\n")
	pgContent.WriteString(fmt.Sprintf("    async findAndCount(options?: IFindOptions<%sEntity, any>): Promise<{ data: %sEntity[], pagination: IPagination }> {\n", singularCap, singularCap))
	pgContent.WriteString("        let _where = ''\n")
	pgContent.WriteString("        let _orderBy = ''\n")
	pgContent.WriteString("        let _paging = ''\n\n")
	pgContent.WriteString("        const offset = options?.offset ?? 0\n")
	pgContent.WriteString("        const limit = options?.limit ?? 10000\n\n")
	pgContent.WriteString("        if (options) {\n")
	pgContent.WriteString(fmt.Sprintf("            _where = Helpers.getWhereForPostgreSql(%sEntity, options, EnvConfig.postgres.schema, \"%s\")\n", singularCap, tableName))
	pgContent.WriteString(fmt.Sprintf("            _orderBy = Helpers.getOrderByForPostgreSql(%sEntity, options, EnvConfig.postgres.schema, \"%s\")\n", singularCap, tableName))
	pgContent.WriteString("            _paging = Helpers.getPagingForPostgresSql(options)\n")
	pgContent.WriteString("        }\n")
	pgContent.WriteString(fmt.Sprintf("        const countResult: QueryResult = await this.postgresService.query(`SELECT COUNT(*)::int AS total FROM ${EnvConfig.postgres.schema}.\"%s\" ${_where ? ' ' + _where : ''}`)\n", tableName))
	pgContent.WriteString("        const total = Number((countResult.rows[0] as { total: number }).total ?? 0)\n\n")
	pgContent.WriteString(fmt.Sprintf("        const response: QueryResult = await this.postgresService.query(`SELECT * FROM ${EnvConfig.postgres.schema}.\"%s\" ${_where} ${_orderBy} ${_paging}`)\n", tableName))
	pgContent.WriteString("        const pagination: IPagination = { total, offset, limit }\n")
	pgContent.WriteString("        return { data: response.rows, pagination }\n")
	pgContent.WriteString("    }\n\n")

	pgContent.WriteString(fmt.Sprintf("    async findOne(id: ID | Partial<%sEntity>, options?: IFindOptions<%sEntity, any>): Promise<%sEntity> {\n", singularCap, singularCap, singularCap))
	pgContent.WriteString(fmt.Sprintf("        const response: QueryResult = await this.postgresService.query(`SELECT * FROM ${EnvConfig.postgres.schema}.\"%s\" WHERE id = ${id}`)\n", tableName))
	pgContent.WriteString(fmt.Sprintf("        return response.rows && response.rows.length > 0 ? response.rows[0] as %sEntity : {} as %sEntity\n", singularCap, singularCap))
	pgContent.WriteString("    }\n\n")

	pgContent.WriteString(fmt.Sprintf("    async exist(id: ID | Partial<%sEntity>): Promise<boolean> {\n", singularCap))
	pgContent.WriteString("        // TODO: implement existence check if required\n")
	pgContent.WriteString("        throw new Error('Method not implemented.')\n")
	pgContent.WriteString("    }\n}\n")

	writeFile(fmt.Sprintf("%s/infrastructure/postgresql.datasource.ts", basePath), pgContent.String())
}

// Helper functions
func toCamelCase(s string) string {
	parts := strings.Split(s, "_")
	for i := 1; i < len(parts); i++ {
		parts[i] = capitalize(parts[i])
	}
	return strings.Join(parts, "")
}

func getDefaultValueForField(sqlType string) string {
	switch {
	case strings.Contains(strings.ToLower(sqlType), "varchar"), strings.Contains(strings.ToLower(sqlType), "text"):
		return "\"\""
	case strings.Contains(strings.ToLower(sqlType), "int"), strings.Contains(strings.ToLower(sqlType), "decimal"), strings.Contains(strings.ToLower(sqlType), "numeric"):
		return "0"
	case strings.Contains(strings.ToLower(sqlType), "bool"):
		return "false"
	case strings.Contains(strings.ToLower(sqlType), "date"), strings.Contains(strings.ToLower(sqlType), "timestamp"):
		return "_currentDate"
	default:
		return "null"
	}
}


