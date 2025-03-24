import { useEffect } from "react";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { get_auth_base } from "@/utilities/util_auth";
import type { NextPageLayout } from "./_app";
import styles from "@/styles/pages/Login.module.css";
import icon_image from "../public/android-chrome-512x512.png";
import { cookie_parse } from "@/utilities/util_cookie";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

interface LoginProps {
    login_discord: string
}

const Login: NextPageLayout<LoginProps> = (props) => {
    const page_router = useRouter();

    useEffect(() => {
        const session_cookie = cookie_parse(document.cookie);
        if (session_cookie.SESSION_USER !== undefined) page_router.push("/");
    });

    return (
        <section className={styles.container}>
            <div className={styles.card}>
                <Image src={icon_image} width="512" height="512" alt="Icon"/>
                <h1>User Login</h1>
                <h3>Register and login with your discord account grants you access to <b>page editing</b> and <b>user features</b></h3>
                <Link href={props.login_discord}>
                    <FontAwesomeIcon icon={faDiscord}/>
                    <span>Login</span>
                </Link>
                <h5 className={styles.disclaimer}>
                    <span>Discord does <b>NOT share your credentials</b> with us; it only helps us authenticate by proving your identity. To learn more about the verification process, check out </span>
                    <Link href="https://auth0.com/intro-to-iam/what-is-oauth-2">OAuth Authentication</Link>
                    <span>.</span>
                </h5>
            </div>
        </section>
    );
};

export const getStaticProps: GetStaticProps = async (context) => {
    return {props: {
        page_name:        "Login",
        page_description: "Begin contributing by logging in with your Discord account.",
        page_pathname:    "/login",
        // local props
        login_discord:    get_auth_base().toString(),
    } as LoginProps};
}

export default Login;