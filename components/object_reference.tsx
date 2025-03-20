import Link from "next/link";
import type { NextPageLayout } from "../pages/_app";
import styles from "@/styles/components/Reference.module.css";

// fonts
import { JetBrains_Mono } from "next/font/google";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

const font_jetbrains = JetBrains_Mono({subsets: ["latin"]});

const ObjectReference: NextPageLayout<{message: string, href: string}> = (props) => {
	return (
		<Link className={`${styles.reference} ${font_jetbrains.className}`} href={props.href}>
            <div>
                <span>{props.message}</span>
                <FontAwesomeIcon icon={faArrowRight} width="16" height="16"/>
            </div>
        </Link>
	);
};

export default ObjectReference;