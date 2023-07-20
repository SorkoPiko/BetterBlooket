import { useState, useRef, useCallback, useEffect } from "react";
import { useGame } from "../../../context/GameContext";
import { audios } from "../../../utils/config";
import { diffObjects, formatBigNumber, formatNumber, getDimensions, getOrdinal } from "../../../utils/numbers";
import { useNavigate } from "react-router-dom";
import TopBar from "../topBar";
import { Textfit } from "react-textfit";
import Blook from "../../../blooks/Blook";
import { NodeGroup } from "react-move";
import { useAuth } from "../../../context/AuthContext";
import Standings from "./Standings";
import Alert from "../../../components/Alert";
import { factoryGlitches, factoryJokes } from "../../../utils/gameModes";
import { shuffleArray, random } from "../../../utils/questions";
import { basic, factory } from "../../../utils/images";
import { Tooltip } from "react-tooltip";
import Modal from "../../../components/Modal";

const messages = [
    { text: "Ready", time: 5500 },
    { text: "Set", time: 2500 },
    { text: "Go!", time: 2e3 },
    { text: "", time: 1e3 }
]

export default function RacingHost() {
    const { host: { current: host }, liveGameController, updateHost, updateStandings } = useGame();
    const [racers, setRacers] = useState([]);
    const [size, setSize] = useState(0);
    const [padding, setPadding] = useState(0);
    const [centerText, setCenterText] = useState("Loading");
    const [muted, setMuted] = useState(!!host && host.muted);
    const dbRef = useRef();
    const lastClients = useRef({});
    const navigate = useNavigate();
    const endGame = useRef(false);
    const updateDimensions = useCallback(() => {
        const windowHeight = window.innerHeight;
        const n = racers.length || 1;
        const o = 0.94 * (windowHeight - 75) / n;

        const size = Math.max(o / 1.15, 75);
        const padding = (n === 1) ? size : 1.15 * size + (o - n * (1.15 * size)) / (n - 1);

        setSize(size);
        setPadding(padding);
    }, [racers]);
    const getClients = useCallback(() => {
        window.dispatchEvent(new Event('resize')); // Fix React-Textfit not sizing right
        liveGameController.getDatabaseVal("c", snapshot => {
            const val = snapshot || {};
            if (!val || Object.keys(val).length == 0) return setRacers([]);
            let clients = [];
            for (const [name, { b: blook, pr = 0 }] of Object.entries(val)) clients.push({ name, blook, progress: pr ? Math.min(pr, Number(host.settings.amount)) : 0 });
            clients.sort((a, b) => b.progress - a.progress);
            if (clients.length != racers.length) updateDimensions();
            setRacers(clients);
        });
    }, []);
    const goNext = useCallback(() => {
        let val = [];
        for (let i = 0; i < racers.length; i++) {
            if ((i == 0 || racers[i].progress != racers[i - 1].progress) && racers[i].blook) i += 1;
            val.push({
                n: racers[i - 1].name,
                b: racers[i - 1].blook,
                pr: racers[i - 1].progress,
                pl: i
            });
        }
        updateStandings(val);
        liveGameController.setVal({
            path: "st", val
        }, () => liveGameController.setStage({ stage: "fin" }, () => navigate("/host/racing/final")));
    }, [racers]);
    const changeMuted = useCallback(() => {
        setMuted(!muted);
    }, [muted]);
    useEffect(() => {
        audio.muted = muted;
        updateHost({ muted });
    }, [muted]);
    const { current: audio } = useRef(new Audio(audios.racing));
    const { current: readySetGoAudios } = useRef(audios.readySetGo.map(src => new Audio(src)));
    const timerInterval = useRef();
    const rsgTimeout = useRef();
    const audioTimeout = useRef();
    useEffect(() => {
        import("./racing.css");
        if (!host?.settings) return navigate("/sets");
        window.liveGameController = liveGameController;
        (async () => {
            let i = 0;
            const readySetGo = () => rsgTimeout.current = setTimeout(() => {
                setCenterText(messages[i].text);
                if (i >= messages.length - 1 || muted) return;
                readySetGoAudios[i].play();
                i++;
                readySetGo()
            }, messages[i].time);
            readySetGo();
            audioTimeout.current = setTimeout(() => {
                audio.muted = muted;
                audio.volume = 0.6;
                audio.play();
                audio.addEventListener("ended", () => {
                    audio.currentTime = 0;
                    audio.play();
                }, false);
            }, 10500);
            liveGameController.setStage({ stage: "race" });
            getClients();
            timerInterval.current = setInterval(getClients, 1000);
            dbRef.current = await liveGameController.getDatabaseRef("c");
            dbRef.current.on("value", function (snapshot) {
                const clients = snapshot.val() || {};
                const changed = diffObjects(lastClients.current, clients) || {};
                for (const [client, data] of Object.entries(changed)) if (data.tat) {
                    let [at, tat] = data.tat.split(":");
                    if (!at) continue;
                    if (!tat) {
                        liveGameController.setVal({
                            path: "act",
                            val: `${client}:${clients[client].b}:${at}`
                        });
                        continue;
                    }
                    liveGameController.setVal({
                        path: `c/${at}/at`,
                        val: `${client}:${clients[client].b}:${tat}`
                    });
                    liveGameController.removeVal(`c/${client}/tat`);
                }
                lastClients.current = clients;
                for (const client in clients) if (clients[client].pr >= host.settings.amount) endGame.current = true;
            });
        })();
        return () => {
            clearInterval(timerInterval.current);
            clearTimeout(rsgTimeout.current);
            clearTimeout(audioTimeout.current);
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
    }, [racers])
    if (!host?.settings) return navigate("/sets");
    const e = Math.floor(racers.length / 10) + 1;
    const { current: line } = useRef([...Array(25)]);
    return <>
        <div className="body" style={{ overflow: "hidden" }}>
            <TopBar left="Blooket" right={host.settings.lateJoin ? `ID: ${liveGameController.liveGameCode}` : ""} muted={muted} changeMuted={changeMuted} />
            <div className="hostRegularBody">
                <div className="racingTrack">
                    {racers.map((racer, i) => {
                        return <div key={racer.name}>
                            {e && (racers.length - i - 1) % e == 0 && <div className="racingLine" style={{
                                height: `${1.15 * size / 15}px`,
                                top: i * padding + size * (16.1 / 15),
                            }}></div>}
                            <Tooltip place="bottom" offset={{ bottom: -10 }} className="tooltip" />
                            <Blook className="racer" name={racer.blook} style={{
                                width: size,
                                top: i * padding,
                                zIndex: i + 1,
                                transform: `translateX(${racer.progress / ((host?.settings?.amount || 0) - 1) * (getDimensions("96vw") - size)}px)`
                            }} tip={`${racer.name}-${racer.progress}/${host?.settings?.amount || 0}`} />
                        </div>
                    })}
                    {line.map((_, i) => <img key={i} src={i % 2 == 0 ? basic.finishLine : basic.finishLine2} alt="Finish Line" className="finishLine" style={{ top: `${4 * i}%` }} />)}
                </div>
                {centerText && <div className="centerText" style={{
                    fontSize: centerText == "Loading" ? "6vw" : "11.5vw"
                }}>{centerText}</div>}
            </div>
        </div>
    </>
}

export function RacingFinal() {
    const { standings: { current: standings }, liveGameController, deleteHost, host: { current: host }, hostId } = useGame();
    const { http: { post } } = useAuth();
    const [state, setState] = useState({
        standings,
        historyId: "",
        ready: false,
        muted: !!host && host.muted,
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
                    standings: standings.map(({ b: blook, n: name, pl: place, pr: progress }) => ({
                        blook, name, place,
                        progress: isNaN(progress) ? 0 : Math.min(Math.round(Number(progress)), 9223372036854775000),
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
    if (host?.standings?.[0] || state.standings?.[0]) return <div className="body" style={{ overflowY: state.ready ? "auto" : "hidden", backgroundColor: "var(--accent2)" }}>
        {state.standings.length > 0 && <Standings
            standings={state.standings}
            stats={state.standings.map(e => (hostCopy.settings.amount - e.pr) + " Left")}
            gameId={hostCopy.setId}
            historyId={state.historyId}
            muted={state.muted}
            ready={state.ready}
        />}
        {askPlayAgain && <Modal text="Would you like to play again right now with the same players and settings?" buttonOne={{
            text: "Yes!",
            click: () => onPlayAgain(true)
        }} buttonTwo={{
            text: "No",
            click: () => onPlayAgain(false)
        }} />}
    </div>;
}