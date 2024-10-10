import { type TaskDatasource } from '../domain/datasources/task.datasource'
import { TaskEntity } from '../domain/entities/task.entity'
import { PostgreDbService } from '../../../infrastructure/postgresql/postgresql'

export class TaskDatasourceImpl implements TaskDatasource {
    public async getTasks(email: string, status: string): Promise<TaskEntity[]> {
        const tasks = PostgreDbService.query(`SELECT ${sqlFields} FROM ${dbSchema}."Item" 
                                                    ${_joinItemPlacement}
                                                    ${_joinNomenclature} 
                                                    ${_joinItemNomenclatureGroup}
                                                    WHERE "Item"."id" = ${id} ${_groupBy}`)
        return tasks
    }
}