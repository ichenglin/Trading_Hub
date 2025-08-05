import { Asset, CurrencyConverter } from "./util_asset";

export enum NumberFormatType {
    WORD,
    ABBREVIATION
};
const NUMBER_FORMAT_UNITS = [
    {[NumberFormatType.WORD]: "",          [NumberFormatType.ABBREVIATION]: ""},
    {[NumberFormatType.WORD]: " Thousand", [NumberFormatType.ABBREVIATION]: "K"}, // or Kilodillion
    {[NumberFormatType.WORD]: " Million",  [NumberFormatType.ABBREVIATION]: "M"},
    {[NumberFormatType.WORD]: " Billion",  [NumberFormatType.ABBREVIATION]: "B"},
    {[NumberFormatType.WORD]: " Trillion", [NumberFormatType.ABBREVIATION]: "T"}
];

export function key_whitelist(raw_object: object, key_allowed: string[]): object {
    return Object.fromEntries(Object.entries(raw_object).filter(([key_name]) => key_allowed.includes(key_name)));
}

export function number_logbase(number_value: number, number_base: number): number {
    return (Math.log(number_value) / Math.log(number_base));
}

export function number_print(number_value: number, number_digits: number, number_type: NumberFormatType): string {
    // TODO: toFixed might round up if there are too less digits
    const number_base        = Math.floor(number_logbase(number_value, 1E3));
    const number_unit        = (NUMBER_FORMAT_UNITS.at(number_base) as (typeof NUMBER_FORMAT_UNITS[0]));
    const number_significant = parseFloat((number_value / Math.pow(1E3, number_base)).toFixed  (number_digits)).toString();
    if (number_base <  0)                          return parseFloat(number_value.toFixed      (number_digits)).toString();
    if (number_base >= NUMBER_FORMAT_UNITS.length) return parseFloat(number_value.toExponential(number_digits)).toString().toUpperCase();
    return `${number_significant}${number_unit[number_type]}`;
}

export function string_capitalize(string_data: string): string {
    const string_words = string_data.split(/\s/);
    return string_words.map(string_word => {
        if (string_word.length <= 0) return string_word;
        return `${string_word.at(0)?.toUpperCase()}${string_word.slice(1).toLowerCase()}`;
    }).join(" ");
}

export function string_join(string_list: string[], string_delimiter: ("and" | "or") = "and"): string {
    if      (string_list.length <=  0) return "";
    else if (string_list.length === 1) return string_list[0];
    else if (string_list.length === 2) return `${string_list[0]} ${string_delimiter} ${string_list[1]}`;
    return `${string_list.slice(0, -1).join(", ")}, ${string_delimiter} ${string_list[string_list.length - 1]}`;
}

export function string_match(string_a: string, string_b: string): number {
    const words_a      = string_a.trim().split(/[^a-zA-Z0-9]/).map(word => word.match(/([a-zA-Z]+?)(e?s\b|\b)/)?.at(1)).filter(word => (word !== undefined)) as string[];
    const words_b      = string_b.trim().split(/[^a-zA-Z0-9]/).map(word => word.match(/([a-zA-Z]+?)(e?s\b|\b)/)?.at(1)).filter(word => (word !== undefined)) as string[];
    const words_used   = {} as {[key: string]: boolean}
    let   words_common = 0;
    for (const word_a of words_a) words_used[word_a] = true;
    for (const word_b of words_b) {
        if (words_used[word_b] !== true) continue;
        words_used[word_b] = false;
        words_common++;
    }
    return words_common;
}

export function date_day(date_data: Date): string {
    return date_data.toLocaleDateString("en-US", {timeZone: "UTC"});
}

export function asset_beside(asset_list: Asset[], asset_id: string): AssetNeighbor {
    const asset_index  = asset_list.findIndex(asset_data => (asset_data.id === asset_id));
    const asset_total  = (asset_list.length);
    let   asset_before = (asset_index - 1);
    let   asset_after  = (asset_index + 1);
    if (asset_before <  0)           asset_before += asset_total;
    if (asset_after  >= asset_total) asset_after  -= asset_total;
    return {
        asset_before: asset_list[asset_before],
        asset_after:  asset_list[asset_after]
    }
}

export function asset_related(asset_list: Asset[], asset_sample: Asset, asset_amount: number): Asset[] {
    // ideally this response should be cached
    return asset_list.map(asset_data => {
        if (asset_sample.id === asset_data.id) return {
            asset_data:   asset_data,
            asset_rating: (-1)
        };
        let asset_rating = 0;
        asset_rating += string_match(asset_sample.name, asset_data.name);
        asset_rating += ((asset_sample.type                  === asset_data.type)                  ? 1   : 0);
        asset_rating += ((asset_sample.price.at(0)?.currency === asset_data.price.at(0)?.currency) ? 0.5 : 0);
        return {
            asset_data:   asset_data,
            asset_rating: asset_rating
        };
    }).sort((asset_a, asset_b) => (asset_b.asset_rating - asset_a.asset_rating)).map(asset_rated => asset_rated.asset_data).slice(0, Math.min(asset_list.length, asset_amount));
}

export function price_color(asset_data: Asset, currency_converter: CurrencyConverter): string {
    if (asset_data.price.length > 0) return `${currency_converter[asset_data.price[0].currency].color}7f`;
    else                             return "#9ca3af7f";
}

export interface AssetNeighbor {
    asset_before: Asset,
    asset_after:  Asset
}