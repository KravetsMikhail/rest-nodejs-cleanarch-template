import { Request } from 'express'
import { JwtPayload } from 'jsonwebtoken'

export interface CustomRequest extends Request {
    payload: TokenPayload
}

export interface TokenPayload {
    exp: string
    roles: string[]
    userName: string
    userId: number
    token: string | JwtPayload    
}
