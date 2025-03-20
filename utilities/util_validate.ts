import { AssetType } from "./util_asset";

export function validate_string(request_string: string): boolean {
    const string_type   = ((typeof request_string) === "string");
    const string_length = (string_type && (request_string.length > 0));
    return (string_type && string_length);
}

export function validate_type(request_type: string): boolean {
    const type_type  = ((typeof request_type) === "string");
    const type_exist = (type_type && Object.values(AssetType).includes(request_type as AssetType));
    return (type_type && type_exist);
}

export function validate_pathname(request_pathname: string[]): boolean {
    const pathname_type = Array.isArray(request_pathname);
    const pathname_full = (pathname_type && (request_pathname.join("/").match(/[^\w\/]/) === null));
    return (pathname_type && pathname_full);
}