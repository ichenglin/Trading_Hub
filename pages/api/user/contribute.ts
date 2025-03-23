import type { NextApiRequest, NextApiResponse } from "next";
import { get_error, get_session } from "@/utilities/util_cache";
import { validate_id, validate_json, validate_string, validate_type } from "@/utilities/util_validate";
import { DatabaseUserRole, set_markup } from "@/utilities/util_database";

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
    const request_object = JSON.parse(request_body);
    const request_type   = request_object.page_type;
    const request_id     = request_object.page_id;
    const request_markup = request_object.page_markup;
    if (!validate_type(request_type)) {
        response.status(400).json(get_error(undefined));
        return;
    }
    if (!(await validate_id(request_id))) {
        response.status(400).json(get_error(undefined));
        return;
    }
    if (!validate_string(request_markup)) {
        response.status(400).json(get_error(undefined));
        return;
    }
    // save to database (also flushes redis cache)
    await set_markup(request_id, request_type, request_markup);
    // flush cache
    await response.revalidate(`/${request_type}/${request_id}`);
    response.status(200).json({success: true});
}