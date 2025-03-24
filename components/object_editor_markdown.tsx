import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { Dispatch } from "react";
import type { NextPageLayout } from "../pages/_app";
import dynamic from "next/dynamic";

// fonts
import { Ubuntu_Mono } from "next/font/google";

const font_mono = Ubuntu_Mono({subsets: ["latin"], weight: ["400"]});
const MDEditor  = dynamic(() => import("@uiw/react-md-editor"), {ssr: false});

const CUSTOM_STYLE = `.w-md-editor {\n${[
    "border-radius: 0px;",
    "--md-editor-background-color: #434749;",
    "--md-editor-box-shadow-color: #ffffff;"
].join("\n")}\n}\nbody .w-md-editor-text-pre > code, body .w-md-editor-text-input {\n${[
    "font-size: 14px !important;",
    "line-height: 18px !important;",
    `font-family: ${font_mono.style.fontFamily} !important;`
].join("\n")}\n}\n.token {\n${[
    // incase mono font failed to load, bold mess up the text aligning
    "font-weight: 400 !important;"
].join("\n")}\n}`;

const ObjectMarkdownEditor: NextPageLayout<{page_text: string, set_text: Dispatch<any>}> = (props) => {
	return (
        <div data-color-mode="dark" style={{height: "100%"}}>
            <MDEditor
                preview="edit"
                height="100%"
                tabSize={4}
                value={props.page_text}
                onChange={(text) => props.set_text(text ?? "")}
                extraCommands={[]}
            />
            <style>{CUSTOM_STYLE}</style>
        </div>
	);
};

export default ObjectMarkdownEditor;