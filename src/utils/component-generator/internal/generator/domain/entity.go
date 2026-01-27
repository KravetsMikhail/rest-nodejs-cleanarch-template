package domain

import (
	"fmt"
	"os"
	"strings"

	"component-generator/internal/migration"
	"component-generator/internal/model"
)

// shared helpers

func Capitalize(s string) string {
	return strings.Title(s)
}

func getOptionalSuffix(nullable bool) string {
	if nullable {
		return "?"
	}
	return ""
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
		parts[i] = Capitalize(parts[i])
	}
	return strings.Join(parts, "")
}

func WriteFile(path, content string) {
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		fmt.Printf("Error writing file %s: %v\n", path, err)
	} else {
		fmt.Printf("Created file: %s\n", path)
	}
}

// GenerateEntityFiles generates entity and id-entity files based on migration fields.
func GenerateEntityFiles(config model.ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := Capitalize(singular)

	var content strings.Builder

	// imports
	content.WriteString("import { UniqueEntityId } from '../../../../../../core/domain/types/uniqueentityid'\n")
	content.WriteString("import { AggregateRoot } from '../../../../../../core/domain/types/aggregate.root'\n")
	content.WriteString("import { Result } from '../../../../../../core/domain/types/result'\n")
	content.WriteString(fmt.Sprintf("import { I%sCreatedEventProps, %sCreatedEvent } from '../events/%s.created.events'\n", singularCap, singularCap, singular))
	content.WriteString(fmt.Sprintf("import { %sDeletedEvent } from '../events/%s.deleted.events'\n", singularCap, singular))
	content.WriteString(fmt.Sprintf("import { %sUpdatedEvent } from '../events/%s.updated.events'\n", singularCap, singular))
	content.WriteString("import { DbTypes, DbType, ID } from '../../../../../../core/domain/types/reflections'\n\n")

	// interface
	content.WriteString(fmt.Sprintf("export interface I%sProps {\n", singularCap))
	for _, field := range config.TableFields {
		// skip technical primary key - handled by UniqueEntityId getter
		if strings.EqualFold(field.Name, "id") {
			continue
		}
		tsType := migration.MapSQLTypeToTypeScript(field.Type)
		propLine := fmt.Sprintf("    %s%s: %s\n", field.Name, getOptionalSuffix(field.Nullable), tsType)
		content.WriteString(propLine)
	}
	content.WriteString("}\n\n")

	// class
	content.WriteString(fmt.Sprintf("export class %sEntity extends AggregateRoot<I%sProps> {\n", singularCap, singularCap))
	content.WriteString("    @ID @DbType(DbTypes.Number)\n")
	content.WriteString("    get id(): UniqueEntityId { return this._id }\n\n")

	for _, field := range config.TableFields {
		// skip technical primary key - handled by UniqueEntityId getter
		if strings.EqualFold(field.Name, "id") {
			continue
		}
		tsType := migration.MapSQLTypeToTypeScript(field.Type)
		dbType := migration.MapSQLTypeToDbTypes(field.Type)
		camelFieldName := toCamelCase(field.Name)

		getter := fmt.Sprintf(`    @DbType(%s)
    get %s(): %s { return this.props.%s || %s }

`, dbType, camelFieldName, tsType, field.Name, getDefaultValue(tsType))

		content.WriteString(getter)
	}

	entityVarName := toCamelCase(singular) + "Entity"
	constructorTemplate := fmt.Sprintf(`

    private constructor(props: I%[1]sProps, id?: UniqueEntityId) {
        super(props, id)
    }

    public static create(props: I%[1]sProps, id?: UniqueEntityId, isCreateEvent: boolean = true): Result<%[1]sEntity> {
        const %[3]s = new %[1]sEntity({ ...props }, id)
        const eventProps = { %[2]s: %[3]s } as I%[1]sCreatedEventProps

        if (isCreateEvent) {
            %[3]s.addDomainEvent(new %[1]sCreatedEvent(eventProps))
        }

        return Result.ok<%[1]sEntity>(%[3]s)
    }

    public static update(props: I%[1]sProps, id?: UniqueEntityId): Result<%[1]sEntity> {
        const %[3]s = new %[1]sEntity({ ...props }, id)
        %[3]s.addDomainEvent(new %[1]sUpdatedEvent(%[3]s))

        return Result.ok<%[1]sEntity>(%[3]s)
    }

    public static delete(entity: %[1]sEntity): Result<%[1]sEntity> {
        entity.addDomainEvent(new %[1]sDeletedEvent(entity))
        return Result.ok<%[1]sEntity>(entity)
    }
`, singularCap, singular, entityVarName)
	content.WriteString(constructorTemplate)

	// close entity class
	content.WriteString("}\n")

	WriteFile(fmt.Sprintf("%s/domain/entities/%s.entity.ts", basePath, singular), content.String())

	idEntityContent := fmt.Sprintf(`import { Entity } from '../../../../../../core/domain/types/entity'
import { UniqueEntityId } from '../../../../../../core/domain/types/uniqueentityid'

export class %sId extends Entity<any> {
    get id(): UniqueEntityId { return this._id }

    private constructor(id?: UniqueEntityId) {
        super(null, id)
    }

    public static create(id?: UniqueEntityId): %sId {
        return new %sId(id)
    }
}`, singularCap, singularCap, singularCap)

	WriteFile(fmt.Sprintf("%s/domain/entities/%sid.entity.ts", basePath, singular), idEntityContent)
}
