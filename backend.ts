import * as Dotenv from "dotenv";
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
    server_env:   BackendDotenv,
    server_cache: Redis.createClient({password: BackendDotenv.get_string("REDIS_PASSWORD")})
};
export default Backend;

(async () => {
    await Backend.server_cache.connect();
})();