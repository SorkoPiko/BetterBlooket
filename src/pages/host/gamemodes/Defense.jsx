import { useState, useRef, useCallback, useEffect } from "react";
import { useGame } from "../../../context/GameContext";
import { audios } from "../../../utils/config";
import { formatBigNumber, formatNumber, getDimensions, getOrdinal, ratedRandom } from "../../../utils/numbers";
import { useNavigate } from "react-router-dom";
import TopBar from "../topBar";
import { Textfit } from "react-textfit";
import Blook from "../../../blooks/Blook";
import { NodeGroup } from "react-move";
import { useAuth } from "../../../context/AuthContext";
import Standings from "./Standings";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { defenseMaps } from "../../../utils/gameModes";
import FlipMove from "react-flip-move";
import { defense } from "../../../utils/images";
import Modal from "../../../components/Modal";

const events = {
    'Question Frenzy': {
        short: 'f',
        color: '#813d8f',
        icon: 'fas fa-check-double',
        desc: 'Answer questions quickly in 20 seconds for extra tokens',
        rate: 0.04,
    },
    Earthquake: {
        short: 'e',
        color: '#805500',
        icon: 'fas fa-mountain',
        desc: 'All of your towers get mixed up',
        rate: 0.02,
    },
    'Tax Time': {
        short: 't',
        color: '#e6e600',
        blook: 'Toucan',
        desc: 'Lose half of your Upgrade Tokens',
        rate: 0.05,
    },
    'Alien Invasion': {
        short: 'a',
        color: '#a64dff',
        icon: 'fas fa-space-shuttle',
        desc: 'Lose one random tower',
        rate: 0.06,
    },
    'A Little Help': {
        short: 'h',
        color: '#0088cc',
        icon: 'fas fa-user-astronaut',
        desc: 'Get one random tower',
        rate: 0.11,
    },
    'Bonus Question': {
        short: 'q',
        color: '#e57e25',
        icon: 'fas fa-check',
        desc: 'Answer the question correctly for 3 Upgrade Tokens',
        rate: 0.1,
    },
    Chance: {
        short: 'c',
        color: '#404040',
        icon: 'fas fa-dice',
        desc: 'Do you want to take a risk?',
        rate: 0.06,
    },
    Freeze: {
        short: 'z',
        color: '#64bee8',
        icon: 'far fa-snowflake',
        desc: "You're Frozen! Answer 3 questions correctly to continue",
        rate: 0.03,
    },
    'Annoying Ducks': {
        short: 'u',
        color: '#ffcd05',
        blook: 'Duck',
        desc: '3 Ducks fill up spots on your board',
        rate: 0.11,
    },
    "King's Request": {
        short: 'k',
        color: '#bd0f26',
        blook: 'King',
        desc: 'Answer 2 questions correctly to double your damage',
        rate: 0.04,
    },
    Boom: {
        short: 'o',
        color: '#ff3300',
        icon: 'fas fa-bomb',
        desc: 'Clear all enemies on the screen',
        rate: 0.1,
    },
    'Double Damage': {
        short: 'm',
        color: '#4d79ff',
        icon: 'fas fa-splotch',
        desc: 'Towers deal double damage for the next 30 seconds',
        rate: 0.18,
    },
    'Difficulty Increase': {
        short: 'd',
        color: '#a0302c',
        icon: 'fas fa-angle-double-up',
        desc: 'Skip the next 3 rounds',
        rate: 0.06,
    },
    Reinforcements: {
        short: 'r',
        color: '#61cbee',
        blook: 'Goldfish',
        desc: 'Spawn 5 fish friends at the start of next round',
        rate: 0.04,
    },
    'Final Boss': {
        short: 'b',
        color: '#3a3a3a',
        icon: 'fas fa-skull',
        desc: 'A terrible enemy approaches next round',
        rate: 0,
    },
}

const eventNames = {
    f: 'Question Frenzy',
    e: 'Earthquake',
    t: 'Tax Time',
    a: 'Alien Invasion',
    h: 'A Little Help',
    q: 'Bonus Question',
    c: 'Chance',
    z: 'Freeze',
    u: 'Annoying Ducks',
    k: "King's Request",
    o: 'Boom',
    m: 'Double Damage',
    d: 'Difficulty Increase',
    r: 'Reinforcements',
    b: 'Final Boss',
}

const placeTiles = ["https://media.blooket.com/image/upload/v1593095356/Media/defense/goldTile.svg", "https://media.blooket.com/image/upload/v1593095359/Media/defense/silverTile.svg", "https://media.blooket.com/image/upload/v1593095363/Media/defense/bronzeTile.svg"];

export default function DefenseHost() {
    const { host: { current: host }, liveGameController, updateHost, updateStandings } = useGame();
    const [timer, setTimer] = useState("00:00");
    const [players, setPlayers] = useState([]);
    const [event, setEvent] = useState({});
    const [muted, setMuted] = useState(!!host && host.muted);
    const [userToBlock, setUserToBlock] = useState("");
    const dbRef = useRef();
    const lastClients = useRef({});
    const navigate = useNavigate();
    const endGame = useRef(false);
    const getClients = useCallback(() => {
        try { window.dispatchEvent(new Event('resize')); } catch (e) { console.error(e) } // Fix React-Textfit not sizing right
        liveGameController.getDatabaseVal("c", snapshot => {
            const val = snapshot || {};
            if (!val || Object.keys(val).length == 0) return setPlayers([]);
            let clients = [];
            for (const [name, { b: blook, d: dmg = 0 }] of Object.entries(val)) clients.push({ name, blook, dmg });
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
        }, () => liveGameController.setStage({ stage: "fin" }, () => navigate("/host/defense/final")));
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
    const { current: audio } = useRef(new Audio(audios.towerDefense));
    const timerInterval = useRef();
    const eventInterval = useRef();
    const eventTimeout = useRef();
    useEffect(() => {
        import("./defense.css");
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
            liveGameController.setStage({ stage: "def" });
            getClients();
            if (host.settings.mode == "Time") {
                let seconds = 60 * host.settings.amount;
                setTimer(`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`);
                timerInterval.current = setInterval(() => {
                    seconds--;
                    setTimer(`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`);
                    getClients();
                    if (seconds == 40 && host.settings.amount > 1) {
                        clearTimeout(eventInterval.current);
                        let event = events["Final Boss"];
                        liveGameController.setVal({ path: "ev", val: event.short }, function () {
                            setEvent(event);
                            eventTimeout.current = setTimeout(() => {
                                setEvent({});
                                liveGameController.setVal({ path: "ev", val: "" });
                            }, 6000)
                        });
                    }
                    if (seconds <= 0) {
                        clearInterval(timerInterval.current);
                        endGame.current = true;
                    }
                }, 1000);
            } else timerInterval.current = setInterval(getClients, 1000);
            let count = 40;
            eventInterval.current = setInterval(() => {
                if ((timer && timer.length < 3) || (count--, players.length == 0 || count <= 0)) return clearInterval(timerInterval.current);
                if (!muted) new Audio(audios.defenseEvent).play();
                const [event] = ratedRandom(Object.values(events), 1);
                liveGameController.setVal({ path: "ev", val: event.short }, function () {
                    setEvent(event);
                    eventTimeout.current = setTimeout(function () {
                        setEvent({});
                        liveGameController.setVal({ path: "ev", val: "" });
                    }, 6000);
                });
            }, 90000);
            dbRef.current = await liveGameController.getDatabaseRef("c");
            dbRef.current.on("value", function (snapshot) {
                const clients = snapshot.val() || {};
                lastClients.current = clients;
                let total = 0;
                for (const client in clients) {
                    total += parseInt("0" + clients[client].d);
                    if (host.settings.mode == "Amount" && clients[client].d >= host.settings.amount) endGame.current = true;
                }
            });
        })();
        return () => {
            clearInterval(timerInterval.current);
            clearInterval(eventInterval.current);
            clearInterval(eventTimeout.current);
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
    const init = useCallback(async engine => {
        console.log(engine);
        await loadFull(engine);
    }, []);
    if (!host?.settings) return navigate("/sets");
    let t = (() => {
        for (var t = getDimensions("100vw") - 80, n = getDimensions("100vh") - 65 - 80, r = t / n, o = Math.sqrt(players.length * r), a = Math.ceil(players.length / o), s = Math.ceil(players.length / a); a * r < s;) a += 1, s = Math.ceil(players.length / a);
        for (var i = n / a, c = Math.ceil(o), l = Math.ceil(players.length / c); c < l * r;) c += 1, l = Math.ceil(players.length / c);
        return Math.max(i, t / c, 80)
    })();
    return <>
        <div className="body" style={{
            overflow: "hidden"
        }}>
            <TopBar left="Blooket" center={host.settings.mode == "Time" ? timer : `Goal: ${formatNumber(host.settings.amount)}`} right={host.settings.lateJoin ? `ID: ${liveGameController.liveGameCode}` : ""} muted={muted} changeMuted={changeMuted} onRightClick={() => (endGame.current = true, getClients())} />
            <div className="hostRegularBody">
                <Particles init={init} height="calc(100vh - 59px)" width="100vw" style={{ padding: 0, margin: 0 }} className="tdParticles" params={{
                    particles: {
                        number: { value: 40 },
                        color: {
                            value: defenseMaps[host.settings.map].particleColor
                        },
                        shape: {
                            type: "triangle",
                            stroke: { width: 0 }
                        },
                        opacity: {
                            value: .7,
                            random: !1
                        },
                        size: {
                            value: 25,
                            random: !1
                        },
                        move: {
                            enable: !0,
                            speed: 2,
                            direction: "none",
                            random: !1,
                            straight: !1,
                            out_mode: "out",
                            bounce: !1
                        }
                    }
                }} />
                <FlipMove className="playersContainer" duration={1000} style={{
                    height: "calc(100vh - 145px)",
                    width: "calc(100vw - 80px)",
                    position: "absolute"
                }}>{players.map((player, place) => {
                    return <div key={player.name} style={{
                        height: t - 8,
                        width: t - 8,
                        backgroundImage: place < 3 ? `url(${placeTiles[place]})` : `url(${defenseMaps[host.settings.map].tile})`,
                        backgroundSize: t - 8
                    }} className="playerBox" onClick={() => setUserToBlock(player.namme)}>
                        <Blook name={player.blook} className="blookBox" />
                        <Textfit className="placeText" mode="single" forceSingleModeWidth={false}>{place + 1}</Textfit>
                        <Textfit className="superPlaceText" mode="single" forceSingleModeWidth={false}>{getOrdinal(place + 1)}</Textfit>
                        <Textfit className="nameText" mode="single" forceSingleModeWidth={false}>{player.name}</Textfit>
                        <div className="dmgContainer">
                            <Textfit className="dmgText" mode="single" forceSingleModeWidth={false} style={{ width: `${Math.min(90, 7 * player.dmg.toString().length)}%` }}>{formatNumber(player.dmg)}</Textfit>
                            <i className="dmgIcon fas fa-splotch" style={{ fontSize: t / 12 }}></i>
                        </div>
                    </div>
                })}</FlipMove>
                {event?.short && <DefenseEvent icon={event.icon} blook={event.blook} color={event.color} name={eventNames[event.short]} desc={event.desc} />}
            </div>
        </div>
        {userToBlock && <Modal text={`Remove ${userToBlock} from the game?`}
            buttonOne={{ text: "Yes", click: blockUser, color: "#ce1313" }}
            buttonTwo={{ text: "No", click: () => setUserToBlock(""), color: "var(--accent1)" }} />}
    </>
}

export function DefenseEvent({ icon, blook, color, name, desc, onYes, yesText, onNo, noLeave }) {
    return <div className={`container${noLeave ? " noLeave" : ""}`} style={{ backgroundColor: color }}>
        {blook
            ? <Blook name={blook} className="tdEventBlook" />
            : <i className={`${icon} tdEventIcon`} style={{ color }} />}
        <div className="tdEventName">{name}</div>
        <div className="tdEventDesc">{desc}</div>
        {(onYes || onNo) && <div className="tdEventButtonContainer">
            {onYes && <div className="tdEventButton" onClick={onYes}>{yesText || "Yes"}</div>}
            {onNo && <div className="tdEventButton" onClick={onNo}>{"No"}</div>}
        </div>}
    </div>
}

export function DefenseFinal() {
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
                    standings: standings.map(({ b: blook, n: name, p: place, d: dmg }) => ({
                        blook, name, place,
                        dmg: isNaN(dmg) ? 0 : Math.min(Math.round(Number(dmg)), 9223372036854775000),
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
    if (host?.standings?.[0] || state.standings?.[0]) return <div className="body tdBackground" style={{
        overflowY: state.ready ? "auto" : "hidden",
        backgroundSize: 100,
        backgroundImage: `url(${defense.grassTile})`
    }}>
        {state.standings.length > 0 && <Standings
            standings={state.standings}
            stats={state.standings.map(e => formatNumber(e.d) + " Damage")}
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