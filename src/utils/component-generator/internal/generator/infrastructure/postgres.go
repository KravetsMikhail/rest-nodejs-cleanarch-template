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
	pgContent.WriteString("import { ID, IFindOptions } from '../../../../../core/domain/types/types'\n")
	pgContent.WriteString("import { Helpers } from '../../../../../core/utils/helpers'\n\n")

	pgContent.WriteString(fmt.Sprintf("export class PostgreSQL%sDataSource implements I%sDatasource {\n", singularCap, singularCap))
	pgContent.WriteString("    private readonly postgresService: PostgresService\n\n")
	pgContent.WriteString("    constructor() {\n")
	pgContent.WriteString("        this.postgresService = PostgresService.getInstance()\n")
	pgContent.WriteString("    }\n\n")

	pgContent.WriteString(fmt.Sprintf("    async create(value: Partial<%sEntity>): Promise<%sEntity> {\n", singularCap, singularCap))
	pgContent.WriteString("        // TODO: map 'value' fields to INSERT columns for your table\n")
	pgContent.WriteString("        const values: any[] = []\n")
	pgContent.WriteString(fmt.Sprintf("        const response: QueryResult = await this.postgresService.query(`INSERT INTO ${EnvConfig.postgres.schema}.\"%s\" DEFAULT VALUES RETURNING *`, values)\n", tableName))
	pgContent.WriteString(fmt.Sprintf("        return response.rows[0] as %sEntity\n", singularCap))
	pgContent.WriteString("    }\n\n")

	pgContent.WriteString(fmt.Sprintf("    async createMany(values: Partial<%sEntity>[]): Promise<%sEntity[]> {\n", singularCap, singularCap))
	pgContent.WriteString("        // TODO: implement batch insert if needed\n")
	pgContent.WriteString("        throw new Error('Method not implemented.')\n")
	pgContent.WriteString("    }\n\n")

	pgContent.WriteString(fmt.Sprintf("    async update(id: ID, newValue: Partial<%sEntity>): Promise<%sEntity> {\n", singularCap, singularCap))
	pgContent.WriteString("        // TODO: build UPDATE statement based on 'newValue'\n")
	pgContent.WriteString(fmt.Sprintf("        const values: any[] = []\n"))
	pgContent.WriteString(fmt.Sprintf("        const response: QueryResult = await this.postgresService.query(`UPDATE ${EnvConfig.postgres.schema}.\"%s\" SET /* columns = values */ WHERE id = ${id} RETURNING *`, values)\n", tableName))
	pgContent.WriteString(fmt.Sprintf("        return response.rows[0] as %sEntity\n", singularCap))
	pgContent.WriteString("    }\n\n")

	pgContent.WriteString("    async delete(id: ID): Promise<any> {\n")
	pgContent.WriteString("        const values = [id ? id.toString() : '0']\n")
	pgContent.WriteString(fmt.Sprintf("        const response: QueryResult = await this.postgresService.query(`DELETE FROM ${EnvConfig.postgres.schema}.\"%s\" n WHERE n.\"id\"=$1 RETURNING *;`, values)\n", tableName))
	pgContent.WriteString("        return response.rows[0]\n")
	pgContent.WriteString("    }\n\n")

	pgContent.WriteString(fmt.Sprintf("    async find(options?: IFindOptions<%sEntity, any>): Promise<%sEntity[]> {\n", singularCap, singularCap))
	pgContent.WriteString("        let _where = ''\n")
	pgContent.WriteString("        let _orderBy = ''\n")
		pgContent.WriteString("        let _paging = ''\n\n")
	pgContent.WriteString("        if (options) {\n")
	pgContent.WriteString(fmt.Sprintf("            _where = Helpers.getWhereForPostgreSql(%sEntity, options, EnvConfig.postgres.schema, \"%s\")\n", singularCap, tableName))
	pgContent.WriteString(fmt.Sprintf("            _orderBy = Helpers.getOrderByForPostgreSql(%sEntity, options, EnvConfig.postgres.schema, \"%s\")\n", singularCap, tableName))
	pgContent.WriteString("            _paging = Helpers.getPagingForPostgresSql(options)\n")
	pgContent.WriteString("        }\n")
	pgContent.WriteString(fmt.Sprintf("        const response: QueryResult = await this.postgresService.query(`SELECT * FROM ${EnvConfig.postgres.schema}.\"%s\" ${_where} ${_orderBy} ${_paging}`)\n", tableName))
	pgContent.WriteString("        return response.rows\n")
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


