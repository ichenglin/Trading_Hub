import { Asset, AssetGroup, CurrencyConverter } from "./util_asset";

export function color_currency(asset_data: Asset, currency_converter: CurrencyConverter): string {
    if (asset_data.price.length > 0) return `${currency_converter[asset_data.price[0].currency].color}7f`;
    else                             return "#9ca3af7f";
}

export function string_join(string_list: string[], string_delimiter: ("and" | "or") = "and"): string {
    if      (string_list.length <=  0) return "";
    else if (string_list.length === 1) return string_list[0];
    else if (string_list.length === 2) return `${string_list[0]} and ${string_list[1]}`;
    return `${string_list.slice(0, -1).join(", ")}, ${string_delimiter} ${string_list[string_list.length - 1]}`;
}

export function string_match(string_a: string, string_b: string): number {
    const words_a      = string_a.trim().split(/[^a-zA-Z0-9]/).map(word => word.match(/([a-zA-Z]+?)(e?s\b|\b)/)?.at(1)).filter(word => (word !== undefined));
    const words_b      = string_b.trim().split(/[^a-zA-Z0-9]/).map(word => word.match(/([a-zA-Z]+?)(e?s\b|\b)/)?.at(1)).filter(word => (word !== undefined));
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

export function markup_template(asset_data: Asset, asset_wraps: Asset[], asset_group: AssetGroup): string {
    const converter_number = new Intl.NumberFormat("en-US");
    const warp_templates = [
        "features **vibrant and eye-catching** design that is visually striking.",
        "focus on clean, simple designs **without too much flair**, favor for players who prefer **simplicity**."
    ]
    return [
        `# ${asset_group.name.slice(0, -1)} - ${asset_data.name}`,
        ``,
        `[${asset_data.name}](/${asset_group.id}/${asset_data.id}) is one of the many [${asset_group.id}](/${asset_group.id}) in Roblox Flagwars.`,
        ((asset_data.alias.length > 0) ? `Though not the official designation, it was also known as ${string_join(asset_data.alias.map(alias_text => `**${alias_text}**`), "or")}.` : undefined),
        ((asset_data.price.length > 0) ? `It cost ${string_join(asset_data.price.map(price_data => `**${converter_number.format(price_data.amount)} ${price_data.currency}** in ${price_data.source}`))}.` : undefined),
        ``,
        `## ${asset_group.name.slice(0, -1)} Customizations`,
        ``,
        ((asset_wraps.length >  0) ? `The ${asset_data.name} have a total of ${asset_wraps.length} ${asset_group.id.slice(0, -1)} warps, below is the list of them:` : undefined),
        ((asset_wraps.length <= 0) ? `The ${asset_data.name} currently doesn't have any ${asset_group.id.slice(0, -1)} warps in-game.` : undefined),
        ...asset_wraps.map((warp_data, warp_index) => `${warp_index + 1}. **[${warp_data.name}](/${warp_data.type}/${warp_data.id}):** ${warp_data.name} ${warp_templates[Math.floor(Math.random() * (warp_templates.length))]}`),
        ``,
        `## Note`,
        ``,
        `This page was automatically generated, feel free to **contribute** by **[logging in](/login)** with your Discord account.`,
        `**Edit permissions** are currently limited to a **selected group of users** as we are still in the early stages of development.`,
        `If you're interested in supporting the project, please **reach out to us for assistance**. Thank you!`,
        ``
    ].filter(line_text => (line_text !== undefined)).join("\n");
}

export interface AssetNeighbor {
    asset_before: Asset,
    asset_after:  Asset
}