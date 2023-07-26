import { useEffect } from "react";
import Sidebar from "./Sidebar.jsx";
import { setActivity } from "../../utils/discordRPC";
function Homework() {
    useEffect(() => {
        setActivity({
            state: "Homework",
            timestampStart: Date.now(),
        });
    }, []);
    return (<>
        <Sidebar>
            Homework
        </Sidebar>
    </>);
}
export default Homework;