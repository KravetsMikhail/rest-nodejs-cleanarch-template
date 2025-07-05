import { Router } from 'express'
import { PostgreTaskDatasource } from '../infrastructure/postgresql.datasource'
import { OracleTaskDatasource } from '../infrastructure/oracldb.datasource'
import { TaskRepository } from '../domain/repositories/task.repository'
import { TaskController } from './task.controller'
import { EnvConfig, DataSourceType } from '../../../../../config/env'

export class TaskRoutesV1 {
    static get routes(): Router {
        const router = Router()

        const datasource = TaskRoutesV1.getDatasource(EnvConfig.defaultDataSource)
        const repository = new TaskRepository(datasource)
        const controller = new TaskController(repository)

        //query параметры
        router.get('', controller.getTasks)
        router.get('/:id', controller.getOneTask)
        router.put('/:id', controller.replaceTask)
        router.patch('/:id', controller.replaceTask)
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

    private static getDatasource(type: DataSourceType) {
        switch (type) {
            case 'postgres':
                return new PostgreTaskDatasource()
            case 'oracle':
                return new OracleTaskDatasource()
            default:
                return new PostgreTaskDatasource() // fallback to postgres
        }
    }
}