import { type HttpCode } from '../constants/httpcodes';

export interface ValidationType {
    fields: string[]
    constraint: string
}

export class ValidationError extends Error {
    public readonly statusCode: HttpCode
    public readonly validationErrors: ValidationType[]

    constructor(validationErrors: ValidationType[]) {
        super('Validation Error')
        Object.setPrototypeOf(this, new.target.prototype)
        this.statusCode = 400
        this.validationErrors = validationErrors
        Error.captureStackTrace(this)
    }
}