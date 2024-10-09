import { envs } from './core/config/env'
import { AppRoutes } from './presentation/routes'
import { Server } from './server'

(() => {
    main()
})()

function main(): void {
    const server = new Server({
        routes: AppRoutes.routes,
        apiPrefix: envs.apiPrefix,
        port: envs.port
    })
    void server.start()
}