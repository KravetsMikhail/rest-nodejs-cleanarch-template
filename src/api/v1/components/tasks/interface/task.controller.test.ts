import { TaskRepository } from "../domain/repositories/task.repository"
import { PostgreTaskDatasource } from "../infrastructure/postgresql.datasource"
import { generateTasksData } from "../../../../../../test/utils/generate"
import { Helpers } from "../../../../../core/utils/helpers"

afterEach(() => {
    jest.resetAllMocks()
})

describe("TaskRepository", () => {
    describe("find", () => {
        test("Должен вернуть пустой объект", async () => {
            const repo = new TaskRepository(new PostgreTaskDatasource)            
            const spy = jest
                .spyOn(repo, "find")
                .mockResolvedValueOnce([])
            const tasks = await repo.find(Helpers.getFilters({}))
            expect(tasks).toEqual([])
            expect(spy).toHaveBeenCalledWith(Helpers.getFilters({}))
            expect(spy).toHaveBeenCalledTimes(1)
            spy.mockRestore()
        })

        test("Должен вернуть список 10 задач", async () => {
            const tasksData = generateTasksData(10)
            const repo = new TaskRepository(new PostgreTaskDatasource)
            const spy = jest
                .spyOn(repo, "find")
                .mockResolvedValueOnce(tasksData)
            const tasks = await repo.find(Helpers.getFilters({}))
            expect(tasks).toEqual(tasksData)
            expect(spy).toHaveBeenCalledWith(Helpers.getFilters({}))
            expect(spy).toHaveBeenCalledTimes(1)
        })
    })
})
