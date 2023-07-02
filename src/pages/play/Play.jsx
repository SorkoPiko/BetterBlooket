import { useEffect } from "react";
import { setActivity } from "../../utils/discordRPC";
function Play() {
    useEffect(() => {
        setActivity({
            state: "Play",
            timestampStart: Date.now(),
        });
    }, []);
    return (<>
        Play
    </>);
}
export default Play;