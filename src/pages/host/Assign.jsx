import { useNavigate } from "react-router-dom";
import { getParam } from "../../utils/location"
import { useEffect } from "react";
import { setActivity } from "../../utils/discordRPC";

export default function Assign() {
    const hwId = getParam("hwId");
    const navigate = useNavigate();
    useEffect(() => {
        if (!hwId) return navigate("/sets");
        setActivity({
            state: "Assigning Homework",
            timestampStart: Date.now()
        });
    }, []);
    return `hwId: ${hwId}`;
}