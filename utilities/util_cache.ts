import Backend from "@/backend";
import Server from "@/backend";

export async function get_cache<CacheContent>(cache_key: string, cache_lifespan: number = Backend.server_env.get_number("REDIS_CACHE_LIFESPAN"), cache_renew: () => Promise<CacheContent>): Promise<APIContent<CacheContent>> {
    // check cache exist
    const cache_response = await Server.server_cache.get(cache_key);
    if (cache_response !== null) return JSON.parse(cache_response);
    // generate new result
    const cache_new = {
        success: true,
        result:  await cache_renew()
    } as APIContent<CacheContent>;
    // register cache
    await Server.server_cache.setEx(cache_key, cache_lifespan, JSON.stringify(cache_new));
    return cache_new;
}

export function get_error<CacheContent>(error_result: CacheContent): APIContent<CacheContent> {
    return {
        success: false,
        result:  error_result
    } as APIContent<CacheContent>;
}

export interface APIContent<CacheContent> {
    success: boolean,
    result:  CacheContent
}