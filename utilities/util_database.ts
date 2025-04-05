import { InferSchemaType } from "mongoose";
import * as Crypto from "crypto";
import Backend from "@/backend";
import { DiscordUser } from "./util_auth";
import { Asset, AssetType } from "./util_asset";
import { APIContent, get_cache, remove_cache } from "./util_cache";

export enum DatabaseUserRole {
    ADMIN  = "admin",
    MOD    = "mod",
    MEMBER = "member"
};

const DatabaseDiscordSchema = new Backend.server_database.Schema({
    id:       {type: String, required: true, min: 17, max: 18},
    username: {type: String, required: true},
    email:    {type: String, required: true},
    locale:   {type: String},
    avatar:   {type: String}
});

const DatabaseUserSchema = new Backend.server_database.Schema({
    id:       {type: String,                required: true, unique: true},
    username: {type: String,                required: true},
    role:     {type: String,                required: true, enum: Object.values(DatabaseUserRole), default: DatabaseUserRole.MEMBER},
    discord:  {type: DatabaseDiscordSchema, required: true},
    suspend:  {type: String}
});

export const DatabaseUserModel = Backend.server_database.models.users || Backend.server_database.model("users", DatabaseUserSchema);
export type  DatabaseUser      = InferSchemaType<typeof DatabaseUserSchema>;

enum DatabaseAssetType {
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
}

enum DatabaseCurrencyType {
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

const DatabasePriceSchema = new Backend.server_database.Schema({
    currency:   {type: String,  required: true, enum: Object.values(DatabaseCurrencyType)},
    amount:     {type: Number,  required: true},
    source:     {type: String,  required: true},
    obtainable: {type: Boolean, required: true}
});

const DatabaseAssetSchema = new Backend.server_database.Schema({
    id:     {type: String, required: true},
    type:   {type: String, required: true, enum: Object.values(DatabaseAssetType)},
    name:   {type: String, required: true},
    alias: [{type: String, required: true}],
    icon:   {type: String, required: true}, // used for image file fetch
    price: [{type: DatabasePriceSchema}]
});

const DatabaseAssetModel = Backend.server_database.models.assets || Backend.server_database.model("assets", DatabaseAssetSchema);
type  DatabasePrice      = InferSchemaType<typeof DatabasePriceSchema>;
interface DatabaseAsset extends Omit<InferSchemaType<typeof DatabaseAssetSchema>, "price"> {
    price: DatabasePrice[]
};

const DatabaseMarkupSchema = new Backend.server_database.Schema({
    id:      {type: String, required: true},
    type:    {type: String, required: true, enum: Object.values(DatabaseAssetType)},
    content: {type: String, required: true},
    updated: {type: Date,   required: true}
});

const DatabaseMarkupModel = Backend.server_database.models.markups || Backend.server_database.model("markups", DatabaseMarkupSchema);
interface DatabaseMarkup extends Omit<InferSchemaType<typeof DatabaseMarkupSchema>, "updated"> {
    updated: string // Date type omitted after json serialize
}

export async function set_user(discord_user: DiscordUser): Promise<DatabaseUser | null> {
    for (let attempt = 0; attempt < 5; attempt++) try {
        return get_serialized(await DatabaseUserModel.findOneAndUpdate({
            "discord.id": discord_user.id
        }, {$set: {
            username: discord_user.username,
            discord: {
                id:       discord_user.id,
                username: discord_user.username,
                email:    discord_user.email,
                locale:   discord_user.locale,
                avatar:   discord_user.avatar
            },
            suspend: null
        }, $setOnInsert: {
            id: Crypto.randomUUID()
        }}, {
            upsert: true,
            new:    true,
            projection: {_id: 0, __v: 0, "discord._id": 0}
        }));
    } catch (error) {
        if ((error as any).code !== 11000) return null;
    }
    return null;
}

export async function update_user(user_id: string, user_update: object): Promise<DatabaseUser | null> {
    return get_serialized(await DatabaseUserModel.findOneAndUpdate({
        id: user_id
    }, {$set: user_update}, {
        new:    true,
        projection: {_id: 0, __v: 0, "discord._id": 0}
    }));
}

export async function get_user(user_id: string): Promise<DatabaseUser | null> {
    return get_serialized(await DatabaseUserModel.findOne({
        id: user_id
    }, undefined, {projection: {_id: 0, __v: 0, "discord._id": 0}}));
}

export async function get_user_all(): Promise<DatabaseUser[]> {
    return get_serialized(await DatabaseUserModel.find({}, undefined, {projection: {_id: 0, __v: 0, "discord._id": 0}}));
}

export async function get_assets(asset_type: AssetType): Promise<Asset[]> {
    const asset_matcher = ((asset_type !== AssetType.ALL) ? {type: asset_type} : {});
    return get_serialized(await DatabaseAssetModel.find(asset_matcher, undefined, {projection: {_id: 0, __v: 0, "price._id": 0}}));
}

export async function get_assets_cached(asset_type: AssetType): Promise<APIContent<Asset[]>> {
    return await get_cache(`assets/${asset_type}`, undefined, async () => {
        return await get_assets(asset_type);
    });
}

export async function set_markup(markup_id: string, markup_type: AssetType, markup_content: string): Promise<DatabaseMarkup> {
    const markup_data = get_serialized(await DatabaseMarkupModel.findOneAndUpdate({
        id: markup_id
    }, {$set: {
        id:      markup_id,
        type:    markup_type,
        content: markup_content,
        updated: new Date()
    }}, {
        upsert: true,
        new:    true,
        projection: {_id: 0, __v: 0}
    }));
    await remove_cache("markups");
    return markup_data;
}

export async function get_markup_all(): Promise<DatabaseMarkup[]> {
    return get_serialized(await DatabaseMarkupModel.find({}, undefined, {projection: {_id: 0, __v: 0}}));
}

export async function get_markup_all_cached(): Promise<APIContent<DatabaseMarkup[]>> {
    return await get_cache(`markups`, undefined, async () => {
        return await get_markup_all();
    });
}

export async function get_markup(markup_id: string): Promise<DatabaseMarkup | null> {
    return get_serialized(await DatabaseMarkupModel.findOne({
        id: markup_id
    }, undefined, {projection: {_id: 0, __v: 0}}));
}

function get_serialized<DatabaseContent>(database_content: DatabaseContent): DatabaseContent {
    return JSON.parse(JSON.stringify(database_content));
}