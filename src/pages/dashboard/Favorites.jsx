import { useEffect } from "react";
import Sidebar from "./SideBar";
function Favorites() {
    useEffect(() => {
        // fetch Favorites
    }, []);
    return (<>
        <Sidebar>
            Favorites
        </Sidebar>
    </>);
}
export default Favorites;