import { useEffect } from "react";
import Sidebar from "./Sidebar.jsx";
import { setActivity } from "../../utils/discordRPC";
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