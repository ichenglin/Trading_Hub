import { useEffect, useState } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import Image from "next/image";
import type { NextPageLayout } from "../_app";
import { AssetCategoryAPI, AssetGroupAPI } from "../api/categories";
import { get_sort_price } from "@/utilities/util_sort";
import { Asset, AssetGroup, CurrencyConverter, get_categories } from "@/utilities/util_asset";
import { number_print, NumberFormatType } from "@/utilities/util_render";
import styles from "@/styles/pages/Catalog.module.css";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearchDollar, faAngleLeft, faAngleRight, faMagnifyingGlass, faArrowDownWideShort, faTableList, faStar, faPrint, faEye } from "@fortawesome/free-solid-svg-icons";

const Catalog: NextPageLayout<{page_group: AssetGroup}> = (props) => {

    const [page_assets,     set_assets]     = useState([] as Asset[]);
    const [page_currencies, set_currencies] = useState({} as CurrencyConverter);
    const [page_categories, set_categories] = useState([] as AssetGroupAPI[]);
    const [page_loaded,     set_loaded]     = useState(false);
    const [page_search,     set_search]     = useState({search_text: null, search_sort: SearchSortType.PRICE_LH, search_view: SearchViewType.CARD} as SearchParameters);

    useEffect(() => {
        (async () => {
            const page_content = await Promise.all([
                fetch(`/api/items/${props.page_group.id}`).then(response => response.json()).then(response => response.result),
                fetch("api/currencies")                   .then(response => response.json()).then(response => response.result),
                fetch("api/categories")                   .then(response => response.json()).then(response => (response.result as AssetCategoryAPI[]).map(category_data => category_data.groups).flat())
            ]);
            set_assets    (page_content[0]);
            set_currencies(page_content[1]);
            set_categories(page_content[2]);
            set_loaded    (true);
        })();
    }, [props.page_group.id]);

    const sidebar_toggle = () => {
		const header_element   = document.getElementsByClassName(styles.explorer)[0];
		const sidebar_inactive = (header_element.getAttribute("sidebar-active") === "false");
		header_element.setAttribute("sidebar-active", (sidebar_inactive ? "true" : "false"));
	};

    const searchbar_update = (search_text?: string, search_sort?: SearchSortType, search_view?: SearchViewType) => {
        const search_parameters = Object.assign({}, page_search);
        if (search_text !== undefined) search_parameters.search_text = ((search_text.length > 0) ? search_text : null);
        if (search_sort !== undefined) search_parameters.search_sort = search_sort;
        if (search_view !== undefined) search_parameters.search_view = search_view;
        set_search(search_parameters);
    }

    const searchbar_match = (asset_data: Asset) => {
        if (page_search.search_text === null) return true;
        const search_term  = page_search.search_text.toLowerCase();
        const search_match = [asset_data.name, ...asset_data.alias].find(asset_name => asset_name.toLowerCase().includes(search_term));
        return (search_match !== undefined);
    }

    // search event already triggers re-render using page_search state
    const search_result = page_assets.filter(asset_data => searchbar_match(asset_data)).sort((asset_a, asset_b) => {
        switch (page_search.search_sort) {
            case SearchSortType.NAME_AZ:  return ((asset_a.name > asset_b.name) ? 1 : -1);
            case SearchSortType.NAME_ZA:  return ((asset_a.name < asset_b.name) ? 1 : -1);
            case SearchSortType.PRICE_LH: return get_sort_price(asset_a, asset_b, true);
            case SearchSortType.PRICE_HL: return get_sort_price(asset_a, asset_b, false);
            default:                      return 0;
        }
    });

    return (
        <section className={styles.explorer}>
            <div className={styles.viewer}>
                {page_loaded ? search_result.map((asset_data, asset_index) => {
                    const icon_background = ((asset_data.price.length > 0) ? `${page_currencies[asset_data.price[0].currency].color}7f` : "#9ca3af7f");
                    return (
                        <div className={styles.card} key={asset_index}>
                            <div className={styles.icon} style={{backgroundColor: icon_background}}>
                                <div>
                                    <Image src={`/api/assets/${asset_data.type}/${asset_data.id}`} alt={asset_data.name} sizes="170px" fill/>
                                </div>
                            </div>
                            <div className={styles.label}>
                                <h5>{asset_data.name}</h5>
                                <span>{props.page_group.name}</span>
                            </div>
                            <div className={styles.pricetag}>
                                {asset_data.price.map((asset_price, price_index) => {
                                    const price_currency = page_currencies[asset_price.currency];
                                    let   price_display  = number_print(asset_price.amount, 2, NumberFormatType.ABBREVIATION);
                                    if      (asset_price.currency === "quest") price_display = "Quest";
                                    else if (asset_price.amount   <=  0)       price_display = "Free";
                                    return (<div className={styles.price} style={{backgroundColor: `${price_currency.color}7f`}} key={price_index}>
                                        <div>
                                            <Image src={price_currency.icon} alt={price_currency.name} sizes="14px" fill/>
                                        </div>
                                        <span>{price_display}</span>
                                        <span>({asset_price.source})</span>
                                    </div>);
                                })}
                            </div>
                            <div className={styles.actions}>
                                <Link href={`/${asset_data.type}/${asset_data.id}`}>
                                    <FontAwesomeIcon icon={faAngleRight}/>
                                    <span>View Item</span>
                                </Link>
                                <button>
                                    <FontAwesomeIcon icon={faStar}/>
                                </button>
                                <button>
                                    <FontAwesomeIcon icon={faPrint}/>
                                </button>
                            </div>
                        </div>
                    );
                }) : (<></>)}
            </div>
            <div className={styles.filters}>
                <div className={`${styles.searchbar} ${styles.tool}`}>
                    <FontAwesomeIcon icon={faMagnifyingGlass}/>
                    <input type="search" placeholder="Search Item Name" spellCheck="false" onChange={(event) => searchbar_update(event.target.value, undefined, undefined)}/>
                </div>
                <div className={styles.tool}>
                    <FontAwesomeIcon icon={faEye}/>
                    <span>{page_loaded ? `Showing ${search_result.length}/${page_assets.length} ${props.page_group.name}` : `Loading ${props.page_group.name}...`}</span>
                </div>
                <div className={`${styles.dropdown} ${styles.tool}`}>
                    <FontAwesomeIcon icon={faArrowDownWideShort}/>
                    <span>Sort By: <b>{page_search.search_sort}</b></span>
                    <div className={styles.options}>
                        <ol>
                            {Object.values(SearchSortType).map((sort_type, sort_index) => (
                                <li key={sort_index}>
                                    <button onClick={() => searchbar_update(undefined, sort_type, undefined)}>{sort_type}</button>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
                <div className={`${styles.dropdown} ${styles.tool}`}>
                    <FontAwesomeIcon icon={faTableList}/>
                    <span>View: <b>{page_search.search_view}</b></span>
                    <div className={styles.options}>
                        <ol>
                            {Object.values(SearchViewType).map((view_type, view_index) => (
                                <li key={view_index}>
                                    <button onClick={() => searchbar_update(undefined, undefined, view_type)}>{view_type}</button>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
            <aside className={styles.sidebar}>
                <div className={styles.header}>
                    <FontAwesomeIcon icon={faSearchDollar}/>
                    <div>
                        <h3>Item Catalog</h3>
                        <p>{props.page_group.name}</p>
                    </div>
                    <button onClick={sidebar_toggle}>
                        <FontAwesomeIcon icon={faAngleLeft}/>
                    </button>
                </div>
                <div className={styles.navbar}>
                    {get_categories().map((category_data, category_index) => (
                        <nav className={styles.category} key={category_index}>
                            <h5>
                                <span>{category_data.name}</span>
                            </h5>
                            {category_data.groups.map((group_data, group_index) => (
                                <Link className={styles.group} href={`/${group_data.id}`} data-selected={group_data.id === props.page_group.id} key={group_index}>
                                    <FontAwesomeIcon icon={faAngleRight}/>
                                    <FontAwesomeIcon icon={group_data.icon}/>
                                    <span>{group_data.name}</span>
                                    <span>{page_categories.find(category_data => (category_data.id === group_data.id))?.elements || 0}</span>
                                </Link>
                            ))}
                        </nav>
                    ))}
                </div>
                <button className={styles.hook} onClick={sidebar_toggle}>
                    <FontAwesomeIcon icon={faAngleRight}/>
                </button>
            </aside>
        </section>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths:    get_categories().map(category_data => category_data.groups.map(group_data => ({params: {type: group_data.id}}))).flat(),
		fallback: false
	};
};

export const getStaticProps: GetStaticProps = async (context) => {
    const page_groups = get_categories().map(category_data => category_data.groups).flat();
    const group_data  = page_groups.find(group_data => (group_data.id === context.params?.type));
    if (group_data === undefined) return {props: {}};
	return {props: {
		page_name:        group_data.name,
		page_description: "Welcome to FlagWars Trading item catalog, your one-stop list for exclusive weapons, gadgets, and cosmetics!",
		page_pathname:    group_data.id,
        // local props
        page_group:       group_data
	}};
}

export default Catalog;

interface SearchParameters {
    search_text: (string | null),
    search_sort: SearchSortType,
    search_view: SearchViewType
}

enum SearchSortType {
    PRICE_LH = "Price (↓-↑)",
    PRICE_HL = "Price (↑-↓)",
    NAME_AZ  = "Name (A-Z)",
    NAME_ZA  = "Name (Z-A)"
}

enum SearchViewType {
    CARD = "Card"
}