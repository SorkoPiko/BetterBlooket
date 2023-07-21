import { useState, useRef, useCallback, useEffect } from "react";
import { useGame } from "../../../context/GameContext";
import { audios } from "../../../utils/config";
import { diffObjects, formatBigNumber, formatNumber, getDimensions, getOrdinal } from "../../../utils/numbers";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar.jsx";
import { Textfit } from "react-textfit";
import Blook from "../../../blooks/Blook";
import { NodeGroup } from "react-move";
import { useAuth } from "../../../context/AuthContext";
import Standings from "./Standings";
import Alert from "../../../components/Alert";
import Modal from "../../../components/Modal";

export default function CafeHost() {
    const { host: { current: host }, liveGameController, updateHost, updateStandings } = useGame();
    const [timer, setTimer] = useState("00:00");
    const [players, setPlayers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [totalCash, setTotalCash] = useState(0);
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
            for (const [name, { b: blook, ca: cash = 0 }] of Object.entries(val)) clients.push({ name, blook, cash });
            clients.sort((a, b) => b.cash - a.cash);
            setPlayers(clients);
        });
    }, []);
    const goNext = useCallback(() => {
        let val = players.map((s, i) => ({
            n: s.name,
            b: s.blook,
            c: s.cash,
            p: i + 1
        }));
        updateStandings(val);
        liveGameController.setVal({
            path: "st", val
        }, () => liveGameController.setStage({ stage: "fin" }, () => navigate("/host/cafe/final")));
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
    const { current: audio } = useRef(new Audio(audios.cafe));
    const timerInterval = useRef();
    useEffect(() => {
        import("./cafe.css");
        if (!host?.settings) return navigate("/sets");
        window.liveGameController = liveGameController;
        (async () => {
            audio.muted = muted;
            audio.volume = 0.6;
            audio.play();
            audio.addEventListener("ended", () => {
                audio.currentTime = 0;
                audio.play();
            }, false);
            liveGameController.setStage({ stage: "cafe" });
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
                const changed = diffObjects(lastClients.current, clients) || {};
                for (const [client, data] of Object.entries(changed)) if (data.up) {
                    let [ability, level] = data.up.split(":");
                    addAlert(client, clients[client].b, `upgraded ${abilities[ability].title} to Level ${level}!`, ability);
                } else if (data.tat) {
                    const [tat, type] = data.tat.split(":");
                    if (!clients[tat] || !type) continue;
                    liveGameController.setVal({
                        path: `c/${tat}/at`,
                        val: `${client}:${clients[client].b}:${type}`
                    });
                    liveGameController.removeVal(`c/${client}/tat`)
                }
                lastClients.current = clients;
                let total = 0;
                for (const client in clients) {
                    total += parseInt("0" + clients[client].ca);
                    if (clients[client].r) addAlert(client, clients[client].b, `just completed Round ${clients[client].r}!`)
                    if (host.settings.mode == "Amount" && clients[client].d >= host.settings.amount) endGame.current = true;
                }
                setTotalCash(total);
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
        <div className="body" style={{ overflow: "hidden" }}>
            <TopBar left="Blooket" center={host.settings.mode == "Time" ? timer : `Goal: ${formatNumber(host.settings.amount)}`} right={host.settings.lateJoin ? `ID: ${liveGameController.liveGameCode}` : ""} muted={muted} changeMuted={changeMuted} onRightClick={() => (endGame.current = true, getClients())} />
            <div className="hostRegularBody">
                <div className="cafeBackground" style={{ width: "100%", height: "100%" }}>
                    <NodeGroup data={players} keyAccessor={({ name }) => name}
                        start={(_, place) => ({ x: -60, y: 11 * place })}
                        enter={(_, place) => ({ x: [0], y: [11 * place], timing: { duration: 1000, ease: e => +e } })}
                        update={(_, place) => ({ x: [0], y: [11 * place], timing: { duration: 500, ease: e => +e } })}
                        leave={() => ({ x: [-60], timing: 1000 })}>
                        {(standings) => <div className="cafeLeft invisibleScrollbar">
                            {standings.map(({ key, data, state: { x, y } }, i) => {
                                return <div key={key} style={{
                                    opacity: userToBlock == data.name ? 0.4 : null,
                                    transform: `translate(${x}vw, ${y}vh)`,
                                }} onClick={() => setUserToBlock(data.name)} className={`cafeStandingContainer`}>
                                    <Textfit className="placeText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5vw")}>{i + 1}</Textfit>
                                    <div className="superPlaceText">{getOrdinal(i + 1)}</div>
                                    <Blook name={data.blook} className="blookBox"></Blook>
                                    <Textfit className="nameText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("4vw")}>{data.name}</Textfit>
                                    <Textfit className="cashText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5vw")}>${formatBigNumber(data.cash)}</Textfit>
                                </div>
                            })}
                        </div>}
                    </NodeGroup>
                    <div className="cafeChatroom">
                        <div className="cafeChatroomInside invisibleScrollbar">
                            {alerts.length
                                ? alerts.map((alert, i) => <Alert key={`alert${i}`} name={alert.name} blook={alert.blook} message={alert.msg} glitchInfo={alert.info} isWhite={true} />)
                                : <div className="noAlerts">
                                    <i className="noAlertsIcon fa-regular fa-clock" />
                                    <div className="noAlertsText">Waiting For Action...</div>
                                </div>}
                        </div>
                    </div>
                    <Textfit className="totalCashText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("7vw")}>
                        ${formatNumber(totalCash)}
                    </Textfit>
                </div>
            </div>
        </div>
        {userToBlock && <Modal text={`Remove ${userToBlock} from the game?`}
            buttonOne={{ text: "Yes", click: blockUser, color: "#ce1313" }}
            buttonTwo={{ text: "No", click: () => setUserToBlock(""), color: "var(--accent1)" }} />}
    </>
}

export function CafeFinal() {
    const { standings: { current: standings }, liveGameController, deleteHost, host: { current: host }, hostId } = useGame();
    const { http: { post } } = useAuth();
    const [state, setState] = useState({
        standings,
        historyId: "",
        ready: false,
        muted: !!host && host.muted
    });
    const [askPlayAgain, setAskPlayAgain] = useState(false);
    const { current: hostCopy } = useRef(JSON.parse(JSON.stringify(host)));
    const navigate = useNavigate();
    const startTimeout = useRef();
    const waitTimeout = useRef();
    const askTimeout = useRef();
    const restarting = useRef(false);
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
            window.dispatchEvent(new Event('resize')); // Fix React-Textfit not sizing right
            waitTimeout.current = setTimeout(function () {
                if (!standings.length) return;
                post("https://play.blooket.com/api/history", {
                    t: hostId.current,
                    standings: standings.map(({ b: blook, n: name, p: place, c: cash }) => ({
                        blook, name, place,
                        cash: isNaN(cash) ? 0 : Math.min(Math.round(Number(cash)), 9223372036854775000),
                        corrects: results[name]?.corrects || {},
                        incorrects: results[name]?.incorrects || {}
                    })),
                    settings: hostCopy.settings,
                    setId: hostCopy.setId
                }).then(({ data }) => {
                    setState(s => ({ ...s, historyId: data.id, ready: true }));
                    askTimeout.current = setTimeout(() => setAskPlayAgain(true), 3000);
                }).catch(console.error);
            }, 2000);
        }, 3500);
        return () => {
            clearTimeout(startTimeout.current);
            clearTimeout(waitTimeout.current);
            clearTimeout(askTimeout.current);
            if (!restarting.current && liveGameController.liveGameCode && liveGameController.isHost) {
                liveGameController.removeHostAndDeleteGame();
                deleteHost();
            }
        }
    }, []);
    const onPlayAgain = useCallback(async (again) => {
        if (!again) {
            if (liveGameController.liveGameCode && liveGameController.isHost) {
                liveGameController.removeHostAndDeleteGame();
                deleteHost();
            }
            return setAskPlayAgain(false);
        }
        restarting.current = true;
        await liveGameController.removeVal("st");
        await liveGameController.removeVal("c");
        liveGameController.setStage({ stage: "join" }, () => navigate("/host/join"));
    }, []);
    if (host?.standings?.[0] || state.standings?.[0]) return <div className="body cafeBackground" style={{
        overflowY: state.ready ? "auto" : "hidden"
    }}>
        {state.standings.length > 0 && <Standings
            standings={state.standings}
            stats={state.standings.map(e => "$" + formatNumber(e.c))}
            gameId={hostCopy.setId}
            historyId={state.historyId}
            muted={state.muted}
            theme="cafe"
            ready={state.ready}
        />}
        {askPlayAgain && <Modal text="Would you like to play again right now with the same settings?" buttonOne={{
            text: "Yes!",
            click: () => onPlayAgain(true)
        }} buttonTwo={{
            text: "No",
            click: () => onPlayAgain(false)
        }} />}
    </div>;
}