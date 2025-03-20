import { Asset, CurrencyType, CurrencyTypeOrder } from "./util_asset";

export function get_sort_price(asset_a: Asset, asset_b: Asset, price_ascending: boolean): number {
    // check price exist for compare
    const weight_available_a = (asset_a.price.length > 0);
    const weight_available_b = (asset_b.price.length > 0);
    if      (!weight_available_a && !weight_available_b) return 0;
    else if (!weight_available_a)                        return 1;
    else if (!weight_available_b)                        return (-1);
    // check currency weight
    const weight_currency_a = get_weight_currency(asset_a.price[0].currency as CurrencyType);
    const weight_currency_b = get_weight_currency(asset_b.price[0].currency as CurrencyType);
    if (weight_currency_a !== weight_currency_b) return (weight_currency_a - weight_currency_b);
    // check price weight
    const weight_price_a = asset_a.price[0].amount;
    const weight_price_b = asset_b.price[0].amount;
    return (weight_price_a - weight_price_b) * (price_ascending ? 1 : (-1));
}

function get_weight_currency(currency_type: CurrencyType): number {
    const currency_weight = CurrencyTypeOrder[currency_type];
    return ((currency_weight !== undefined) ? currency_weight : Infinity);
}