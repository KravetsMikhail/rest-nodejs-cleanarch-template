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
import { %[1]sName } from '../domain/valueobjects/%[2]s.name'
import { %[1]sSearch } from '../domain/valueobjects/%[2]s.search'
import { UniqueEntityId } from '../../../../../core/domain/types/uniqueentityid'
import { DomainEvents } from '../../../../../core/domain/events/domain.events'
import { GetReflectionTypes, ReflectionData } from '../../../../../core/domain/types/reflections'

export class Create%[1]sUseCase implements IUseCase<Promise<%[1]sResponse>> {
    constructor(private readonly repository: any) {}

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

        const _name = %[1]sName.create(create%[2]s.name)
        if(_name.isFailure) {
            return left(Result.fail<void, void>(_name.error)) as %[1]sResponse
        }
        const _nameString = _name.getValue()?.value as string
        const _search = %[1]sSearch.create(_nameString, user, user)

        const combinedPropsResult = Result.combine([_name])

        if (combinedPropsResult.isFailure) {
            return left(Result.fail<void, void>(combinedPropsResult.error)) as %[1]sResponse
        }
        const _id = new UniqueEntityId()
        const _%[2]s = %[1]sEntity.create({
            name: _name?.getValue() as %[1]sName,
            search: _search.value,
            createdBy: user,
            updatedBy: user,
        }, _id)

        if (_%[2]s.isFailure) {
            return left(Result.fail<void, void>(combinedPropsResult.error)) as %[1]sResponse
        }

        const %[2]s: %[1]sEntity = _%[2]s.getValue() as %[1]sEntity
        let new%[2]s = {} 

        try {
            new%[2]s = await this.repository.create(%[2]s)
            DomainEvents.dispatchEventsForAggregate(_id)
        }catch(err){
            return left(new GenericAppError.UnexpectedError(err)) as %[1]sResponse
        }

        return right(Result.ok<%[1]sEntity>(new%[2]s as %[1]sEntity)) as %[1]sResponse
    }
}`, singularCap, singular)

	domain.WriteFile(fmt.Sprintf("%s/usecases/create-%s.usecase.ts", basePath, singular), createUsecaseContent)

	updateUsecaseContent := fmt.Sprintf(`import { %[1]sEntity } from '../domain/entities/%[2]s.entity'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { Result, left, right } from '../../../../../core/domain/types/result'
import { %[1]sResponse } from '../domain/types/response'
import { %[1]sName } from '../domain/valueobjects/%[2]s.name'
import { %[1]sSearch } from '../domain/valueobjects/%[2]s.search'
import { UniqueEntityId } from '../../../../../core/domain/types/uniqueentityid'
import { DomainEvents } from '../../../../../core/domain/events/domain.events'
import { GetReflectionTypes, ReflectionData } from '../../../../../core/domain/types/reflections'

export class Update%[1]sUseCase implements IUseCase<Promise<%[1]sResponse>> {
    constructor(private readonly repository: any) {}

    async execute(id: number, upd%[2]s: any, user: string): Promise<%[1]sResponse> {
        if (!upd%[2]s) {
            return left(Result.fail<void, void>("Ошибка! Нет данных")) as %[1]sResponse
        }
        let _reflect = GetReflectionTypes(%[1]sEntity)
        let _isOk: boolean = true;
        for (const k of Object.getOwnPropertyNames(upd%[2]s)) {
            if (!(_reflect as ReflectionData[]).find(r => r.field.replace(/_/ig, '').toLowerCase() === k.replace(/_/ig, '').toLowerCase())) {
                _isOk = false
                break
            }
        }
        if (!_isOk) {
            return left(Result.fail<void, void>("Ошибка! Не верный или не полный состав данных")) as %[1]sResponse
        }

        const _name = %[1]sName.create(upd%[2]s.name)

        const _%[2]s = %[1]sEntity.update({
            name: _name?.getValue() as %[1]sName,
            search: upd%[2]s.search as string,
            updatedBy: user,
            createdAt: upd%[2]s.createdAt,
            createdBy: upd%[2]s.createdBy
        }, new UniqueEntityId(id))

        if (_%[2]s.isFailure) {
            return left(Result.fail<void, void>("Ошибка! Не удалось создать %[1]s для обновления")) as %[1]sResponse
        }

        const %[2]s: %[1]sEntity = _%[2]s.getValue() as %[1]sEntity
        let update%[2]s = {} 

        try {
            update%[2]s = await this.repository.update(id, %[2]s)
            DomainEvents.dispatchEventsForAggregate(new UniqueEntityId(id))
        }catch(err){
            return left(new GenericAppError.UnexpectedError(err)) as %[1]sResponse
        }

        return right(Result.ok<%[1]sEntity>(update%[2]s as %[1]sEntity)) as %[1]sResponse
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

