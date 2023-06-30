import { useEffect } from "react";
import Sidebar from "./SideBar";
import { setActivity } from "../../discordRPC";
function Favorites() {
    useEffect(() => {
        setActivity ({
            state: "Favorites",
            timestampStart: Date.now(),
        });
    }, []);
    return (<>
        <Sidebar>
            Favorites
        </Sidebar>
    </>);
}
export default Favorites;