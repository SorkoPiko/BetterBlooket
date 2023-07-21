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
import { factoryGlitches, factoryJokes } from "../../../utils/gameModes";
import { shuffleArray, random } from "../../../utils/questions";
import { factory } from "../../../utils/images";
import Modal from "../../../components/Modal";

const glitches = {
    names: {
        lb: 'Lunch Break',
        as: 'Ad Spam',
        e37: 'Error 37',
        nt: 'Night Time',
        lo: '#LOL',
        j: 'Jokester',
        sm: 'Slow Mo',
        dp: 'Dance Party',
        v: 'Vortex',
        r: 'Reverse',
        f: 'Flip',
        m: 'Micro',
    },
    keys: {
        'Lunch Break': 'lb',
        'Ad Spam': 'as',
        'Error 37': 'e37',
        'Night Time': 'nt',
        '#LOL': 'lo',
        Jokester: 'j',
        'Slow Mo': 'sm',
        'Dance Party': 'dp',
        Vortex: 'v',
        Reverse: 'r',
        Flip: 'f',
        Micro: 'm',
    }
}

const errorColors = ["#FF00FF", "#FF6600", "#FFFF00", "#00FFFF", "#FF0000", "#00FF00"];

function FactoryAd({ top, left, blook, msg, onClick, night, hazard }) {
    return <div className="container" style={{
        top, left, backgroundColor: night ? "#000" : hazard[0] ? hazard[1] : null,
        color: night ? "#fff" : null
    }} onClick={onClick}>
        <div className="close">X</div>
        <Blook name={blook} className="adBlook" />
        <div className="adMsg">{msg}</div>
    </div>
}

function FactoryAds({ ads, onClick, night, hazards }) {
    return <div>
        {ads[0] && <FactoryAd top="30%" left="20%" onClick={() => onClick(0)}
            blook="Chicken" msg="$0.99 Scrambled Eggs" night={night} hazard={[hazards[0], hazards[1]]} />}
        {ads[1] && <FactoryAd top="60%" left="80%" onClick={() => onClick(1)}
            blook="Cow" msg="50% Off Soy Milk" night={night} hazard={[hazards[0], hazards[2]]} />}
        {ads[2] && <FactoryAd top="30%" left="80%" onClick={() => onClick(2)}
            blook="Goat" msg="Red Goat Gives You Wings" night={night} hazard={[hazards[0], hazards[3]]} />}
        {ads[3] && <FactoryAd top="80%" left="50%" onClick={() => onClick(3)}
            blook="Duck" msg="QUACK AH DOODLE DO" night={night} hazard={[hazards[0], hazards[4]]} />}
        {ads[4] && <FactoryAd top="25%" left="40%" onClick={() => onClick(4)}
            blook="Baby Penguin" msg="$89 Hanglider Rides" night={night} hazard={[hazards[0], hazards[5]]} />}
        {ads[5] && <FactoryAd top="50%" left="50%" onClick={() => onClick(5)}
            blook="Toucan" msg="Toucan Play At This Game" night={night} hazard={[hazards[0], hazards[1]]} />}
        {ads[6] && <FactoryAd top="60%" left="20%" onClick={() => onClick(6)}
            blook="Owl" msg="Mixtape Dropping Next Week" night={night} hazard={[hazards[0], hazards[2]]} />}
        {ads[7] && <FactoryAd top="80%" left="80%" onClick={() => onClick(7)}
            blook="Dragon" msg="Marty's Fireplace SALE" night={night} hazard={[hazards[0], hazards[3]]} />}
        {ads[8] && <FactoryAd top="40%" left="40%" onClick={() => onClick(8)}
            blook="Rabbit" msg="$799 - Max Hops Series 9" night={night} hazard={[hazards[0], hazards[4]]} />}
        {ads[9] && <FactoryAd top="80%" left="20%" onClick={() => onClick(9)}
            blook="Witch" msg="Spells & Potions Galore" night={night} hazard={[hazards[0], hazards[5]]} />}
    </div>
}

function Lol() {
    return <div>
        <div className="glitch1">#LOL</div>
        <div className="glitch2">#TacoTuesday</div>
        <div className="glitch3">#SELFIE</div>
        <div className="glitch4">#StudiousSeason</div>
        <div className="glitch5">#NobodyCares</div>
        <div className="glitch6">#HastagsAreFakeWaffles</div>
        <div className="glitch7">#NotTheNumberSymbol</div>
        <div className="glitch8">#TGIF...Maybe</div>
        <div className="glitch9">#STOPPPPPPPP</div>
        <div className="glitch10">#WhoDidThis?</div>
    </div>
}

function Joke() {
    const interval = useRef();
    const timeout = useRef();
    const { current: [topText, bottomText] } = useRef(random(factoryJokes));
    const [topProgress, setTopProgress] = useState("");
    const [bottomProgress, setBottomProgress] = useState("");
    useEffect(() => {
        let progress = 0;
        interval.current = setInterval(() => {
            progress++;
            setTopProgress(topText.substring(0, progress));
            if (progress !== topText.length) return;
            clearInterval(interval.current);
            timeout.current = setTimeout(() => {
                let progress2 = 0;
                interval.current = setInterval(() => {
                    progress2++;
                    setBottomProgress(bottomText.substring(0, progress2));
                    if (progress2 == bottomText.length) clearInterval(interval.current);
                }, 1000 / bottomText.length);
            }, 2000);
        }, 2000 / topText.length);
        return () => {
            clearInterval(interval.current);
            clearTimeout(timeout.current);
        }
    }, []);
    return <div className="jokeContainer">
        {topProgress && <div className="jokeText">{topProgress}</div>}
        {bottomProgress && <div className="jokeText" style={{ marginTop: 70 }}>{bottomProgress}</div>}
    </div>
}

function Slow({ night }) {
    return <div className="slow" style={{
        color: night ? "#fff" : null,
        textShadow: night ? "2px 2px 8px #fff" : null
    }}>Slow Mo</div>
}

function Dance({ name, blook }) {
    return <div className="danceBackground">
        <div className="danceText">{name}'s<br />Dance Party!!!</div>
        <div className="dancing">
            <Blook name={blook} className="danceBlook" />
            <div className="danceShadow"></div>
        </div>
    </div>
}

export default function FactoryHost() {
    const { host: { current: host }, liveGameController, updateHost, updateStandings } = useGame();
    const [timer, setTimer] = useState("00:00");
    const [players, setPlayers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [totalCash, setTotalCash] = useState(0);
    const [glitch, setGlitch] = useState({
        glitch: "",
        name: "",
        blook: "",
        ads: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        hazards: ["", "", "", "", ""],
        lunch: false,
        lol: false,
        joke: false,
        slow: false,
        dance: false,
        color: "",
    });
    const [muted, setMuted] = useState(!!host && host.muted);
    const [userToBlock, setUserToBlock] = useState("");
    const dbRef = useRef();
    const dbRefAction = useRef();
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
        }, () => liveGameController.setStage({ stage: "fin" }, () => navigate("/host/factory/final")));
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
    const addAlert = useCallback((name, blook, msg, endBlook, info) => {
        setAlerts(a => a.find(e => e.name + e.msg == name + msg) ? a : [...a, { name, blook, msg, endBlook, info }])
    }, []);
    const { current: audio } = useRef(new Audio(audios.factory));
    const { current: danceAudio } = useRef(new Audio(audios.factory));
    const timerInterval = useRef();
    const { current: glitchTimeouts } = useRef({});
    const glitchEffects = useRef([]);
    useEffect(() => {
        for (const effect of glitchEffects.current) if (!effect.ran) {
            effect();
            effect.ran = true;
        }
        glitchEffects.current = glitchEffects.current.filter(x => !x.ran);
    }, [glitch]);
    useEffect(() => {
        import("./factory.css");
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
            liveGameController.setStage({ stage: "fact" });
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
            dbRefAction.current = await liveGameController.getDatabaseRef("act");
            dbRefAction.current.on("value", snapshot => {
                const action = snapshot.val();
                if (!action) return;
                if (action.g) {
                    const glitchData = factoryGlitches.find(x => x.name == glitches.names[action.g]);
                    switch (glitchData.name) {
                        case "Lunch Break":
                            clearTimeout(glitchTimeouts.lunchTimeout);
                            setGlitch(g => ({ ...g, lunch: false }));
                            glitchEffects.current.push(function () {
                                setGlitch(g => ({ ...g, lunch: true }));
                                glitchTimeouts.lunchTimeout = setTimeout(function () {
                                    setGlitch(g => ({ ...g, lunch: false }));
                                }, glitchData.time);
                            });
                            break;
                        case "Ad Spam": {
                            clearTimeout(glitchTimeouts.adTimeout);
                            setGlitch(g => ({ ...g, ads: g.ads.fill(0) }));
                            let i = 0;
                            glitchTimeouts.adTimeout = setTimeout(function newAd() {
                                setGlitch(g => ({ ...g, ads: [...(g.ads[i] = 1, g.ads)] }));
                                if ((i += 1) < glitch.ads.length) glitchTimeouts.adTimeout = setTimeout(newAd, 800);
                                else glitchTimeouts.adTimeout = setTimeout(() => {
                                    setGlitch(g => ({ ...g, ads: [...g.ads].fill(0) }))
                                }, glitchData.time - 8000)
                            }, 800);
                            break;
                        }
                        case "Error 37":
                            clearInterval(glitchTimeouts.hazardInterval);
                            clearTimeout(glitchTimeouts.nightTimeout)
                            let i = 3, shuffleColors = () => setGlitch(g => ({ ...g, color: "error", hazards: shuffleArray(errorColors).slice(0, 5) }));
                            shuffleColors();
                            glitchTimeouts.hazardInterval = setTimeout(function () {
                                shuffleColors();
                                if (i > 0) return i--;
                                clearInterval(glitchTimeouts.hazardInterval);
                                setGlitch(g => ({ ...g, color: "" }));
                            }, 3250);
                            break;
                        case "Night Time":
                            clearInterval(glitchTimeouts.hazardInterval);
                            clearTimeout(glitchTimeouts.nightTimeout);
                            setGlitch(g => ({ ...g, color: "night" }));
                            glitchTimeouts.nightTimeout = setTimeout(function () {
                                setGlitch(g => ({ ...g, color: "" }));
                            }, glitchData.time);
                            break;
                        case "#LOL":
                            clearTimeout(glitchTimeouts.lolTimeout);
                            setGlitch(g => ({ ...g, lol: false }));
                            glitchEffects.current.push(function () {
                                setGlitch(g => ({ ...g, lol: true }));
                                glitchTimeouts.lolTimeout = setTimeout(function () {
                                    setGlitch(g => ({ ...g, lol: false }));
                                }, glitchData.time);
                            });
                            break;
                        case "Jokester":
                            clearTimeout(glitchTimeouts.jokeTimeout);
                            setGlitch(g => ({ ...g, joke: false }));
                            glitchEffects.current.push(function () {
                                setGlitch(g => ({ ...g, joke: true }));
                                glitchTimeouts.jokeTimeout = setTimeout(function () {
                                    setGlitch(g => ({ ...g, joke: false }));
                                }, glitchData.time);
                            });
                            break;
                        case "Slow Mo":
                            clearTimeout(glitchTimeouts.slowTimeout);
                            setGlitch(g => ({ ...g, slow: false }));
                            glitchEffects.current.push(function () {
                                setGlitch(g => ({ ...g, slow: true }));
                                glitchTimeouts.slowTimeout = setTimeout(function () {
                                    setGlitch(g => ({ ...g, slow: false }));
                                }, glitchData.time);
                            });
                            break;
                        case "Dance Party":
                            clearTimeout(glitchTimeouts.danceTimeout);
                            setGlitch(g => ({ ...g, dance: false }));
                            glitchEffects.current.push(function () {
                                setGlitch(g => ({ ...g, dance: true }));
                                audio.pause();
                                danceAudio.currentTime = 0;
                                danceAudio.play();
                                glitchTimeouts.danceTimeout = setTimeout(function () {
                                    setGlitch(g => ({ ...g, dance: false }));
                                    danceAudio.pause();
                                    audio.play();
                                }, glitchData.time);
                            });
                            break;
                        default:
                            clearTimeout(glitchTimeouts.glitchTimeout);
                            setGlitch(g => ({ ...g, glitch: "" }));
                            glitchEffects.current.push(function () {
                                setGlitch(g => ({ ...g, glitch: glitchData.name }));
                                glitchTimeouts.glitchTimeout = setTimeout(function () {
                                    setGlitch(g => ({ ...g, glitch: "" }));
                                }, glitchData.time);
                            });
                            break;
                    }
                    setGlitch(g => ({ ...g, name: action.n, blook: action.b }));
                    addAlert(action.n, action.b, `activated the ${glitchData.name} glitch!`, "", [glitchData.icon, glitchData.color])
                } else if (action.s) {
                    const [synergy, level] = action.s.split("-");
                    addAlert(action.n, action.b, `has a ${synergy} ${level} synergy`);
                } else if (action.t) addAlert(action.n, action.b, "now has 10 Blooks!");
            });
            dbRef.current = await liveGameController.getDatabaseRef("c");
            dbRef.current.on("value", function (snapshot) {
                const clients = snapshot.val() || {};
                const changed = diffObjects(lastClients.current, clients) || {};
                for (const [client, data] of Object.entries(changed)) {
                    if (data.tat) {
                        liveGameController.setVal({
                            path: `act`,
                            val: {
                                n: client,
                                b: clients[client].b,
                                g: data.tat
                            }
                        });
                        liveGameController.removeVal(`c/${client}/tat`);
                    }
                    if (data.s) {
                        let [synergy, level] = data.s.split("-");
                        addAlert(action.n, action.b, `has a ${synergy} ${level} synergy`);
                        liveGameController.removeVal(`c/${client}/s`);
                    }
                }
                lastClients.current = clients;
                let total = 0;
                for (const client in clients) {
                    total += parseInt("0" + clients[client].ca);
                    if (host.settings.mode == "Amount" && clients[client].ca >= host.settings.amount) endGame.current = true;
                }
                setTotalCash(total);
            });
        })();
        return () => {
            clearInterval(timerInterval.current);
            for (let timeout in glitchTimeouts) {
                clearTimeout(glitchTimeouts[timeout]);
                clearInterval(glitchTimeouts[timeout]);
            }
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
    const glitchColor = useCallback((i = 0) => {
        if (glitch.color == "night") return "#000";
        else if (glitch.color == "error") return glitch.hazards[i];
    }, [glitch]);
    return <>
        <div className="body" style={{
            overflow: "hidden",
            backgroundColor: glitchColor(0) || "#2d313d"
        }}>
            <div className={"Vortex" === glitch.glitch ? "factorySpin" : "Reverse" === glitch.glitch ? "factoryReverse" : "Flip" === glitch.glitch ? "factoryFlip" : "Micro" === glitch.glitch ? "factoryMicro" : null}>
                <TopBar left="Blooket" center={host.settings.mode == "Time" ? timer : `Goal: $${formatNumber(host.settings.amount)}`} right={host.settings.lateJoin ? `ID: ${liveGameController.liveGameCode}` : ""} muted={muted} changeMuted={changeMuted} onRightClick={() => (endGame.current = true, getClients())} color={glitchColor(1)} />
                <div className="hostRegularBody">
                    <NodeGroup data={players} keyAccessor={({ name }) => name}
                        start={(_, place) => ({ x: -60, y: 11.5 * place })}
                        enter={(_, place) => ({ x: [0], y: [11.5 * place], timing: { duration: 1000, ease: e => +e } })}
                        update={(_, place) => ({ x: [0], y: [11.5 * place], timing: { duration: 500, ease: e => +e } })}
                        leave={() => ({ x: [-60], timing: 1000 })}>
                        {(standings) => <div className="factoryLeft invisibleScrollbar">
                            {standings.map(({ key, data, state: { x, y } }, i) => {
                                return <div key={key} style={{
                                    opacity: userToBlock == data.name ? 0.4 : null,
                                    transform: `translate(${x}vw, ${y}vh)`,
                                    backgroundColor: glitchColor(2),
                                    color: glitch.color == "night" ? "#fff" : null
                                }} onClick={() => setUserToBlock(data.name)} className={`factoryStandingContainer`}>
                                    <Textfit className="placeText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5vw")}>{i + 1}</Textfit>
                                    <div className="superPlaceText">{getOrdinal(i + 1)}</div>
                                    <Blook name={data.blook} className="blookBox"></Blook>
                                    <Textfit className="nameText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("4vw")}>{data.name}</Textfit>
                                    <Textfit className="cashText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5vw")}>${formatBigNumber(data.cash)}</Textfit>
                                </div>
                            })}
                        </div>}
                    </NodeGroup>
                    <div className="factoryChatroom invisibleScrollbar" style={{ backgroundColor: glitchColor(3), color: glitch.color == "night" ? "#fff" : null }}>
                        {alerts.length
                            ? alerts.map((alert, i) => <Alert key={`alert${i}`} name={alert.name} blook={alert.blook} message={alert.msg} glitchInfo={alert.info} night={glitch.color == "night"} endBlook={alert.endBlook} />)
                            : <div className="noAlerts">
                                <i className="noAlertsIcon fa-regular fa-clock" />
                                <div className="noAlertsText">Waiting For Action...</div>
                            </div>}
                    </div>
                    <Textfit className="totalCashText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("7vw")} style={{ backgroundColor: glitchColor(4), color: glitch.color == "night" ? "#fff" : null }}>
                        ${formatNumber(totalCash)}
                    </Textfit>
                </div>
                {glitch.lunch && <div className="modal burgerContainer">
                    <img src={factory.burgerIcon1} alt="Hamburger" className="burgerImg" />
                    <div className="burgerText">Lunch Break</div>
                </div>}
                {glitch.ads.some(x => x > 0) && <FactoryAds ads={glitch.ads} onClick={() => { }} night={glitch.color == "night"} hazards={[glitch.color == "error", ...glitch.hazards]} />}
                {glitch.lol && <Lol />}
                {glitch.joke && <Joke />}
                {glitch.slow && <Slow night={glitch.color == "night"} />}
                {glitch.dance && <Dance name={glitch.name} blook={glitch.blook} />}
            </div>
        </div>
        {userToBlock && <Modal text={`Remove ${userToBlock} from the game?`}
            buttonOne={{ text: "Yes", click: blockUser, color: "#ce1313" }}
            buttonTwo={{ text: "No", click: () => setUserToBlock(""), color: "var(--accent1)" }} />}
    </>
}

export function FactoryFinal() {
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
    if (host?.standings?.[0] || state.standings?.[0]) return <div className="body factoryBackground" style={{
        overflowY: state.ready ? "auto" : "hidden",
        backgroundColor: "#2d313d"
    }}>
        {state.standings.length > 0 && <Standings
            standings={state.standings}
            stats={state.standings.map(e => "$" + formatNumber(e.c))}
            gameId={hostCopy.setId}
            historyId={state.historyId}
            muted={state.muted}
            theme="factory"
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