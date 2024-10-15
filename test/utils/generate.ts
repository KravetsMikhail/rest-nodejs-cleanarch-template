import { faker } from '@faker-js/faker'
import { TaskEntity } from "../../src/components/tasks/domain/entities/v1/task.entity"

export function generateTaskData(overide = {}) {
  const t = new TaskEntity(
    faker.number.int(),
    faker.person.firstName(),
    faker.person.firstName(),
    "Иванов",
    (new Date()).toDateString(),
    "Петров",
    (new Date()).toDateString(),
  )
  return t
}

export function generateTasksData(n: number = 1, overide = {}) {
  return Array.from(
    {
      length: n,
    },
    (_, i) => {
      return generateTaskData({ id: i, ...overide })
    }
  )
}
