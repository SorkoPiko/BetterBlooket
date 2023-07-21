import { useEffect } from "react";
import Sidebar from "./SideBar.jsx";
import { setActivity } from "../../utils/discordRPC";
function Sets() {
    useEffect(() => {
        setActivity({
            state: "My Sets",
            timestampStart: Date.now(),
        });
    }, []);
    return (<>
        <Sidebar>
            Sets
        </Sidebar>
    </>);
}
export default Sets;