import type { NextApiRequest, NextApiResponse } from "next";
import { get_auth_info, get_auth_token, set_auth_cookie } from "@/utilities/util_auth";
import { set_session } from "@/utilities/util_cache";
import { set_user } from "@/utilities/util_database";
import { validate_string } from "@/utilities/util_validate";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    // check valid authorization code
    const auth_code  = request.query.code as string;
    const auth_valid = validate_string(auth_code);
    if (!auth_valid) {
        response.status(307).redirect(`/login?error=${encodeURIComponent("Authorization Failed")}`);
        return;
    }
    // fetch for token
    const auth_token = await get_auth_token(auth_code);
    if (auth_token === null) {
        response.status(307).redirect(`/login?error=${encodeURIComponent("Authorization Failed")}`);
        return;
    }
    // fetch for information
    const auth_information = await get_auth_info(auth_token);
    if (auth_information === null) {
        response.status(307).redirect(`/login?error=${encodeURIComponent("Authorization Failed")}`);
        return;
    }
    // create/update user
    const auth_user = await set_user(auth_information);
    if (auth_user === null) {
        response.status(307).redirect(`/login?error=${encodeURIComponent("Authorization Failed")}`);
        return;
    }
    // create session
    const auth_session = await set_session(auth_user);
    set_auth_cookie(response, auth_user, auth_session).status(307).redirect("/");
}