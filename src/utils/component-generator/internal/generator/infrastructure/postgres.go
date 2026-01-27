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

	var pgContent strings.Builder
	pgContent.WriteString(fmt.Sprintf("import { I%sDatasource } from '../domain/datasources/i.%s.datasource'\n", singularCap, singular))
	pgContent.WriteString(fmt.Sprintf("import { %sEntity } from '../domain/entities/%s.entity'\n", singularCap, singular))
	pgContent.WriteString("import { ID, IFindOptions } from '../../../../../core/domain/types/types'\n\n")
	pgContent.WriteString(fmt.Sprintf("export class PostgreSQL%sDataSource implements I%sDatasource {\n", singularCap, singularCap))
	pgContent.WriteString(fmt.Sprintf("    async create(value: Partial<%sEntity>): Promise<%sEntity> {\n        throw new Error('Not implemented')\n    }\n\n", singularCap, singularCap))
	pgContent.WriteString(fmt.Sprintf("    async createMany(values: Partial<%sEntity>[]): Promise<%sEntity[]> {\n        throw new Error('Not implemented')\n    }\n\n", singularCap, singularCap))
	pgContent.WriteString(fmt.Sprintf("    async update(id: ID, newValue: Partial<%sEntity>): Promise<%sEntity> {\n        throw new Error('Not implemented')\n    }\n\n", singularCap, singularCap))
	pgContent.WriteString("    async delete(id: ID): Promise<any> {\n        throw new Error('Not implemented')\n    }\n\n")
	pgContent.WriteString(fmt.Sprintf("    async find(options?: IFindOptions<%sEntity, any>): Promise<%sEntity[]> {\n        throw new Error('Not implemented')\n    }\n\n", singularCap, singularCap))
	pgContent.WriteString(fmt.Sprintf("    async findOne(id: ID | Partial<%sEntity>, options?: IFindOptions<%sEntity, any>): Promise<%sEntity> {\n        throw new Error('Not implemented')\n    }\n\n", singularCap, singularCap, singularCap))
	pgContent.WriteString(fmt.Sprintf("    async exist(id: ID | Partial<%sEntity>): Promise<boolean> {\n        throw new Error('Not implemented')\n    }\n}\n", singularCap))

	writeFile(fmt.Sprintf("%s/infrastructure/postgresql.datasource.ts", basePath), pgContent.String())
}


