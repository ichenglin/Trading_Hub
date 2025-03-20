import { GetStaticProps } from "next";
import Image from "next/image";
import type { NextPageLayout } from "./_app";
import ObjectReference from "@/components/object_reference";
import styles from "@/styles/pages/Error.module.css";
import icon_image from "../public/android-chrome-512x512.png";

// fonts
import { Dosis } from "next/font/google";

const font_dosis = Dosis({subsets: ["latin"]});

const Error404: NextPageLayout = () => {
	return (
		<section className={styles.cover}>
			<div className={`${styles.window} ${font_dosis.className}`}>
				<Image src={icon_image} width="512" height="512" alt="Icon"/>
				<h5>Ooops... 404?</h5>
				<p>The page you accessed does not exist or is currently under maintenance</p>
				<ObjectReference message="Return to Home" href="/"/>
			</div>
		</section>
	);
};

export const getStaticProps: GetStaticProps = async (context) => {
	return {props: {
		page_name:        "Not Found",
		page_description: "The requested page could not be found or is currently under maintenance.",
		page_pathname:    null,
		page_robots:      "noindex,nofollow"
	}};
}

export default Error404;