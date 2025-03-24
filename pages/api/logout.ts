import type { NextApiRequest, NextApiResponse } from "next";
import { validate_string } from "@/utilities/util_validate";
import { get_error, get_session } from "@/utilities/util_cache";

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
        response.status(401).json(get_error(undefined));
        return;
    }
    // invalidate session
    await get_session(session_id as string, true);
    // remove cookies
    response.status(307).setHeader("Set-Cookie", [
        // ID, name, and role are for PUBLIC, not used for verification
        `SESSION_ID=deleted;   Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
        `SESSION_USER=deleted; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
        `SESSION_NAME=deleted; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
        `SESSION_ROLE=deleted; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    ]).redirect("/");
}