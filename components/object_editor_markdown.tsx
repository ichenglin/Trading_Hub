import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { Dispatch } from "react";
import type { NextPageLayout } from "../pages/_app";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {ssr: false});

const CUSTOM_STYLE = `.w-md-editor {${[
    "border-radius: 0px;",
    "",
    "--md-editor-background-color: #434749;",
    "--md-editor-box-shadow-color: #ffffff;"
].join("\n")}} .w-md-editor-text-input, .w-md-editor-text-pre .code-line {${[
    "font-size: 1rem !important;",
    "line-height: 1rem !important;"
].join("\n")}} .w-md-editor-text-pre .code-line {${[
    "display: block;"
].join("\n")}}`;

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