package domain

import (
	"fmt"

	"component-generator/internal/model"
)

// GenerateTypeFiles generates response type/wrapper.
func GenerateTypeFiles(config model.ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := Capitalize(singular)

	responseContent := fmt.Sprintf(`import { %sEntity } from '../entities/%s.entity'
import { Result, left, right } from '../../../../../../core/domain/types/result'
import { GenericAppError } from '../../../../../../core/errors/app.error'

export type %sResponseType = Promise<Result<%sEntity, GenericAppError>>

export class %sResponse {
    public static success(result: %sEntity): %sResponseType {
        return Promise.resolve(right(Result.ok(result)))
    }

    public static fail(error: GenericAppError): %sResponseType {
        return Promise.resolve(left(Result.fail(error)))
    }
}`, singularCap, singular, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap)

	WriteFile(fmt.Sprintf("%s/domain/types/response.ts", basePath), responseContent)
}
