import type { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import sharp from "sharp";
import { AssetType } from "@/utilities/util_asset";
import { get_cache, get_error } from "@/utilities/util_cache";
import { get_assets_cached } from "../../items/[type]";
import { validate_string, validate_type } from "@/utilities/util_validate";
import { get_currencies_cached } from "../../currencies";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    // check type & pathname valid
    const type_request = (request.query.type as string);
    const type_valid   = validate_type(type_request);
    const id_request   = (request.query.id as string);
    const id_valid     = validate_string(id_request)
    if ((!type_valid) || (!id_valid)) {
        response.status(404).json(get_error(undefined));
        return;
    }
    // check image valid
    const assets_all   = await get_assets_cached(AssetType.ALL);
    const assets_match = assets_all.result.find(asset_data => {
        if (asset_data.type !== type_request) return false;
        if (asset_data.id   !== id_request)   return false;
        return true;
    });
    if (assets_match === undefined) {
        response.status(404).json(get_error(undefined));
        return;
    }
    // send image
    response.status(200).setHeader("Content-Type", "image/png").send((await get_cache(`assets/${type_request}/${id_request}`, undefined, async () => {
        // watermark image
        const path_asset       = `${getConfig().serverRuntimeConfig.PROJECT_ROOT}/assets${assets_match.icon}`;
        const path_watermark   = `${getConfig().serverRuntimeConfig.PROJECT_ROOT}/public/images/watermark.png`;
        const page_currency    = (await get_currencies_cached()).result;
        const page_color       = ((assets_match.price.length > 0) ? `${page_currency[assets_match.price[0].currency as keyof typeof page_currency].color}7f` : "#9ca3af7f");
        const buffer_background = await sharp({create: {
            width:      400,
            height:     240,
            channels:   4,
            background: page_color
        }}).png().toBuffer();
        const buffer_asset = await sharp(path_asset).resize({
            width:      400,
            height:     240,
            fit:        "contain",
            background: "#00000000"
        }).toBuffer();
        const buffer_watermark = await sharp(path_watermark).resize({
            width:      400,
            height:     240,
            fit:        "contain",
            background: "#00000000"
        }).toBuffer();
        return await sharp({create: {
            width: 400,
            height: 240,
            channels: 3,
            background: "#ffffff"
        }}).png().composite([{
            input:   buffer_background,
            gravity: "center"
        }, {
            input:   buffer_asset,
            gravity: "center"
        }, {
            input:   buffer_watermark,
            gravity: "center"
        }]).toBuffer();
    })).result);
}