import { useNavigate, useParams } from "react-router-dom";
import { getParam } from "../../utils/location"
import { useEffect } from "react";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../context/AuthContext";

export default function Landing() {
    const gid = getParam("gid");
    const hwId = getParam("hwId");
    const { gameMode } = useParams();
    const navigate = useNavigate();
    const { http: { get } } = useAuth();
    const { setSettings, addGameId, setHostId } = useGame();
    useEffect(() => {
        if ((!gid && !hwId) || !gameMode) return navigate("/sets");
        if (gid) {
            setHostId(gid);
            get("https://play.blooket.com/api/hostedgames/forhost", { params: { id: gid } }).then(({ data }) => {
                addGameId(data.questionSetId);
                setSettings({
                    type: gameMode,
                    method: "host"
                });
                navigate("/host/settings?gid=" + gid, { replace: true });
            });
        } else {
            get("https://play.blooket.com/api/homeworks/forhost", { params: { id: hwId } }).then(({ data }) => {
                addGameId(data.questionSetId);
                setSettings({
                    type: gameMode,
                    method: "assign"
                });
                navigate("/host/assign?hwId=" + hwId, { replace: true });
            });
        }
    }, []);
    return null;
}