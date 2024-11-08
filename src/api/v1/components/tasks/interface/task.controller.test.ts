import { TaskRepository } from "../domain/repositories/task.repository"
import { PostgreTaskDatasource } from "../infrastructure/postgresql.datasource"
import { generateTasksData } from "../../../../../../test/utils/generate"

afterEach(() => {
    jest.resetAllMocks()
})

describe("TaskRepository", () => {
    describe("getTasks", () => {
        test("should return empty array", async () => {
            const repo = new TaskRepository(new PostgreTaskDatasource)
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
            const repo = new TaskRepository(new PostgreTaskDatasource)
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
