// icons
import { faGun, faWandSparkles, faTicket, faToolbox, faHatCowboy, faFaceLaughWink, faPersonSnowboarding, faSkullCrossbones, faFlag, IconDefinition } from "@fortawesome/free-solid-svg-icons";

// data
import data_currencies from "@/data/data_currencies.json";

export async function get_currencies(): Promise<CurrencyConverter> {
    const page_currencies = await Promise.all(data_currencies.map(async (currency_data) => ({
        id:    currency_data.id,
        name:  currency_data.name,
        icon:  currency_data.icon,
        color: currency_data.color
    }) as Currency));
    return page_currencies.reduce((currency_converter, currency_data) => Object.assign(currency_converter, {[currency_data.id]: currency_data}), {} as CurrencyConverter);
}

export function get_categories(): AssetCategory[] {
    return [{
        name: "Armory",
        groups: [{
            name: "Weapons",
            id: AssetType.WEAPONS,
            icon: faGun
        },{
            name: "Wraps",
            id: AssetType.WRAPS,
            icon: faWandSparkles
        },{
            name: "Gadgets",
            id: AssetType.GADGETS,
            icon: faToolbox
        }]
    },{
        name: "Cosmetics",
        groups: [{
            name: "Hats",
            id: AssetType.HATS,
            icon: faHatCowboy
        },{
            name: "Faces",
            id: AssetType.FACES,
            icon: faFaceLaughWink
        },{
            name: "Emotes",
            id: AssetType.EMOTES,
            icon: faPersonSnowboarding
        },{
            name: "Kill Effects",
            id: AssetType.KILLFXS,
            icon: faSkullCrossbones
        },{
            name: "Banners",
            id: AssetType.BANNERS,
            icon: faFlag
        }]
    },{
        name: "Miscellaneous",
        groups: [{
            name: "Gamepasses",
            id: AssetType.GAMEPASSES,
            icon: faTicket
        }]
    }];
}

export interface Asset {
    id:    string,
    type:  AssetType,
    name:  string,
    alias: string[],
    icon:  string,
    price: AssetPrice[],
    page:  string
}

export interface AssetPrice {
    currency:   string,
    amount:     number,
    source:     string,
    obtainable: boolean,
    tooltip:    (string | null)
}

export enum AssetType {
    WEAPONS    = "weapons",
    WRAPS      = "wraps",
    GADGETS    = "gadgets",
    HATS       = "hats",
    FACES      = "faces",
    EMOTES     = "emotes",
    KILLFXS    = "killfxs",
    BANNERS    = "banners",
    GAMEPASSES = "gamepasses",
    ALL        = "all"
};

export interface Currency {
    id:    string,
    name:  string,
    icon:  string,
    color: string
}

export enum CurrencyType {
    CASH        = "cash",
    HEART       = "heart",
    ROSE        = "rose",
    CLOVER      = "clover",
    EGG         = "egg",
    POPSICLE    = "popsicle",
    COIN        = "coin",
    CANDY       = "candy",
    GINGERBREAD = "gingerbread",
    SNOWFLAKE   = "snowflake",
    ROBUX       = "robux",
    QUEST       = "quest"
}

// currency order used for util_sort
export const CurrencyTypeOrder = {
    [CurrencyType.CASH]:        0,
    [CurrencyType.HEART]:       1,
    [CurrencyType.ROSE]:        2,
    [CurrencyType.CLOVER]:      3,
    [CurrencyType.EGG]:         4,
    [CurrencyType.POPSICLE]:    5,
    [CurrencyType.COIN]:        6,
    [CurrencyType.CANDY]:       7,
    [CurrencyType.GINGERBREAD]: 8,
    [CurrencyType.SNOWFLAKE]:   9,
    [CurrencyType.ROBUX]:       10,
    [CurrencyType.QUEST]:       11
} as {[key in CurrencyType]: number};

export type CurrencyConverter = {[id: string]: Currency};

export interface AssetCategory {
    name:   string,
    groups: AssetGroup[]
}

export interface AssetGroup {
    name: string,
    id:   AssetType,
    icon: IconDefinition
}