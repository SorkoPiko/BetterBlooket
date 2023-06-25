import { useEffect } from "react";
import Sidebar from "./SideBar";
function Settings() {
    useEffect(() => {
        // fetch Settings
    }, []);
    return (<>
        <Sidebar>
            Settings
        </Sidebar>
    </>);
}
export default Settings;