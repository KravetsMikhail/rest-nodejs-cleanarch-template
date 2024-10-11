import { Router } from 'express'
import { TaskDatasourceImpl } from '../../infrastructure/datasource'
import { TaskRepositoryImpl } from '../../infrastructure/repository'
import { TaskController } from './controllers'

export class TaskRoutes {
    static get routes(): Router {
        const router = Router()

        //* This datasource can be change  
        const datasource = new TaskDatasourceImpl()
        const repository = new TaskRepositoryImpl(datasource)
        const controller = new TaskController(repository)

        router.get('/', controller.getTasks)

        return router
    }
}