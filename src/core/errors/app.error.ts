
import { Result } from "../domain/types/result"
import { UseCaseError } from "./usecase.error"

export namespace GenericAppError {
    export class UnexpectedError extends Result<UseCaseError> {
        public constructor(err: any) {
            super(false, {
                message: `Произошла непредвиденная ошибка`,
                error: err
            } as UseCaseError)
            console.log(`[AppError]: Произошла непредвиденная ошибка`)
            console.error(err)
        }

        public static create(err: any): UnexpectedError {
            return new UnexpectedError(err)
        }
    }
}