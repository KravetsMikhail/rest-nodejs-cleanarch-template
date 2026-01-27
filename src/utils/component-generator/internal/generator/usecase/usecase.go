package usecase

import (
	"fmt"

	"component-generator/internal/generator/domain"
	"component-generator/internal/model"
)

// GenerateUseCaseFiles generates CRUD use case classes.
func GenerateUseCaseFiles(config model.ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := domain.Capitalize(singular)

	createUsecaseContent := fmt.Sprintf(`import { %sEntity } from '../domain/entities/%s.entity'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { Result } from '../../../../../core/domain/types/result'
import { %sResponse } from '../../../../../core/domain/types/response'

export class Create%sUseCase implements IUseCase<Promise<%sResponse>> {
    constructor(private readonly repository: any) {}

    async execute(name: string, user: string): Promise<%sResponse> {
        // TODO: Implement create logic
        return %sResponse.success({} as %sEntity)
    }
}`, singularCap, singular, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap)

	domain.WriteFile(fmt.Sprintf("%s/usecases/create-%s.usecase.ts", basePath, singular), createUsecaseContent)

	updateUsecaseContent := fmt.Sprintf(`import { %sEntity } from '../domain/entities/%s.entity'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { Result } from '../../../../../core/domain/types/result'
import { %sResponse } from '../../../../../core/domain/types/response'

export class Update%sUseCase implements IUseCase<Promise<%sResponse>> {
    constructor(private readonly repository: any) {}

    async execute(id: number, data: Partial<%sEntity>): Promise<%sResponse> {
        // TODO: Implement update logic
        return %sResponse.success({} as %sEntity)
    }
}`, singularCap, singular, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap)

	domain.WriteFile(fmt.Sprintf("%s/usecases/update-%s.usecase.ts", basePath, singular), updateUsecaseContent)

	deleteUsecaseContent := fmt.Sprintf(`import { %sEntity } from '../domain/entities/%s.entity'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { Result } from '../../../../../core/domain/types/result'
import { %sResponse } from '../../../../../core/domain/types/response'

export class Delete%sUseCase implements IUseCase<Promise<%sResponse>> {
    constructor(private readonly repository: any) {}

    async execute(id: number): Promise<%sResponse> {
        // TODO: Implement delete logic
        return %sResponse.success({} as %sEntity)
    }
}`, singularCap, singular, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap)

	domain.WriteFile(fmt.Sprintf("%s/usecases/delete-%s.usecase.ts", basePath, singular), deleteUsecaseContent)

	getUsecaseContent := fmt.Sprintf(`import { %sEntity } from '../domain/entities/%s.entity'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { Result } from '../../../../../core/domain/types/result'
import { %sResponse } from '../../../../../core/domain/types/response'

export class Get%sUseCase implements IUseCase<Promise<%sResponse>> {
    constructor(private readonly repository: any) {}

    async execute(options?: any): Promise<%sResponse> {
        // TODO: Implement get all logic
        return %sResponse.success([] as %sEntity[])
    }
}`, singularCap, singular, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap)

	domain.WriteFile(fmt.Sprintf("%s/usecases/get-%s.usecase.ts", basePath, singular), getUsecaseContent)
}

