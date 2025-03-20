// icons
import { faGun, faWandSparkles, faTicket, faToolbox, faHatCowboy, faFaceLaughWink, faPersonSnowboarding, faSkullCrossbones, faFlag, IconDefinition } from "@fortawesome/free-solid-svg-icons";

// data
import data_weapons from "@/data/data_weapons.json";
import data_gadgets from "@/data/data_gadgets.json";
import data_hats from "@/data/data_hats.json";
import data_faces from "@/data/data_faces.json";
import data_banners from "@/data/data_banners.json";
import data_gamepasses from "@/data/data_gamepasses.json";
import data_currencies from "@/data/data_currencies.json";

export async function get_assets(): Promise<Asset[]> {
    const page_assets = [] as Asset[];
    page_assets.push(...data_weapons.map(weapon_data => [{
        id:    weapon_data.id,
        type:  AssetType.WEAPONS,
        name:  weapon_data.name,
        alias: weapon_data.alias,
        icon:  weapon_data.icon,
        price: weapon_data.price.map(price_data => Object.assign(price_data, {tooltip: ((!price_data.obtainable) ? "former price; currently offsale" : null)})),
        page:  `/weapons/${weapon_data.id}`
    } as Asset, ...weapon_data.skins.map(skin_data => {
        const skin_id = `${weapon_data.id}_${skin_data.id}`
        return ({
            id:    skin_id,
            type:  AssetType.WRAPS,
            name:  skin_data.name,
            alias: [weapon_data.name, ...weapon_data.alias], // skin uses weapon alias
            icon:  skin_data.icon,
            price: skin_data.price.map(price_data => Object.assign(price_data, {tooltip: ((!price_data.obtainable) ? "former price; currently offsale" : null)})),
            page:  `/weapons/${weapon_data.id}/skins/${skin_id}`
        } as Asset);
    })]).flat());
    page_assets.push(...data_gadgets.map(weapon_data => [{
        id:    weapon_data.id,
        type:  AssetType.GADGETS,
        name:  weapon_data.name,
        alias: weapon_data.alias,
        icon:  weapon_data.icon,
        price: weapon_data.price.map(price_data => Object.assign(price_data, {tooltip: ((!price_data.obtainable) ? "former price; currently offsale" : null)})),
        page:  `/gadgets/${weapon_data.id}`
    } as Asset, ...weapon_data.skins.map(skin_data => {
        const skin_id = `${weapon_data.id}_${skin_data.id}`
        return ({
            id:    skin_id,
            type:  AssetType.WRAPS,
            name:  skin_data.name,
            alias: [weapon_data.name, ...weapon_data.alias], // skin uses gadget alias
            icon:  skin_data.icon,
            price: skin_data.price.map(price_data => Object.assign(price_data, {tooltip: ((!price_data.obtainable) ? "former price; currently offsale" : null)})),
            page:  `/gadgets/${weapon_data.id}/skins/${skin_id}`
        } as Asset);
    })]).flat());
    page_assets.push(...data_hats.map(weapon_data => ({
        id:    weapon_data.id,
        type:  AssetType.HATS,
        name:  weapon_data.name,
        alias: weapon_data.alias,
        icon:  weapon_data.icon,
        price: weapon_data.price.map(price_data => Object.assign(price_data, {tooltip: ((!price_data.obtainable) ? "former price; currently offsale" : null)})),
        page:  `/hats/${weapon_data.id}`
    } as Asset)));
    page_assets.push(...data_faces.map(weapon_data => ({
        id:    weapon_data.id,
        type:  AssetType.FACES,
        name:  weapon_data.name,
        alias: weapon_data.alias,
        icon:  weapon_data.icon,
        price: weapon_data.price.map(price_data => Object.assign(price_data, {tooltip: ((!price_data.obtainable) ? "former price; currently offsale" : null)})),
        page:  `/faces/${weapon_data.id}`
    } as Asset)));
    page_assets.push(...data_banners.map(banner_data => ({
        id: banner_data.id,
        type: AssetType.BANNERS,
        name: banner_data.name,
        alias: banner_data.alias,
        icon: banner_data.icon,
        price: banner_data.price.map(price_data => Object.assign(price_data, {tooltip: ((!price_data.obtainable) ? "former price; currently offsale" : null)})),
        page: `/banners/${banner_data.id}`
    } as Asset)));
    page_assets.push(...data_gamepasses.map(weapon_data => ({
        id:    weapon_data.id,
        type:  AssetType.GAMEPASSES,
        name:  weapon_data.name,
        alias: weapon_data.alias,
        icon:  weapon_data.icon,
        price: weapon_data.price.map(price_data => Object.assign(price_data, {tooltip: ((!price_data.obtainable) ? "former price; currently offsale" : null)})),
        page:  `/gamepasses/${weapon_data.id}`
    } as Asset)));
    return page_assets;
}

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