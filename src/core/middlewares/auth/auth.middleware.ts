import jwt, { Secret, JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../../../core/errors/custom.error'
import { ErrorMiddleware } from '../errors/error.middleware'
import { CustomRequest, TokenPayload } from '../../domain/types/custom.request'
import { Logger } from '../../logger/logger'
import jwksClient from 'jwks-rsa'

export class AuthMiddleware {
    private static readonly logger = new Logger()
    private static readonly keycloakDomain = process.env.KEYCLOAK_DOMAIN || 'http://localhost:8282'
    private static readonly realmName = process.env.KEYCLOAK_REALM || 'master'
    private static readonly jwksClient = jwksClient({
        jwksUri: `${this.keycloakDomain}/realms/${this.realmName}/protocol/openid-connect/certs`,
    })

    public static getKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void => {
        this.jwksClient.getSigningKey(header.kid, (err, key) => {
            if (err) {
                this.logger.error(`Error fetching signing key: ${err.message}`)
                callback(err, undefined)
            } else {
                const signingKey = key?.getPublicKey()
                callback(null, signingKey)
            }
        })
    }

    public static verify(token: string): Promise<JwtPayload> {
        return new Promise(
            (
                resolve: (decoded: JwtPayload) => void,
                reject: (error: Error) => void
            ) => {
                const verifyCallback: jwt.VerifyCallback = (
                    error: jwt.VerifyErrors | null,
                    decoded: any
                ): void => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(decoded);
                };

                jwt.verify(token, this.getKey, verifyCallback);
            }
        );
    }

    public static verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const token = this.extractToken(req)
            if (!token) {
                throw AppError.unauthorized('No token provided')
            }
            this.verify(token).then((decoded) => {
                this.attachPayloadToRequest(req as CustomRequest, this.validateTokenPayload(decoded))
                next()
            }).catch((error) => {
                console.log("error 1 => ", error)
                ErrorMiddleware.handleError(
                    AppError.unauthorized('Authentication failed'),
                    req,
                    res,
                    next
                )
            })
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
                console.log("error 2 => ", error)
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

    private static validateTokenPayload(decoded: JwtPayload): TokenPayload {
        // if (!decoded.exp || !decoded.userId || !decoded.userName) {
        //     throw AppError.unauthorized('Invalid token payload')
        // }

        return {
            exp: decoded.exp as number,
            roles: decoded.roles || [],
            userName: decoded.userName,
            userId: decoded.userId,
            token: decoded
        }
    }

    //private static attachPayloadToRequest(req: CustomRequest, payload: TokenPayload): void {
    private static attachPayloadToRequest(req: CustomRequest, payload: TokenPayload): void {
        req.payload = payload
    }
}

// Export for backward compatibility
export const auth = AuthMiddleware.verifyToken