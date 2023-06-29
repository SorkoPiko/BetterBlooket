import { invoke } from "@tauri-apps/api";
import { useEffect } from "react";
import Sidebar from "./SideBar";
function Sets() {
    useEffect(() => {
        invoke('set_activity', {
            state: "My Sets",
            timestampStart: Date.now(),
            largeImage: "icon1024",
            largeText: "BetterBlooket",
            smallImage: "empty",
            smallText: "empty"
        });
    }, []);
    return (<>
        <Sidebar>
            Sets
        </Sidebar>
    </>);
}
export default Sets;