import { TaskRepositoryImpl } from "../infrastructure/v1/task.repository"
import { PostgreTaskDatasource } from "../infrastructure/v1/postgresql.datasource"
import { generateTasksData } from "../../../../../test/utils/generate"

afterEach(() => {
    jest.resetAllMocks()
})

describe("TaskRepositoryImpl", () => {
    describe("getTasks", () => {
        test("should return empty array", async () => {
            const repo = new TaskRepositoryImpl(new PostgreTaskDatasource)
            const spy = jest
                .spyOn(repo, "getTasks")
                .mockResolvedValueOnce([])
            const tasks = await repo.getTasks("", "")
            expect(tasks).toEqual([]);
            expect(spy).toHaveBeenCalledWith("", "")
            expect(spy).toHaveBeenCalledTimes(1)
            spy.mockRestore()
        })

        test("should return tasks list", async () => {
            const tasksData = generateTasksData(10)
            const repo = new TaskRepositoryImpl(new PostgreTaskDatasource)
            const spy = jest
                .spyOn(repo, "getTasks")
                .mockResolvedValueOnce(tasksData)
            const tasks = await repo.getTasks("", "")
            expect(tasks).toEqual(tasksData)
            expect(spy).toHaveBeenCalledWith("", "")
            expect(spy).toHaveBeenCalledTimes(1)
        })
    })
})
