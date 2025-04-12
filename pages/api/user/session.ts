import type { NextApiRequest, NextApiResponse } from "next";
import { get_error, get_session, set_session } from "@/utilities/util_cache";
import { validate_string } from "@/utilities/util_validate";
import { remove_auth_cookie, set_auth_cookie } from "@/utilities/util_auth";

export interface UserSessionAPI {
    user_id:   string,
    user_name: string,
    user_role: string
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    // check request method
    if (request.method !== "GET") {
        response.status(405).json(get_error(undefined));
        return;
    }
    // check request session
    const session_id    = request.cookies.SESSION_ID;
    const session_exist = validate_string(session_id);
    if (!session_exist) {
        remove_auth_cookie(response).status(401).json(get_error(undefined));
        return;
    }
    const auth_user = await get_session(session_id as string);
    if (auth_user === null) {
        remove_auth_cookie(response).status(401).json(get_error(undefined));
        return;
    }
    const auth_session = await set_session(auth_user);
    set_auth_cookie(response, auth_user, auth_session).status(200).json({
        success: true,
        result: {
            user_id:   auth_user.id,
            user_name: auth_user.username,
            user_role: auth_user.role
        } as UserSessionAPI
    });
}