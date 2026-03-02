export const TaskOpenapiScheme = {
    type: 'object',
    properties: {
        id:{
            type: 'integer',
            description: 'Уникальный идентификатор',
            example: 1
        },
        name:{
            type: 'string',
            description: 'Наименование',
            example: "Пример задачи"
        },
        status:{
            type: 'string',
            enum: ['DRAFT', 'STARTED', 'INWORK', 'ONPAUSE', 'CANCELED', 'COMPLETED', 'ERROR'],
            description: 'Статус задачи',
            example: 'DRAFT'
        },
        description:{
            type: 'string',
            description: 'Описание задачи',
            example: 'Подробное описание задачи'
        },
        comment:{
            type: 'string',
            description: 'Комментарий к задаче',
            example: 'Дополнительная информация'
        },
        projectId:{
            type: 'integer',
            description: 'ID проекта',
            example: 123
        },
        createdAt:{
            type: 'string',
            format: 'date-time',
            description: 'Дата создания',
            example: '2024-10-10T10:00:01'
        },
        createdBy:{
            type: 'string',
            description: 'Создано кем',
            example: 'Иванов'
        },
        updatedAt:{
            type: 'string',
            format: 'date-time',
            description: 'Дата обновления',
            example: '2024-10-10T10:00:01'
        },
        updatedBy:{
            type: 'string',
            description: 'Обновлено кем',
            example: 'Петров'
        },
        isDeleted:{
            type: 'boolean',
            description: 'Признак удаления',
            example: false
        },
        deletedBy:{
            type: 'string',
            description: 'Удалено кем',
            example: 'Сидоров'
        },
        deletedAt:{
            type: 'string',
            format: 'date-time',
            description: 'Дата удаления',
            example: '2024-10-10T10:00:01'
        }
    },
    required: ['name']
}

/** Pagination object for list responses */
export const PaginationScheme = {
    type: 'object',
    required: ['total', 'offset', 'limit'],
    properties: {
        total: {
            type: 'integer',
            description: 'Общее количество строк без учёта offset и limit',
            example: 42
        },
        offset: {
            type: 'integer',
            description: 'Смещение (параметр запроса)',
            example: 0
        },
        limit: {
            type: 'integer',
            description: 'Лимит строк на страницу (параметр запроса)',
            example: 10
        }
    }
}

/** Response GET list with pagination: data + pagination */
export const TaskListResponseScheme = {
    type: 'object',
    required: ['data', 'pagination'],
    properties: {
        data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Task' }
        },
        pagination: {
            $ref: '#/components/schemas/Pagination'
        }
    }
}