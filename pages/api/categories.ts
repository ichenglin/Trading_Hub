import { AssetCategory, AssetGroup, get_assets, get_categories } from "@/utilities/util_asset";
import { get_cache } from "@/utilities/util_cache";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    response.status(200).json(await get_cache("categories", undefined, async () => {
        const data_assets     = await get_assets();
        const data_categories = get_categories();
        return data_categories.map(category_data => ({
            name: category_data.name,
            groups: category_data.groups.map(group_data => ({
                id:       group_data.id,
                name:     group_data.name,
                elements: data_assets.filter(asset_data => (asset_data.type === group_data.id)).length
            } as AssetGroupAPI))
        } as AssetCategoryAPI));
    }));
}

export interface AssetCategoryAPI extends Omit<AssetCategory, "groups"> {
    groups: AssetGroupAPI[]
}

export interface AssetGroupAPI extends Omit<AssetGroup, "icon"> {
    elements: number
}