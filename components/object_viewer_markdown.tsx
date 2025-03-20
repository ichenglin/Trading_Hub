import type { NextPageLayout } from "../pages/_app";
import * as Marked from "marked";
import styles from "@/styles/components/MarkdownViewer.module.css";

const ObjectMarkdownViewer: NextPageLayout<{source: string}> = (props) => {
    const markdown_html = Marked.parse(props.source) as string;
	return (
        <div className={`${styles.markdown} prose prose-invert`} dangerouslySetInnerHTML={{__html: markdown_html}}/>
	);
};

export default ObjectMarkdownViewer;