import { type NextFunction, type Request, type Response } from 'express'
import { type ITaskRepository } from '../domain/repositories/i.task.repository'
import { type TaskEntity } from '../domain/entities/task.entity'
import { GetTasksUseCase, GetOneTaskUseCase } from '../usecases/get-task.usecase'
import { CreateTasksUseCase } from '../usecases/create-task.usecase'
import { DeleteTasksUseCase } from '../usecases/delete-task.usecase'
import { ReplaceTasksUseCase } from '../usecases/update-task.usecase'
import { CustomRequest } from '../../../../../core/domain/types/custom.request'
import { Helpers } from '../../../../../core/utils/helpers'

/**
 * @swagger
 * tags:
 *   name: tasks
 *   description: Operations with tasks
 */

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

    /**
     * @swagger
     * /tasks:
     *   get:
     *     summary: Get list of tasks
     *     tags: [tasks]
     *     security:
     *       - JWT: [read]
     *     parameters:
     *       - in: query
     *         name: name
     *         schema:
     *           type: string
     *         description: Filter by name
     *         example: задача1
     *       - in: query
     *         name: offset
     *         schema:
     *           type: integer
     *         description: Offset for pagination
     *         example: 0
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         description: Limit for pagination
     *         example: 10
     *       - in: query
     *         name: sort
     *         schema:
     *           type: string
     *         description: Sort field
     *         example: name
     *       - in: query
     *         name: order
     *         schema:
     *           type: string
     *           enum: [desc, asc]
     *         description: Sort order
     *         example: desc
     *     responses:
     *       200:
     *         description: List of tasks
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Task'
     *       400:
     *         description: Error
     *         $ref: "#/components/responses/Error400"
     *       401:
     *         description: Unauthorized
     *         $ref: "#/components/responses/Unauthorized"
     *       500:
     *         description: Internal Server Error
     */
    public getTasks = (
        _req: Request<unknown, unknown, unknown, QueryParams>,
        res: Response<TaskEntity[]>,
        next: NextFunction
    ): void => {

        let findOptions = Helpers.getFilters(_req.query)

        new GetTasksUseCase(this.repository)
            .execute(findOptions)
            .then((result) => {
                if (result.isLeft()) {                    
                    const error = result.value
                    next(error.errorValue())
                } 
                //console.log(res.json((result as any)))
                return res.json(result.value.getValue())       
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
    /**
     * @swagger
     * /tasks:
     *   post:
     *     summary: Create new task
     *     tags: [tasks]
     *     security:
     *       - JWT: [write]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: "#/components/schemas/Task"
     *     responses:
     *       200:
     *         description: Task created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Task'
     *       400:
     *         description: Error
     *         $ref: '#/components/responses/Error400'
     *       401:
     *         description: Unauthorized
     *         $ref: '#/components/responses/Unauthorized'
     *       500:
     *         description: Internal Server Error
     */
    public createTask = (
        _req: Request<unknown, unknown, QueryBody, QueryParams>,
        res: Response<TaskEntity>,
        next: NextFunction
    ): void => {
        const user = ((_req as unknown) as CustomRequest).payload.token.preferred_username
        new CreateTasksUseCase(this.repository)
            .execute(_req.body, user)
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
    /**
     * @swagger
     * /tasks/{id}:
     *   put:
     *     summary: Update task
     *     tags: [tasks]
     *     security:
     *       - JWT: [write]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Task'
     *     responses:
     *       200:
     *         description: task updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Task'
     *       400:
     *         description: Error
     *         $ref: '#/components/responses/Error400'
     *       401:
     *         description: Unauthorized
     *         $ref: '#/components/responses/Unauthorized'
     *       500:
     *         description: Internal Server Error
     */
    public replaceTask = (
        _req: Request<any, unknown, QueryBody, QueryParams>,
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
        const user = ((_req as unknown) as CustomRequest).payload.token.preferred_username
        new ReplaceTasksUseCase(this.repository)
            .execute(_id, _req.body, user)
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
    /**
     * @swagger
     * /tasks/{id}:
     *   delete:
     *     summary: Delete task
     *     tags: [tasks]
     *     security:
     *       - JWT: [delete]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *     responses:
     *       200:
     *         description: Tasks deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: "#/components/schemas/Task"
     *       400:
     *         description: Error
     *         $ref: "#/components/responses/Error400"
     *       401:
     *         description: Unauthorized
     *         $ref: "#/components/responses/Unauthorized"
     *       500:
     *         description: Internal Server Error
    */
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
        const user = ((_req as unknown) as CustomRequest).payload.token.preferred_username
        new DeleteTasksUseCase(this.repository)
            .execute(_id.toString(), user)
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