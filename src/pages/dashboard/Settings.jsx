import { useEffect } from "react";
import { invoke } from "@tauri-apps/api";
import Sidebar from "./SideBar";
function Settings() {
    useEffect(() => {
        invoke('set_activity', {
            state: "Settings",
            timestampStart: Date.now(),
            largeImage: "icon1024",
            largeText: "BetterBlooket",
            smallImage: "empty",
            smallText: "empty"
        });
    }, []);
    return (<>
        <Sidebar>
            Settings
        </Sidebar>
    </>);
}
export default Settings;