package main

import (
	"fmt"
)

func generateInfrastructureFiles(config ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := capitalize(singular)
	
	pgContent := fmt.Sprintf(`import { I%sDataSource } from '../domain/datasources/i.%s.datasource'
import { %sEntity, Deleted%sEntity } from '../domain/entities/%s.entity'
import { UniqueEntityId } from '../../../../../../core/domain/types/uniqueentityid'

export class PostgreSQL%sDataSource implements I%sDataSource {
    async create(%s: %sEntity): Promise<%sEntity> {
        throw new Error('Not implemented')
    }

    async findById(id: UniqueEntityId): Promise<%sEntity | null> {
        throw new Error('Not implemented')
    }

    async findAll(options?: any): Promise<%sEntity[]> {
        throw new Error('Not implemented')
    }

    async update(%s: %sEntity): Promise<%sEntity> {
        throw new Error('Not implemented')
    }

    async delete(id: UniqueEntityId): Promise<Deleted%sEntity> {
        throw new Error('Not implemented')
    }
}`, singularCap, singular, singularCap, singularCap, singular, singularCap, singularCap, singular, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap)

	writeFile(fmt.Sprintf("%s/infrastructure/postgresql.datasource.ts", basePath), pgContent)
}

func generateTypeFiles(config ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := capitalize(singular)
	
	responseContent := fmt.Sprintf(`import { %sEntity } from '../entities/%s.entity'
import { Result, left, right } from '../../../../../../core/domain/types/result'
import { GenericAppError } from '../../../../../../core/errors/app.error'

export type %sResponse = Promise<Result<%sEntity, GenericAppError>>

export class %sResponse {
    public static success(result: %sEntity): %sResponse {
        return Promise.resolve(right(Result.ok<%sEntity>(result)))
    }

    public static fail(error: GenericAppError): %sResponse {
        return Promise.resolve(left(Result.fail<%sEntity, GenericAppError>(error)))
    }
}`, singularCap, singular, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap)

	writeFile(fmt.Sprintf("%s/domain/types/response.ts", basePath), responseContent)
}
