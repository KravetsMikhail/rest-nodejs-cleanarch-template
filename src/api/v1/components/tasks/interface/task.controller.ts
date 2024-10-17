import { type NextFunction, type Request, type Response } from 'express'
import { type TaskRepository } from '../domain/repositories/i.task.repository'
import { type TaskEntity } from '../domain/entities/v1/task.entity'
import { GetTasks } from '../domain/usecases/get-tasks.usecase'
import { CreateTask } from '../domain/usecases/create-task.usecase'

type QueryParams = {
    email: string
    status: string
}

type QueryBody = {
    name: string
    search: string
}

export class TaskController {
    //* Dependency injection
    constructor(private readonly repository:TaskRepository) { }

    public getTasks = (
        _req: Request<unknown, unknown, unknown, QueryParams>,
        res: Response<TaskEntity[]>,
        next: NextFunction
    ): void => {        
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
        new CreateTask(this.repository)
        .execute(_req.body.name, _req.body.search)
        .then((result) => res.json(result))
        .catch((error) => {
            next(error)
        })
    }

}