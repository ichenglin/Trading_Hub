import * as Dotenv from "dotenv";
import * as fs from "fs";
import * as Mongoose from "mongoose";
import * as Redis from "redis";

Dotenv.config();

const DEFAULT_MONGODB_URI = "mongodb://mongodb:27017/flagwars";
const DEFAULT_REDIS_URL   = "redis://redis:6379";

abstract class BackendDotenv {
    public static get_string(env_key: string): string {
        const env_value = process.env[env_key];
        if ((env_value !== undefined) && (env_value.length > 0)) return env_value;

        const env_file_path = process.env[`${env_key}_FILE`];
        if ((env_file_path !== undefined) && (env_file_path.length > 0)) {
            return fs.readFileSync(env_file_path, "utf8").trim();
        }

        throw new Error(`Missing required environment variable: ${env_key}`);
    }

    public static get_optional_string(env_key: string): string | undefined {
        const env_value = process.env[env_key];
        if ((env_value !== undefined) && (env_value.length > 0)) return env_value;

        const env_file_path = process.env[`${env_key}_FILE`];
        if ((env_file_path !== undefined) && (env_file_path.length > 0)) {
            const file_value = fs.readFileSync(env_file_path, "utf8").trim();
            return ((file_value.length > 0) ? file_value : undefined);
        }

        return undefined;
    }

    public static get_number(env_key: string): number {
        const number_value = parseFloat(this.get_string(env_key));
        if (Number.isNaN(number_value)) throw new Error(`Environment variable is not a number: ${env_key}`);
        return number_value;
    }
}

const Backend = {
    server_env:      BackendDotenv,
    server_database: Mongoose,
    server_cache:    Redis.createClient((() => {
        const redis_password = BackendDotenv.get_optional_string("REDIS_PASSWORD");
        return {
            url:      (BackendDotenv.get_optional_string("REDIS_URL") ?? DEFAULT_REDIS_URL),
            password: redis_password
        };
    })())
};
export default Backend;

(async () => {
    const mongodb_user = BackendDotenv.get_optional_string("MONGODB_USERNAME");
    const mongodb_pass = BackendDotenv.get_optional_string("MONGODB_PASSWORD");

    await Promise.all([
        Backend.server_database.connect((BackendDotenv.get_optional_string("MONGODB_URI") ?? DEFAULT_MONGODB_URI), {
            authSource: ((mongodb_user && mongodb_pass) ? "admin" : undefined),
            user:       mongodb_user,
            pass:       mongodb_pass
        }),
        Backend.server_cache.connect()
    ]);
    console.log("Connected to Database and Cache!");
})();