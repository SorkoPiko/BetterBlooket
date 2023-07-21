import { useEffect } from "react";
import Sidebar from "./SideBar.jsx";
import { setActivity } from "../../utils/discordRPC";
function Settings() {
    useEffect(() => {
        setActivity({
            state: "Settings",
            timestampStart: Date.now(),
        });
    }, []);
    return (<>
        <Sidebar>
            Settings
        </Sidebar>
    </>);
}
export default Settings;