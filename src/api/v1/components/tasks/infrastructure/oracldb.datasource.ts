import { type TaskDatasource } from '../domain/datasources/i.task.datasource'
import { TaskEntity } from '../domain/entities/task.entity'
import { OracleDbService } from '../../../infrastructure/oracle/oracledb' 
import { envs } from '../../../../../core/config/env'
import { QueryResult } from 'pg'

export class OracleTaskDatasource implements TaskDatasource {
    public async getTasks(email: string, status: string): Promise<TaskEntity[]> {
        const response: QueryResult = await OracleDbService.query(`SELECT * FROM TASK`)    
        return response.rows
    }
    public async createTask(name: string, search: string, userId: number): Promise<TaskEntity> {
        const _currentDate = new Date().toISOString().replace('T', ' ')
        const values = [name, search, userId.toString(), userId.toString(), _currentDate, _currentDate ]
        const response: QueryResult = await OracleDbService.query(`DECLARE 
            v_row tasks%rowType; 
        BEGIN 
        INSERT INTO TASKS (
name, search, createdBy, updatedBy, createdAt, updatedAt)
VALUES ($1, $2, $3, $4, $5, $6) 
RETURNING name, search, createdBy, updatedBy, createdAt, updatedAt into v_row;
END;`, values)
        return response.rows[0]
    }
    public async deleteTask(id: number): Promise<TaskEntity> {
        const values = [id ? id.toString() : '0']
        const response: QueryResult = await OracleDbService.query(`DELETE FROM ${envs.dbSchema}."Task" n 
                                        WHERE n."id"=$1 RETURNING *;`, values)
        return response.rows[0]
    }

}