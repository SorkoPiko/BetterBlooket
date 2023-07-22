import { useState, useRef, useCallback, useEffect } from "react";
import { useGame } from "../../../context/GameContext";
import { audios } from "../../../utils/config";
import { diffObjects, formatNumber, randomFloat, randomInt } from "../../../utils/numbers";
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar.jsx";
import { useAuth } from "../../../context/AuthContext";
import Standings from "./Standings";
import Modal from "../../../components/Modal";
import FlipMove from "react-flip-move";
import Sketch from "react-p5";
import allBlooks from "../../../blooks/allBlooks";
import { rushBoxes } from "../../../utils/gameModes";
import { basic } from "../../../utils/images";

export function RushInstruct() {
    const { host: { current: host }, updateHost } = useGame();
    const { current: audio } = useRef(new Audio(audios.blookRush));
    const [muted, setMuted] = useState(!!host && host.muted);
    const timeout = useRef();
    const navigate = useNavigate();
    const skip = useCallback(() => navigate("/host/rush"), []);
    const changeMuted = useCallback(() => {
        setMuted(!muted);
        audio.muted = !muted;
        updateHost({ muted: !muted });
    }, [muted]);
    useEffect(() => {
        if (host?.settings) {
            import("./rush.css");
            audio.volume = 0.15;
            audio.play();
            audio.addEventListener("ended", function () {
                audio.currentTime = 0;
                audio.play();
            }, false);
            timeout.current = setTimeout(skip, 22500);
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
        <TopBar center="Instructions" muted={muted} changeMuted={changeMuted} />
        <div className="regularBody">
            <div className="instructContainer">
                <div className="text n1">
                    <div className="textInside">The goal is to collect as many Blooks as you can</div>
                </div>
                <div className="text n2">
                    <div className="textInside">After answering correctly, you can either Attack or Defend</div>
                </div>
                <div className="text n3">
                    <div className="textInside">Defending will increase your shields by 1</div>
                </div>
                <div className="text n4">
                    <div className="textInside">Attacking will reduce enemy shields by 1</div>
                </div>
                <div className="text n5">
                    <div className="textInside">If they have no shields, you'll take one of their Blooks</div>
                </div>
                <div className="text n6">
                    <div className="textInside">Most Blooks after {formatNumber(host.settings.amount)} minute{host.settings.amount == 1 ? "" : "s"} wins!</div>
                </div>
                <div className="text n7">
                    <div className="textInside">Good Luck!</div>
                </div>
            </div>
        </div>
        <div id="skipButton" onClick={skip}>Skip</div>
    </div>
}

class RushBlook {
    constructor(offsetWidth, offsetHeight, blook, p5) {
        this.p5 = p5;
        this.pos = p5.createVector(
            randomFloat(0.22 * offsetWidth, 0.75 * offsetWidth),
            randomFloat(0.22 * offsetHeight, 0.75 * offsetHeight)
        );
        this.vel = p5.createVector(0, 0);
        this.img = p5.loadImage(allBlooks[blook].mediaUrl);
        this.speed = randomFloat(1, 3);
        this.onCreate(offsetWidth, offsetHeight);
    }
    draw(width) {
        this.p5.push();
        this.p5.translate(this.pos.x, this.pos.y);
        this.p5.imageMode(this.p5.CENTER);
        this.p5.image(this.img, 0, 0, width, 1.15 * width);
        this.p5.imageMode(this.p5.CENTER);
        this.p5.pop();
    }
    pxSpeed(width) {
        return (this.speed * width) / (this.p5.frameRate() > 5 ? this.p5.frameRate() : 30);
    }
    update(canvasWidth, canvasHeight) {
        const width = Math.max(canvasWidth / 5, 30),
            halfWidth = width / 2,
            halfHeight = (1.15 * width) / 2;
        if (this.pos.x - halfWidth < 0) this.vel.x = Math.abs(this.vel.x);
        if (this.pos.x + halfWidth > canvasWidth) this.vel.x = -Math.abs(this.vel.x);
        if (this.pos.y - halfHeight < 0) this.vel.y = Math.abs(this.vel.y);
        if (this.pos.y + halfHeight > canvasHeight) this.vel.y = -Math.abs(this.vel.y);
        const speed = this.pxSpeed(width),
            velocity = this.vel.normalize();
        this.vel = this.p5.createVector(velocity.x * speed, velocity.y * speed);
        this.pos.add(this.vel);
        this.draw(width);
    }
    onCreate(width, height) {
        let x = 0, y = randomFloat(0, height);
        if (randomInt(0, 2) == 0) {
            x = randomFloat(0, width);
            y = 0;
        }
        this.vel = this.p5
            .createVector(x, y)
            .sub(this.pos)
            .normalize()
            .mult(this.speed);
    }
}

function RushBox({ name, blook, numBlooks, numDefense, bigBox, letMove, onClick }) {
    const p5Ref = useRef();
    const canvasParentRef = useRef();
    const blooks = useRef([]);
    let pack = rushBoxes[allBlooks[blook]?.realSet || allBlooks[blook]?.set] || rushBoxes.Classic;
    return <div className={`wrapper${bigBox ? " bigBox" : ""}${!letMove && onClick ? " hoverButton" : ""}`} style={{ backgroundColor: pack.base }} onClick={onClick}>
        <div className="fenceContainer" style={{ backgroundColor: pack.fence }}>
            <div className={`topWall${bigBox ? " bigTopWall" : ""}`} style={{ backgroundColor: pack.top }}></div>
            <div className={`container${bigBox ? " bigContainer" : ""}`} style={{
                backgroundColor: pack.inside,
                backgroundImage: pack.insideImg,
                backgroundSize: pack.imgSize,
                backgroundPosition: pack.imgPosition
            }}>
                <div className="sketchWrapper"><Sketch setup={(p5, canvasParent) => {
                    if (!canvasParent) return;
                    p5Ref.current = p5;
                    canvasParentRef.current = canvasParent;
                    canvasParentRef.current.className = "sketchHolder";
                    const canvas = p5.createCanvas(canvasParent.offsetWidth, canvasParent.offsetHeight);
                    canvas.canvas.className = "sketchCanvas";
                    canvas.parent(canvasParent);
                    p5.frameRate(40);
                }} draw={(p5) => {
                    for (p5.clear(); blooks.current.length < numBlooks;) blooks.current.push(new RushBlook(canvasParentRef.current.offsetWidth, canvasParentRef.current.offsetHeight, blook, p5));
                    for (; blooks.current.length > numBlooks;) blooks.current.pop();
                    for (let i = blooks.current.length - 1; i >= 0; i--) {
                        blooks.current[i].update(canvasParentRef.current.offsetWidth, canvasParentRef.current.offsetHeight);
                    }
                }} /></div>
            </div>
        </div>
        <div className="textRow">
            <div className={`boxText${bigBox ? " bigText" : ""}`} style={{ borderColor: pack.border }}>{name}</div>
            <div className={`boxText${bigBox ? " bigText" : ""}`} style={{ borderColor: pack.border }}>{numBlooks}</div>
        </div>
        {numDefense != null && <div className="shieldContainer">
            <img src={basic.shield} alt="Shield" className="shieldImg" />
            <div className="shieldText">{numDefense}</div>
        </div>}
    </div>
}

export default function RushHost() {
    const { host: { current: host }, liveGameController, updateHost, updateStandings } = useGame();
    const [timer, setTimer] = useState("00:00");
    const [players, setPlayers] = useState([]);
    const [muted, setMuted] = useState(!!host && host.muted);
    const [userToBlock, setUserToBlock] = useState("");
    const dbRef = useRef();
    const lastClients = useRef({});
    const navigate = useNavigate();
    const endGame = useRef(false);
    const getClients = useCallback(async (first) => {
        window.dispatchEvent(new Event('resize')); // Fix React-Textfit not sizing right
        if (host.settings.mode == "Teams") liveGameController.getDatabaseVal("a", snapshot => {
            const val = snapshot || {};
            let teams = [];
            for (const team of host.players) teams.push({
                name: team.name,
                blook: team.blook,
                numBlooks: first ? 3 : playersRef.current.find(x => x.name == team.name)?.numBlooks || 0,
                numDefense: first ? 0 : playersRef.current.find(x => x.name == team.name)?.numDefense || 0,
            });
            teams.sort((a, b) => b.numBlooks == a.numBlooks ? b.numDefense - a.numDefense : b.numBlooks - a.numBlooks);
            setPlayers(teams.map(team => ({ ...team, players: host.players.find(x => x.name == team.name).players })));
            liveGameController.setVal({ path: "c", val: teams.reduce((c, { name, numBlooks, numDefense, blook }) => (c[name] = { bs: numBlooks || 0, d: numDefense || 0, b: blook }, c), {}) });

        });
        else liveGameController.getDatabaseVal("c", snapshot => {
            const val = snapshot || {};
            if (!val || Object.keys(val).length == 0) return setPlayers([]);
            let clients = [];
            for (const [name, { b: blook, bs, d }] of Object.entries(val)) clients.push({ name, blook, numBlooks: first ? 3 : bs || 0, numDefense: first ? 0 : d || 0 });
            clients.sort((a, b) => b.numBlooks == a.numBlooks ? b.numDefense - a.numDefense : b.numBlooks - a.numBlooks);
            setPlayers(clients);
            if (first) liveGameController.setVal({ path: "c", val: clients.reduce((c, { name, numBlooks, numDefense, blook }) => (c[name] = { bs: numBlooks, d: numDefense, b: blook }, c), {}) });
        });
    }, [players]);
    const goNext = useCallback(() => {
        let val = [], place = 0, lowest = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < players.length; i++) {
            if (players[i].numBlooks < lowest) {
                place += 1;
                lowest = players[i].numBlooks
            }
            val.push({
                n: players[i].name,
                b: players[i].blook,
                bs: players[i].numBlooks,
                p: place
            });
        }
        updateStandings(val.map(x => ({ ...x, players: host.players.find(e => e.name == x.n).players })));
        liveGameController.setVal({
            path: "st", val
        }, () => liveGameController.setStage({ stage: "fin" }, () => navigate("/host/rush/final")));
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
        console.log(players)
        setUserToBlock("");
    }, [userToBlock, players]);
    const { current: audio } = useRef(new Audio(audios.blookRush));
    const timerInterval = useRef();
    const clientsInterval = useRef();
    const playersRef = useRef();
    useEffect(() => { playersRef.current = players }, [players]);
    useEffect(() => {
        import("./rush.css");
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
            liveGameController.setStage({ stage: "rush" });
            getClients(true);
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
            if (host.settings.mode == "Teams") {
                dbRef.current = await liveGameController.getDatabaseRef("a");
                dbRef.current.on("value", function (snapshot) {
                    const clients = snapshot.val() || {};
                    console.warn(clients)
                    liveGameController.removeVal("a");
                    for (const [client, data] of Object.entries(clients)) {
                        let team = playersRef.current.find(x => x.players[client]);
                        if (data.tat) {
                            let at = playersRef.current.find(x => x.name == data.tat);
                            if (at?.numDefense > 0) setPlayers(p => [...p.map(x => x.name == at.name ? { ...x, numDefense: x.numDefense - 1 } : x)]);
                            else if (at?.numBlooks >= 1) setPlayers(p => [...p.map(x => x.name == at.name ? { ...x, numBlooks: x.numBlooks - 1 } : x.name == team.name ? { ...x, numBlooks: x.numBlooks + 1 } : x)]);
                        } else if (data.d) setPlayers(p => [...p.map(x => x.name == team.name ? { ...x, numDefense: Math.min(4, x.numDefense + 1) } : x)]);
                        else if (data.bs) setPlayers(p => [...p.map(x => x.name == team.name ? { ...x, numBlooks: x.numBlooks + 1 } : x)]);
                    }
                });
            } else {
                dbRef.current = await liveGameController.getDatabaseRef("c");
                dbRef.current.on("value", function (snapshot) {
                    const clients = snapshot.val() || {};
                    const changed = diffObjects(lastClients.current, clients) || {};
                    console.log({ clients, changed })
                    for (const [client, data] of Object.entries(changed)) if (data.tat) {
                        liveGameController.removeVal(`c/${client}/tat`);
                        let at = clients[data.tat];
                        if (at.d > 0) liveGameController.setVal({ path: `c/${data.tat}/d`, val: at.d - 1 });
                        else if (at.bs >= 1) {
                            liveGameController.setVal({ path: `c/${data.tat}/bs`, val: at.bs - 1 });
                            liveGameController.setVal({ path: `c/${client}/bs`, val: (clients[client].bs || 0) + 1 });
                        }
                    }
                    lastClients.current = clients;
                });
            }
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
        console.log(players);
        window.setPlayers = setPlayers
        if (endGame.current) goNext();
    }, [players])
    if (!host?.settings) return navigate("/sets");
    return <>
        <div className="body background" style={{ overflow: "hidden" }}>
            <TopBar left="Blooket" center={timer} right={host.settings.lateJoin ? `ID: ${liveGameController.liveGameCode}` : ""} muted={muted} changeMuted={changeMuted} onRightClick={() => (endGame.current = true, getClients())} />
            <div className="hostRegularBody">
                <div className="shelves">
                    {[...Array(Math.ceil(Math.min(players.length, 8) / 4))].map((_, i) => {
                        return <div className="shelfContainer" key={i}>
                            <div className="shelf"></div>
                            <div className="shelfBot"></div>
                        </div>
                    })}
                </div>
                <FlipMove className="rushBoxesHolder" duration={1000} style={{ position: "absolute" }}>
                    {players.slice(0, 8).map(player => {
                        return <div key={player.name}>
                            <RushBox
                                name={player.name}
                                blook={player.blook}
                                numBlooks={player.numBlooks}
                                numDefense={player.numDefense}
                                onClick={host?.settings?.mode == "Teams" ? null : () => setUserToBlock(player.name)}
                                letMove={true} />
                        </div>
                    })}
                </FlipMove>
            </div>
        </div>
        {userToBlock && <Modal text={`Remove ${userToBlock} from the game?`}
            buttonOne={{ text: "Yes", click: blockUser, color: "#ce1313" }}
            buttonTwo={{ text: "No", click: () => setUserToBlock(""), color: "var(--accent1)" }} />}
    </>
}

export function RushFinal() {
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
    if (host?.standings?.[0] || state.standings?.[0]) return <div className="body background" style={{ overflowY: state.ready ? "auto" : "hidden" }}>
        {state.standings.length > 0 && <Standings
            standings={state.standings}
            stats={state.standings.map(e => formatNumber(e.bs) + (e.bs == 1 ? " Blook" : " Blooks"))}
            gameId={hostCopy.setId}
            historyId={state.historyId}
            muted={state.muted}
            theme="rush"
            ready={state.ready}
            team={hostCopy.settings.mode == "Teams"}
        />}
        {askPlayAgain && <Modal text="Would you like to play again right now with the same settings?"
            buttonOne={{ text: "Yes!", click: () => onPlayAgain(true) }}
            buttonTwo={{ text: "No", click: () => onPlayAgain(false) }} />}
    </div>;
}