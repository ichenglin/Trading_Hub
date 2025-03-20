import { GetStaticProps } from "next";
import Link from "next/link";
import Image from "next/image";
import type { NextPageLayout } from "./_app";
import styles from "@/styles/pages/About.module.css";
import ObjectDivider, { ObjectDividerType } from "@/components/object_divider";
import ObjectReference from "@/components/object_reference";

// fonts
import { Dosis, JetBrains_Mono } from "next/font/google";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

const font_jetbrains = JetBrains_Mono({subsets: ["latin"]});
const font_dosis     = Dosis         ({subsets: ["latin"]});

const About: NextPageLayout = () => {

	return (
		<>
			<span className="header_offset" id="cover"/>
			<section className={`${styles.cover} ${font_jetbrains.className}`}>
				<Image src="/images/banner.png" alt="Banner" width="1920" height="900"/>
				<div className={styles.intro}>
					<h1>Flagwars Wiki</h1>
					<h3>One-Stop Source for All Things FlagWars</h3>
				</div>
				<div className={styles.navbar}>
					<Link className={styles.item} href="/weapons">
						<FontAwesomeIcon icon={faSearch}/>
						<span>Catalog</span>
					</Link>
					<a className={styles.item} href="/login">
						<FontAwesomeIcon icon={faDiscord}/>
						<span>Login</span>
					</a>
				</div>
			</section>
			<ObjectDivider type={ObjectDividerType.DIVIDER_UPWARD}/>
			<span className="header_offset" id="projects"/>
			<section className={styles.featured}>
				<div className={`${styles.title} ${font_dosis.className}`}>
					<h1>Frequently Asked Questions</h1>
					<ObjectReference message="Read More" href="/faq"/>
				</div>
			</section>
		</>
	);
};

export const getStaticProps: GetStaticProps = async (context) => {
	return {props: {
		page_name:        "About",
		page_description: "Welcome to the FlagWars Wiki, your one-stop list for exclusive weapons, gadgets, and cosmetics!",
		page_pathname:    "/"
	}};
}

export default About;