import { Server } from '../server'
import { EnvConfig } from '../config/env'
import { PostgresService } from '../api/v1/infrastructure/postgresql/postgresql'
import { OracleService } from '../api/v1/infrastructure/oracle/oracledb'
import { Logger } from '../core/logger/logger'

jest.mock('../api/v1/infrastructure/postgresql/postgresql')
jest.mock('../api/v1/infrastructure/oracle/oracledb')
jest.mock('../core/logger/logger')
jest.mock('../config/env')

describe('Server', () => {
    let server: Server
    let mockPostgresService: jest.Mocked<PostgresService>
    let mockOracleService: jest.Mocked<OracleService>
    let mockLogger: jest.Mocked<Logger>

    beforeEach(() => {
        mockPostgresService = {
            query: jest.fn()
        } as unknown as jest.Mocked<PostgresService>

        mockOracleService = {
            query: jest.fn()
        } as unknown as jest.Mocked<OracleService>

        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            debug: jest.fn()
        } as unknown as jest.Mocked<Logger>

        ;(PostgresService.getInstance as jest.Mock).mockReturnValue(mockPostgresService)
        ;(OracleService.getInstance as jest.Mock).mockReturnValue(mockOracleService)
        ;(Logger as jest.Mock).mockImplementation(() => mockLogger)

        // Mock EnvConfig
        (EnvConfig as any).defaultDataSource = 'postgres'

        server = new Server({
            host: 'localhost',
            port: 3000,
            routes: jest.fn() as any,
            apiPrefix: '/api'
        })
    })

    it('should initialize with correct configuration', () => {
        expect(server).toBeDefined()
    })
}) 