import { envs } from "./env"

const config: any = {}

switch (envs.nodeEnv){
    case 'development':
        config.logLevel = 'debug'
        break
    case 'production':
        config.logLevel = 'info'
        break
    case 'tested':
        config.logLevel = 'debug'
        break
    default:
        config.logLevel = 'info'
        break
}

export { config }