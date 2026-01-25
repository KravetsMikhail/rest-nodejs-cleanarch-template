package main

import (
	"fmt"
	"strings"
)

func generateEntityFiles(config ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := capitalize(singular)
	
	// Generate additional fields from migration
	var additionalProps []string
	var additionalGetters []string
	
	for _, field := range config.TableFields {
		fieldName := capitalize(field.Name)
		tsType := mapSQLTypeToTypeScript(field.Type)
		dbType := mapSQLTypeToDbTypes(field.Type)
		
		// Add to interface props
		propLine := fmt.Sprintf("    %s%s: %s,", field.Name, getOptionalSuffix(field.Nullable), tsType)
		additionalProps = append(additionalProps, propLine)
		
		// Add getter
		getterLine := fmt.Sprintf(`    
    @DbType(%s)
    get %s(): %s { return this.props.%s }`, dbType, fieldName, tsType, field.Name)
		additionalGetters = append(additionalGetters, getterLine)
	}
	
	// Build entity content step by step
	var entityContent strings.Builder
	
	// Imports
	imports := fmt.Sprintf(`import { UniqueEntityId } from '../../../../../../core/domain/types/uniqueentityid'
import { ValidationError } from '../../../../../../core/errors/validation.error'
import { AggregateRoot } from '../../../../../../core/domain/types/aggregate.root'
import { %sName } from '../valueobjects/%s.name'
import { %sSearch } from '../valueobjects/%s.search'
import { Result } from '../../../../../../core/domain/types/result'
import { Guard } from '../../../../../../core/domain/types/guard'
import { I%sCreatedEventProps, %sCreatedEvent } from '../events/%s.created.events'
import { %sDeletedEvent } from '../events/%s.deleted.events'
import { %sUpdatedEvent } from '../events/%s.updated.events'
import { DbTypes, DbType, ID } from '../../../../../../core/domain/types/reflections'

`, singularCap, singular, singularCap, singular,
		singularCap, singularCap, singular, singularCap, singular,
		singularCap, singular, singularCap, singular)
	entityContent.WriteString(imports)
	
	// Interface
	entityContent.WriteString(fmt.Sprintf(`export interface I%sProps {
    name: %sName,
    search: string,
    createdBy?: string,
    createdAt?: Date,
    updatedBy?: string,
    updatedAt?: Date`, singularCap, singularCap))
	
	// Add additional properties
	for _, prop := range additionalProps {
		entityContent.WriteString("\n")
		entityContent.WriteString(prop)
	}
	
	entityContent.WriteString("\n}\n\n")
	
	// Class
	classContent := fmt.Sprintf(`export class %sEntity extends AggregateRoot<I%sProps> {
    @ID @DbType(DbTypes.Number)
    get id(): UniqueEntityId { return this._id }
    
    @DbType(DbTypes.String)
    get name(): %sName { return this.props.name }
    
    @DbType(DbTypes.String)
    get search(): %sSearch { 
        return %sSearch.create(this.props.name.value, this.props?.createdBy, this.props?.updatedBy)
    }
    
    @DbType(DbTypes.String)
    get createdBy(): string { return this.props?.createdBy || "" }
    
    @DbType(DbTypes.Date)
    get createdAt(): Date { return this.props?.createdAt || new Date() }
    
    @DbType(DbTypes.String)
    get updatedBy(): string { return this.props?.updatedBy || "" }
    
    @DbType(DbTypes.Date)
    get updatedAt(): Date { return this.props?.updatedAt || new Date() }`, singularCap, singularCap, singularCap, singularCap, singularCap)
	entityContent.WriteString(classContent)
	
	// Add additional getters
	for _, getter := range additionalGetters {
		entityContent.WriteString(getter)
	}
	
	constructorContent := fmt.Sprintf(`

    private constructor(props: I%sProps, id?: UniqueEntityId) {
        super(props, id)
    }

    public static create(props: I%sProps, id?: UniqueEntityId, isCreateEvent: boolean = true): Result<%sEntity> {
        const guardResult = Guard.againstNullOrUndefinedBulk([
            { argument: props.name, argumentName: 'name' },
        ])

        if (!guardResult.succeeded) {
            return Result.fail<%sEntity, ValidationError>(
                new ValidationError([{ fields: ["name"], constraint: guardResult.message as string }])
            )
        }
        
        const i%s = { %s: new %sEntity({ ...props }, id) } as I%sCreatedEventProps

        if (isCreateEvent) {
            i%s.%s.addDomainEvent(new %sCreatedEvent(i%s))
        }

        return Result.ok<%sEntity>(i%s.%s)
    }
}`, singularCap, singularCap, singularCap, singularCap,
		singular, singularCap, singularCap, singularCap,
		singularCap, singularCap, singularCap, singularCap,
		singularCap, singularCap, singularCap, singularCap)
	entityContent.WriteString(constructorContent)

	writeFile(fmt.Sprintf("%s/domain/entities/%s.entity.ts", basePath, singular), entityContent.String())

	idEntityContent := fmt.Sprintf(`import { UniqueEntityId } from '../../../../../../core/domain/types/uniqueentityid'
import { ValueObject } from '../../../../../../core/domain/types/value.object'

export class %sId extends ValueObject<{ value: UniqueEntityId }> {
    get value(): UniqueEntityId { return this.props.value }

    private constructor(props: { value: UniqueEntityId }) { super(props) }

    public static create(id: UniqueEntityId): %sId {
        return new %sId({ value: id })
    }
}`, singularCap, singularCap, singularCap)

	writeFile(fmt.Sprintf("%s/domain/entities/%sid.entity.ts", basePath, singular), idEntityContent)
}

func getOptionalSuffix(nullable bool) string {
	if nullable {
		return "?"
	}
	return ""
}

func generateValueObjectFiles(config ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := capitalize(singular)
	
	nameContent := fmt.Sprintf(`import { ValueObject } from '../../../../../../core/domain/types/value.object'
import { Result } from '../../../../../../core/domain/types/result'

export interface %sNameProps { value: string }

export class %sName extends ValueObject<%sNameProps> {
    get value(): string { return this.props.value }

    private constructor(props: %sNameProps) { super(props) }

    public static create(name: string): Result<%sName> {
        if (!name || name.trim().length === 0) {
            return Result.fail<%sName>(new Error('%s name is required'))
        }
        if (name.length > 255) {
            return Result.fail<%sName>(new Error('%s name must be less than 255 characters'))
        }
        return Result.ok<%sName>(new %sName({ value: name.trim() }))
    }
}`, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap)

	writeFile(fmt.Sprintf("%s/domain/valueobjects/%s.name.ts", basePath, singular), nameContent)

	searchContent := fmt.Sprintf(`import { ValueObject } from '../../../../../../core/domain/types/value.object'
import { Result } from '../../../../../../core/domain/types/result'

export interface %sSearchProps { value: string }

export class %sSearch extends ValueObject<%sSearchProps> {
    get value(): string { return this.props.value }

    private constructor(props: %sSearchProps) { super(props) }

    public static create(name: string, createdBy?: string, updatedBy?: string): Result<%sSearch> {
        const searchTerms = []
        if (name) searchTerms.push(name.toLowerCase())
        if (createdBy) searchTerms.push(createdBy.toLowerCase())
        if (updatedBy) searchTerms.push(updatedBy.toLowerCase())
        const searchValue = searchTerms.join(" ")
        return Result.ok<%sSearch>(new %sSearch({ value: searchValue }))
    }
}`, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap)

	writeFile(fmt.Sprintf("%s/domain/valueobjects/%s.search.ts", basePath, singular), searchContent)
}
