import type { GetServerSideProps } from "next";
import { glob } from "glob";
import type { NextPageLayout } from "../_app";

// data
import data_sitemaps from "@/data/data_sitemaps.json";
import data_links from "@/data/data_links.json";
import data_pages from "@/data/data_pages.json";

const routes_blocked = [
    "/_app",
    "/_document",
    "/404",
    "/500",
    "/sitemap"
];

export const getServerSideProps: GetServerSideProps = async (context) => {
    const context_response = context.res;
    context_response.setHeader("Content-Type", "text/xml");
    context_response.write([
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
        "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
        ...website_sitemaps().map(route_data => {
            const route_metadata = route_data.map(route_xml => `<${route_xml.name}>${route_xml.value}</${route_xml.name}>`).join("");
            return `<url>${route_metadata}</url>`;
        }),
        "</urlset>"
    ].join(""));
    context_response.end();
    return {props: {}};
};

function website_sitemaps() {
    const routes_modified = (new Date()).toISOString().slice(0, 10);
	const routes_url      = [...website_routes(), ...website_files(), ...data_sitemaps];
    const routes_ranked   = routes_url.map(page_url => {
        const page_link = (page_url.match(/^https?:\/\/(.+)$/) as RegExpMatchArray)[1];
        const page_rank = (page_link.split(/[\/\.]+/).length - 1);
        return {
            page_url:  page_url,
            page_rank: page_rank
        };
    }).sort((page_a, page_b) => (page_a.page_rank - page_b.page_rank));
	return routes_ranked.map(page_ranked => [
        {name: "loc",        value: page_ranked.page_url},
        {name: "lastmod",    value: routes_modified},
        {name: "changefreq", value: "daily"},
        {name: "priority",   value: (page_ranked.page_rank ** (-1)).toString()}
    ]);
}

function website_routes() {
    const routes_directory = glob.sync("pages/**/*.tsx");
    const routes_pathname  = routes_directory.filter(page_directory => (page_directory.match(/[^\w\.\/]/) === null)).map(page_directory => (page_directory.match(/^pages\/(.+)\.tsx$/) as RegExpMatchArray)[1].split("/")).map(page_pathname => {
        const pathname_ending = (page_pathname.length - 1);
        const pathname_index  = (page_pathname[pathname_ending] === "index");
        const pathname_groups = page_pathname.slice(0, (pathname_index ? -1 : page_pathname.length));
        return `${((pathname_groups.length > 0) ? "/" : "")}${pathname_groups.join("/")}`;
    });
    const routes_valid = routes_pathname.filter(page_pathname => (!routes_blocked.includes(page_pathname)));
    return routes_valid.map(page_pathname => `${data_links.link_website}${page_pathname}`);
}

function website_files() {
    return data_pages.filter(page_data => page_data.sitemap).map(page_data => `${data_links.link_website}${page_data.pathname}`);
}

const Sitemap: NextPageLayout = () => null;
export default Sitemap;