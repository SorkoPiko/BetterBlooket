import { useEffect } from "react";
import Sidebar from "./Sidebar.jsx";
import { setActivity } from "../../utils/discordRPC";
function SetCreator() {
    useEffect(() => {
        setActivity({
            state: "Set Creator",
            timestampStart: Date.now(),
        });
    }, []);
    return (<>
        <Sidebar>
            <div className="newSetHeader">Question Set Creator</div>
            <div className="coverContainer">
                <input type="file" accept="image/jpeg, image/png, image/gif" />
            </div>
        </Sidebar>
    </>);
}
export default SetCreator;