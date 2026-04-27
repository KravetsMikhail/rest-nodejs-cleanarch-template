package usecase

import (
	"fmt"
	"os"
	"strings"

	"component-generator/internal/generator/domain"
	"component-generator/internal/model"
)

// GenerateUseCaseFiles generates CRUD use case classes.
func GenerateUseCaseFiles(config model.ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := domain.Capitalize(singular)
	pluralCap := domain.Capitalize(config.PluralName)

	contentCreate := buildCreateUsecaseContent(config, singular, singularCap)
	fileCreateUseCasePath := fmt.Sprintf("%s/usecases/create-%s.usecase.ts", basePath, singular)
	if err := os.WriteFile(fileCreateUseCasePath, []byte(contentCreate), 0o644); err != nil {
		fmt.Printf("Warning: could not write %s: %v\n", fileCreateUseCasePath, err)
	} else {
		fmt.Printf("Created file: %s\n", fileCreateUseCasePath)
	}

	contentUpdate := buildUpdateUsecaseContent(config, singular, singularCap)
	fileUpdateUseCasePath := fmt.Sprintf("%s/usecases/update-%s.usecase.ts", basePath, singular)
	if err := os.WriteFile(fileUpdateUseCasePath, []byte(contentUpdate), 0o644); err != nil {
		fmt.Printf("Warning: could not write %s: %v\n", fileUpdateUseCasePath, err)
	} else {
		fmt.Printf("Created file: %s\n", fileUpdateUseCasePath)
	}

	contentDelete := buildDeleteUsecaseContent(singular, singularCap)
	fileDeleteUseCasePath := fmt.Sprintf("%s/usecases/delete-%s.usecase.ts", basePath, singular)
	if err := os.WriteFile(fileDeleteUseCasePath, []byte(contentDelete), 0o644); err != nil {
		fmt.Printf("Warning: could not write %s: %v\n", fileDeleteUseCasePath, err)
	} else {
		fmt.Printf("Created file: %s\n", fileDeleteUseCasePath)
	}

	contentGet := buildGetUsecaseContent(singular, singularCap, pluralCap)
	fileGetUseCasePath := fmt.Sprintf("%s/usecases/get-%s.usecase.ts", basePath, singular)
	if err := os.WriteFile(fileGetUseCasePath, []byte(contentGet), 0o644); err != nil {
		fmt.Printf("Warning: could not write %s: %v\n", fileGetUseCasePath, err)
	} else {
		fmt.Printf("Created file: %s\n", fileGetUseCasePath)
	}
}

// Создание Create Usecase
func buildCreateUsecaseContent(config model.ComponentConfig, singular string, singularCap string) string {
	var content strings.Builder

	content.WriteString(fmt.Sprintf(`import { %[1]sEntity } from '../domain/entities/%[2]s.entity'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { Result, left, right } from '../../../../../core/domain/types/result'
import { %[1]sResponse } from '../domain/types/response'
import { UniqueEntityId } from '../../../../../core/domain/types/uniqueentityid'
import { DomainEvents } from '../../../../../core/domain/events/domain.events'
import { GetReflectionTypes, ReflectionData } from '../../../../../core/domain/types/reflections'
import { GenericAppError } from '../../../../../core/errors/app.error'
import { type I%[1]sRepository } from '../domain/repositories/i.%[2]s.repository'

export class Create%[1]sUseCase implements IUseCase<Promise<%[1]sResponse>> {
    constructor(private readonly repository: I%[1]sRepository) {}

    async execute(create%[2]s: any, user: string): Promise<%[1]sResponse> {
        if (!create%[2]s) {
            return left(Result.fail<void, void>("Ошибка! Нет данных")) as %[1]sResponse
        }
        let _reflect = GetReflectionTypes(%[1]sEntity)
        let _isOk: boolean = true;
        for (const k of Object.getOwnPropertyNames(create%[2]s)) {
            if (!(_reflect as ReflectionData[]).find(r => r.field.replace(/_/ig, '').toLowerCase() === k.replace(/_/ig, '').toLowerCase())) {
                console.log(k)
                console.log(create%[2]s)
                _isOk = false
                break
            }
        }
        if (!_isOk) {
            return left(Result.fail<void, void>("Ошибка! Не верный или не полный состав данных")) as %[1]sResponse
        }

        const _id = new UniqueEntityId()
        const _%[2]s = %[1]sEntity.create({`, singularCap, singular))

	fields := config.TableFields

	content.WriteString("\n")

	for _, f := range fields {
		if f.Name == "id" {
			continue
		}
		line := fmt.Sprintf("        %[1]s: create%[2]s?.%[1]s,\n", f.Name, singular)
		content.WriteString(line)
	}

	content.WriteString(fmt.Sprintf(`}, _id)

        if (_%[2]s.isFailure) {
            return left(Result.fail<void, void>("Ошибка! Не удалось создать объект. " + _%[2]s.error?.toString())) as %[1]sResponse
        }

        const %[2]s: %[1]sEntity = _%[2]s.getValue() as %[1]sEntity
        let new%[2]s = {} 

        try {
            new%[2]s = await this.repository.create(%[2]s)
            DomainEvents.dispatchEventsForAggregate(_id)
        }catch(err){
            return left(new GenericAppError.UnexpectedError(err)) as %[1]sResponse
        }

        return right(Result.created<%[1]sEntity>(new%[2]s as %[1]sEntity)) as %[1]sResponse
    }
}`, singularCap, singular))

	return content.String()
}

// Создание Update Usecase
func buildUpdateUsecaseContent(config model.ComponentConfig, singular string, singularCap string) string {
	var content strings.Builder

	content.WriteString(fmt.Sprintf(`import { %[1]sEntity } from '../domain/entities/%[2]s.entity'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { Result, left, right } from '../../../../../core/domain/types/result'
import { %[1]sResponse } from '../domain/types/response'
import { UniqueEntityId } from '../../../../../core/domain/types/uniqueentityid'
import { DomainEvents } from '../../../../../core/domain/events/domain.events'
import { GetReflectionTypes, ReflectionData } from '../../../../../core/domain/types/reflections'
import { GenericAppError } from '../../../../../core/errors/app.error'
import { type I%[1]sRepository } from '../domain/repositories/i.%[2]s.repository'

export class Update%[1]sUseCase implements IUseCase<Promise<%[1]sResponse>> {
    constructor(private readonly repository: I%[1]sRepository) {}

    async execute(id: number, data: any): Promise<%[1]sResponse> {
        if (!data) {
            return left(Result.fail<void, void>("Ошибка! Нет данных")) as %[1]sResponse
        }
        let _reflect = GetReflectionTypes(%[1]sEntity)
        let _isOk: boolean = true;
        for (const k of Object.getOwnPropertyNames(data)) {
            if (!(_reflect as ReflectionData[]).find(r => r.field.replace(/_/ig, '').toLowerCase() === k.replace(/_/ig, '').toLowerCase())) {
                console.log(k)
                console.log(data)
                _isOk = false
                break
            }
        }
        if (!_isOk) {
            return left(Result.fail<void, void>("Ошибка! Не верный или не полный состав данных")) as %[1]sResponse
        }

        const _%[2]s = %[1]sEntity.update({`, singularCap, singular))

	fields := config.TableFields

	content.WriteString("\n")

	for _, f := range fields {
		if f.Name == "id" {
			continue
		}
		line := fmt.Sprintf("        %[1]s: data?.%[1]s,\n", f.Name, singular)
		content.WriteString(line)
	}

	content.WriteString(fmt.Sprintf(`}, new UniqueEntityId(id))

        if (_%[2]s.isFailure) {
            return left(Result.fail<void, void>("Ошибка! Не удалось изменить объект. " + _%[2]s.error?.toString())) as %[1]sResponse
        }

        const %[2]s: %[1]sEntity = _%[2]s.getValue() as %[1]sEntity
        let update%[2]s = {} 

        try {
            update%[2]s = await this.repository.create(%[2]s)
            DomainEvents.dispatchEventsForAggregate(new UniqueEntityId(id))
        }catch(err){
            return left(new GenericAppError.UnexpectedError(err)) as %[1]sResponse
        }

        return right(Result.ok<%[1]sEntity>(update%[2]s as %[1]sEntity)) as %[1]sResponse
    }
}`, singularCap, singular))

	return content.String()
}

// Создание Delete Usecase
func buildDeleteUsecaseContent(singular string, singularCap string) string {
	var content strings.Builder

	content.WriteString(fmt.Sprintf(`import { %[1]sEntity, Deleted%[1]sEntity } from '../domain/entities/%[2]s.entity'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { Result, left, right } from '../../../../../core/domain/types/result'
import { %[1]sResponse } from '../domain/types/response'
import { UniqueEntityId } from '../../../../../core/domain/types/uniqueentityid'
import { DomainEvents } from '../../../../../core/domain/events/domain.events'
import { GenericAppError } from '../../../../../core/errors/app.error'
import { type I%[1]sRepository } from '../domain/repositories/i.%[2]s.repository'

export class Delete%[1]sUseCase implements IUseCase<Promise<%[1]sResponse>> {
    constructor(private readonly repository: I%[1]sRepository) {}

    async execute(id: number): Promise<%[1]sResponse> {
        const _id  = new UniqueEntityId(id)
        const _delcontract = Deleted%[1]sEntity.delete(_id)

        if (_delcontract.isFailure) {
            return left(Result.fail<void, void>(new Error("Ошибка! Не удалось удалить"))) as %[1]sResponse
        }

        let deleted%[2]s = {}
        try {
            deleted%[2]s = await this.repository.delete(id)
            DomainEvents.dispatchEventsForAggregate(_id)
        }catch(err){
            return left(new GenericAppError.UnexpectedError(err)) as %[1]sResponse
        }

        return right(Result.ok<%[1]sEntity>({} as %[1]sEntity)) as %[1]sResponse
    }
}`, singularCap, singular))

	return content.String()
}

// Создание Get Usecase
func buildGetUsecaseContent(singular string, singularCap string, pluralCap string) string {
	var content strings.Builder

	content.WriteString(fmt.Sprintf(`import { IFindOptions, IPagination } from '../../../../../core/domain/types/types'
import { %[1]sEntity } from '../domain/entities/%[2]s.entity'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { Result, left, right } from '../../../../../core/domain/types/result'
import { %[1]sResponse, %[3]sResponse } from '../domain/types/response'
import { GenericAppError } from '../../../../../core/errors/app.error'
import { type I%[1]sRepository } from '../domain/repositories/i.%[2]s.repository'

export class Get%[1]sUseCase implements IUseCase<Promise<%[3]sResponse>> {
    constructor(private readonly repository: I%[1]sRepository) {}

    async execute(findOptions?: IFindOptions<%[1]sEntity, any>): Promise<%[3]sResponse> {
        let result = []
        try{
             result = await this.repository.find(findOptions)
        }catch(err){
            return left(new GenericAppError.UnexpectedError(err)) as %[3]sResponse
        }

        return right(Result.ok<%[1]sEntity[]>(result as %[1]sEntity[])) as %[3]sResponse
    }
}

export class GetOne%[1]sUseCase implements IUseCase<Promise<%[1]sResponse>> {
    constructor(private readonly repository: I%[1]sRepository) { }

    async execute(id: string): Promise<%[1]sResponse> {
        let result: %[1]sEntity
        try{
             result = await this.repository.findOne(id)
        }catch(err){
            return left(new GenericAppError.UnexpectedError(err)) as %[1]sResponse
        }

        return right(Result.ok<%[1]sEntity>(result)) as %[1]sResponse
    }
}
`, singularCap, singular, pluralCap))

	return content.String()
}
