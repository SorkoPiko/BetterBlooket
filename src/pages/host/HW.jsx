import { Link, useNavigate, useParams } from "react-router-dom";
import { getParam } from "../../utils/location";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { imageUrl } from "../../utils/questions";
import "./host.css";
import { setActivity } from "../../utils/discordRPC";

export default function HW() {
    const [selected, setSelected] = useState(null);
    const [gameModes, setGameModes] = useState([]);
    const navigate = useNavigate();
    const id = getParam("id");
    const { http: { get, post } } = useAuth();
    useEffect(() => {
        if (!/^[a-f0-9]{24}$/i.test(id)) return navigate("/sets");
        get("https://play.blooket.com/api/gamemodes/forhwpage").then(({ data }) => {
            if (!data.gameModes || !Array.isArray(data.gameModes) || data.gameModes.length == 0) return navigate("/sets");
            let preferred = data.gameModes.find(x => x.isPreferred);
            setSelected(preferred || data.gameModes[0]);
            setGameModes(data.gameModes);
        });
        setActivity({
            state: "Choosing Gamemode",
            timestampStart: Date.now()
        });
    }, []);
    const onAssign = useCallback(async () => {
        const { data: { id: hwId } } = await post("https://play.blooket.com/api/homeworks", {
            gameMode: selected.slug,
            setId: id
        }).catch(console.error);
        navigate(`/host/landing/${selected.slug}?hwId=${hwId}`);
    }, [selected]);
    if (getParam("id")) return <div>
        <div id="hostPageBackground" style={{
            position: "fixed",
            width: "100%",
            height: "100%",
            left: "0",
            top: "0",
            background: "linear-gradient(var(--accent2), var(--accent4))",
            overflow: "hidden",
        }}>
            <div style={{ position: "fixed", top: "0", left: "0", bottom: "0", right: "25%", backgroundColor: "var(--accent3)", boxShadow: "4px 0 rgba(0,0,0,.2)" }}></div>
            {/* <div style={{ position: "fixed", top: "0", left: "75%", bottom: "0", right: "0",  }}></div> */}
            <div style={{
                position: "absolute",
                width: "200%",
                height: "200%",
                top: "50%",
                left: "50%",
                backgroundSize: "20%",
                backgroundPosition: "-100px -100px",
                opacity: ".1",
                transform: "translate(-50%,-50%) rotate(15deg)",
                backgroundImage: 'url("https://ac.blooket.com/play/65a43218fd1cabe52bdf1cda34613e9e.png")'
            }}></div>
        </div>
        <div id="hostPageLeft">
            <div id="gameModesHeader">Select HW Game Mode</div>
            <div id="gameModesContainer">
                {gameModes.map(mode => {
                    return <div key={mode.slug} className="gameMode" onClick={() => setSelected(mode)}>
                        {mode.plusOnly && <div className="plusOnly">Plus Only</div>}
                        <img src={imageUrl(mode.logo)} alt={mode.name} className="modeImage" />
                        {(mode.limitedLabel || mode.newLabel) && <div className="limitedTime">{mode.limitedLabel || mode.newLabel}</div>}
                    </div>
                })}
            </div>
        </div>
        <div id="backButton" style={{ backgroundColor: "var(--accent6)" }} onClick={() => navigate(-1)}><i className="fas fa-reply" />Back</div>
        {selected && <div id="hostPageRight">
            <div id="gameModeInfo">
                <div id="gameModeImage">
                    <img src={selected.img} alt={selected.slug} />
                </div>
                <img id="gameModeLogo" src={selected.logo} alt={selected.slug}></img>
                <div id="gameModeDesc">{selected.desc}</div>
                <div id="gameModeDetail">{selected.detail}</div>
                <div className="gameModeInfoRow">
                    <i className="gameModeInfoIcon fa-regular fa-lightbulb"></i>
                    <div className="gameModeInfoText">{selected.focus}</div>
                </div>
                <div className="gameModeInfoRow">
                    <i className="gameModeInfoIcon fas fa-users"></i>
                    <div className="gameModeInfoText">{selected.limit.replace(/Player Limit: \d+ \((\d+) (for Plus|for Plus & HW)\)/g, "Player Limit: $1").replace(" for Plus", "")}</div>
                </div>
                <div className="gameModeInfoRow">
                    <i className="gameModeInfoIcon fas fa-tasks"></i>
                    <div className="gameModeInfoText">{selected.suggest}</div>
                </div>
            </div>
            <div id="playButtonContainer">
                {selected.methods.includes("assign") && <div style={{ width: "70%" }} onClick={onAssign}>Assign HW</div>}
            </div>
            <div id="playButtonContainer">
                <div style={{
                    width: "70%",
                    color: "#fff",
                    cursor: "pointer",
                    textDecoration: "none"
                }} onClick={() => navigate(`/host?id=${id}`, { replace: true })}>Host Gamemodes</div>
            </div>
        </div>}
    </div>
    navigate("/sets");
}