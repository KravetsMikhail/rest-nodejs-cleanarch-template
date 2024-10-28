import { envs } from './core/config/env'
import { AppRoutes } from './api/v1/interface/routes'
import { Server } from './server'

(() => {
    main()
})()

function main(): void {
    const server = new Server({
        host: envs.host,
        routes: AppRoutes.routes,
        apiPrefix: envs.apiPrefix,
        port: envs.port
    })
    void server.start()
}