import jwt, { Secret, JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../../../core/errors/custom.error'
import { ErrorMiddleware } from '../errors/error.middleware'
import { CustomRequest, TokenPayload } from '../../domain/types/custom.request'
import { Logger } from '../../logger/logger'
import { HttpCode } from '../../constants/httpcodes'

export class AuthMiddleware {
    private static readonly SECRET_KEY: Secret = process.env.JWT_SECRET || '112233445566'
    private static readonly logger = new Logger()

    public static verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const token = this.extractToken(req)
            if (!token) {
                throw AppError.unauthorized('No token provided')
            }

            const decoded = this.verifyAndDecodeToken(token)
            this.attachPayloadToRequest(req as CustomRequest, decoded)

            next()
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                ErrorMiddleware.handleError(
                    AppError.unauthorized('Invalid token'),
                    req,
                    res,
                    next
                )
            } else if (error instanceof jwt.TokenExpiredError) {
                ErrorMiddleware.handleError(
                    AppError.unauthorized('Token expired'),
                    req,
                    res,
                    next
                )
            } else {
                ErrorMiddleware.handleError(
                    error instanceof AppError ? error : AppError.unauthorized('Authentication failed'),
                    req,
                    res,
                    next
                )
            }
        }
    }

    private static extractToken(req: Request): string | null {
        const authHeader = req.header('Authorization')
        if (!authHeader) {
            return null
        }

        const [type, token] = authHeader.split(' ')
        return type === 'Bearer' ? token : null
    }

    private static verifyAndDecodeToken(token: string): TokenPayload {
        try {
            const decoded = jwt.verify(token, this.SECRET_KEY) as JwtPayload
            return this.validateTokenPayload(decoded)
        } catch (error) {
            this.logger.error('Token verification failed', { error })
            throw error
        }
    }

    private static validateTokenPayload(decoded: JwtPayload): TokenPayload {
        if (!decoded.exp || !decoded.userId || !decoded.userName) {
            throw AppError.unauthorized('Invalid token payload')
        }

        return {
            exp: decoded.exp as number,
            roles: decoded.roles || [],
            userName: decoded.userName,
            userId: decoded.userId,
            token: decoded
        }
    }

    private static attachPayloadToRequest(req: CustomRequest, payload: TokenPayload): void {
        req.payload = payload
    }

    public static generateToken(payload: Omit<TokenPayload, 'exp' | 'token'>): string {
        const tokenPayload: JwtPayload = {
            ...payload,
            exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
        }

        return jwt.sign(tokenPayload, this.SECRET_KEY)
    }
}

// Export for backward compatibility
export const auth = AuthMiddleware.verifyToken