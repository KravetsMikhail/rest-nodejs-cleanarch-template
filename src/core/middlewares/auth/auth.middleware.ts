import jwt, { Secret } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../../../core/errors/custom.error'
import { ErrorMiddleware } from '../errors/error.middleware'
import { CustomRequest, TokenPayload } from '../../../core/interfaces/customrequest'

export const SECRET_KEY: Secret = '112233445566'

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '')

        if (!token) {
            throw new Error()
        }

        //const token = jwt.sign({
        //    data: 'foobar'
        //  }, SECRET_KEY, { expiresIn: '1h' })
        //const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiZm9vYmFyIiwiaWF0IjoxNzI5MTczMjQ3LCJleHAiOjE3MjkxNzY4NDd9.uTamOlz7OU-tWlwmVmt6F-VB6AZwocU8O7DWyO-YyEo'

        const decoded = (jwt.verify(token, SECRET_KEY) as unknown) as TokenPayload

        (req as CustomRequest).payload = decoded

        next()
    } catch (err) {
        res.status(401)
        ErrorMiddleware.handleError(AppError.unauthorized("Ошибка авторизации!"), req, res, next)
        //next(AppError.unauthorized("Ошибка авторизации!"))
    }
}