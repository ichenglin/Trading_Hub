import { NextRouter } from "next/router";
import { MouseEventHandler } from "react";

export default async function silent_scroll(event: any, url: string, selector: string, router: NextRouter): Promise<MouseEventHandler<HTMLAnchorElement> | undefined> {
    event.preventDefault();
    // switch page
    if (window.location.pathname !== url) await new Promise((resolve) => {
        const event_handler = () => {
            router.events.off("routeChangeComplete", event_handler);
            resolve(false);
        };
        router.events.on("routeChangeComplete", event_handler);
        router.push(url);
    });
    // scroll to element (router's push as url doesn't work for cross-page)
    const target_element = document.querySelector(selector);
    if (target_element === null) return;
    target_element.scrollIntoView({block: "start", behavior: "smooth"});
}