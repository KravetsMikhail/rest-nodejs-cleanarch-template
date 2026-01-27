package domain

import (
	"fmt"

	"component-generator/internal/model"
)

// GenerateValueObjectFiles generates Name and Search value objects.
func GenerateValueObjectFiles(config model.ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := Capitalize(singular)

	nameContent := fmt.Sprintf(`import { ValueObject } from '../../../../../../core/domain/types/valueobject'
import { Result } from '../../../../../../core/domain/types/result'

export interface %sNameProps { value: string }

export class %sName extends ValueObject<%sNameProps> {
    get value(): string { return this.props.value }

    private constructor(props: %sNameProps) { super(props) }

    public static create(name: string): Result<%sName> {
        if (!name || name.trim().length === 0) {
            return Result.fail<%sName, Error>(new Error('%s name is required'))
        }
        if (name.length > 100) {
            return Result.fail<%sName, Error>(new Error('%s name must be less than 100 characters'))
        }
        return Result.ok<%sName>(new %sName({ value: name.trim() }))
    }
}`, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap)

	WriteFile(fmt.Sprintf("%s/domain/valueobjects/%s.name.ts", basePath, singular), nameContent)

	searchContent := fmt.Sprintf(`import { ValueObject } from '../../../../../../core/domain/types/valueobject'

export interface %sSearchProps { value: string }

export class %sSearch extends ValueObject<%sSearchProps> {
    get value(): string { return this.props.value }

    private constructor(props: %sSearchProps) { super(props) }

    public static create(name: string, createdBy?: string, updatedBy?: string): %sSearch {
        const searchTerms = []
        if (name) searchTerms.push(name.toLowerCase())
        if (createdBy) searchTerms.push(createdBy.toLowerCase())
        if (updatedBy) searchTerms.push(updatedBy.toLowerCase())
        const searchValue = searchTerms.join(" ")
        return new %sSearch({ value: searchValue })
    }
}`, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap)

	WriteFile(fmt.Sprintf("%s/domain/valueobjects/%s.search.ts", basePath, singular), searchContent)
}
