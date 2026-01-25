package main

import (
	"fmt"
)

func generateUseCaseFiles(config ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := capitalize(singular)
	
	createUsecaseContent := fmt.Sprintf(`import { %sEntity } from '../domain/entities/%s.entity'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { Result } from '../../../../../core/domain/types/result'

export class Create%sUseCase implements IUseCase<Promise<Result<%sEntity, any>>> {
    constructor(private readonly repository: any) {}

    async execute(name: string, user: string): Promise<Result<%sEntity, any>> {
        // TODO: Implement create logic
        return Result.ok<%sEntity>({} as %sEntity)
    }
}`, singularCap, singular, singularCap, singularCap, singularCap, singularCap, singularCap)

	writeFile(fmt.Sprintf("%s/usecases/create-%s.usecase.ts", basePath, singular), createUsecaseContent)

	getUsecaseContent := fmt.Sprintf(`import { %sEntity } from '../domain/entities/%s.entity'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { Result } from '../../../../../core/domain/types/result'

export class Get%sUseCase implements IUseCase<Promise<Result<%sEntity[], any>>> {
    constructor(private readonly repository: any) {}

    async execute(options?: any): Promise<Result<%sEntity[], any>> {
        // TODO: Implement get all logic
        return Result.ok<%sEntity[]>([])
    }
}`, singularCap, singular, singularCap, singularCap, singularCap, singularCap)

	writeFile(fmt.Sprintf("%s/usecases/get-%s.usecase.ts", basePath, singular), getUsecaseContent)
}
