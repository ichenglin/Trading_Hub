import { get_currencies } from "@/utilities/util_asset";
import { get_cache } from "@/utilities/util_cache";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    response.status(200).json(await get_currencies_cached());
}

export async function get_currencies_cached() {
    return await get_cache("currencies", undefined, async () => {
        return await get_currencies();
    });
}