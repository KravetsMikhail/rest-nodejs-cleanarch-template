import { faker } from '@faker-js/faker'
import { TaskEntity, ITaskProps } from "../../src/api/v1/components/tasks/domain/entities/task.entity"
import { UniqueEntityId } from '../../src/core/domain/types/uniqueentityid'

export function generateTaskData(overide = {}) {
    const _task = {
        name: faker.person.firstName(),
        search: faker.person.firstName().toLowerCase(),
        createdBy: faker.person.lastName(),
        createdAt: (new Date()).toDateString(),
        updatedBy: faker.person.lastName(),
        updatedAt: (new Date()).toDateString(),
    }

    let _id = new UniqueEntityId(faker.number.int())

    const t = TaskEntity.create((_task as unknown) as ITaskProps, _id, false)
    return t.getValue()
}

export function generateTasksData(n: number = 1, overide = {}) {
    return Array.from(
        {
            length: n,
        },
        (_, i) => {
            return (generateTaskData({ id: i, ...overide }) as unknown) as TaskEntity
        }
    )
}
