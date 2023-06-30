import { useEffect } from "react";
import Sidebar from "./SideBar";
import { setActivity } from "../../discordRPC";
function Discover() {
    useEffect(() => {
        setActivity({
            state: "Discover",
            timestampStart: Date.now(),
        });
    }, []);
    return (<>
        <Sidebar>
            Discover
        </Sidebar>
    </>);
}
export default Discover;