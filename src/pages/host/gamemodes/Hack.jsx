import { useState, useRef, useCallback, useEffect } from "react";
import { useGame } from "../../../context/GameContext";
import { audios } from "../../../utils/config";
import { diffObjects, formatBigNumber, formatNumber, getDimensions, getOrdinal } from "../../../utils/numbers";
import { useNavigate } from "react-router-dom";
import TopBar from "../topBar";
import { Textfit } from "react-textfit";
import Blook from "../../../blooks/Blook";
import Alert from "../../../components/Alert";
import { NodeGroup } from "react-move";
import { useAuth } from "../../../context/AuthContext";
import Standings from "./Standings";

const instructs = ["Choose a Password", "Answer Questions", "Mine Crypto", "Hack Other Players By Guessing Their Passwords"];

export function HackInstruct() {
    const { host: { current: host }, updateHost, liveGameController } = useGame();
    const { current: audio } = useRef(new Audio(audios.cryptoHack));
    const [muted, setMuted] = useState(!!host && host.muted);
    const [instructions, setInstructions] = useState(instructs);
    const [text, setText] = useState("");
    const timeout = useRef();
    const typingInterval = useRef();
    const navigate = useNavigate();
    const skip = useCallback(() => navigate("/host/hack"), []);
    const changeMuted = useCallback(() => {
        setMuted(!muted);
        audio.muted = !muted;
        updateHost({ muted: !muted });
    }, [muted]);
    const instructionsRef = useRef(instructions);
    const nextInstruction = useCallback((ind) => {
        setText("");
        if (ind >= instructionsRef.current.length) skip();
        else timeout.current = setTimeout(function () {
            let char = 0;
            typingInterval.current = setInterval(function () {
                char++;
                setText(instructionsRef.current[ind].slice(0, char));
                if (char >= instructionsRef.current[ind].length) {
                    clearInterval(typingInterval.current);
                    timeout.current = setTimeout(function () {
                        ind++;
                        nextInstruction(ind);
                    }, 3000);
                }
            }, 40);
        }, 1000);
    }, []);
    useEffect(() => { instructionsRef.current = instructions }, [instructions])
    useEffect(() => {
        if (host?.settings) {
            import("./hack.css");
            setInstructions(i => [...i].concat([host?.settings && "Time" === host.settings.mode ? `Most Crypto after ${formatNumber(host.settings.amount)} ${"1" === host.settings.amount ? "minute" : "minutes"} wins!` : `First player to have ₿ ${formatNumber(host.settings.amount)} wins!`, "Good Luck"]));
            audio.volume = 0.15;
            audio.play();
            audio.addEventListener("ended", function () {
                audio.currentTime = 0;
                audio.play();
            }, false);
            nextInstruction(0);
        }
        return () => {
            clearTimeout(timeout.current);
            clearTimeout(typingInterval.current);
            audio.currentTime = 0;
            audio.pause();
            audio.removeEventListener("ended", function () {
                audio.currentTime = 0;
                audio.play();
            }, false);
        }
    }, []);
    if (!host?.settings) return navigate("/sets");
    return <div className="instructBody" style={{ backgroundColor: "#000" }}>
        <TopBar left={host.settings.lateJoin ? `ID: ${liveGameController.liveGameCode}` : ""} center="Instructions" muted={muted} changeMuted={changeMuted} color="#000" />
        <div className="regularBody instructInnerBody">
            <div className="noise"></div>
            <div className="overlay"></div>
            <div className="text">{text}</div>
        </div>
        <div id="skipButton" onClick={skip}>Skip</div>
    </div>
}

export default function HackHost() {
    const { host: { current: host }, liveGameController, updateHost, updateStandings } = useGame();
    const [timer, setTimer] = useState("00:00");
    const [players, setPlayers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [totalCrypto, setTotalCrypto] = useState(0);
    const [muted, setMuted] = useState(!!host && host.muted);
    const [loadingText, setLoadingText] = useState("[----------]")
    const [isIntro, setIsIntro] = useState(true);
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
            for (const [name, { b: blook, cr: crypto = 0 }] of Object.entries(val)) clients.push({ name, blook, crypto: crypto || 0 });
            clients.sort((a, b) => b.crypto - a.crypto);
            setPlayers(clients);
        });
    }, []);
    const goNext = useCallback(() => {
        let val = players.map((s, i) => ({
            n: s.name,
            b: s.blook,
            cr: s.crypto,
            p: i + 1
        }));
        updateStandings(val);
        liveGameController.setVal({
            path: "st", val
        }, () => liveGameController.setStage({ stage: "fin" }, () => navigate("/host/hack/final")));
    }, [players]);
    const addAlert = useCallback((name, blook, msg, info) => {
        setAlerts(a => a.find(e => e.name + e.msg == name + msg) ? a : [...a, { name, blook, msg, info }])
    }, []);
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
    const { current: audio } = useRef(new Audio(audios.cryptoHack));
    const timerInterval = useRef();
    const loadingTimeout = useRef();
    const clientsInterval = useRef();
    useEffect(() => {
        import("./hack.css");
        if (!host?.settings) return navigate("/sets");
        window.liveGameController = liveGameController;
        (async () => {
            audio.muted = muted;
            audio.volume = 0.15;
            audio.play();
            audio.addEventListener("ended", () => {
                audio.currentTime = 0;
                audio.play();
            }, false);
            liveGameController.setStage({ stage: "hack" });
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
            let progress = 0;
            loadingTimeout.current = setTimeout(function load() {
                loadingTimeout.current = progress >= 10
                    ? setTimeout(() => setIsIntro(false), 3000)
                    : setTimeout(() => {
                        progress++;
                        setLoadingText(`[${"#".repeat(progress)}${"-".repeat(10 - progress)}]`);
                        load();
                    }, 500);
            }, 1500);
            dbRef.current = await liveGameController.getDatabaseRef("c");
            dbRef.current.on("value", function (snapshot) {
                const clients = snapshot.val() || {};
                const changed = diffObjects(lastClients.current, clients) || {};
                for (const [client, data] of Object.entries(changed)) if (data.tat) {
                    const [tat, amount] = data.tat.split(":");
                    const r = clients[tat];
                    if (!r || !type) continue;
                    liveGameController.setVal({
                        path: `c/${tat}`,
                        val: {
                            b: r.b,
                            p: r.p,
                            cr: Math.max((r.cr || 0) - parseInt(amount), 0),
                            at: `${client}:${clients[client].b}:${amount}`
                        }
                    });
                    clients[tat].cr = Math.max((r.cr || 0) - parseInt(amount), 0);
                    addAlert(client, clients[client].b, `just took ${formatNumber(parseInt(amount))} crypto from ${tat}`);
                    liveGameController.removeVal(`c/${client}/tat`);
                }
                lastClients.current = clients;
                let total = 0;
                for (const client in clients) {
                    total += parseInt("0" + clients[client].cr);
                    if (host.settings.mode == "Amount" && clients[client].cr >= host.settings.amount) endGame.current = true;
                }
                setTotalCrypto(total);
            });
        })();
        return () => {
            clearInterval(timerInterval.current);
            clearInterval(clientsInterval.current);
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
        <div className="body" style={{
            overflow: "hidden",
            backgroundColor: `#000`
        }}>
            <TopBar left="Blooket" center={host.settings.mode == "Time" ? timer : `Goal: ${formatNumber(host.settings.amount)}`} right={host.settings.lateJoin ? `ID: ${liveGameController.liveGameCode}` : ""} muted={muted} changeMuted={changeMuted} onRightClick={() => (endGame.current = true, getClients())} color="#000" />
            <div className="hostRegularBody hackBody">
                <NodeGroup data={players} keyAccessor={({ name }) => name}
                    start={(_, place) => ({ x: -60, y: 11 * place })}
                    enter={(_, place) => ({ x: [0], y: [11 * place], timing: { duration: 1000, ease: e => +e } })}
                    update={(_, place) => ({ x: [0], y: [11 * place], timing: { duration: 500, ease: e => +e } })}
                    leave={() => ({ x: [-60], timing: 1000 })}>
                    {(standings) => <div className="hackLeft invisibleScrollbar">
                        {standings.map(({ key, data, state: { x, y } }, i) => {
                            return <div key={key} style={{
                                opacity: userToBlock == data.name ? 0.4 : null,
                                transform: `translate(${x}vw, ${y}vh)`
                            }} onClick={() => setUserToBlock(data.name)} className={`hackStandingContainer`}>
                                <Textfit className="placeText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5vw")}>{i + 1}</Textfit>
                                <div className="superPlaceText">{getOrdinal(i + 1)}</div>
                                <Blook name={data.blook} className="blookBox"></Blook>
                                <Textfit className="nameText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("4vw")}>{data.name}</Textfit>
                                <div className="cryptoContainer">
                                    <Textfit className="cryptoText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5vw")}>{data.crypto < 1000 ? formatNumber(data.crypto) : formatBigNumber(data.crypto)}</Textfit>
                                </div>
                            </div>
                        })}
                    </div>}
                </NodeGroup>
                <div className={`hackChatroom invisibleScrollbar`}>
                    {alerts.length
                        ? alerts.map((alert, i) => <Alert key={`alert${i}`} name={alert.name} blook={alert.blook} message={alert.msg} glitchInfo={alert.info} night={true} />)
                        : <div id="noAlerts">
                            <i className="noAlertsIcon fas fa-satellite-dish" />
                            <div id="noAlertsText">Waiting For Hacks...</div>
                        </div>}
                </div>
                <div className="totalCryptoContainer">
                    <div className="totalCryptoText">{"₿ " + formatNumber(totalCrypto)}</div>
                </div>
                <div className="noise"></div>
                <div className="overlay"></div>
            </div>
            {isIntro && <div className="loadingText">{loadingText}<br />Loading</div>}
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

export function HackFinal() {
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
            if (liveGameController.liveGameCode && liveGameController.isHost) {
                liveGameController.removeHostAndDeleteGame();
                deleteHost();
            }
            window.dispatchEvent(new Event('resize')); // Fix React-Textfit not sizing right
            waitTimeout.current = setTimeout(function () {
                if (!standings.length) return;
                post("https://play.blooket.com/api/history", {
                    t: hostId.current,
                    standings: standings.map(({ b: blook, n: name, p: place, cr: crypto }) => ({
                        blook, name, place,
                        crypto: isNaN(crypto) ? 0 : Math.min(Math.round(Number(crypto)), 9223372036854775000),
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
    if (host?.standings?.[0] || state.standings?.[0]) return <div className="body" style={{
        overflowY: state.ready ? "auto" : "hidden",
        backgroundColor: "#000"
    }}>
        {state.standings.length > 0 && <Standings
            standings={state.standings}
            stats={state.standings.map(e => "₿ " + formatNumber(e.cr))}
            gameId={hostCopy.setId}
            historyId={state.historyId}
            muted={state.muted}
            theme="hack"
            ready={state.ready}
        />}
        {askPlayAgain && <div className="blockModal">
            <div className="blockContainer">
                <div className="blockHeader">Would you like to play again right now with the same players and settings?</div>
                <div className="blockButtonContainer">
                    <div className="blockNoButton" onClick={() => onPlayAgain(true)}>Yes!</div>
                    <div className="blockNoButton" onClick={() => onPlayAgain(false)}>No</div>
                </div>
            </div>
        </div>}
    </div>;
}