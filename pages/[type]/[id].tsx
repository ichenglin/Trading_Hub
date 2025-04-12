import { useContext, useEffect, useState } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { NextPageLayout } from "../_app";
import { validate_string } from "@/utilities/util_validate";
import { get_assets, get_assets_cached, get_markup_all_cached } from "@/utilities/util_database";
import { Asset, AssetGroup, AssetType, CurrencyConverter, CurrencyType, get_categories } from "@/utilities/util_asset";
import styles from "@/styles/pages/CatalogItem.module.css";
import ObjectMarkdownViewer from "@/components/object_viewer_markdown";
import { get_currencies_cached } from "../api/currencies";
import { asset_beside, asset_related, AssetNeighbor, date_day, number_print, NumberFormatType, price_color, string_join } from "@/utilities/util_render";
import silent_scroll from "@/utilities/util_scroll";
import ObjectMarkdownEditor from "@/components/object_editor_markdown";
import { context_alert, context_auth, ContextAlertType } from "@/contexts/context_page";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDroplet, faBoltLightning, faPersonWalking, faBullseye, faTags, faSquarePollVertical, faIdCard, faChevronRight, faChevronLeft, faLightbulb, faPencil, faShare, faStar, faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";

enum CatalogItemEditStatus {
    VERIFYING = "Verifying",
    FAILED    = "Rejected",
    SUCCESS   = "Success",
    NONE      = "Submit"
}

interface CatalogItemProps {
    page_asset:      Asset,
    page_wraps:      Asset[],
    page_group:      string,
    page_related:    string,
    page_neighbor:   AssetNeighbor,
    page_currencies: CurrencyConverter,
    page_markup:     string,
    page_updated:    string
};

const CatalogItem: NextPageLayout<CatalogItemProps> = (props) => {
    const [page_edit, set_edit] = useState({editing: false, status: CatalogItemEditStatus.NONE});
    const [page_text, set_text] = useState("");
    const page_alert            = useContext(context_alert);
    const page_auth             = useContext(context_auth);
    const page_router           = useRouter();
    const page_user             = page_auth.get();
    const page_url              = `/${props.page_asset.type}/${props.page_asset.id}`;
    const asset_wraps           = props.page_wraps.slice(0, Math.min(props.page_wraps.length, 4));
    const asset_wraps_more      = Math.max((props.page_wraps.length - 4), 0);

    useEffect(() => {
        set_text(props.page_markup);
    }, [props.page_markup])

    const page_bookmark_request = async () => {
        page_alert.add(ContextAlertType.WARNING, "Bookmark is currently Disabled");
    }

    const page_copy_request = async () => {
        await navigator.clipboard.writeText(new URL(page_url, window.location.origin).toString());
        page_alert.add(ContextAlertType.SUCCESS, "Successfully Copied Link to Clipboard");
    }

    const page_edit_request = () => {
        if (page_edit.editing) {
            set_edit({...page_edit, editing: false});
            return;
        }
        if (!page_user.auth_success) return page_router.push("/login");
        else                         set_edit({...page_edit, editing: true});
    }

    const page_submit_request = async () => {
        set_edit({...page_edit, status: CatalogItemEditStatus.VERIFYING});
        const submit_result = await fetch("/api/user/contribute", {
            method: "POST",
            body: JSON.stringify({
                page_type:     props.page_asset.type,
                page_id:       props.page_asset.id,
                page_markup:   page_text
            })
        }).then(response => response.json());
        if (submit_result.success) {
            page_alert.add(ContextAlertType.SUCCESS, `Successfully Updated ${props.page_asset.name}`);
            set_edit({...page_edit, status: CatalogItemEditStatus.SUCCESS});
        } else {
            page_alert.add(ContextAlertType.FAILURE, `Update to ${props.page_asset.name} was Rejected`);
            set_edit({...page_edit, status: CatalogItemEditStatus.FAILED});
        }
    }

    return (
        <div className={styles.layout}>
            {page_edit.editing && (
                <div className={styles.window_editor} style={{width: (page_edit.editing ? "50%" : "0%"), visibility: (page_edit.editing ? "visible" : "hidden")}}>
                    <div>
                        <ObjectMarkdownEditor page_text={page_text} set_text={set_text}/>
                        <button className={styles.submit} onClick={page_submit_request}>
                            <FontAwesomeIcon icon={faCloudArrowUp}/>
                            <span>{page_edit.status}</span>
                        </button>
                    </div>
                </div>
            )}
            <div className={styles.window_viewer} style={{width: (page_edit.editing ? "50%" : "100%")}}>
                <section className={styles.viewer}>
                    <section className={styles.namecard}>
                        <div className={styles.grid}>
                            <div className={styles.title} style={{color: `${price_color(props.page_asset, props.page_currencies).slice(0, -2)}`}}>
                                <h1>{props.page_asset.name}</h1>
                            </div>
                            <div className={styles.icon}>
                                <Image src={`/api/assets/${props.page_asset.type}/${props.page_asset.id}`} alt={props.page_asset.name} fill style={{backgroundColor: price_color(props.page_asset, props.page_currencies)}}/>
                                <div className={styles.preview}>
                                    {asset_wraps.map((wrap_data, wrap_index) => (
                                        <Link href={`/${wrap_data.type}/${wrap_data.id}`} key={wrap_index}>
                                            <Image src={`/api/assets/${wrap_data.type}/${wrap_data.id}`} alt={wrap_data.name} fill style={{backgroundColor: price_color(wrap_data, props.page_currencies)}}/>
                                        </Link>
                                    ))}
                                    {(asset_wraps_more > 0) && (
                                        <Link className={styles.more} href={page_url} onClick={(event: any) => silent_scroll(event, page_url, "#wraps", page_router)}>
                                            <h5>
                                                <span>{`${asset_wraps_more}+`}</span>
                                                <span>More</span>
                                            </h5>
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <div className={styles.stats}>
                                <div className={styles.price}>
                                    <h3 className={styles.category}>
                                        <FontAwesomeIcon icon={faTags}/>
                                        <span>Former Prices</span>
                                    </h3>
                                    {props.page_asset.price.map((pricetag_data, pricetag_index) => {
                                        const pricetag_currency = props.page_currencies[pricetag_data.currency];
                                        let   price_display     = number_print(pricetag_data.amount, 2, NumberFormatType.ABBREVIATION);
                                        if      (pricetag_data.currency === "quest") price_display = "Quest";
                                        else if (pricetag_data.amount   <=  0)       price_display = "Free";
                                        return (
                                            <div className={styles.pricetag} key={pricetag_index} style={{backgroundColor: pricetag_currency.color}}>
                                                <div>
                                                    <Image src={`/images/currencies/${pricetag_currency.id}.png`} alt={pricetag_currency.name} fill/>
                                                </div>
                                                <span><b>{price_display}</b></span>
                                                <span>({pricetag_data.source})</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className={styles.gameplay}>
                                    <h3 className={styles.category}>
                                        <FontAwesomeIcon icon={faSquarePollVertical}/>
                                        <span>Item Stats</span>
                                    </h3>
                                    <div style={{backgroundColor: "#fca5a5"}}>
                                        <FontAwesomeIcon icon={faDroplet}/>
                                        <span><b>Damage:</b> ?</span>
                                    </div>
                                    <div style={{backgroundColor: "#fde68a"}}>
                                        <FontAwesomeIcon icon={faBoltLightning}/>
                                        <span><b>Firerate:</b> ?</span>
                                    </div>
                                    <div style={{backgroundColor: "#93c5fd"}}>
                                        <FontAwesomeIcon icon={faBullseye}/>
                                        <span><b>Accuracy:</b> ?</span>
                                    </div>
                                    <div style={{backgroundColor: "#bef264"}}>
                                        <FontAwesomeIcon icon={faPersonWalking}/>
                                        <span><b>Movement:</b> ?</span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.aliases}>
                                <h3 className={styles.category}>
                                    <FontAwesomeIcon icon={faIdCard}/>
                                    <span>Item Aliases</span>
                                </h3>
                                <div>
                                    {props.page_asset.alias.map((asset_alias, alias_index) => (
                                        <span key={alias_index}>{asset_alias}</span>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.options}>
                                <span><b>Last Updated:</b> {props.page_updated}</span>
                                <span className={styles.tree}>
                                    <span>Catalog</span>
                                    <span><Link href={`/${props.page_asset.type}`}>{props.page_group}</Link></span>
                                    <span>{props.page_asset.name}</span>
                                </span>
                            </div>
                        </div>
                    </section>
                    <section className={styles.document}>
                        <div>
                            <ObjectMarkdownViewer source={page_text}/>
                        </div>
                    </section>
                    <section className={styles.footer}>
                        <span className="header_offset" id="wraps"/>
                        <div>
                            {(props.page_wraps.length > 0) && (<>
                                <h2>{props.page_asset.name} Wraps</h2>
                                <div className={styles.wraps}>
                                    {props.page_wraps.map((wrap_data, wrap_index) => (
                                        <Link href={`/${wrap_data.type}/${wrap_data.id}`} key={wrap_index}>
                                            <div>
                                                <Image src={`/api/assets/${wrap_data.type}/${wrap_data.id}`} alt={wrap_data.name} fill style={{backgroundColor: price_color(wrap_data, props.page_currencies)}}/>
                                            </div>
                                            <h5>
                                                <span>{wrap_data.name}</span>
                                            </h5>
                                        </Link>
                                    ))}
                                </div>
                            </>)}
                            <h2>Related Items</h2>
                            <ObjectMarkdownViewer source={props.page_related} margin={false}/>
                            <div className={styles.toolbox}>
                                <div>
                                    <button style={{backgroundColor: "#f59e0b"}} onClick={page_bookmark_request}>
                                        <FontAwesomeIcon icon={faStar}/>
                                        <span>Bookmark</span>
                                    </button>
                                    <button style={{backgroundColor: "#ef4444"}} onClick={page_copy_request}>
                                        <FontAwesomeIcon icon={faShare}/>
                                        <span>Copy Link</span>
                                    </button>
                                    <button style={{backgroundColor: "#a3a3a3"}} onClick={page_edit_request}>
                                        <FontAwesomeIcon icon={faPencil}/>
                                        <span>Edit Page</span>
                                    </button>
                                </div>
                            </div>
                            <div className={styles.contribute}>
                                <FontAwesomeIcon icon={faLightbulb}/>
                                <span>
                                    <span>Encountered a problem or have <b>suggestions for enhancement</b>? Feel free to <b>contribute</b> by </span>
                                    <Link href="/login">logging in</Link>
                                    <span> with your Discord account.</span>
                                </span>
                            </div>
                            <div className={styles.next}>
                                <Link href={`/${props.page_neighbor.asset_before.type}/${props.page_neighbor.asset_before.id}`}>
                                    <FontAwesomeIcon icon={faChevronLeft}/>
                                    <span>Previous <b>({props.page_neighbor.asset_before.name})</b></span>
                                </Link>
                                <Link href={`/${props.page_neighbor.asset_after.type}/${props.page_neighbor.asset_after.id}`}>
                                    <span><b>({props.page_neighbor.asset_after.name})</b> Next</span>
                                    <FontAwesomeIcon icon={faChevronRight}/>
                                </Link>
                            </div>
                        </div>
                    </section>
                </section>
            </div>
        </div>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    const server_assets = await get_assets(AssetType.ALL);
	return {
		paths: server_assets.map(asset_data => ({params: {
            type: asset_data.type,
            id:   asset_data.id
        }})),
		fallback: false
	};
};

export const getStaticProps: GetStaticProps = async (context) => {
	// verify parameters
    const page_type = context.params?.type as string;
    const page_id   = context.params?.id   as string;
    if (!validate_string(page_type)) return {props: {}};
    if (!validate_string(page_id))   return {props: {}};
    // verify asset
    const server_assets = (await get_assets_cached(AssetType.ALL)).result;
    const page_asset    = server_assets.find(asset_data => ((asset_data.type === page_type) && (asset_data.id === page_id)));
    if (page_asset === undefined) return {props: {}};
    // find warps
    const page_group = get_categories().flatMap(category_data => category_data.groups).find(group_data => (group_data.id === page_type)) as AssetGroup;
    const page_wraps = server_assets.filter(asset_data => {
        if (page_asset.type === AssetType.WRAPS)      return false;
        if (asset_data.type !== AssetType.WRAPS)      return false;
        if (!asset_data.id.startsWith(page_asset.id)) return false;
        return true;
    });
    const page_wraps_minimal = page_wraps.slice(0, Math.min(page_wraps.length, 3)).map(wrap_data => wrap_data.name);
    // find related
    const page_related = asset_related(server_assets, page_asset, 5);
    const page_related_text = [
        `Players who are interested in **${page_asset.name}** also searched for `,
        string_join(page_related.map(asset_data => `[${asset_data.name}](/${asset_data.type}/${asset_data.id})`)),
        "."
    ].join("");
    // find markup
    const page_markup = (await get_markup_all_cached()).result.find(markup_data => (markup_data.id === page_id));
    // find prices
    const page_prices = page_asset.price.map(price_data => {
        if (price_data.currency === CurrencyType.QUEST) return price_data.source;
        if (price_data.amount   <=  0)                  return price_data.source;
        return `${number_print(price_data.amount, 2, NumberFormatType.ABBREVIATION)} ${price_data.currency} in ${price_data.source}`;
    });
    // generate description
    let   page_pronouns_next = 0;
    const page_pronouns_list = ["It", `The ${page_group.name.slice(0, -1).toLowerCase()}`, "It", `The ${page_group.name.slice(0, -1).toLowerCase()}`];
    const page_description   = [
        `The ${page_asset.name} is one of the ${page_group.name.toLowerCase()} in Flagwars.`,
        ((page_asset.alias.length > 0) ? `${page_pronouns_list[page_pronouns_next++]} was also referred to as ${string_join(page_asset.alias, "or")}.`                         : undefined),
        ((page_prices.length      > 0) ? `${page_pronouns_list[page_pronouns_next++]} was obtainable for ${string_join(page_prices)}.`                                         : undefined),
        ((page_wraps.length       > 0) ? `${page_pronouns_list[page_pronouns_next++]} has ${page_wraps.length} wraps in total such as the ${string_join(page_wraps_minimal)}.` : undefined),
        `Check ${page_pronouns_list[page_pronouns_next++].toLowerCase()} out right now on Flagwars Wiki.`
    ].filter(sentence_string => (sentence_string !== undefined)).join(" ");
	return {props: {
		page_name:        page_asset.name,
		page_description: page_description,
        page_image:       `/api/assets/${page_asset.type}/${page_asset.id}?format=fixed`,
		page_pathname:    `/${page_asset.type}/${page_asset.id}`,
		// local props
        page_asset:       page_asset,
        page_wraps:       page_wraps,
        page_group:       page_group.name,
        page_related:     page_related_text,
        page_neighbor:    asset_beside(server_assets, page_id),
        page_currencies:  (await get_currencies_cached()).result,
		page_markup:      (page_markup?.content ?? `# Overview\n\n${page_description}`),
        page_updated:     ((page_markup?.updated !== undefined) ? date_day(new Date(page_markup.updated)) : "Unknown")
	} as CatalogItemProps};
};

export default CatalogItem;