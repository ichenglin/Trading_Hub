import type { NextPageLayout } from "../pages/_app";
import * as Marked from "marked";
import DOMPurify from "isomorphic-dompurify";
import styles from "@/styles/components/MarkdownViewer.module.css";

const ObjectMarkdownViewer: NextPageLayout<{source: string, margin?: boolean}> = (props) => {
    const markdown_html   = Marked.parse(props.source) as string;
    const markdown_clean  = DOMPurify.sanitize(markdown_html);
    const markdown_margin = ((props.margin === false) ? "0" : undefined);
	return (
        <div className={`${styles.markdown} prose prose-invert`} style={{margin: markdown_margin}} dangerouslySetInnerHTML={{__html: markdown_clean}}/>
	);
};

export default ObjectMarkdownViewer;