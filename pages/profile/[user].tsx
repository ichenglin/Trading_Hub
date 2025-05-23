import { useContext } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import type { NextPageLayout } from "../_app";
import styles from "@/styles/pages/User.module.css";
import { DatabaseUser, get_user, get_user_all } from "@/utilities/util_database";
import { string_capitalize } from "@/utilities/util_render";
import icon_image from "@/public/android-chrome-512x512.png";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightArrowLeft, faBan, faCakeCandles, faCircleXmark, faComment, faCopy, faMedal, faPenNib, faTag, faUserPen, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { context_alert, context_auth, ContextAlertType } from "@/contexts/context_page";

interface ProfileUser {
    user_id:      string
    user_name:    string,
    user_role:    string,
    user_avatar:  (string | null),
    user_suspend: boolean
}

interface ProfileProps {
    page_pathname: string,
    page_user:     ProfileUser
}

const Profile: NextPageLayout<ProfileProps> = (props) => {
    const page_alert  = useContext(context_alert);
    const page_auth   = useContext(context_auth);
    const page_router = useRouter();
    const page_user   = page_auth.get();

    const copy_link = async () => {
        await navigator.clipboard.writeText(new URL(props.page_pathname, window.location.origin).toString());
        page_alert.add(ContextAlertType.SUCCESS, "Successfully Copied Link to Clipboard");
    }

    const update_username = async () => {
        page_alert.add(ContextAlertType.WARNING, "Username Update is currently Disabled");
    }

    const add_friend = async () => {
        page_alert.add(ContextAlertType.WARNING, "Friend Request is currently Disabled");
    }

    const update_role = async () => {
        const update_result = await fetch("/api/user/update", {
            method: "POST",
            body: JSON.stringify({
                user_id:   props.page_user.user_id,
                user_role: ((props.page_user.user_role === "member") ? "mod" : "member")
            })
        }).then(response => response.json());
        if (update_result.success) {
            page_alert.add(ContextAlertType.SUCCESS, `Successfully Updated ${props.page_user.user_name}'s Role`);
            page_router.reload();
        } else {
            page_alert.add(ContextAlertType.FAILURE, `Failed to Update ${props.page_user.user_name}'s Role`);
        }
    }

    const suspend_user = async () => {
        const suspend_result = await fetch("/api/user/update", {
            method: "POST",
            body: JSON.stringify({
                user_id:      props.page_user.user_id,
                user_suspend: (props.page_user.user_suspend ? null : "User Suspended")
            })
        }).then(response => response.json());
        if (suspend_result.success) {
            page_alert.add(ContextAlertType.SUCCESS, `Successfully Updated ${props.page_user.user_name}'s Status`);
            page_router.reload();
        } else {
            page_alert.add(ContextAlertType.FAILURE, `Failed to Update ${props.page_user.user_name}'s Status`);
        }
    }

    return (
        <section className={styles.container}>
            <div className={styles.profile}>
                <div className={styles.avatar}>
                    {(props.page_user.user_avatar !== null) ? (<>
                        <Image src={props.page_user.user_avatar ?? "/"} alt={props.page_user.user_name} fill/>
                    </>) : (<>
                        <Image src={icon_image} alt={props.page_user.user_name} fill/>
                    </>)}
                </div>
                <div className={styles.name}>
                    <h1>{props.page_user.user_name}</h1>
                    <h5>{string_capitalize(props.page_user.user_role)}</h5>
                </div>
                <div className={styles.actions}>
                    <button style={{backgroundColor: "#9ca3af"}} onClick={copy_link}>
                        <FontAwesomeIcon icon={faCopy}/>
                        <span>Copy Link</span>
                    </button>
                    <button style={{backgroundColor: "#60a5fa"}} onClick={update_username}>
                        <FontAwesomeIcon icon={faUserPen}/>
                        <span>Edit Name</span>
                    </button>
                    <button style={{backgroundColor: "#4ade80"}} onClick={add_friend}>
                        <FontAwesomeIcon icon={faUserPlus}/>
                        <span>Add Friend</span>
                    </button>
                    {(page_user.auth_success && page_user.auth_role === "admin") && (<>
                        <button style={{backgroundColor: "#fbbf24"}} onClick={update_role}>
                            <FontAwesomeIcon icon={faTag}/>
                            <span>Update Role</span>
                        </button>
                        <button style={{backgroundColor: "#f87171"}} onClick={suspend_user}>
                            <FontAwesomeIcon icon={faBan}/>
                            <span>{props.page_user.user_suspend ? "Unsuspend User" : "Suspend User"}</span>
                        </button>
                    </>)}
                </div>
                <div className={styles.activity}>
                    <div className={styles.event} style={{backgroundColor: "#9ca3af"}}>
                        <h3>Comment</h3>
                        <div>
                            <FontAwesomeIcon icon={faComment}/>
                        </div>
                        <div>
                            <p><b>{props.page_user.user_name}</b> commented in <b>Black Hole Gun</b> 2 days ago</p>
                        </div>
                    </div>
                    <div className={styles.event} style={{backgroundColor: "#fbbf24"}}>
                        <h3>Achievement</h3>
                        <div>
                            <FontAwesomeIcon icon={faMedal}/>
                        </div>
                        <div>
                            <p><b>{props.page_user.user_name}</b> unlocked the <b>100 Comments</b> achievement 2 days ago</p>
                        </div>
                    </div>
                    <div className={styles.event} style={{backgroundColor: "#38bdf8"}}>
                        <h3>Trade</h3>
                        <div>
                            <FontAwesomeIcon icon={faArrowRightArrowLeft}/>
                        </div>
                        <div>
                            <p><b>{props.page_user.user_name}</b> traded with <b>Someone</b> 2 days ago</p>
                        </div>
                    </div>
                    <div className={styles.event} style={{backgroundColor: "#4ade80"}}>
                        <h3>Contribute</h3>
                        <div>
                            <FontAwesomeIcon icon={faPenNib}/>
                        </div>
                        <div>
                            <p><b>{props.page_user.user_name}</b>&apos;s update to <b>Black Hole Gun</b> was approved 2 days ago</p>
                        </div>
                    </div>
                    <div className={styles.event} style={{backgroundColor: "#f87171"}}>
                        <h3>Contribute</h3>
                        <div>
                            <FontAwesomeIcon icon={faCircleXmark}/>
                        </div>
                        <div>
                            <p><b>{props.page_user.user_name}</b>&apos;s update to <b>Black Hole Gun</b> was rejected 2 days ago</p>
                        </div>
                    </div>
                    <div className={styles.event} style={{backgroundColor: "#c084fc"}}>
                        <h3>First Join</h3>
                        <div>
                            <FontAwesomeIcon icon={faCakeCandles}/>
                        </div>
                        <div>
                            <p><b>{props.page_user.user_name}</b> joined <b>Flagwars Trading</b> 3 days ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    const server_users = await get_user_all();
    return {
        paths: server_users.map(user_data => ({params: {
            user: user_data.id
        }})),
        fallback: false
    };
};

export const getStaticProps: GetStaticProps = async (context) => {
    const page_user      = context.params?.user      as string;
    const page_user_data = await get_user(page_user) as DatabaseUser;
    return {
        props: {
            page_name:        `${page_user_data.username}'s Profile`,
            page_description: "",
            page_pathname:    `/profile/${page_user_data.id}`,
            page_robots:      "noindex,nofollow",
            // local props
            page_user: {
                user_id:      page_user_data.id,
                user_name:    page_user_data.username,
                user_role:    page_user_data.role,
                user_avatar:  (((typeof page_user_data.discord.avatar) === "string") ? `https://cdn.discordapp.com/avatars/${page_user_data.discord.id}/${page_user_data.discord.avatar}.png` : null),
                user_suspend: ((typeof page_user_data.suspend) === "string")
            } as ProfileUser
        } as ProfileProps,
        // cache profile for a minute
        revalidate: 60
    };
}

export default Profile;