import { Router } from 'express'
import { PostgreTaskDatasource } from '../infrastructure/v1/postgresql.datasource'
import { TaskRepositoryImpl } from '../infrastructure/v1/task.repository'
import { TaskController } from './task.controller'

export class TaskRoutesV1 {
    static get routes(): Router {
        const router = Router()

        //* This datasource can be change  
        const datasource = new PostgreTaskDatasource()
        const repository = new TaskRepositoryImpl(datasource)
        const controller = new TaskController(repository)

        router.get('/', controller.getTasks)
        router.post('/', controller.createTask)

        return router
    }
}