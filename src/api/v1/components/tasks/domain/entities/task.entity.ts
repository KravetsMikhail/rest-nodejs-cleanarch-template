import { ValidationError } from '../../../../../../core/errors/validation.error'

export class TaskEntity {
    constructor(public id: number,
        public name: string,
        public search: string,
        public createdBy: string,
        public createdAt: string,
        public updatedBy: string,
        public updatedAt: string
    ) { }

    public static fromJson(obj: Record<string, unknown>): TaskEntity {
        const { id, 
            name, 
            search, 
            createdBy, 
            createdAt, 
            updatedBy, 
            updatedAt } = obj
        if (!id) throw new ValidationError([{ constraint: 'id is required', fields: ['id'] }])
        if (!name) throw new ValidationError([{ constraint: 'name is required', fields: ['name'] }])
        return new TaskEntity(id as number, 
                name as string, 
                search as string, 
                createdBy as string, 
                createdAt as string, 
                updatedBy as string, 
                updatedAt as string
            )
    }
}