package domain

import (
	"fmt"

	"component-generator/internal/model"
)

// GenerateTypeFiles generates response type/wrapper.
func GenerateTypeFiles(config model.ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := Capitalize(singular)
	pluralCap := Capitalize(config.PluralName)

	responseContent := fmt.Sprintf(`import { Result, Either, left, right } from '../../../../../../core/domain/types/result'
import { GenericAppError } from '../../../../../../core/errors/app.error'
import { %[1]sEntity } from '../entities/%[2]s.entity'

export type %[1]sResponse = Either<
    GenericAppError.UnexpectedError |
    Result<any>,
    Result<%[1]sEntity>
>

export type %[3]sResponse = Either<
    GenericAppError.UnexpectedError |
    Result<any>,
    Result<%[1]sEntity[]>
>
`, singularCap, singular, pluralCap)

	WriteFile(fmt.Sprintf("%s/domain/types/response.ts", basePath), responseContent)
}
