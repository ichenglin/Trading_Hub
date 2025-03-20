import { ReactElement } from "react";
import { SpecialZoomLevel, Viewer, Worker } from "@react-pdf-viewer/core";
import { ToolbarProps, ToolbarSlot, defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import type { NextPageLayout } from "../pages/_app";
import styles from "@/styles/components/PDFViewer.module.css";

// pdf-viewer styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const ObjectPDFViewer: NextPageLayout<{url: string}> = (props) => {

    const default_layout = defaultLayoutPlugin({
        renderToolbar: (Toolbar: (props: ToolbarProps) => ReactElement) => (
            <Toolbar>
                {toolbarPlugin().renderDefaultToolbar((slot: ToolbarSlot) => ({
                    ...slot,
                    EnterFullScreen:         () => (<></>),
                    EnterFullScreenMenuItem: () => (<></>),
                    Open:                    () => (<></>),
                    OpenMenuItem:            () => (<></>),
                    SwitchTheme:             () => (<></>),
                    SwitchThemeMenuItem:     () => (<></>)
                }))}
            </Toolbar>
        )
    });

	return (
        <div className={styles.pdf}>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
                <Viewer fileUrl={props.url} defaultScale={SpecialZoomLevel.PageFit} theme="dark" plugins={[default_layout]}/>
            </Worker>
        </div>
	);
};

export default ObjectPDFViewer;