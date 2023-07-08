import { useNavigate } from "react-router-dom";
import { getParam } from "../../utils/location"
import { useEffect } from "react";
import { setActivity } from "../../utils/discordRPC";

export default function Landing() {
    const gid = getParam("gid");
    const navigate = useNavigate();
    useEffect(() => {
        if (!gid) return navigate("/sets");
        setActivity({
            state: "Hosting Game",
            timestampStart: Date.now()
        });
    }, []);
    return `gid: ${gid}`;
}