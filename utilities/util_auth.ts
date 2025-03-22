import { URL, URLSearchParams } from "url";
import Backend from "@/backend";
import { validate_string } from "./util_validate";

const DISCORD_SCOPES = [
    "identify",
    "email"
];

export function get_auth_base(): URL {
    const authorization_url = new URL("https://discord.com/oauth2/authorize");
    authorization_url.searchParams.set("client_id",     Backend.server_env.get_string("AUTH_CLIENT_ID"));
    authorization_url.searchParams.set("redirect_uri",  Backend.server_env.get_string("AUTH_REDIRECT"));
    authorization_url.searchParams.set("scope",         DISCORD_SCOPES.join(" "));
    authorization_url.searchParams.set("response_type", "code");
    return authorization_url;
}

export async function get_auth_token(auth_code: string): Promise<DiscordToken | null> {
    const auth_params = new URLSearchParams();
    auth_params.set("code",          auth_code);
    auth_params.set("redirect_uri",  Backend.server_env.get_string("AUTH_REDIRECT"));
    auth_params.set("grant_type",    "authorization_code");
    auth_params.set("client_id",     Backend.server_env.get_string("AUTH_CLIENT_ID"));
    auth_params.set("client_secret", Backend.server_env.get_string("AUTH_CLIENT_SECRET"));
    const auth_result = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept":       "application/json"
        },
        body: (auth_params as any)
    }).then(response => response.json());
    const auth_scopes        = (((typeof auth_result.scope) === "string") ? (auth_result.scope as string).split(" ") : []);
    const auth_scopes_needed = DISCORD_SCOPES.find(scope_name => (!auth_scopes.includes(scope_name)));
    // reject when code received is invalid
    if (auth_result.error  !== undefined) return null;
    if (auth_scopes_needed !== undefined) return null;
    return auth_result;
}

export async function get_auth_info(auth_token: DiscordToken): Promise<DiscordUser | null> {
    const auth_info = await fetch("https://discord.com/api/users/@me", {
        headers: {
            Authorization: `${auth_token.token_type} ${auth_token.access_token}`
        }
    }).then(response => response.json());
    const auth_username = (auth_info.global_name ?? auth_info.username) as (string | undefined);
    // reject if info received has error message
    if (auth_info.message !== undefined)   return null;
    if (!validate_string(auth_info.id))    return null;
    if (!validate_string(auth_info.email)) return null;
    if (!validate_string(auth_username))   return null;
    if (auth_info.verified !== true)       return null;
    return {
        id:       auth_info.id,
        username: auth_username,
        email:    auth_info.email,
        locale:   auth_info.locale,
        avatar:   auth_info.avatar
    } as DiscordUser;
}

export interface DiscordToken {
    token_type:    string,
    access_token:  string,
    expires_in:    number,
    refresh_token: string,
    scope:         string
}

export interface DiscordUser {
    id:        string,
    username:  string,
    email:     string,
    locale:    (string | undefined),
    avatar:    (string | null)
}