import { envs } from './config/env'
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
        port: envs.port,
        allowOrig: envs.allowOrig
        //uiHost: envs.uiHost,
        //uiPort: envs.uiPort
    })
    void server.start()
}