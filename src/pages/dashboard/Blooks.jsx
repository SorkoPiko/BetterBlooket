import { useEffect } from "react";
import Sidebar from "./SideBar";
function Blooks() {
    useEffect(() => {
        // fetch Blooks
    }, []);
    return (<>
        <Sidebar>
            blooks
        </Sidebar>
    </>);
}
export default Blooks;