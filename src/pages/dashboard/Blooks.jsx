import { useEffect, useState } from "react";
import Sidebar from "./SideBar";
import { useAuth } from "../../context/AuthContext";
function Blooks() {
    const { protobuf } = useAuth();
    const [blooks, setBlooks] = useState({});
    useEffect(() => {
        console.log({protobuf})
        protobuf.listUnlockedBlooks({}).then(setBlooks);
    }, []);
    return (<>
        <Sidebar>
            {JSON.stringify(blooks)}
        </Sidebar>
    </>);
}
export default Blooks;