import Link from "next/link";
import type { NextPageLayout } from "../pages/_app";
import styles from "@/styles/components/Footer.module.css";

// fonts
import { Inter } from "next/font/google";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGamepad, faMapLocationDot, faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

const font_inter = Inter({subsets: ["latin"]});

const PageFooter: NextPageLayout = () => {

	return (
		<footer className={`${styles.footer} ${font_inter.className}`}>
			<div className={styles.copyright}>
				<p><b>© 2025 Flagwars Trading. All Rights Reserved.</b></p>
				<p>The site is not affiliated with Flagwars or Scriptly Studios</p>
			</div>
			<div className={styles.navbar}>
				<Link className={styles.item} href="/faq">
					<FontAwesomeIcon icon={faCircleQuestion} width="14" height="14"/>
					<span>FAQ</span>
				</Link>
				<Link className={styles.item} href="https://www.roblox.com/games/3214114884">
					<FontAwesomeIcon icon={faGamepad} width="14" height="14"/>
					<span>Flagwars</span>
				</Link>
				<Link className={styles.item} href="https://discord.gg/8h9mG4W">
					<FontAwesomeIcon icon={faDiscord} width="14" height="14"/>
					<span>Scriptly Studios</span>
				</Link>
				<a className={styles.item} href="/sitemap">
					<FontAwesomeIcon icon={faMapLocationDot} width="14" height="14"/>
					<span>Sitemap</span>
				</a>
			</div>
		</footer>
	);
};

export default PageFooter;