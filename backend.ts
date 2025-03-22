import * as Dotenv from "dotenv";
import * as Mongoose from "mongoose";
import * as Redis from "redis";

Dotenv.config();

abstract class BackendDotenv {
    public static get_string(env_key: string): string {
        return process.env[env_key] as string;
    }
    public static get_number(env_key: string): number {
        return parseFloat(process.env[env_key] as string);
    }
}

const Backend = {
    server_env:      BackendDotenv,
    server_database: Mongoose,
    server_cache:    Redis.createClient({password: BackendDotenv.get_string("REDIS_PASSWORD")})
};
export default Backend;

(async () => {
    await Promise.all([
        Backend.server_database.connect(BackendDotenv.get_string("MONGODB_URI"), {
            authSource: "admin",
            user:       BackendDotenv.get_string("MONGODB_USERNAME"),
            pass:       BackendDotenv.get_string("MONGODB_PASSWORD")
        }),
        Backend.server_cache.connect()
    ]);
    console.log("Connected to Database and Cache!")
})();