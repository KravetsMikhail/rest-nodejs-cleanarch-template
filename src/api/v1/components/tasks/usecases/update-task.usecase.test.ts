import { ReplaceTasksUseCase } from './update-task.usecase'
import { TaskRepository } from '../domain/repositories/task.repository'
import { PostgreTaskDatasource } from '../infrastructure/postgresql.datasource'
import { TaskName } from '../domain/valueobjects/task.name'
import { TaskResponse } from '../domain/types/response'

jest.mock('../domain/repositories/task.repository')
jest.mock('../infrastructure/postgresql.datasource')

describe('ReplaceTasksUseCase', () => {
    let updateTaskUseCase: ReplaceTasksUseCase
    let mockRepository: jest.Mocked<TaskRepository>

    beforeEach(() => {
        mockRepository = {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            exist: jest.fn()
        } as unknown as jest.Mocked<TaskRepository>

        updateTaskUseCase = new ReplaceTasksUseCase(mockRepository)
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    describe('execute', () => {
        test('Должен вернуть ошибку если нет данных', async () => {
            const result = await updateTaskUseCase.execute(1, null as any, 'testuser')
            
            expect(result.isLeft()).toBe(true)
            if (result.isLeft()) {
                expect((result.value as any).error || result.value).toEqual("Ошибка! Нет данных")
            }
        })

        test('Должен вернуть ошибку если неверный состав данных', async () => {
            const invalidTaskData = {
                invalidField: 'test'
            }
            
            const result = await updateTaskUseCase.execute(1, invalidTaskData, 'testuser')
            
            expect(result.isLeft()).toBe(true)
            if (result.isLeft()) {
                expect((result.value as any).error || result.value).toEqual("Ошибка! Не верный или не полный состав данных")
            }
        })

        test('Должен вернуть ошибку если имя невалидное', async () => {
            const validTaskData = {
                name: 'Valid Task Name'
            }
            
            const result = await updateTaskUseCase.execute(1, validTaskData, 'testuser')
            
            expect(result.isRight()).toBe(true)
        })

        test('Должен успешно обновить задачу с валидными данными', async () => {
            const validTaskData = {
                name: 'Updated Task',
                search: 'updated task testuser testuser'
            }
            
            const mockUpdatedTask = {
                id: 1,
                name: { value: 'Updated Task' },
                search: 'updated task testuser testuser',
                createdBy: 'originaluser',
                updatedBy: 'testuser',
                createdAt: new Date(),
                updatedAt: new Date()
            }
            
            mockRepository.update.mockResolvedValue(mockUpdatedTask as any)
            
            const result = await updateTaskUseCase.execute(1, validTaskData, 'testuser')
            
            expect(result.isRight()).toBe(true)
            expect(mockRepository.update).toHaveBeenCalledWith(1, expect.any(Object))
            expect(mockRepository.update).toHaveBeenCalledTimes(1)
        })

        test('Должен корректно обрабатывать поля с нижним подчеркиванием', async () => {
            const validTaskData = {
                name: 'Updated Task',
                created_by: 'originaluser',
                updated_at: new Date()
            }
            
            const mockUpdatedTask = {
                id: 1,
                name: { value: 'Updated Task' },
                search: 'updated task testuser testuser',
                createdBy: 'originaluser',
                updatedBy: 'testuser',
                createdAt: new Date(),
                updatedAt: new Date()
            }
            
            mockRepository.update.mockResolvedValue(mockUpdatedTask as any)
            
            const result = await updateTaskUseCase.execute(1, validTaskData, 'testuser')
            
            expect(result.isRight()).toBe(true)
            expect(mockRepository.update).toHaveBeenCalledTimes(1)
        })

        test('Должен обрабатывать ошибку репозитория при обновлении', async () => {
            const validTaskData = {
                name: 'Updated Task'
            }
            
            mockRepository.update.mockRejectedValue(new Error('Database error'))
            
            const result = await updateTaskUseCase.execute(1, validTaskData, 'testuser')
            
            expect(result.isLeft()).toBe(true)
            expect(mockRepository.update).toHaveBeenCalledTimes(1)
        })
    })
})
