package main

import (
	"fmt"
	"strings"
)

func generateInfrastructureFiles(config ComponentConfig, basePath string) {
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

func generateTypeFiles(config ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := capitalize(singular)
	
	responseContent := fmt.Sprintf(`import { %sEntity } from '../entities/%s.entity'
import { Result, left, right } from '../../../../../../core/domain/types/result'
import { GenericAppError } from '../../../../../../core/errors/app.error'

export type %sResponseType = Promise<Result<%sEntity, GenericAppError>>

export class %sResponse {
    public static success(result: %sEntity): %sResponseType {
        return Promise.resolve(right(Result.ok(result)))
    }

    public static fail(error: GenericAppError): %sResponseType {
        return Promise.resolve(left(Result.fail(error)))
    }
}`, singularCap, singular, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap)

	writeFile(fmt.Sprintf("%s/domain/types/response.ts", basePath), responseContent)
}
