import { createContext, useEffect, useState } from "react";
import type { NextPageLayout } from "../pages/_app";
import { UserSessionAPI } from "@/pages/api/user/session";

export enum ContextAlertType {
    SUCCESS,
    WARNING,
    FAILURE,
    MESSAGE
};
export interface ContextAlert {
    alert_id:       number,
    alert_type:     ContextAlertType,
    alert_message:  string,
    alert_created:  number
};
interface ContextAlertContext {
    get:    ()                                                    => ContextAlert[],
    add:    (alert_type: ContextAlertType, alert_message: string) => void
};
export interface ContextAuth {
    auth_success: boolean,
    auth_id?:     string,
    auth_name?:   string,
    auth_role?:   string
};
interface ContextAuthContext {
    get: () => ContextAuth
};

export const context_alert = createContext<ContextAlertContext>(null as unknown as ContextAlertContext);
export const context_auth  = createContext<ContextAuthContext> (null as unknown as ContextAuthContext);

const ContextPage: NextPageLayout<{children: React.ReactNode}> = (props) => {
    const [page_alert, page_alert_set] = useState<ContextAlert[]>([]);
    const [page_auth,  page_auth_set]  = useState<ContextAuth>({
        auth_success: false,
        auth_id:      "",
        auth_name:    "",
        auth_role:    "member"
    });

    const alert_add = (alert_type: ContextAlertType, alert_message: string) => {
        const alert_last = (page_alert.at(page_alert.length - 1)?.alert_id ?? (-1));
        page_alert_set(page_alert.filter(alert_data => ((Date.now() - alert_data.alert_created) <= 4000)).concat({
            alert_id:       (alert_last + 1),
            alert_type:     alert_type,
            alert_message:  alert_message,
            alert_created:  Date.now()
        }));
    };

    const alert_get = () => {
        return page_alert;
    };

    const auth_get = () => {
        return page_auth;
    }

    useEffect(() => {(async () => {
        const session_data = await fetch("/api/user/session").then(response => response.json()) as {
            success: boolean,
            result?: UserSessionAPI
        };
        page_auth_set({
            auth_success: session_data.success,
            auth_id:      session_data.result?.user_id,
            auth_name:    session_data.result?.user_name,
            auth_role:    session_data.result?.user_role
        });
    })()}, []);

    return (
        <context_alert.Provider value={{get: alert_get, add: alert_add}}>
        <context_auth.Provider  value={{get: auth_get}}>
            {props.children}
        </context_auth.Provider>
        </context_alert.Provider>
    );
};

export default ContextPage;