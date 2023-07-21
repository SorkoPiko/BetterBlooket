import { useState, useRef, useCallback, useEffect } from "react";
import { useGame } from "../../../context/GameContext";
import { audios } from "../../../utils/config";
import { diffObjects, formatBigNumber, formatNumber, getDimensions, getOrdinal, randomFloat, randomInt } from "../../../utils/numbers";
import { useNavigate } from "react-router-dom";
import TopBar from "../topBar";
import { Textfit } from "react-textfit";
import Blook from "../../../blooks/Blook";
import Alert from "../../../components/Alert";
import { NodeGroup } from "react-move";
import { useAuth } from "../../../context/AuthContext";
import Standings from "./Standings";
import Modal from "../../../components/Modal";

export function FishInstruct() {
    const { host: { current: host }, updateHost, liveGameController } = useGame();
    const { current: audio } = useRef(new Audio(audios.fishingFrenzy));
    const [muted, setMuted] = useState(!!host && host.muted);
    const timeout = useRef();
    const navigate = useNavigate();
    const skip = useCallback(() => navigate("/host/fishing"), []);
    const changeMuted = useCallback(() => {
        setMuted(!muted);
        audio.muted = !muted;
        updateHost({ muted: !muted });
    }, [muted]);
    useEffect(() => {
        if (host?.settings) {
            import("./fish.css");
            audio.volume = 0.15;
            audio.play();
            audio.addEventListener("ended", function () {
                audio.currentTime = 0;
                audio.play();
            }, false);
            timeout.current = setTimeout(skip, 24500);
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
    return <div className="instructBody">
        <TopBar left={host.settings.lateJoin ? `ID: ${liveGameController.liveGameCode}` : ""} center="Instructions" muted={muted} changeMuted={changeMuted} />
        <div className="regularBody">
            <div className="container">
                <div className="wave1" style={{ backgroundSize: "100px 320px" }}></div>
                <div className="text n1">Click to Cast Your Line</div>
                <div className="text n2">Click to Reel Once You Hook a Fish</div>
                <div className="text n3">Answer Questions to Reel In The Fish</div>
                <div className="text n4">Watch Out For Catching Some Crazy Things!</div>
                <div className="text n5">
                    {host.settings.mode == "Time"
                        ? `Most total fish weight after ${formatNumber(host.settings.amount)} minute${host.settings.amount == 1 ? "s" : ""} wins!`
                        : `First player to have ${formatNumber(host.settings.amount)} lbs of fish wins!`}
                </div>
                <div className="text n6">Good Luck!</div>
                <div className="wave2" style={{ backgroundSize: "100px 320px" }}></div>
                <div className="wave3" style={{ backgroundSize: "100px 320px" }}></div>
                <div className="wave4" style={{ backgroundSize: "100px 320px" }}></div>
            </div>
        </div>
        <div id="skipButton" onClick={skip}>Skip</div>
    </div>
}

export const lures = [
    'https://blooket.s3.us-east-2.amazonaws.com/images/fishing/lure1.svg',
    'https://blooket.s3.us-east-2.amazonaws.com/images/fishing/lure2.svg',
    'https://blooket.s3.us-east-2.amazonaws.com/images/fishing/lure3.svg',
    'https://blooket.s3.us-east-2.amazonaws.com/images/fishing/lure4.svg',
    'https://blooket.s3.us-east-2.amazonaws.com/images/fishing/lure5.svg',
];

const parties = {
    Crab: { className: 'crab', blookClassName: 'crabDance', num: 4 },
    Jellyfish: { className: 'jellyfish', blookClassName: 'crabDance', num: 4 },
    Frog: { className: 'frog', num: 4 },
    Pufferfish: { className: 'pufferfish', blookClassName: 'crabDance', num: 9 },
    Octopus: { className: 'octopus', num: 7 },
    Narwhal: { className: 'narwhal', blookClassName: 'narwhalDance', num: 9, dontNumber: true },
    Megalodon: { className: 'megalodon', num: 11 },
    Blobfish: { className: 'blobfish', num: 1 },
    'Baby Shark': { className: 'babyShark', num: 9 },
}

export function Party({ fish }) {
    console.log(parties, parties[fish], fish)
    return <div className="wrapper">
        {Array(parties[fish]?.num || 0).fill(parties[fish]).map((party, i) =>
            <Blook key={i} name={fish} className={`${party.className} ${party.className}${i + 1}`} blookClassName={party.blookClassName ? `${party.blookClassName}${party.dontNumber ? "" : (i % 4) + 1}` : null} />
        )}
    </div>
}

export default function FishHost() {
    const { host: { current: host }, liveGameController, updateHost, updateStandings } = useGame();
    const [timer, setTimer] = useState("00:00");
    const [players, setPlayers] = useState([]);
    const [muted, setMuted] = useState(!!host && host.muted);
    const [fish, setFish] = useState([])
    const [party, setParty] = useState("")
    const [isFrenzy, setIsFrenzy] = useState(false);
    const [userToBlock, setUserToBlock] = useState("");
    const fishCounter = useRef(-1);
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
            for (const [name, { b: blook, w: weight = 0, f: fish, s: isSpecial }] of Object.entries(val)) clients.push({ name, blook, weight: weight || 0, fish, isSpecial });
            clients.sort((a, b) => b.weight - a.weight);
            setPlayers(clients);
        });
    }, []);
    const goNext = useCallback(() => {
        let val = players.map((s, i) => ({
            n: s.name,
            b: s.blook,
            w: s.weight,
            p: i + 1
        }));
        updateStandings(val);
        liveGameController.setVal({
            path: "st", val
        }, () => liveGameController.setStage({ stage: "fin" }, () => navigate("/host/fishing/final")));
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
    const { current: audio } = useRef(new Audio(audios.fishingFrenzy));
    const timerInterval = useRef();
    const clientsInterval = useRef();
    const frenzyTimeout = useRef();
    const partyTimeout = useRef();
    const shortFrenzyTimeout = useRef();
    const frenzyRef = useRef(isFrenzy);
    const fishRef = useRef(fish);
    useEffect(() => { frenzyRef.current = isFrenzy }, [isFrenzy]);
    useEffect(() => { fishRef.current = fish }, [fish]);
    useEffect(() => {
        import("./fish.css");
        if (!host?.settings) return navigate("/sets");
        window.liveGameController = liveGameController;
        (async () => {
            audio.muted = muted;
            audio.volume = 0.4;
            audio.play();
            audio.addEventListener("ended", () => {
                audio.currentTime = 0;
                audio.play();
            }, false);
            liveGameController.setStage({ stage: "fish" });
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
                let i = [], distraction = "";
                for (const [client, data] of Object.entries(changed)) if (data.f) {
                    if (data.f.split(" ")[0] == "Lure") i.push({ lure: data.f.split(" ")[1], name: client });
                    else if (data.f == "Frenzy") {
                        if (frenzyRef.current) continue;
                        liveGameController.setVal({ path: "act", val: "Frenzy" });
                        shortFrenzyTimeout.current = setTimeout(() => liveGameController.removeVal("act"), 1000);
                        audio.playbackRate = 2;
                        audio.volume = 0.5;
                        setIsFrenzy(true);
                        clearTimeout(frenzyTimeout.current);
                        frenzyTimeout.current = setTimeout(() => {
                            setIsFrenzy(false);
                            audio.playbackRate = 1;
                            audio.volume = 0.4;
                        }, 20000);
                    } else i.push({ fish: data.f, name: client });
                    if (data.s) {
                        distraction = data.f;
                        liveGameController.removeVal(`c/${client}/s`);
                    }
                    liveGameController.removeVal(`c/${client}/f`);
                }
                lastClients.current = clients;
                if (distraction) {
                    liveGameController.setVal({ path: "act", val: distraction });
                    setParty(p => p || distraction);
                    partyTimeout.current = setTimeout(() => {
                        setParty("");
                        liveGameController.removeVal("act");
                    }, 7100);
                }
                for (const { fish, lure, name } of i) {
                    fishCounter.current += 1;
                    let newFish = {
                        fish, lure,
                        id: fishCounter.current,
                        left: `${randomFloat(41.5, 87.5)}%`,
                        top: `${randomFloat(100, 145)}%`,
                        zIndex: randomInt(2, 5),
                        fisher: name
                    }
                    setTimeout(() => {
                        setFish(f => [...f, newFish]);
                        setTimeout(() => {
                            let copy = JSON.parse(JSON.stringify(fishRef.current));
                            copy.splice(copy.findIndex(fish => fish.id == newFish.id), 1);
                            setFish(copy);
                        }, 3100);
                    }, randomInt(100, 4000));
                }
                for (const client in clients)
                    if (host.settings.mode == "Amount" && clients[client].w >= host.settings.amount) endGame.current = true;
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
            overflow: "hidden"
        }}>
            <TopBar left="Blooket" center={host.settings.mode == "Time" ? timer : `Goal: ${formatNumber(host.settings.amount)} lbs`} right={host.settings.lateJoin ? `ID: ${liveGameController.liveGameCode}` : ""} muted={muted} changeMuted={changeMuted} onRightClick={() => (endGame.current = true, getClients())} />
            <div className="hostRegularBody">
                <div className={`background${isFrenzy ? " frenzyBackground" : ""}`}></div>
                <div className={`wave1${isFrenzy ? " wave1Frenzy" : ""}`} style={{ backgroundSize: "100px 320px" }}></div>
                <div className={`wave2${isFrenzy ? " wave2Frenzy" : ""}`} style={{ backgroundSize: "100px 320px" }}></div>
                <div className={`wave3${isFrenzy ? " wave3Frenzy" : ""}`} style={{ backgroundSize: "100px 320px" }}></div>
                <div className={`wave4${isFrenzy ? " wave4Frenzy" : ""}`} style={{ backgroundSize: "100px 320px" }}></div>
                <NodeGroup data={players} keyAccessor={({ name }) => name}
                    start={(_, place) => ({ x: -60, y: 12.5 * place })}
                    enter={(_, place) => ({ x: [0], y: [12.5 * place], timing: { duration: 1000, ease: e => +e } })}
                    update={(_, place) => ({ x: [0], y: [12.5 * place], timing: { duration: 500, ease: e => +e } })}
                    leave={() => ({ x: [-60], timing: 1000 })}>
                    {(standings) => <div className="fishLeft invisibleScrollbar">
                        {standings.map(({ key, data, state: { x, y } }, i) => {
                            return <div key={key} style={{
                                opacity: userToBlock == data.name ? 0.4 : null,
                                transform: `translate(${x}vw, ${y}vh)`,
                                backgroundColor: isFrenzy ? (i + 1) % 3 == 0 ? "#9b97d6" : (i + 1) % 3 == 1 ? "#9ccfe7" : "#f5a9cb" : null
                            }} onClick={() => setUserToBlock(data.name)} className={`fishStandingContainer`}>
                                <div className="fishStandingInside">
                                    <Textfit className="placeText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("4vw")}>{i + 1}</Textfit>
                                    <div className="superPlaceText">{getOrdinal(i + 1)}</div>
                                    <Blook name={data.blook} className="blookBox"></Blook>
                                    <Textfit className="nameText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("3vw")}>{data.name}</Textfit>
                                    <Textfit className="weightText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("3vw")}>{(data.weight < 1000 ? formatNumber(data.weight) : formatBigNumber(data.weight)) + " lbs"}</Textfit>
                                </div>
                            </div>
                        })}
                    </div>}
                </NodeGroup>
                {fish.map(fish => {
                    return <div key={fish.id} className="jumpingContainer" style={{
                        left: fish.left,
                        top: fish.top,
                        zIndex: fish.zIndex
                    }}>
                        {(console.log(fish), fish.lure)
                            ? <div className="lureUpgrade">
                                <div className="lureUpgradeInside">
                                    <img src={lures[fish.lure]} alt="Lure" className="lureUpgradeImg" />
                                </div>
                            </div>
                            : <Blook name={fish.fish} className="jumpingFish" />}
                        <div className="jumpingText">{fish.fisher}</div>
                    </div>
                })}
            </div>
            {isFrenzy && <div className="frenzyText">Frenzy!</div>}
            {party && <Party fish={party} />}
        </div>
        {userToBlock && <Modal text={`Remove ${userToBlock} from the game?`}
            buttonOne={{ text: "Yes", click: blockUser, color: "#ce1313" }}
            buttonTwo={{ text: "No", click: () => setUserToBlock(""), color: "var(--accent1)" }} />}
    </>
}

export function FishFinal() {
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
                    standings: standings.map(({ b: blook, n: name, p: place, w: weight }) => ({
                        blook, name, place,
                        weight: isNaN(weight) ? 0 : Math.min(Math.round(Number(weight)), 9223372036854775000),
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
    if (host?.standings?.[0] || state.standings?.[0]) return <div className="body" style={{
        overflowY: state.ready ? "auto" : "hidden",
        background: "linear-gradient(to bottom, #9be2fe 0%,#67d1fb 100%)"
    }}>
        {state.standings.length > 0 && <Standings
            standings={state.standings}
            stats={state.standings.map(e => formatNumber(e.w) + " lbs")}
            gameId={hostCopy.setId}
            historyId={state.historyId}
            muted={state.muted}
            theme="fish"
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