import { TaskController } from "./task.controller"
import { TaskRepositoryImpl } from "../../infrastructure/task.repository"
import { PostgreTaskDatasource } from "../../infrastructure/postgresql.datasource"
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
            const tasks = repo.getTasks("123", "123123")
            expect(tasks).toEqual([])
            expect(spy).toHaveBeenCalledWith()
            expect(spy).toHaveBeenCalledTimes(1)
            spy.mockRestore()
        })
    })
})
