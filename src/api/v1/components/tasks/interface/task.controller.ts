import { type NextFunction, type Request, type Response } from 'express'
import { type ITaskRepository } from '../domain/repositories/i.task.repository'
import { type TaskEntity } from '../domain/entities/task.entity'
import { GetTasks } from '../usecases/get-tasks.usecase'
import { CreateTask } from '../usecases/create-task.usecase'
import { DeleteTask } from '../usecases/delete-task.usecase'
import { CustomRequest } from 'src/core/types/custom.request'

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
    //* Dependency injection
    constructor(private readonly repository: ITaskRepository) { }

    public getTasks = (
        _req: Request<unknown, unknown, unknown, QueryParams>,
        res: Response<TaskEntity[]>,
        next: NextFunction
    ): void => {
        if (_req && _req.query && _req.params && Object.keys(_req.query).length === 0 && _req.query.constructor === Object) {
            //console.log("params => ", _req.params)   
        } else if (_req && _req.query) {
            //console.log("query => ", _req.query)            
        }
        else {
            return
        }
        new GetTasks(this.repository)
            .execute(_req.route.email, _req.route.status)
            .then((result) => res.json(result))
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
        new CreateTask(this.repository)
            .execute(_req.body.name, _req.body.search, userId)
            .then((result) => res.json(result))
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
            //console.log("params => ", _req.params)   
            _id = _req.params.id
        } else if (_req && _req.query) {
            //console.log("query => ", _req.query)      
            _id = (_req.query as QueryParams).id      
        }
        else {
            return
        }
        new DeleteTask(this.repository)
            .execute(_req.params.id)
            .then((result) => res.json(result))
            .catch((error) => {
                next(error)
            })
    }
}