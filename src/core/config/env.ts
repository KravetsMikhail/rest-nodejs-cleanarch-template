require("dotenv").config()

export class envs {
    public static version = <string>process.env.VERSION
	public static nodeEnv = <string>process.env.NODE_ENV
	public static host = <string>process.env.HOST || "localhost"
	public static port = <number>Number(process.env.PORT) || 1234
	public static apiPrefix = <string>process.env.API_PREFIX || "\\api"
	public static dbName = <string>process.env.PG_DB_NAME
	public static dbHost = <string>process.env.PG_DB_HOST
	public static dbPort = <number>Number(process.env.PG_DB_PORT) || 5432
	public static dbUser = <string>process.env.PG_DB_USER
	public static dbPass = <string>process.env.PG_DB_PASS
	public static dbSchema = <string>process.env.PG_DB_SCHEMA   
	public static oracleDbName = <string>process.env.ORACLE_DB_NAME
	public static oracleDbHost = <string>process.env.ORACLE_DB_HOST 
	public static oracleDbPort = <number>Number(process.env.ORACLE_DB_PORT) || 1521
	public static oracleDbuser = <string>process.env.ORACLE_DB_USER 
	public static oracleDbPass = <string>process.env.ORACLE_DB_PASS
	public static oracleDbSchema = <string>process.env.ORACLE_DB_SCHEMA
	public static oracleDbPoolmax = <number>Number(process.env.ORACLE_DB_POOLMAX)
	public static oracleDbPoolmin = <number>Number(process.env.ORACLE_DB_POOLMIN)
	public static oracleDbPoolincrement = <number>Number(process.env.ORACLE_DB_POOLINCREMENT)
	public static oracleDbPoolpinginterval = <number>Number(process.env.ORACLE_DB_POOLPINGINTERVAL)
	public static oracleDbPooltimeout = <number>Number(process.env.ORACLE_DB_POOLTIMEOUT)
}