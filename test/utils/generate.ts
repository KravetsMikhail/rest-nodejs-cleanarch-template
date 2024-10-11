import faker from "faker"

export function generateTaskData(overide = {}) {
  return {
    id: faker.random.number(),
    name: faker.name.firstName(),
    search: faker.name.firstName(),
    //email: faker.internet.email(),
    //posts: [],
    //comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overide,
  };
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