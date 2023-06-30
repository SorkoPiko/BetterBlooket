import { useEffect } from "react";
import Sidebar from "./SideBar";
import { setActivity } from "../../discordRPC";
function SetCreator() {
    useEffect(() => {
        setActivity({
            state: "Set Creator",
            timestampStart: Date.now(),
        });
    }, []);
    return (<>
        <Sidebar>
            set creator
        </Sidebar>
    </>);
}
export default SetCreator;