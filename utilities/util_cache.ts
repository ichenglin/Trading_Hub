import * as Crypto from "crypto";
import Backend from "@/backend";
import { DatabaseUser } from "./util_database";

export async function get_cache<CacheContent>(cache_key: string, cache_lifespan: number = Backend.server_env.get_number("REDIS_CACHE_LIFESPAN"), cache_renew: () => Promise<CacheContent>): Promise<APIContent<CacheContent>> {
    // check cache exist
    const cache_response = await Backend.server_cache.get(`CACHE_${cache_key}`);
    if (cache_response !== null) return JSON.parse(cache_response);
    // generate new result
    const cache_new = {
        success: true,
        result:  await cache_renew()
    } as APIContent<CacheContent>;
    // register cache
    await Backend.server_cache.setEx(`CACHE_${cache_key}`, cache_lifespan, JSON.stringify(cache_new));
    return cache_new;
}

export function get_error<CacheContent>(error_result: CacheContent): APIContent<CacheContent> {
    return {
        success: false,
        result:  error_result
    } as APIContent<CacheContent>;
}

export async function remove_cache(cache_key: string): Promise<boolean> {
    return ((await Backend.server_cache.del(`CACHE_${cache_key}`)) === 1);
}

export async function get_session(session_id: string, session_invalidate: boolean = false): Promise<DatabaseUser | null> {
    // TODO: refresh session expiration
    const session_raw   = await Backend.server_cache.get(`SESSION_DATA_${session_id}`);
    const session_exist = (session_raw !== null);
    const session_data  = (session_exist ? JSON.parse(session_raw) : null) as DatabaseUser;
    if (session_exist && session_invalidate) await Backend.server_cache.del(`SESSION_DATA_${session_id}`);
    if (session_exist && session_invalidate) await Backend.server_cache.del(`SESSION_USER_${session_data.id}`);
    return session_data;
}

export async function get_session_id(user_id: string): Promise<string | null> {
    return await Backend.server_cache.get(`SESSION_USER_${user_id}`);
}

export async function set_session(session_user: DatabaseUser, session_lifespan: number = Backend.server_env.get_number("REDIS_SESSION_LIFESPAN")): Promise<UserSession> {
    // check if user session exist
    const session_old   = (await get_session_id(session_user.id)) as string;
    const session_exist = (session_old !== null);
    // generate new session id if needed
    let session_id = session_old;
    if (!session_exist) while (true) {
        const session_valid     = (session_id !== null);
        const session_available = (session_valid && ((await Backend.server_cache.get(`SESSION_${session_id}`)) === null));
        if (session_valid && session_available) break;
        session_id = Crypto.randomBytes(32).toString("hex").normalize();
    }
    // save session id
    await Backend.server_cache.setEx(`SESSION_DATA_${session_id}`,      session_lifespan, JSON.stringify(session_user));
    await Backend.server_cache.setEx(`SESSION_USER_${session_user.id}`, session_lifespan, (session_id as string));
    return {
        session_id:       session_id,
        session_lifespan: session_lifespan,
        session_expire:   new Date(Date.now() + (session_lifespan * 1E3))
    } as UserSession;
}

export interface APIContent<CacheContent> {
    success: boolean,
    result:  CacheContent
}

export interface UserSession {
    session_id:       string,
    session_lifespan: number,
    session_expire:   Date
}