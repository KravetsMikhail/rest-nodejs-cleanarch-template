import { type ITaskDatasource } from '../domain/datasources/i.task.datasource'
import { TaskEntity, ITaskProps } from '../domain/entities/task.entity'
import { PostgresService } from '../../../infrastructure/postgresql/postgresql'
import { EnvConfig } from '../../../../../config/env'
import { QueryResult } from 'pg'
import { ID, IFindOptions, IPagination } from '../../../../../core/domain/types/types'
import { Helpers } from '../../../../../core/utils/helpers'
import { v4 as uuidv4 } from 'uuid';
import { OutboxMessage } from '../../../../../core/domain/types/types'

export class PostgreTaskDatasource implements ITaskDatasource {
    private readonly postgresService: PostgresService

    constructor() {
        this.postgresService = PostgresService.getInstance()
    }

    async create(value: Partial<TaskEntity>): Promise<TaskEntity> {
        const _currentDate = new Date().toISOString().replace('T', ' ')
        let _name = value.name?.value ? value.name.value : "<empty>"
        let _search = value.search?.value ? value.search.value : ""
        let _status = value.status ? value.status : 'DRAFT'
        let _description = value.description ? value.description : null
        let _comment = value.comment ? value.comment : null
        let _projectId = value.projectId ? value.projectId : null
        let _createdBy = value?.createdBy ? value.createdBy : ""
        let _updatedBy = value?.updatedBy ? value.updatedBy : ""

        // Build dynamic INSERT query based on provided fields
        let fields = ["name", "search", "status", "description", "comment", "createdBy", "updatedBy", "createdAt", "updatedAt"]
        let values = [_name, _search, _status, _description || '', _comment || '', _createdBy, _updatedBy, _currentDate, _currentDate]
        let placeholders = []

        // Add projectId only if it's not null and not empty
        if (_projectId !== null && _projectId !== undefined && _projectId.toString().trim() !== '') {
            fields.splice(5, 0, "projectId")
            values.splice(5, 0, _projectId.toString())
        }

        // Generate placeholders
        for (let i = 1; i <= values.length; i++) {
            placeholders.push(`$${i}`)
        }

        //Начинаем транзакцию
        await this.postgresService.query('BEGIN')

        try {
            //Шаг 1: Создаем объект в основной таблице
            const response: QueryResult = await this.postgresService.query(`INSERT INTO ${EnvConfig.postgres.schema}."Task"(
                "${fields.join('", "')}")
                VALUES (${placeholders.join(', ')}) RETURNING *`, values)

            const task = response.rows[0] as TaskEntity

            //Шаг 2: Создаем запись в Outbox
            const messageId = uuidv4();
            const outboxMessage: OutboxMessage = {
                status: 'pending',
                aggregateId: task.id.toString(),
                messageId,
                messageType: 'TaskCreated',
                payload: JSON.stringify(task),
                metadata: JSON.stringify({name: 'tasks', path: '/api/v1/tasks'}),
                retryCount: 0,
                createdAt: new Date(),
            }

            await this.postgresService.query(
                `INSERT INTO ${EnvConfig.postgres.schema}.outbox_messages
(status, aggregate_id, message_id, message_type, payload, metadata, rerty_count, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    outboxMessage.status,
                    outboxMessage.aggregateId,
                    outboxMessage.messageId,
                    outboxMessage.messageType,
                    outboxMessage.payload,
                    outboxMessage.metadata,
                    outboxMessage.retryCount.toString(),
                    outboxMessage.createdAt.toISOString().replace('T', ' '),
                ]
            )

            //Фиксируем транзакцию
            await this.postgresService.query('COMMIT')

            return task
        } catch(error){
            //Откатываем транзакцию
            await this.postgresService.query('ROLLBACK')
            throw error
        }
    }

    createMany(values: Partial<TaskEntity>[]): Promise<TaskEntity[]> {
        throw new Error('Method not implemented.')
    }
    
    async update(id: ID, value: Partial<TaskEntity>): Promise<TaskEntity> {
        const _currentDate = new Date().toISOString().replace('T', ' ')
        let _name = value.name?.value ? value.name.value : "<Нет наименования>"
        let _search = value.search?.value ? value.search.value : ""
        let _status = value.status ? value.status : null
        let _description = value.description ? value.description : null
        let _comment = value.comment ? value.comment : null
        let _projectId = value.projectId ? value.projectId : null
        let _createdBy = value?.createdBy ? value.createdBy : ""
        let _updatedBy = value?.updatedBy ? value.updatedBy : ""
        let _createdAt = value?.createdAt ? value.createdAt : _currentDate

        // Build dynamic UPDATE query based on provided fields
        let fields = ["name", "search", "status", "description", "comment", "createdBy", "updatedBy", "createdAt", "updatedAt"]
        let values = [_name, _search, _status || '', _description || '', _comment || '', _createdBy, _updatedBy, _createdAt as string, _currentDate]
        let setClauses = []

        // Add projectId only if it's not null and not empty
        if (_projectId !== null && _projectId !== undefined && _projectId.toString().trim() !== '') {
            fields.splice(5, 0, "projectId")
            values.splice(5, 0, _projectId.toString())
        }

        // Generate SET clauses
        for (let i = 0; i < fields.length; i++) {
            setClauses.push(`"${fields[i]}" = $${i + 1}`)
        }

        const response: QueryResult = await this.postgresService.query(`UPDATE ${EnvConfig.postgres.schema}."Task" SET 
${setClauses.join(', ')} WHERE id=${id} RETURNING *`, values)

        return response.rows[0]
    }

    async delete(id: ID): Promise<any> {
        const _currentDate = new Date().toISOString().replace('T', ' ')
        const values = [id ? id.toString() : '0', _currentDate]
        const response: QueryResult = await this.postgresService.query(`UPDATE ${EnvConfig.postgres.schema}."Task" SET 
("isDeleted", "deletedAt") = (true, $2)
                                        WHERE "id"=$1 RETURNING *;`, values)
        return response.rows[0]
    }

    async find(options?: IFindOptions<TaskEntity, any> | undefined): Promise<TaskEntity[]> {
        const { data } = await this.findAndCount(options)
        return data
    }

    async findAndCount(options?: IFindOptions<TaskEntity, any> | undefined): Promise<{ data: TaskEntity[], pagination: IPagination }> {
        let _where = ""
        let _orderBy = ""
        let _paging = ""

        const offset = options?.offset ?? 0
        const limit = options?.limit ?? 10000

        // Always filter out deleted records
        _where += ` WHERE "isDeleted" = false`

        if (options) {
            // Add status filter if provided and not empty
            const statusItem = options.where && (options.where as any).AND ?
                (options.where as any).AND.find((item: any) => item.param === 'status') : null

            if (statusItem && statusItem.value && statusItem.value.trim() !== '') {
                _where += ` AND status = '${statusItem.value}'`
            }

            // Create optionsWithoutStatus without status field for Helpers
            const optionsWithoutStatus: any = {
                ...options,
                where: options.where && (options.where as any).AND ? {
                    ...options.where,
                    AND: ((options.where as any).AND as any[]).filter((item: any) => item.param !== 'status')
                } : options.where
            }

            const additionalWhere = Helpers.getWhereForPostgreSql(TaskEntity, optionsWithoutStatus, EnvConfig.postgres.schema, "Task")

            if (additionalWhere && additionalWhere.trim() !== '') {
                _where += ` AND ${additionalWhere.replace(/WHERE/gi, '')}`
            }

            _orderBy = Helpers.getOrderByForPostgreSql(TaskEntity, options, EnvConfig.postgres.schema, "Task")
            _paging = Helpers.getPagingForPostgresSql(options)
        }

        const countResult: QueryResult = await this.postgresService.query(`SELECT COUNT(*)::int AS total FROM ${EnvConfig.postgres.schema}."Task" ${_where}`)
        const total = Number((countResult.rows[0] as { total: number }).total ?? 0)

        const response: QueryResult = await this.postgresService.query(`SELECT * FROM ${EnvConfig.postgres.schema}."Task" ${_where} ${_orderBy} ${_paging}`)
        const pagination: IPagination = { total, offset, limit }
        return { data: response.rows, pagination }
    }

    async findOne(id: Partial<TaskEntity> | ID, options?: IFindOptions<TaskEntity, any> | undefined): Promise<TaskEntity> {
        const response: QueryResult = await this.postgresService.query(`SELECT * FROM ${EnvConfig.postgres.schema}."Task" WHERE id = ${id} AND "isDeleted" = false`)
        return response.rows && response.rows.length > 0 ? response.rows[0] : {} as TaskEntity
    }
    
    exist(id: Partial<TaskEntity> | ID): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
}