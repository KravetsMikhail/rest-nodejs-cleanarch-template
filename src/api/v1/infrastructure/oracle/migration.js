const marv = require('marv/api/promise')
const driver = require('marv-oracledb-driver')
const path = require('path')
const directory = path.resolve('migrations')

module.exports = {
    migration: async(connection) => {
        const migrations = await marv.scan(directory)
        await marv.migrate(migrations, driver({ connection }))
    }
}