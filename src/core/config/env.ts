require("dotenv").config()

export class envs {
    public static version = <string>process.env.VERSION
	public static nodeEnv = <string>process.env.NODE_ENV
	public static host = <string>process.env.HOST || "localhost"
	public static port = <string>process.env.PORT || '7117'
	public static dbName = <string>process.env.DB_NAME
	public static dbHost = <string>process.env.DB_HOST
	public static dbPort = <string>process.env.DB_PORT || '5432'
	public static dbUser = <string>process.env.DB_USER
	public static dbPass = <string>process.env.DB_PAS
	public static dbSchema = <string>process.env.DB_SCHEMA
    public static apiPrefix = <string>process.env.API_PREFIX || '123'
}