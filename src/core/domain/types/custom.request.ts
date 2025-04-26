import { Request } from 'express'
import { JwtPayload } from 'jsonwebtoken'

export interface CustomRequest extends Request {
    payload: TokenPayload
}

export interface TokenPayload extends Omit<JwtPayload, 'exp'> {
    exp: number
    roles: string[]
    userName: string
    userId: number
    token: JwtPayload
}

export interface TokenPayloadInput {
    roles?: string[]
    userName: string
    userId: number
}
