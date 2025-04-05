import type { NextApiRequest, NextApiResponse } from "next";
import { get_error, get_session, set_session } from "@/utilities/util_cache";
import { validate_enum, validate_json, validate_string } from "@/utilities/util_validate";
import { DatabaseUser, DatabaseUserRole, update_user } from "@/utilities/util_database";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    // check request method
    if (request.method !== "POST") {
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
    const session_data = await get_session(session_id as string);
    if (session_data === null) {
        response.status(401).json(get_error(undefined));
        return;
    }
    if (session_data.role !== DatabaseUserRole.ADMIN) {
        response.status(401).json(get_error(undefined));
        return;
    }
    // check request body is an object (array forbidden)
    const request_body = request.body;
    const request_json = validate_json(request_body, false, true);
    if (!request_json) {
        response.status(400).json(get_error(undefined));
        return;
    }
    // check request json values
    const request_object  = JSON.parse(request_body);
    const request_id      = request_object.user_id      as string;
    const request_role    = request_object.user_role    as DatabaseUserRole;
    const request_suspend = request_object.user_suspend as string;
    if (!validate_string(request_id)) {
        response.status(400).json(get_error(undefined));
        return;
    }
    if ((request_role !== undefined) && !validate_enum(request_role, DatabaseUserRole)) {
        response.status(400).json(get_error(undefined));
        return;
    }
    if ((request_suspend !== undefined) && (request_suspend !== null) && !validate_string(request_suspend)) {
        response.status(400).json(get_error(undefined));
        return;
    }
    // save to database (also flushes redis cache)
    const request_user = await update_user(request_id, {
        role:    request_role,
        suspend: request_suspend
    });
    if (request_user === null) {
        response.status(400).json(get_error(undefined));
    }
    // refresh session and cache
    await set_session(request_user as DatabaseUser);
    await response.revalidate(`/profile/${request_id}`);
    response.status(200).json({success: true});
}