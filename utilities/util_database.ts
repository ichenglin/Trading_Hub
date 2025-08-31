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

const DatabaseValueUpdateSchema = new Backend.server_database.Schema({
    date:  {type: Date,   required: true},
    value: {type: Number, required: true}
});

const DatabaseValueHistorySchema = new Backend.server_database.Schema({
    id:       {type: String, required: true},
    updated:  {type: Date,   required: true},
    updates: [{type: DatabaseValueUpdateSchema}]
});

const DatabaseValueHistoryModel = Backend.server_database.models.values || Backend.server_database.model("values", DatabaseValueHistorySchema);
interface DatabaseValueUpdate extends Omit<InferSchemaType<typeof DatabaseValueUpdateSchema>, "date"> {
    date: string // Date type omitted after json serialize
};
interface DatabaseValueHistory extends Omit<InferSchemaType<typeof DatabaseValueHistorySchema>, "updated"|"updates"> {
    updated: string,
    updates: DatabaseValueUpdate[]
};

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
    await remove_cache(`markups/${markup_id}`);
    return markup_data;
}

export async function get_markup(markup_id: string): Promise<DatabaseMarkup | null> {
    return get_serialized(await DatabaseMarkupModel.findOne({
        id: markup_id
    }, undefined, {projection: {_id: 0, __v: 0}}));
}

export async function get_markup_cached(markup_id: string): Promise<APIContent<DatabaseMarkup | null>> {
    return await get_cache(`markups/${markup_id}`, undefined, async () => {
        return await get_markup(markup_id);
    });
}

export async function set_value(value_id: string, value_new: number, value_overwrite: boolean): Promise<DatabaseValueHistory> {
    const value_update = {
        date: new Date(),
        value: value_new
    } as unknown as DatabaseValueUpdate;
    const history_old = get_serialized(await DatabaseValueHistoryModel.findOne({
        id: value_id
    })) as (DatabaseValueHistory | null);
    const history_new = get_serialized(await DatabaseValueHistoryModel.findOneAndUpdate({
        id: value_id
    }, {$set: {
        id:      value_id,
        updated: Date.now(),
        updates: set_value_overwrite(history_old, value_update, value_overwrite)
    }}, {
        upsert: true,
        new:    true,
        projection: {_id: 0, __v: 0, "updates._id": 0}
    })) as DatabaseValueHistory;
    await remove_cache(`values/${value_id}`);
    return history_new;
}

function set_value_overwrite(old_history: (DatabaseValueHistory | null), new_update: DatabaseValueUpdate, new_overwrite: boolean): DatabaseValueUpdate[] {
    // no existing values
    if (old_history === null) return [new_update];
    // there's existing values
    const old_newest   = old_history.updates.at(-1) as DatabaseValueUpdate;
    const old_updated  = new Date(old_newest.date).getTime();
    const new_updated  = new Date(new_update.date).getTime();
    // check if a day has passed since last update
    const old_outdated = ((new_updated - old_updated) >= 864E5);
    if ((!new_overwrite) || old_outdated) return old_history.updates.concat(new_update);
    return old_history.updates.slice(0, -1).concat({
        date:  old_newest.date,
        value: new_update.value
    } as unknown as DatabaseValueUpdate);
}

export async function get_value(value_id: string): Promise<DatabaseValueHistory | null> {
    return get_serialized(await DatabaseValueHistoryModel.findOne({
        id: value_id
    }, undefined, {projection: {_id: 0, __v: 0, "updates._id": 0}}));
}

export async function get_value_cached(value_id: string): Promise<APIContent<DatabaseValueHistory | null>> {
    return await get_cache(`values/${value_id}`, undefined, async () => {
        return await get_value(value_id);
    });
}

function get_serialized<DatabaseContent>(database_content: DatabaseContent): DatabaseContent {
    return JSON.parse(JSON.stringify(database_content));
}