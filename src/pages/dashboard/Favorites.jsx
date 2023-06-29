import { useEffect } from "react";
import { invoke } from "@tauri-apps/api";
import Sidebar from "./SideBar";
function Favorites() {
    useEffect(() => {
        invoke('set_activity', {
            state: "Favorites",
            timestampStart: Date.now(),
            largeImage: "icon1024",
            largeText: "BetterBlooket",
            smallImage: "empty",
            smallText: "empty"
        });
    }, []);
    return (<>
        <Sidebar>
            Favorites
        </Sidebar>
    </>);
}
export default Favorites;