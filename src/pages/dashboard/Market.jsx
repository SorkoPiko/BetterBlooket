import { useEffect } from "react";
import Sidebar from "./SideBar";
function Market() {
    useEffect(() => {
        // fetch market
    }, []);
    return (<>
        <Sidebar>
            market
        </Sidebar>
    </>);
}
export default Market;