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
		// Skip system fields that are already handled
		if field.Name == "name" || field.Name == "created_at" || field.Name == "updated_at" || 
		   field.Name == "createdby" || field.Name == "updatedby" {
			continue
		}
		
		tsType := mapSQLTypeToTypeScript(field.Type)
		dbType := mapSQLTypeToDbTypes(field.Type)
		
		// Add to interface props
		propLine := fmt.Sprintf("    %s%s: %s,", field.Name, getOptionalSuffix(field.Nullable), tsType)
		additionalProps = append(additionalProps, propLine)
		
		// Add getter with camelCase name (convert snake_case to camelCase)
		camelFieldName := toCamelCase(field.Name)
		getterLine := fmt.Sprintf(`    
    @DbType(%s)
    get %s(): %s { return this.props.%s || %s }`, 
			dbType, camelFieldName, tsType, field.Name, getDefaultValue(tsType))
		additionalGetters = append(additionalGetters, getterLine)
	}
	
	// Build entity content
	var content strings.Builder
	
	// Write imports separately
	content.WriteString("import { UniqueEntityId } from '../../../../../../core/domain/types/uniqueentityid'\n")
	content.WriteString("import { ValidationError } from '../../../../../../core/errors/validation.error'\n")
	content.WriteString("import { AggregateRoot } from '../../../../../../core/domain/types/aggregate.root'\n")
	content.WriteString(fmt.Sprintf("import { %sName } from '../valueobjects/%s.name'\n", singularCap, singular))
	content.WriteString(fmt.Sprintf("import { %sSearch } from '../valueobjects/%s.search'\n", singularCap, singular))
	content.WriteString("import { Result } from '../../../../../../core/domain/types/result'\n")
	content.WriteString("import { Guard } from '../../../../../../core/domain/types/guard'\n")
	content.WriteString(fmt.Sprintf("import { I%sCreatedEventProps, %sCreatedEvent } from '../events/%s.created.events'\n", singularCap, singularCap, singular))
	content.WriteString(fmt.Sprintf("import { %sDeletedEvent } from '../events/%s.deleted.events'\n", singularCap, singular))
	content.WriteString(fmt.Sprintf("import { %sUpdatedEvent } from '../events/%s.updated.events'\n", singularCap, singular))
	content.WriteString("import { DbTypes, DbType, ID } from '../../../../../../core/domain/types/reflections'\n\n")
	
	// Interface
	content.WriteString(fmt.Sprintf("export interface I%sProps {\n", singularCap))
	content.WriteString(fmt.Sprintf("    name: %sName,\n", singularCap))
	content.WriteString("    search: string,\n")
	content.WriteString("    createdBy?: string,\n")
	content.WriteString("    createdAt?: Date,\n")
	content.WriteString("    updatedBy?: string,\n")
	content.WriteString("    updatedAt?: Date")
	
	// Add additional properties
	for _, prop := range additionalProps {
		content.WriteString("\n")
		content.WriteString(prop)
	}
	
	content.WriteString("\n}\n\n")
	
	// Class
	content.WriteString(fmt.Sprintf("export class %sEntity extends AggregateRoot<I%sProps> {\n", singularCap, singularCap))
	content.WriteString("    @ID @DbType(DbTypes.Number)\n")
	content.WriteString("    get id(): UniqueEntityId { return this._id }\n\n")
	
	content.WriteString("    @DbType(DbTypes.String)\n")
	content.WriteString(fmt.Sprintf("    get name(): %sName { return this.props.name }\n\n", singularCap))
	
	content.WriteString("    @DbType(DbTypes.String)\n")
	content.WriteString(fmt.Sprintf("    get search(): %sSearch { \n", singularCap))
	content.WriteString(fmt.Sprintf("        return %sSearch.create(this.props.name.value, this.props?.createdBy, this.props?.updatedBy)\n", singularCap))
	content.WriteString("    }\n\n")
	
	content.WriteString("    @DbType(DbTypes.String)\n")
	content.WriteString("    get createdBy(): string { return this.props?.createdBy || \"\" }\n\n")
	
	content.WriteString("    @DbType(DbTypes.Date)\n")
	content.WriteString("    get createdAt(): Date { return this.props?.createdAt || new Date() }\n\n")
	
	content.WriteString("    @DbType(DbTypes.String)\n")
	content.WriteString("    get updatedBy(): string { return this.props?.updatedBy || \"\" }\n\n")
	
	content.WriteString("    @DbType(DbTypes.Date)\n")
	content.WriteString("    get updatedAt(): Date { return this.props?.updatedAt || new Date() }")
	
	// Add additional getters
	for _, getter := range additionalGetters {
		content.WriteString(getter)
	}
	
	// Constructor and create method
	constructorTemplate := fmt.Sprintf(`

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
        
        const %sEntity = new %sEntity({ ...props }, id)
        const eventProps = { %s: %sEntity } as I%sCreatedEventProps

        if (isCreateEvent) {
            %sEntity.addDomainEvent(new %sCreatedEvent(eventProps))
        }

        return Result.ok<%sEntity>(%sEntity)
    }
}`, singularCap, singularCap, singularCap, singularCap,
		singular, singularCap, singular, singularCap, singularCap,
		singular, singularCap, singular, singularCap, singularCap)
	content.WriteString(constructorTemplate)

	content.WriteString("}\n")
	
	writeFile(fmt.Sprintf("%s/domain/entities/%s.entity.ts", basePath, singular), content.String())

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

func getDefaultValue(tsType string) string {
	switch tsType {
	case "string":
		return `""`
	case "number":
		return `0`
	case "boolean":
		return `false`
	case "Date":
		return `new Date()`
	default:
		return `null`
	}
}

func toCamelCase(s string) string {
	parts := strings.Split(s, "_")
	for i := 1; i < len(parts); i++ {
		parts[i] = capitalize(parts[i])
	}
	return strings.Join(parts, "")
}
