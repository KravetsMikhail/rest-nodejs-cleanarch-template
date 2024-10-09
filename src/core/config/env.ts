require("dotenv").config()
import { normalizePort } from "normalize-port"

export class envs {
    public static version = process.env.VERSION
	public static nodeEnv = process.env.NODE_ENV
	public static host = process.env.HOST || "localhost"
	public static port = normalizePort(process.env.PORT || '7117')
	public static dbName = process.env.DB_NAME
	public static dbHost = process.env.DB_HOST
	public static dbPort = process.env.DB_PORT || '5432'
	public static dbUser = process.env.DB_USER
	public static dbPass = process.env.DB_PAS
	public static dbSchema = process.env.DB_SCHEMA
    public static apiPrefix = process.env.API_PREFIX || '123'
}