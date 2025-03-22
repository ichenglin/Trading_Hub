// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Asset, AssetType } from "@/utilities/util_asset";
import { APIContent, get_error } from "@/utilities/util_cache";
import { validate_type } from "@/utilities/util_validate";
import { get_assets_cached } from "@/utilities/util_database";

export default async function handler(request: NextApiRequest, response: NextApiResponse<APIContent<Asset[]>>) {
    const item_type  = request.query.type as AssetType;
    const item_exist = validate_type(item_type)
    // check item exist
    if (!item_exist) {
        response.status(404).json(get_error([]));
        return;
    }
    // block queueing all items
    if (item_type === AssetType.ALL) {
        response.status(404).json(get_error([]));
        return;
    }
    // item exist
    response.status(200).json(await get_assets_cached(item_type));
}