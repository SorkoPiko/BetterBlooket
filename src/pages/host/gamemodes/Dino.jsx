import { useState, useRef, useCallback, useEffect } from "react";
import { useGame } from "../../../context/GameContext";
import { audios } from "../../../utils/config";
import { diffObjects, formatBigNumber, formatNumber, getDimensions, getOrdinal, listKeys } from "../../../utils/numbers";
import { useNavigate } from "react-router-dom";
import TopBar from "../topBar";
import { Textfit } from "react-textfit";
import Blook from "../../../blooks/Blook";
import Alert from "../../../components/Alert";
import { NodeGroup } from "react-move";
import { useAuth } from "../../../context/AuthContext";
import { dino } from "../../../utils/images";
// import Blook from "../../../blooks/Blook";

function Panel({ content, onClick, className, style }) {
    useEffect(() => {
        import("./dino.css");
    }, [])
    const backgroundImage = `radial-gradient(rgba(220, 184, 86, 0), rgba(220, 184, 86, 0.2)), url(${dino.paperTexture})`;
    return <div className={`wrapper ${className}${onClick ? " button" : ""}`} style={style} onClick={onClick}>
        <div className="inside">
            <div className="corner1" style={{ backgroundImage }}></div>
            <div className="corner2" style={{ backgroundImage }}></div>
            <div className="corner3" style={{ backgroundImage }}></div>
            <div className="corner4" style={{ backgroundImage }}></div>
            <div className="center">
                <div className="corner5" style={{ backgroundImage }}></div>
                <div className="corner6" style={{ backgroundImage }}></div>
                <div className="corner7" style={{ backgroundImage }}></div>
                <div className="corner8" style={{ backgroundImage }}></div>
                {content}
            </div>
        </div>
    </div>
}

export function DinoInstruct() {
    const { host: { current: host }, updateHost, liveGameController } = useGame();
    const { current: audio } = useRef(new Audio(audios.deceptiveDinos));
    const [muted, setMuted] = useState(!!host && host.muted);
    const timeout = useRef();
    const navigate = useNavigate();
    const skip = useCallback(() => navigate("/host/dino"), []);
    const changeMuted = useCallback(() => {
        setMuted(!muted);
        audio.muted = !muted;
        updateHost({ muted: !muted });
    }, [muted])
    useEffect(() => {
        if (host?.settings) {
            import("./dino.css");
            audio.volume = 0.45;
            audio.play();
            audio.addEventListener("ended", function () {
                audio.currentTime = 0;
                audio.play();
            }, false);
            timeout.current = setTimeout(skip, 28000);
        }
        return () => {
            clearTimeout(timeout.current);
            audio.currentTime = 0;
            audio.pause();
            audio.removeEventListener("ended", function () {
                audio.currentTime = 0;
                audio.play();
            }, false);
        }
    }, []);
    if (!host?.settings) return navigate("/sets");
    return <div className="body">
        <TopBar left={host.settings.lateJoin ? `ID: ${liveGameController.liveGameCode}` : ""} center="Instructions" muted={muted} changeMuted={changeMuted} />
        <div className="regularBody">
            <div className="container" style={{
                backgroundImage: `url(${dino.paperTexture})`,
            }}>
                <Panel className="text n1" content={<div className="textInside">Answer Questions</div>} />
                <Panel className="text n2" content={<div className="textInside">Excavate or Investigate</div>} />
                <Panel className="text n3" content={<div className="textInside">Excavate: Choose rocks to collect fossils</div>} />
                <Panel className="text n4" content={<div className="textInside">You can also "Cheat" to see inside the rocks</div>} />
                <Panel className="text n5" content={<div className="textInside">Investigate: Check if a player is cheating</div>} />
                <Panel className="text n6" content={<div className="textInside">If you catch a cheater, you'll take some of their fossils</div>} />
                <Panel className="text n7" content={<div className="textInside">
                    {host.settings.mode == "Time"
                        ? `Most fossils after ${formatNumber(host.settings.amount)} minute${host.settings.amount == 1 ? "s" : ""} wins!`
                        : `First player to have ${formatNumber(host.settings.amount)} fossils wins!`}
                </div>} />
                <Panel className="text n8" content={<div className="textInside">Good Luck!</div>} />
            </div>
        </div>
        <div id="skipButton" onClick={skip}>Skip</div>
    </div>
}

export default function DinoHost() {
    const { host: { current: host }, liveGameController, updateHost, updateStandings } = useGame();
    const [timer, setTimer] = useState("00:00");
    const [players, setPlayers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [totalFossils, setTotalFossils] = useState(0);
    const [muted, setMuted] = useState(!!host?.muted);
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
            for (const [name, { b: blook, f: fossils = 0 }] of Object.entries(val)) clients.push({ name, blook, fossils });
            clients.sort((a, b) => b.fossils - a.fossils);
            setPlayers(clients);
        });
    }, []);
    const goNext = useCallback(() => {
        let val = players.map((s, i) => ({
            n: s.name,
            b: s.blook,
            f: s.fossils,
            p: i + 1
        }));
        updateStandings(val);
        liveGameController.setVal({
            path: "st", val
        }, () => liveGameController.setStage({ stage: "fin" }, () => navigate("/host/dino/final")));
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
    const { current: audio } = useRef(new Audio(audios.deceptiveDinos));
    const timerInterval = useRef();
    const clientsInterval = useRef();
    useEffect(() => {
        import("./dino.css");
        if (!host?.settings) return navigate("/sets");
        window.liveGameController = liveGameController;
        (async () => {
            audio.muted = muted;
            audio.volume = 0.45;
            audio.play();
            audio.addEventListener("ended", () => {
                audio.currentTime = 0;
                audio.play();
            }, false);
            liveGameController.setStage({ stage: "dino" });
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
                for (const [client, data] of Object.entries(changed)) if (data.tat) {
                    const [tat, cheating] = data.tat.split(":");
                    const r = clients[tat];
                    if (!r || !cheating) continue;
                    if (cheating == "true") {
                        addAlert(client, clients[client].b, `just caught ${tat} CHEATING!`);
                        liveGameController.setVal({
                            path: `c/${tat}`,
                            val: {
                                b: r.b,
                                f: r.f,
                                at: `${client}:${clients[client].b}`
                            }
                        });
                    } else {
                        addAlert(client, clients[client].b, `investigated ${tat}`);
                        liveGameController.removeVal(`c/${client}/tat`);
                    }
                }
                lastClients.current = clients;
                let total = 0;
                for (const client in clients) {
                    total += parseInt("0" + clients[client].f);
                    if (host.settings.mode == "Amount" && clients[client].f >= host.settings.amount) endGame.current = true;
                }
                setTotalFossils(total);
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
        <div className="body" style={{ overflow: "hidden" }}>
            <TopBar left="Blooket" center={host.settings.mode == "Time" ? timer : `Goal: ${formatNumber(host.settings.amount)}`} right={host.settings.lateJoin ? `ID: ${liveGameController.liveGameCode}` : ""} muted={muted} changeMuted={changeMuted} onRightClick={() => (endGame.current = true, getClients())} />
            <div className="hostRegularBody" style={{ fontFamily: '"Macondo", sans-serif' }}>
                <div className="dinoBackground" style={{ backgroundImage: `radial-gradient(rgba(220, 184, 86, 0), rgba(220, 184, 86, 0.4)), url(${dino.paperTexture})` }}></div>
                <NodeGroup data={players} keyAccessor={({ name }) => name}
                    start={(_, place) => ({ x: -60, y: 12.5 * place })}
                    enter={(_, place) => ({ x: [0], y: [12.5 * place], timing: { duration: 1000, ease: e => +e } })}
                    update={(_, place) => ({ x: [0], y: [12.5 * place], timing: { duration: 500, ease: e => +e } })}
                    leave={() => ({ x: [-60], timing: 1000 })}>
                    {(standings) => <div className="dinoLeft invisibleScrollbar">
                        {standings.map(({ key, data, state: { x, y } }, i) => {
                            return <Panel key={key} className="dinoStandingContainer" onClick={() => setUserToBlock(data.name)} style={{
                                opacity: userToBlock == data.name ? 0.4 : null,
                                transform: `translate(${x}vw, ${y}vh)`
                            }} content={<div className="dinoStandingInside">
                                <Textfit className="placeText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5vw")}>{i + 1}</Textfit>
                                <div className="superPlaceText">{getOrdinal(i + 1)}</div>
                                <Blook name={data.blook} className="blookBox"></Blook>
                                <Textfit className="nameText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("4vw")}>{data.name}</Textfit>
                                <div className="fossilsContainer">
                                    <Textfit className="fossilsText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5vw")}>{data.fossils < 1000 ? formatNumber(data.fossils) : formatBigNumber(data.fossils)}</Textfit>
                                    <i className="fas fa-bone fossilsIcon" />
                                </div>
                            </div>} />
                        })}
                    </div>}
                </NodeGroup>
                <Panel className="dinoChatroom" content={<div className="dinoChatroomInside invisibleScrollbar">
                    {alerts.length
                        ? alerts.map((alert, i) => <Alert key={`alert${i}`} name={alert.name} blook={alert.blook} message={alert.msg} glitchInfo={alert.info} night={true} />)
                        : <div className="noAlerts">
                            <i className="noAlertsIcon fas fa-hourglass-start" />
                            <div className="noAlertsText">Waiting To Party...</div>
                        </div>}
                </div>} />
                <Panel className="totalFossilsContainer" content={<div className="totalFossilsInside">
                    <div className="totalFossilsText">{formatNumber(totalFossils)}</div>
                    <i className="fas fa-bone totalFossilsIcon" />
                </div>} />
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

function DinoStandings({ muted, historyId, gameId, standings, stats, ready }) {
    const { current: audio } = useRef(new Audio(audios.final));
    const audioTimeout = useRef();
    useEffect(() => {
        audio.volume = 0.7;
        if (muted) audio.muted = true;
        audioTimeout.current = setTimeout(() => audio.play(), 3500);
        return () => clearTimeout(audioTimeout.current);
    }, []);
    return <div style={{ fontFamily: "Macondo" }}>
        <div className="header" style={{
            backgroundColor: "var(--accent1)",
            width: "100%",
            height: "65px",
            paddingBottom: "6px",
            boxShadow: "inset 0 -6px rgba(0,0,0,.2)",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            zIndex: "10",
            overflow: "hidden",
            position: "absolute",
            top: "0",
            left: "0",
        }}>
            {ready && <a className="headerTextLeft" style={{
                fontSize: "30px",
                textAlign: "left",
                lineHeight: "59px",
                paddingLeft: "20px",
                fontFamily: "Adventure",
                userSelect: "none",
                display: "flex",
                justifyContent: "center"
            }} href="/sets">
                Sets
            </a>}
            <div className="headerTextCenter" style={{
                fontSize: "38px",
                textAlign: "center",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                fontFamily: "Adventure",
                userSelect: "none",
            }}>Final Standings</div>
            {historyId && <a className="headerTextRight" style={{
                fontSize: "30px",
                color: "#fff",
                textAlign: "right",
                lineHeight: "59px",
                paddingRight: "20px",
                fontFamily: "Adventure",
                userSelect: "none",
                display: "flex",
                justifyContent: "center"
            }} href={`/history/game/${historyId}`}>
                View Report
            </a>}
        </div>
        <div className="hostRegularBody">
            <a className="again" href={"/host?id=" + gameId}>Play Again</a>
            {standings[0] && <div className="containerOne">
                <Panel className="dino" content={<>
                    <Textfit className="nameTextOne" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{standings[0].n}</Textfit>
                    <Textfit className="scoreTextOne" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{stats[0]}</Textfit>
                    <Blook className="firstBlook" name={standings[0].b} />
                </>} />
                <div className="placeOne">
                    <Textfit className="placeText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5.5vw")}>1</Textfit>
                    <Textfit className="superPlaceText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("2.5vw")}>st</Textfit>
                </div>
            </div>}
            {standings[1] && <div className="containerTwo">
                <Panel className="dino" content={<>
                    <Textfit className="nameTextTwo" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{standings[1].n}</Textfit>
                    <Textfit className="scoreTextTwo" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{stats[1]}</Textfit>
                    <Blook className="secondBlook" name={standings[1].b} />
                </>} />
                <div className="placeTwo">
                    <Textfit className="placeText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5.5vw")}>2</Textfit>
                    <Textfit className="superPlaceText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("2.5vw")}>nd</Textfit>
                </div>
            </div>}
            {standings[2] && <div className="containerThree">
                <Panel className="dino" content={<>
                    <Textfit className="nameTextThree" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{standings[2].n}</Textfit>
                    <Textfit className="scoreTextThree" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{stats[2]}</Textfit>
                    <Blook className="thirdBlook" name={standings[2].b} />
                </>} />
                <div className="placeThree">
                    <Textfit className="placeText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5.5vw")}>3</Textfit>
                    <Textfit className="superPlaceText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("2.5vw")}>rd</Textfit>
                </div>
            </div>}
            {standings[3] && <div className="standingsArray">
                {standings.slice(3, standings.length).map(standing => {
                    return <Panel key={standing.n} className="standingHolder" content={
                        <div className={`standingContainer`}>
                            <div className="standingPlaceText">{standing.place}</div>
                            <div className="standingSuperPlaceText">{getOrdinal(standing.place)}</div>
                            <Blook name={standing.b} className="standingBlook" />
                            <div className="standingNameText">{standing.n}</div>
                            <div className="standingStatText">{stats[standings.indexOf(standing)]}</div>
                            {standing.players && <div className="playerText">{listKeys(standing.players)}</div>}
                        </div>}
                    />
                })}
            </div>}
        </div>
    </div>
}

export function DinoFinal() {
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
                    standings: standings.map(({ b: blook, n: name, p: place, f: fossils }) => ({
                        blook, name, place,
                        fossils: isNaN(fossils) ? 0 : Math.min(Math.round(Number(fossils)), 9223372036854775000),
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
    if (host?.standings?.[0] || state.standings?.[0]) return <div className="body" style={{
        overflowY: state.ready ? "auto" : "hidden",
        backgroundImage: `radial-gradient(rgba(220, 184, 86, 0.4), rgba(220, 184, 86, 0.6)), url(${dino.paperTexture})`
    }}>
        {state.standings.length > 0 && <DinoStandings
            standings={state.standings}
            stats={state.standings.map(e => formatNumber(e.f) + (e.f == 1 ? " Fossil" : " Fossils"))}
            gameId={hostCopy.setId}
            historyId={state.historyId}
            muted={state.muted}
            ready={state.ready}
        />}
    </div>;
}