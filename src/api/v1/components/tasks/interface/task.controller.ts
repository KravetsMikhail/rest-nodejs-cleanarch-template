import { type NextFunction, type Request, type Response } from 'express'
import { type ITaskRepository } from '../domain/repositories/i.task.repository'
import { type TaskEntity } from '../domain/entities/task.entity'
import { GetTasksUseCase, GetOneTaskUseCase } from '../usecases/get-task.usecase'
import { CreateTasksUseCase } from '../usecases/create-task.usecase'
import { DeleteTasksUseCase } from '../usecases/delete-task.usecase'
import { ReplaceTasksUseCase } from '../usecases/update-task.usecase'
import { CustomRequest } from '../../../../../core/domain/types/custom.request'
import { Helpers } from '../../../../../core/utils/helpers'

type QueryParams = {
    id: number
    email: string
    status: string
}

type QueryBody = {
    name: string
    search: string
}

export class TaskController {
    constructor(private readonly repository: ITaskRepository) { }

    public getTasks = (
        _req: Request<unknown, unknown, unknown, QueryParams>,
        res: Response<TaskEntity[]>,
        next: NextFunction
    ): void => {
        // if (_req && _req.query && _req.params && Object.keys(_req.query).length === 0 && _req.query.constructor === Object) {
        //     console.log("params => ", _req.params)   
        // } else if (_req && _req.query) {
        //     console.log("query => ", _req.query)            
        // }
        // else {
        //     return
        // }

        let findOptions = Helpers.getFilters(_req.query)

        new GetTasksUseCase(this.repository)
            .execute(findOptions)
            .then((result) => {
                if (result.isLeft()) {                    
                    const error = result.value
                    next(error.errorValue())
                } 
                return res.json((result as any).value.getValue())            
            })
            .catch((error) => {
                next(error)
            })
    }

    public getOneTask = (
        _req: Request<any, unknown, unknown, QueryParams>,
        res: Response<TaskEntity>,
        next: NextFunction
    ): void => {
        let _id = 0
        if (_req && _req.query && _req.params && Object.keys(_req.query).length === 0 && _req.query.constructor === Object) {
            _id = _req.params.id
        } 
        else {
            return
        }

        new GetOneTaskUseCase(this.repository)
            .execute(_id.toString())
            .then((result) => {
                if (result.isLeft()) {                    
                    const error = result.value
                    next(error.errorValue())
                } 
                return res.json((result as any).value.getValue())            
            })
            .catch((error) => {
                next(error)
            })
    }

    public createTask = (
        _req: Request<unknown, unknown, QueryBody, QueryParams>,
        res: Response<TaskEntity>,
        next: NextFunction
    ): void => {
        const userId = ((_req as unknown) as CustomRequest).payload.userId
        new CreateTasksUseCase(this.repository)
            .execute(_req.body.name, userId)
            .then((result) => {
                if (result.isLeft()) {                    
                    const error = result.value
                    next(error.errorValue())
                } 
                return res.json((result as any).value.getValue())                               
            })
            .catch((error) => {
                next(error)
            })
    }

    public deleteTask = (
        _req: Request<any, unknown, unknown, QueryParams>,
        res: Response<TaskEntity>,
        next: NextFunction
    ): void => {
        let _id = 0
        if (_req && _req.query && _req.params && Object.keys(_req.query).length === 0 && _req.query.constructor === Object) {
            _id = _req.params.id
        } else if (_req && _req.query) {
            _id = (_req.query as QueryParams).id
        }
        else {
            return
        }
        const userId = ((_req as unknown) as CustomRequest).payload.userId
        new DeleteTasksUseCase(this.repository)
            .execute(_id.toString(), userId)
            .then((result) => {
                if (result.isLeft()) {                    
                    const error = result.value
                    next(error.errorValue())
                } 
                return res.json((result as any).value.getValue())                               
            })
            .catch((error) => {
                next(error)
            })
    }

    public replaceTask = (
        _req: Request<unknown, unknown, QueryBody, QueryParams>,
        res: Response<TaskEntity>,
        next: NextFunction
    ): void => {
        const userId = ((_req as unknown) as CustomRequest).payload.userId
        new ReplaceTasksUseCase(this.repository)
            .execute(_req.body, userId)
            .then((result) => {
                if (result.isLeft()) {                    
                    const error = result.value
                    next(error.errorValue())
                } 
                return res.json((result as any).value.getValue())                               
            })
            .catch((error) => {
                next(error)
            })
    }
}