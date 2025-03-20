import { GetStaticPaths, GetStaticProps } from "next";
import FileSystem from "fs";
import type { NextPageLayout } from "@/pages/_app";
import styles from "@/styles/pages/StaticPage.module.css";
import ObjectPDFViewer from "@/components/object_viewer_pdf";
import ObjectMarkdownViewer from "@/components/object_viewer_markdown";
import { pathname_equal, pathname_tokenize } from "@/utilities/util_pathname";

// data
import data_pages from "@/data/data_pages.json";

const StaticPage: NextPageLayout<{page_data: (typeof data_pages[0]), page_markdown: string}> = (props) => {
	return (
		<section className={styles.viewer}>
			{(props.page_data.type === "file")     && (<ObjectPDFViewer      url   ={props.page_data.source}/>)}
			{(props.page_data.type === "markdown") && (<ObjectMarkdownViewer source={props.page_markdown}/>)}
		</section>
	);
};

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths:    data_pages.map(page_data => ({params: {pathname: pathname_tokenize(page_data.pathname)}})),
		fallback: false
	};
};

export const getStaticProps: GetStaticProps = async (context) => {
	const page_data = data_pages.find(page_data => pathname_equal(page_data.pathname, (context.params?.pathname as string[])));
	if (page_data === undefined) return {props: {}};
	return {props: {
		page_name:        page_data.name,
		page_description: page_data.description,
		page_pathname:    page_data.pathname,
		page_robots:      ((page_data.sitemap === true) ? null : "noindex,nofollow"),
		// local props
		page_data:        page_data,
		page_markdown:    ((page_data.type === "markdown") && FileSystem.readFileSync(`${process.cwd()}/${page_data.source}`, "utf8"))
	}};
};

export default StaticPage;