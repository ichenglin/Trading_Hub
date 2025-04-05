import { useContext } from "react";
import type { NextPageLayout } from "../pages/_app";
import { context_alert, ContextAlertType } from "@/contexts/context_page";
import styles from "@/styles/components/Alert.module.css";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faTriangleExclamation, faCircleExclamation, faComment, faCircleCheck } from "@fortawesome/free-solid-svg-icons";

const PageAlertStyle = {
	[ContextAlertType.SUCCESS]: {color: "#4ade80", icon: faCircleCheck},
	[ContextAlertType.WARNING]: {color: "#fbbf24", icon: faCircleExclamation},
	[ContextAlertType.FAILURE]: {color: "#f87171", icon: faTriangleExclamation},
	[ContextAlertType.MESSAGE]: {color: "#38bdf8", icon: faComment}
} as {[key in ContextAlertType]: {color: string, icon: IconProp}};

const PageAlert: NextPageLayout = () => {
	const page_alert = useContext(context_alert);

	return (
		<section className={styles.container}>
			{page_alert.get().map(alert_data => {
				const alert_style = PageAlertStyle[alert_data.alert_type];
				return (
					<div className={styles.alert} style={{backgroundColor: alert_style.color}} key={alert_data.alert_id}>
						<div className={styles.content}>
							<div className={styles.icon}>
								<FontAwesomeIcon icon={alert_style.icon}/>
							</div>
							<div className={styles.message}>
								<p>{alert_data.alert_message}</p>
							</div>
						</div>
					</div>
				);
			})}
		</section>
	);
};

export default PageAlert;