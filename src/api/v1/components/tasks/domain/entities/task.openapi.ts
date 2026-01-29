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
        search:{
            type: 'string',
            description: 'Поисковая строка',
            example: "пример задачи"
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
    },
    required: ['name']
}