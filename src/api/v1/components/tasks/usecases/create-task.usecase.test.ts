import { CreateTasksUseCase } from './create-task.usecase'
import { TaskRepository } from '../domain/repositories/task.repository'
import { PostgreTaskDatasource } from '../infrastructure/postgresql.datasource'
import { TaskName } from '../domain/valueobjects/task.name'
import { TaskSearch } from '../domain/valueobjects/task.search'
import { TaskResponse } from '../domain/types/response'

jest.mock('../domain/repositories/task.repository')
jest.mock('../infrastructure/postgresql.datasource')

describe('CreateTasksUseCase', () => {
    let createTaskUseCase: CreateTasksUseCase
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

        createTaskUseCase = new CreateTasksUseCase(mockRepository)
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    describe('execute', () => {
        test('Должен вернуть ошибку если нет данных', async () => {
            const result = await createTaskUseCase.execute(null as any, 'testuser')
            
            expect(result.isLeft()).toBe(true)
            if (result.isLeft()) {
                expect((result.value as any).error || result.value).toEqual("Ошибка! Нет данных")
            }
        })

        test('Должен вернуть ошибку если неверный состав данных', async () => {
            const invalidTaskData = {
                invalidField: 'test'
            }
            
            const result = await createTaskUseCase.execute(invalidTaskData, 'testuser')
            
            expect(result.isLeft()).toBe(true)
            if (result.isLeft()) {
                expect((result.value as any).error || result.value).toEqual("Ошибка! Не верный или не полный состав данных")
            }
        })

        test('Должен вернуть ошибку если имя невалидное', async () => {
            const invalidTaskData = {
                name: ''
            }
            
            const result = await createTaskUseCase.execute(invalidTaskData, 'testuser')
            
            expect(result.isLeft()).toBe(true)
        })

        test('Должен успешно создать задачу с валидными данными', async () => {
            const validTaskData = {
                name: 'Test Task'
            }
            
            const mockCreatedTask = {
                id: 1,
                name: { value: 'Test Task' },
                search: { value: 'test task testuser testuser' },
                createdBy: 'testuser',
                updatedBy: 'testuser',
                createdAt: new Date(),
                updatedAt: new Date()
            }
            
            mockRepository.create.mockResolvedValue(mockCreatedTask as any)
            
            const result = await createTaskUseCase.execute(validTaskData, 'testuser')
            
            expect(result.isRight()).toBe(true)
            expect(mockRepository.create).toHaveBeenCalledTimes(1)
        })

        test('Должен корректно обрабатывать поля с нижним подчеркиванием', async () => {
            const validTaskData = {
                name: 'Test Task',
                created_by: 'testuser',
                updated_at: new Date()
            }
            
            const mockCreatedTask = {
                id: 1,
                name: { value: 'Test Task' },
                search: { value: 'test task testuser testuser' },
                createdBy: 'testuser',
                updatedBy: 'testuser',
                createdAt: new Date(),
                updatedAt: new Date()
            }
            
            mockRepository.create.mockResolvedValue(mockCreatedTask as any)
            
            const result = await createTaskUseCase.execute(validTaskData, 'testuser')
            
            expect(result.isRight()).toBe(true)
            expect(mockRepository.create).toHaveBeenCalledTimes(1)
        })
    })
})
