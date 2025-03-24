import { AssetType } from "./util_asset";
import { get_assets, get_assets_cached } from "./util_database";

export function validate_string(request_string: (string | undefined | null)): boolean {
    const string_type   = ((typeof request_string) === "string");
    const string_length = (string_type && (request_string.length > 0));
    return (string_type && string_length);
}

export function validate_enum<EnumConversion>(request_string: (EnumConversion | undefined | null), matching_enum: {[key: string]: EnumConversion}): boolean {
    const enum_type  = ((typeof request_string) === "string");
    const enum_exist = (enum_type && Object.values(matching_enum).includes(request_string));
    return (enum_type && enum_exist);
}

export function validate_type(request_type: (string | undefined | null)): boolean {
    const type_type  = ((typeof request_type) === "string");
    const type_exist = (type_type && Object.values(AssetType).includes(request_type as AssetType));
    return (type_type && type_exist);
}

export async function validate_id(request_id: (string | undefined | null)): Promise<boolean> {
    const id_type  = ((typeof request_id) === "string");
    const id_exist = (id_type && ((await get_assets_cached(AssetType.ALL)).result.find(asset_data => (asset_data.id === request_id)) !== undefined));
    return (id_type && id_exist);
}

export function validate_pathname(request_pathname: (string[] | undefined | null)): boolean {
    const pathname_type = Array.isArray(request_pathname);
    const pathname_full = (pathname_type && (request_pathname.join("/").match(/[^\w\/]/) === null));
    return (pathname_type && pathname_full);
}

export function validate_json(request_string: (string | undefined | null), allow_array: boolean, allow_object: boolean): boolean {
    // check is string
    const string_type = validate_string(request_string);
    if (!string_type) return false;
    // check is json
    let json_parsed;
    try {json_parsed = JSON.parse(request_string as string);}
    catch (error) {return false;}
    // check array
    const json_array = Array.isArray(json_parsed);
    if (json_array && (!allow_array)) return false;
    // check object
    if (!allow_object) return false;
    return true;
}