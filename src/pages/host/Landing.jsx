import { useNavigate, useParams } from "react-router-dom";
import { getParam } from "../../utils/location"
import { useEffect } from "react";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../context/AuthContext";

export default function Landing() {
    const gid = getParam("gid");
    const { gameMode } = useParams();
    const navigate = useNavigate();
    const { http: { get } } = useAuth();
    const { setSettings, addGameId } = useGame();
    useEffect(() => {
        if (!gid || !gameMode) return navigate("/sets");
        get("https://play.blooket.com/api/hostedgames/forhost", { params: { id: gid } }).then(({ data }) => {
            console.log(data)
            addGameId(data.questionSetId);
            setSettings({
                type: gameMode,
                method: "host"
            });
            navigate("/host/settings?gid=" + gid, { replace: true });
        });
    }, []);
    return null;
}