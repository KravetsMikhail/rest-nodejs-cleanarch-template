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
	pluralCap := domain.Capitalize(config.PluralName)

	createUsecaseContent := fmt.Sprintf(`import { %[1]sEntity } from '../domain/entities/%[2]s.entity'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { Result, left, right } from '../../../../../core/domain/types/result'
import { %[1]sResponse } from '../domain/types/response'

export class Create%[1]sUseCase implements IUseCase<Promise<%[1]sResponse>> {
    constructor(private readonly repository: any) {}

    async execute(name: string, user: string): Promise<%[1]sResponse> {
        // TODO: Implement create logic
        return right(Result.ok({} as %[1]sEntity)) as %[1]sResponse
    }
}`, singularCap, singular)

	domain.WriteFile(fmt.Sprintf("%s/usecases/create-%s.usecase.ts", basePath, singular), createUsecaseContent)

	updateUsecaseContent := fmt.Sprintf(`import { %[1]sEntity } from '../domain/entities/%[2]s.entity'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { Result, left, right } from '../../../../../core/domain/types/result'
import { %[1]sResponse } from '../domain/types/response'

export class Update%[1]sUseCase implements IUseCase<Promise<%[1]sResponse>> {
    constructor(private readonly repository: any) {}

    async execute(id: number, data: Partial<%[1]sEntity>): Promise<%[1]sResponse> {
        // TODO: Implement update logic
        return right(Result.ok({} as %[1]sEntity)) as %[1]sResponse
    }
}`, singularCap, singular)

	domain.WriteFile(fmt.Sprintf("%s/usecases/update-%s.usecase.ts", basePath, singular), updateUsecaseContent)

	deleteUsecaseContent := fmt.Sprintf(`import { %[1]sEntity } from '../domain/entities/%[2]s.entity'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { Result, left, right } from '../../../../../core/domain/types/result'
import { %[1]sResponse } from '../domain/types/response'

export class Delete%[1]sUseCase implements IUseCase<Promise<%[1]sResponse>> {
    constructor(private readonly repository: any) {}

    async execute(id: number): Promise<%[1]sResponse> {
        // TODO: Implement delete logic
        return right(Result.ok({} as %[1]sEntity)) as %[1]sResponse
    }
}`, singularCap, singular)

	domain.WriteFile(fmt.Sprintf("%s/usecases/delete-%s.usecase.ts", basePath, singular), deleteUsecaseContent)

	getUsecaseContent := fmt.Sprintf(`import { %[1]sEntity } from '../domain/entities/%[2]s.entity'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { Result, left, right } from '../../../../../core/domain/types/result'
import { %[3]sResponse } from '../domain/types/response'

export class Get%[1]sUseCase implements IUseCase<Promise<%[3]sResponse>> {
    constructor(private readonly repository: any) {}

    async execute(options?: any): Promise<%[3]sResponse> {
        // TODO: Implement get all logic
        return right(Result.ok([] as %[1]sEntity[])) as %[3]sResponse
    }
}`, singularCap, singular, pluralCap)

	domain.WriteFile(fmt.Sprintf("%s/usecases/get-%s.usecase.ts", basePath, singular), getUsecaseContent)
}

