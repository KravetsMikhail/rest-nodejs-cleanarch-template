import { Router } from 'express'
import { PostgreTaskDatasource } from '../infrastructure/postgresql.datasource'
import { OracleTaskDatasource } from '../infrastructure/oracldb.datasource'
import { TaskRepository } from '../domain/repositories/task.repository'
import { TaskController } from './task.controller'

export class TaskRoutesV1 {
    static get routes(): Router {
        const router = Router()

        //* This datasource can be change  
        const datasource = new PostgreTaskDatasource()
        //const datasource = new OracleTaskDatasource()
        const repository = new TaskRepository(datasource)
        const controller = new TaskController(repository)

        //query параметры
        router.get('', controller.getTasks)
        //path параметры
        //router.get('/:email/:status', controller.getTasks)
        //body параметры
        router.post('/', controller.createTask)
        //query параметры
        router.delete('', controller.deleteTask)
        //path параметры
        router.delete('/:id', controller.deleteTask)

        return router
    }
}