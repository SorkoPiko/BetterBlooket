import { useEffect } from "react";
import { useGame } from "../../context/GameContext"
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { useState } from "react";
import { useCallback } from "react";
import banners from "../../blooks/banners";
import { Textfit } from "react-textfit";
import { getDimensions } from "../../utils/numbers";
import Blook from "../../blooks/Blook";
import "./join.css";
import { audios, holidays } from "../../utils/config";
import { useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { colorBlooks, freeBlooks } from "../../blooks/allBlooks";
import { random } from "../../utils/questions";

export default function HostLobby() {
    const { host: { current: host }, liveGameController, deleteHost, hostId, setPlayers, updateHost } = useGame();
    const { http: { get, post }, userData } = useAuth();
    const navigate = useNavigate();
    const [game, setGame] = useState({
        id: "",
        clients: {},
        hostName: ""
    });
    const [muted, setMuted] = useState(false);
    const [justCopied, setJustCopied] = useState(false);
    const audio = useRef(new Audio(audios.lobby));
    const dbRef = useRef({});
    const copyTimeout = useRef();
    const init = useCallback(async engine => {
        console.log(engine);
        await loadFull(engine);
    }, []);
    useEffect(() => {
        window.hostData = { host, hostId };
        if (!host?.setId || !host.settings || host.teams) return navigate("/sets");

        audio.current.volume = 0.6;
        if (host.settings.type == "Toy" || holidays.winter) {
            audio.current = new Audio(audios.winter);
            audio.current.volume = 0.35;
        } else if (holidays.halloween) {
            audio.current = new Audio(audios.halloween);
            audio.current.volume = 0.35;
        } else audio.current = new Audio(audios.lobby);
        audio.current.play();
        audio.current.addEventListener("ended", function () {
            audio.current.currentTime = 0;
            audio.current.play();
        });
        get("https://play.blooket.com/api/questionsets/detailforhostjoinpage", { params: { id: host.setId } }).then(async ({ data }) => {
            if (!data?.title) return navigate("/sets");
            setGame({ ...game, hostName: data.title });
            let opts = {
                t: host.settings.type,
                m: host.settings.mode,
                d: new Date().toISOString()
            }
            switch (host.settings.type) {
                case "Factory":
                    opts.g = host.settings.glitchesOn;
                    opts.a = Number(host.settings.amount);
                    break;
                case "Defense2":
                    opts.mp = host.settings.map;
                    opts.df = host.settings.difficulty;
                    opts.a = Number(host.settings.amount);
                    break;
                case "Defense":
                    opts.mp = host.settings.map;
                    opts.a = Number(host.settings.amount);
                    break;
                case "Cafe":
                case "Racing":
                    opts.a = Number(host.settings.amount);
                    break;
                case "Royale":
                    opts.e = Number(host.settings.energy);
                    break;
            }
            if (host.settings.lateJoin) opts.la = host.settings.lateJoin;
            if (host.settings.randomNames) opts.r = host.settings.randomNames;
            if (!host.settings.allowAccounts) opts.ba = !host.settings.allowAccounts;
            if (liveGameController.liveGameCode) {

            }
            const newGame = await liveGameController.hostNewGame({
                qSetId: host.setId,
                settings: opts,
                userId: userData._id
            });
            setGame({ ...game, id: newGame.id });
            await post("https://play.blooket.com/api/hostedgames/invitationcodes", {
                invitationCode: newGame.id,
                hostToken: hostId.current
            });
            updateHost({ hostName: data.title });
            dbRef.current = await liveGameController.getDatabaseRef("c");
            let oldClients = {};
            dbRef.current.on("value", function (snapshot) {
                const clients = snapshot.val() || {};
                if (Object.keys(clients).length > Object.keys(oldClients).length && !muted) new Audio(audios.join).play();
                oldClients = clients;
                setGame(g => ({ ...g, clients }));
            });
        });
        return () => {
            if (Object.keys(dbRef.current).length) dbRef.current.off("value");
            // if (liveGameController.liveGameCode && liveGameController.isHost) {
            //     console.log("bruh")
            //     liveGameController.removeHostAndDeleteGame();
            //     deleteHost();
            // }
            audio.current.currentTime = 0;
            audio.current.pause();
            audio.current.removeEventListener("ended", function () {
                audio.current.currentTime = 0;
                audio.current.play();
            });
            clearTimeout(copyTimeout.current)
        }
    }, []);
    const changeMuted = useCallback(() => {
        setMuted(!muted);
        audio.current.muted = !muted;
        updateHost({ muted: !muted });
    }, [muted]);
    const copyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(new URL("/play?id=" + game.id, "https://play.blooket.com").href).then(() => setJustCopied(true));
    }, [game]);
    useEffect(() => {
        if (justCopied) copyTimeout.current = setTimeout(() => setJustCopied(false), 1500);
    }, [justCopied]);
    const startGame = useCallback(() => {
        let clients = JSON.parse(JSON.stringify(game.clients));
        let taken = [];
        for (const [name, data] of Object.entries(clients)) if (taken.includes(data?.b || "Chick")) {
            let available = [];
            for (let blook of freeBlooks) if (!taken.includes(blook)) available.push(blook);
            if (available.length == 0) for (let blook of colorBlooks) if (!taken.includes(blook)) available.push(blook);
            if (available.length > 0) clients[name].b = random(available);
        } else taken.push(data?.b || "Chick");
        liveGameController.setVal({ path: "c", val: clients }, () => {
            switch (host.settings.type) {
                case "Racing": navigate("/host/racing"); break;
                case "Factory": navigate("/host/factory"); break;
                case "Cafe": navigate("/host/cafe"); break;
                case "Defense2": navigate("/host/defense2"); break;
                case "Defense": navigate("/host/defense"); break;
                case "Brawl": navigate("/host/brawl"); break;
                case "Classic": liveGameController.setStage({ stage: "crdy" }, () => navigate("/host/classic/get-ready")); break;
                case "Gold":
                    if (host.settings.instruct) liveGameController.setStage({ stage: "inst" }, () => navigate("/host/gold/instructions"));
                    else navigate("/host/gold");
                    break;
                case "Hack":
                    if (host.settings.instruct) liveGameController.setStage({ stage: "inst" }, () => navigate("/host/hack/instructions"));
                    else navigate("/host/hack");
                    break;
                case "Fish":
                    if (host.settings.instruct) liveGameController.setStage({ stage: "inst" }, () => navigate("/host/fishing/instructions"));
                    else navigate("/host/fishing");
                    break;
                case "Dino":
                    if (host.settings.instruct) liveGameController.setStage({ stage: "inst" }, () => navigate("/host/dino/instructions"));
                    else navigate("/host/dino");
                    break;
                case "Toy":
                    if (host.settings.instruct) liveGameController.setStage({ stage: "inst" }, () => navigate("/host/toy/instructions"));
                    else navigate("/host/toy");
                    break;
                case "Rush":
                    if (host.settings.mode == "Teams") {
                        setPlayers(Object.entries(clients).map(([name, { b: blook }]) => ({ name, blook })));
                        liveGameController.setStage({ stage: "team" }, () => navigate("/host/teams"));
                    } else if (host.settings.instruct) liveGameController.setStage({ stage: "inst" }, () => navigate("/host/rush/instructions"));
                    else navigate("/host/rush");
                    break;
                // default: BATTLE ROYALE
                //     setPlayers(Object.entries(clients).map(([name, { b: blook }]) => ({ name, blook, energy: host.settings.energy })));
                //     if (host.settings.mode == "Teams") liveGameController.setStage({ stage: "team" }, () => navigate("/host/teams"));
                //     else if (host.settings.instruct) liveGameController.setStage({ stage: "inst" }, () => navigate("/host/battle-royale/instructions"));
                //     else {

                //     }
            }
        });
    }, [game, host]);
    const removeClient = useCallback((user) => {
        liveGameController.blockUser(user);
    }, []);
    let minClients = ["Rush", "Royale"].includes(host.settings?.type) ? "Teams" === host.settings?.mode ? 4 : 2 : 1,
        numClients = Object.keys(game.clients).length;
    return <div id="hostLobbyBody">
        <div id="hostLobbyBackground" style={{
            backgroundColor: holidays.halloween ? "#292929" : "var(--accent2)",
            backgroundImage: holidays.winter ? "linear-gradient(#31aae0, #bdf)" : null
        }}>
            <div id="blooksBackground" style={{ backgroundImage: 'url("https://ac.blooket.com/play/65a43218fd1cabe52bdf1cda34613e9e.png")' }}></div>
            <div id="hostLobbyHeaderBox">
                <div id="hostLobbyQrHolder">
                    <QRCode size={1000} bgColor="var(--accent1)" fgColor="white" className="qrCode" value={new URL(`https://play.blooket.com/play?id=${game.id}`).href}></QRCode>
                </div>
                <div id="hostLobbyHeaderText">
                    Go to <span style={{ textDecoration: "underline", fontWeight: "bold" }}>play.blooket.com</span> and enter Game ID:
                </div>
                {game.id && <div id="hostLobbyIdNumberText">{game.id}</div>}
                <div id="hostLobbyRightContainer">
                    <div id="hostLobbyRightRow">
                        <i onClick={changeMuted} className={`hostLobbyIconButton ${muted ? "fas fa-volume-mute" : "fas fa-volume-up"}`} />
                    </div>
                    <div id="hostLobbyCopyButton" onClick={copyToClipboard}>Copy Join Link{justCopied && <div id="copiedNotification">Copied!</div>}</div>
                </div>
            </div>
            <div id="hostLobbyLowerContainer">
                {holidays.winter && <Particles
                    init={init}
                    height="calc(100vh - 61px)"
                    width="100vw"
                    // canvasClassName=""
                    params={{
                        particles: {
                            number: {
                                value: 70,
                                density: {
                                    enable: true,
                                    value_area: 650,
                                },
                            },
                            color: { value: '#fff' },
                            shape: {
                                type: 'circle',
                                stroke: { width: 0 },
                            },
                            opacity: {
                                value: 1,
                                random: true,
                                anim: { enable: false },
                            },
                            size: {
                                value: 8,
                                random: true,
                                anim: { enable: false },
                            },
                            line_linked: { enable: false },
                            move: {
                                enable: true,
                                speed: 6,
                                direction: 'bottom',
                                random: false,
                                straight: false,
                                out_mode: 'out',
                                bounce: false,
                                attract: { enable: false },
                            },
                        },
                        interactivity: {},
                        fullScreen: {
                            enable: true,
                            zIndex: 1,
                        },
                    }}
                />}
                <div id="hostLobbyLowerRow">
                    <div id="hostLobbyPlayerNumber">
                        {numClients}
                        <i className="clientIcon fas fa-user" />
                    </div>
                    <div id="hostLobbyTitleText">Blooket</div>
                    <div className={`hostLobbyStartButton${numClients < minClients ? " hostLobbyNoButton" : ""}`}
                        onClick={numClients >= minClients ? startGame : () => { }}
                    >{numClients >= minClients ? "Start" : `${minClients - numClients} More`}</div>
                </div>
                <div className="hostLobbyClientArrayContainer hostLobbyArrayScrollbar">
                    {Object.entries(game.clients).map(([name, data]) => {
                        return data && <div key={name} className="hostLobbyClientBox" onClick={() => removeClient(name)}>
                            {banners[data.bg]?.url
                                ? <img className="hostLobbyClientBgImg" src={banners[data.bg]?.url} />
                                : <div className="hostLobbyClientBg" style={{ backgroundColor: holidays.halloween ? "#1a1a1a" : null }}></div>}
                            <Blook name={data.b} className="hostLobbyBlookBox" />
                            <Textfit className="hostLobbyClientNameText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")} style={{
                                width: banners[data.bg]?.url ? "50%" : null,
                                color: banners[data.bg]?.url || holidays.halloween ? "#fff" : "#3a3a3a",
                                marginLeft: banners[data.bg]?.url ? "0%" : null,
                            }}>{name}</Textfit>
                        </div>
                    })}
                </div>
            </div>
        </div>
    </div>;
}