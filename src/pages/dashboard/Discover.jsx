import { useEffect } from "react";
import { invoke } from "@tauri-apps/api"
import Sidebar from "./SideBar";
function Discover() {
    useEffect(() => {
        invoke('set_activity', {
            state: "Discover",
            timestampStart: Date.now(),
            largeImage: "icon1024",
            largeText: "BetterBlooket",
            smallImage: "empty",
            smallText: "empty"
        });
    }, []);
    return (<>
        <Sidebar>
            Discover
        </Sidebar>
    </>);
}
export default Discover;