import { MouseEvent } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import type { NextPageLayout } from "../pages/_app";
import styles from "@/styles/components/Header.module.css";
import silent_scroll from "@/utilities/util_scroll";
import icon_image from "../public/android-chrome-192x192.png";

// fonts
import { Inter, Bungee } from "next/font/google";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faBars, faXmark, faRankingStar, faShuffle, faSquareRootVariable, faToolbox } from "@fortawesome/free-solid-svg-icons";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

const font_bungee = Bungee({subsets: ["latin"], weight: "400"});
const font_inter  = Inter({subsets: ["latin"]});

const PageHeader: NextPageLayout = () => {

	const router = useRouter();

	const dropdown_toggle = (click_event: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>) => {
		const header_element  = document.getElementsByClassName(styles.header)[0];
		const dropdown_active = (header_element.getAttribute("dropdown-active") === "true");
		header_element.setAttribute("dropdown-active", (dropdown_active ? "false" : "true"));
	};

	return (
		<header className={`${styles.header} ${font_inter.className}`}>
			<Link className={`${styles.icon} ${font_bungee.className}`} href="/" onClick={(event: any) => silent_scroll(event, "/", "#cover", router)}>
				<Image src={icon_image} width="192" height="192" alt="Icon"/>
				<h1>Flagwars Wiki</h1>
			</Link>
			<nav className={styles.navbar}>
				<Link className={styles.item} href="/weapons">
					<FontAwesomeIcon icon={faMagnifyingGlass} width="14" height="14"/>
					<span>Catalog</span>
				</Link>
				<Link className={styles.item} href="/calculator">
					<FontAwesomeIcon icon={faSquareRootVariable} width="14" height="14"/>
					<span>Calculator</span>
				</Link>
				<Link className={styles.item} href="/random">
					<FontAwesomeIcon icon={faShuffle} width="14" height="14"/>
					<span>Random</span>
				</Link>
				<Link className={styles.item} href="/loadout">
					<FontAwesomeIcon icon={faToolbox} width="14" height="14"/>
					<span>Loadout</span>
				</Link>
				<Link className={styles.item} href="/rankings">
					<FontAwesomeIcon icon={faRankingStar} width="14" height="14"/>
					<span>Rankings</span>
				</Link>
			</nav>
			<a className={styles.dropdown} target="_blank" onClick={dropdown_toggle}>
				<FontAwesomeIcon className={styles.inactive} icon={faBars}  width="14" height="14"/>
				<FontAwesomeIcon className={styles.active} icon={faXmark} width="14" height="14"/>
				<span>Links</span>
			</a>
			<Link className={styles.contact} href="/login">
				<FontAwesomeIcon icon={faDiscord} width="14" height="14"/>
				<span>Login with Discord</span>
			</Link>
		</header>
	);
};

export default PageHeader;