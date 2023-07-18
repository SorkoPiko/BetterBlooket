import { useState, useRef, useCallback, useEffect } from "react";
import { useGame } from "../../../context/GameContext";
import { audios } from "../../../utils/config";
import { formatBigNumber, formatNumber, getDimensions, getOrdinal } from "../../../utils/numbers";
import { useNavigate } from "react-router-dom";
import TopBar from "../topBar";
import { Textfit } from "react-textfit";
import Blook from "../../../blooks/Blook";
import { NodeGroup } from "react-move";
import { useAuth } from "../../../context/AuthContext";
import Standings from "./Standings";
import { defense2 } from "../../../utils/images";
import Alert from "../../../components/Alert";

export default function Defense2Host() {
    const { host: { current: host }, liveGameController, updateHost, updateStandings } = useGame();
    const [timer, setTimer] = useState("00:00");
    const [players, setPlayers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [totalDmg, setTotalDmg] = useState(0);
    const [muted, setMuted] = useState(!!host && host.muted);
    const [userToBlock, setUserToBlock] = useState("");
    const dbRef = useRef();
    const lastClients = useRef({});
    const navigate = useNavigate();
    const endGame = useRef(false);
    const getClients = useCallback(() => {
        window.dispatchEvent(new Event('resize')); // Fix React-Textfit not sizing right
        liveGameController.getDatabaseVal("c", snapshot => {
            const val = snapshot || {};
            if (!val || Object.keys(val).length == 0) return setPlayers([]);
            let clients = [];
            for (const [name, { b: blook, d: dmg }] of Object.entries(val)) clients.push({ name, blook, dmg });
            clients.sort((a, b) => b.dmg - a.dmg);
            setPlayers(clients);
        });
    }, []);
    const goNext = useCallback(() => {
        let val = players.map((s, i) => ({
            n: s.name,
            b: s.blook,
            d: s.dmg,
            p: i + 1
        }));
        updateStandings(val);
        liveGameController.setVal({
            path: "st", val
        }, () => liveGameController.setStage({ stage: "fin" }, () => navigate("/host/defense2/final")));
    }, [players]);
    const changeMuted = useCallback(() => {
        setMuted(!muted);
    }, [muted]);
    useEffect(() => {
        audio.muted = muted;
        updateHost({ muted });
    }, [muted]);
    const blockUser = useCallback(() => {
        liveGameController.blockUser(userToBlock);
        setPlayers(players.filter(({ name }) => name != userToBlock));
        setUserToBlock("");
    }, [userToBlock, players]);
    const addAlert = useCallback((name, blook, msg, info) => {
        setAlerts(a => a.find(e => e.name + e.msg == name + msg) ? a : [...a, { name, blook, msg, info }])
    }, []);
    const { current: audio } = useRef(new Audio(audios.defense2));
    const timerInterval = useRef();
    useEffect(() => {
        import("./defense2.css");
        if (!host?.settings) return navigate("/sets");
        window.liveGameController = liveGameController;
        (async () => {
            audio.muted = muted;
            audio.volume = 0.2;
            audio.play();
            audio.addEventListener("ended", () => {
                audio.currentTime = 0;
                audio.play();
            }, false);
            liveGameController.setStage({ stage: "defense2" });
            getClients();
            if (host.settings.mode == "Time") {
                let seconds = 60 * host.settings.amount;
                setTimer(`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`);
                timerInterval.current = setInterval(() => {
                    seconds--;
                    setTimer(`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`);
                    getClients();
                    if (seconds <= 0) {
                        clearInterval(timerInterval.current);
                        endGame.current = true;
                    }
                }, 1000);
            } else timerInterval.current = setInterval(getClients, 1000);
            dbRef.current = await liveGameController.getDatabaseRef("c");
            dbRef.current.on("value", function (snapshot) {
                const clients = snapshot.val() || {};
                lastClients.current = clients;
                let total = 0;
                for (const client in clients) {
                    total += parseInt("0" + clients[client].d);
                    if (clients[client].r) addAlert(client, clients[client].b, `just completed Round ${clients[client].r}!`)
                    if (host.settings.mode == "Amount" && clients[client].d >= host.settings.amount) endGame.current = true;
                }
                setTotalDmg(total);
            });
        })();
        return () => {
            clearInterval(timerInterval.current);
            audio.currentTime = 0;
            audio.pause();
            audio.removeEventListener("ended", () => {
                audio.currentTime = 0;
                audio.play();
            }, false);
        }
    }, []);
    useEffect(() => {
        if (endGame.current) goNext();
    }, [players])
    if (!host?.settings) return navigate("/sets");
    return <>
        <div className="body td2Background" style={{
            overflow: "hidden"
        }}>
            <TopBar left="Blooket" center={host.settings.mode == "Time" ? timer : `Goal: ${formatNumber(host.settings.amount)}`} right={host.settings.lateJoin ? `ID: ${liveGameController.liveGameCode}` : ""} muted={muted} changeMuted={changeMuted} onRightClick={() => (endGame.current = true, getClients())} />
            <div className="hostRegularBody">
                <NodeGroup data={players} keyAccessor={({ name }) => name}
                    start={(_, place) => ({ x: -60, y: 13 * place })}
                    enter={(_, place) => ({ x: [0], y: [13 * place], timing: { duration: 1000, ease: e => +e } })}
                    update={(_, place) => ({ x: [0], y: [13 * place], timing: { duration: 500, ease: e => +e } })}
                    leave={() => ({ x: [-60], timing: 1000 })}>
                    {(standings) => <div className="td2Left invisibleScrollbar">
                        {standings.map(({ key, data, state: { x, y } }, i) => {
                            return <div key={key} style={{
                                opacity: userToBlock == data.name ? 0.4 : null,
                                transform: `translate(${x}vw, ${y}vh)`,
                            }} onClick={() => setUserToBlock(data.name)} className={`td2StandingContainer`}>
                                <div className="td2StandingBorderLeft"></div>
                                <div className="td2StandingBorderRight"></div>
                                <div className="td2StandingTopBottom"></div>
                                <div className="td2StandingLongTexture"></div>
                                <div className="td2StandingInside">
                                    <Textfit className="placeText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5vw")}>{i + 1}</Textfit>
                                    <div className="superPlaceText">{getOrdinal(i + 1)}</div>
                                    <Blook name={data.blook} className="blookBox"></Blook>
                                    <Textfit className="nameText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("4vw")}>{data.name}</Textfit>
                                    <div className="dmgContainer">
                                        <Textfit className="dmgText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5vw")}>{(data.dmg < 1000 ? formatNumber(data.dmg) : formatBigNumber(data.dmg))}</Textfit>
                                        <img src={defense2.totalDmg} alt="Damage" className="dmgIcon" draggable={false} />
                                    </div>
                                </div>
                            </div>
                        })}
                    </div>}
                </NodeGroup>
                <div className="td2Chatroom">
                    <div className="td2StandingBorderLeft"></div>
                    <div className="td2StandingBorderRight"></div>
                    <div className="td2StandingTopBottom"></div>
                    <div className="td2StandingLongTexture" style={{ backgroundSize: "calc(55vw + 20px)" }}></div>
                    <div className="td2ChatroomInside invisibleScrollbar">
                        {alerts.length
                            ? alerts.map((alert, i) => <Alert key={`alert${i}`} name={alert.name} blook={alert.blook} message={alert.msg} glitchInfo={alert.info} night={true} />)
                            : <div className="noAlerts">
                                <img src={defense2.fireRate} alt="Waiting" className="noAlertsIcon" draggable={false} />
                                <div className="noAlertsText">Waiting To Party...</div>
                            </div>}
                    </div>
                </div>
                <div className="totalDmgContainer">
                    <div className="td2StandingBorderLeft"></div>
                    <div className="td2StandingBorderRight"></div>
                    <div className="td2StandingTopBottom"></div>
                    <div className="td2StandingLongTexture" style={{ backgroundSize: "50vw" }}></div>
                    <div className="totalDmgInside">
                        <div className="totalDmgText">{formatNumber(totalDmg)}</div>
                        <img src={defense2.totalDmg} alt="Damage" className="totalDmgIcon" draggable={false} />
                    </div>
                </div>
            </div>
        </div>
        {userToBlock && <div className="blockModal">
            <div className="blockContainer">
                <div className="blockHeader">Remove {userToBlock} from the game?</div>
                <div className="blockButtonContainer">
                    <div className="blockYesButton" onClick={blockUser}>Yes</div>
                    <div className="blockNoButton" onClick={() => setUserToBlock("")}>No</div>
                </div>
            </div>
        </div>}
    </>
}

export function Defense2Final() {
    const { standings: { current: standings }, liveGameController, deleteHost, host: { current: host }, hostId } = useGame();
    const { http: { post } } = useAuth();
    const [state, setState] = useState({
        standings,
        historyId: "",
        ready: false,
        muted: !!host && host.muted
    });
    const { current: hostCopy } = useRef(JSON.parse(JSON.stringify(host)));
    const navigate = useNavigate();
    const startTimeout = useRef();
    const waitTimeout = useRef();
    useEffect(() => {
        console.log(state, hostId);
        if (!state.standings?.[0]) return navigate("/sets");
        startTimeout.current = setTimeout(function () {
            let results = {};
            liveGameController.getDatabaseVal("c", val => {
                for (const client in (val || {})) {
                    let user = val[client];
                    results[client] = { corrects: {}, incorrects: {} };
                    if (user.i) if (Array.isArray(user.i)) for (let i = 0; i < user.i.length; i++) {
                        if (user.i[i]) results[client].incorrects[i] = user.i[i];
                    } else results[client].incorrects = user.i;

                    if (user.c) if (Array.isArray(user.c)) for (let i = 0; i < user.c.length; i++) {
                        if (user.c[i]) results[client].corrects[i] = user.c[i];
                    } else results[client].corrects = user.c;
                }
            });
            if (liveGameController.liveGameCode && liveGameController.isHost) {
                liveGameController.removeHostAndDeleteGame();
                deleteHost();
            }
            window.dispatchEvent(new Event('resize')); // Fix React-Textfit not sizing right
            waitTimeout.current = setTimeout(function () {
                if (!standings.length) return;
                post("https://play.blooket.com/api/history", {
                    t: hostId.current,
                    standings: standings.map(({ b: blook, n: name, p: place, d: dmg }) => ({
                        blook, name, place,
                        dmg: isNaN(dmg) ? 0 : Math.min(Math.round(Number(dmg)), 9223372036854775000),
                        corrects: results[name]?.corrects || {},
                        incorrects: results[name]?.incorrects || {}
                    })),
                    settings: hostCopy.settings,
                    setId: hostCopy.setId
                }).then(({ data }) => setState(s => ({ ...s, historyId: data.id, ready: true }))).catch(console.error);
            }, 2000);
        }, 3500);
        return () => {
            clearTimeout(startTimeout.current);
            clearTimeout(waitTimeout.current);
            if (liveGameController.liveGameCode && liveGameController.isHost) {
                liveGameController.removeHostAndDeleteGame();
                deleteHost();
            }
        }
    }, []);
    if (host?.standings?.[0] || state.standings?.[0]) return <div className="body td2Background" style={{
        overflowY: state.ready ? "auto" : "hidden"
    }}>
        {state.standings.length > 0 && <Standings
            standings={state.standings}
            stats={state.standings.map(e => formatNumber(e.dmg) + " Damage")}
            gameId={hostCopy.setId}
            historyId={state.historyId}
            muted={state.muted}
            theme="defense2"
            ready={state.ready}
        />}
    </div>;
}