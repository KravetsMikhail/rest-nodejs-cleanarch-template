import jwt, { Secret, JwtPayload } from 'jsonwebtoken'
//import { sign, SignOptions, verify, VerifyOptions, Secret, JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../../../core/errors/custom.error'

export const SECRET_KEY: Secret = '112233445566'

export interface CustomRequest extends Request {
    token: string | JwtPayload
}

interface TokenPayload {
    exp: string
    roles: string[]
    userName: string
    userId: number
    
}

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

        console.log(token, SECRET_KEY) //, jwt.verify(token, SECRET_KEY))

        jwt.verify(token, SECRET_KEY)
        //const decoded = jwt.verify(token, SECRET_KEY)

        //(req as CustomRequest).token = decoded

        next()
    } catch (err) {
        //res.status(401).send('Please authenticate')
        next(AppError.unauthorized("Авторизуйтесь!"))
    }
}