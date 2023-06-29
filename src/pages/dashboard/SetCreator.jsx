import { invoke } from "@tauri-apps/api";
import { useEffect } from "react";
import Sidebar from "./SideBar";
function SetCreator() {
    useEffect(() => {
        invoke('set_activity', {
            state: "Set Creator",
            timestampStart: Date.now(),
            largeImage: "icon1024",
            largeText: "BetterBlooket",
            smallImage: "empty",
            smallText: "empty"
        });
    }, []);
    return (<>
        <Sidebar>
            set creator
        </Sidebar>
    </>);
}
export default SetCreator;