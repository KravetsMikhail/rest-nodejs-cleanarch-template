const marv = require('marv/api/callback')
const driver = require('marv-oracledb-driver')
const path = require('path')
const directory = path.resolve('migrations')
const dotenv = require('dotenv')
dotenv.config()

let connection = {
    connectionString: `${process.env.ORACLE_DB_HOST}:${process.env.ORACLE_DB_PORT}/${process.env.ORACLE_DB_NAME}`,
    user: process.env.ORACLE_DB_USER,
    password: process.env.ORACLE_DB_PASS,
}
//const migrations = await marv.scan(directory)
//await marv.migrate(migrations, driver({ connection }))
marv.scan(directory, (err, migrations) => {
    if (err) throw err
    marv.migrate(migrations, driver({ connection }), (err) => {
        if (err) throw err
    })
})


/* module.exports = {
    migration: async(connection) => {
        const migrations = await marv.scan(directory)
        await marv.migrate(migrations, driver({ connection }))
    }
} */