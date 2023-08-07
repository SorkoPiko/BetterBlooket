import { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";
import packs, { market, packTop, token } from "../../blooks/packs";
import "./market.css";
import { setActivity } from "../../utils/discordRPC";
import { useAuth } from "../../context/AuthContext";
import allBlooks, { rarityColors } from "../../blooks/allBlooks";
import { Textfit } from "react-textfit";
import { Game, Scale, WEBGL } from "phaser";
import Particles from "../../blooks/Particles";
import { useRef } from "react";
import { formatNumber } from "../../utils/numbers.js";
function imgUrl(url) {
    if (!url) return url;
    let i = url.indexOf("upload/");
    return -1 === i ? url : (i += 7, "".concat(url.slice(0, i)).concat("f_auto,q_auto:best").concat(url.slice(i - 1, url.length)))
}

function weighted(entries) {
    let totalWeight = 0;
    for (const [item, weight] of entries) totalWeight += weight;
    const choice = Math.random() * totalWeight;
    let weightCount = 0;
    for (const [item, weight] of entries) {
        weightCount += weight;
        if (weightCount >= choice) return item;
    }
}

function useGame(config, containerRef) {
    const [game, setGame] = useState();
    const oldConfig = useRef(config);
    useEffect(() => {
        if ((!game && containerRef.current) || config != oldConfig.current) {
            oldConfig.current = config;
            const newGame = new Game({ ...config, parent: containerRef.current });
            setGame(newGame);
        }
        return () => game?.destroy(true);
    }, [config, containerRef, game]);
    return game;
}

function Market() {
    const [tokens, setTokens] = useState(0);
    const [opening, setOpening] = useState(false);
    const [startOpen, setStartOpen] = useState(false);
    const [selected, setSelected] = useState("Outback");
    const [amount, setAmount] = useState(1);
    const [blooks, setBlooks] = useState([]);
    const [isNew, setIsNew] = useState([]);
    const [showing, setShowing] = useState(-1);
    const [game, setGame] = useState(null);
    const gameRef = useRef(null);
    const shownParticles = useRef(false);
    useGame(game, gameRef);
    const { http: { get }, protobuf: { purchaseBlookBox } } = useAuth();
    useEffect(() => {
        window.setStartOpen = setStartOpen;
        get("https://dashboard.blooket.com/api/users/market").then(({ data: { tokens } }) => setTokens(tokens));
        setActivity({
            state: "Market",
            timestampStart: Date.now(),
        });
    }, []);
    useEffect(() => {
        if (startOpen && game?.scene?.game && !shownParticles.current) {
            game.scene.game.events.emit("start-particles", allBlooks[blooks[showing]]?.rarity);
            shownParticles.current = true;
        }
    }, [blooks]);
    return (<>
        <Sidebar>
            <div id="marketHeader">Market</div>
            <div id="tokens">
                <img id="balanceIcon" src={token} alt="Tokens"></img>
                {formatNumber(tokens)}
            </div>
            <div id="packsWrapper">
                {Object.keys(market).map(pack => {
                    return (<div className="packWrapper" onClick={() => setSelected(pack)} style={{ background: market[pack].background }} data-selected={selected == pack} key={pack}>
                        <div className="packImgContainer">
                            <img className="packShadow" src={imgUrl(market[pack].url)} alt="" />
                            <img className="packImg" src={imgUrl(market[pack].url)} alt="" />
                        </div>
                        <div className="packBottom">
                            <img className="packPriceImg" src={token} alt=""></img>
                            {market[pack].price}
                        </div>
                    </div>)
                })}
            </div>
            <div id="rewardsPreview">
                {market[selected]?.rewards?.map(([blook, chance]) => {
                    return (<div key={blook}>
                        {/* {blook} */}
                        <img src={allBlooks[blook].url} alt={blook} />
                        {/* <div style={{ fontSize: "1rem" }}>{blook}</div> */}
                        <Textfit mode="single" forceSingleModeWidth={false} min={1} max={16}>{blook}</Textfit>
                        <div style={{ color: rarityColors[allBlooks[blook].rarity] }}>{chance}%</div>
                    </div>)
                })}
            </div>
            <div id="packOpener">
                <form onSubmit={async e => {
                    e.preventDefault();
                    let toOpen = Math.min(amount, Math.floor(tokens / market[selected].price))
                    if (toOpen <= 0) return;
                    setOpening(true);
                    setBlooks(Array(toOpen));
                    setIsNew(Array(toOpen));
                    setShowing(0);
                    setGame({
                        type: WEBGL, parent: "phaser-market", width: "100%", height: "100%", transparent: true,
                        scale: { mode: Scale.NONE, autoCenter: Scale.CENTER_BOTH },
                        physics: { default: "arcade" },
                        scene: new Particles("Uncommon")
                    });
                    for (let i = 0; i < toOpen; i++) {
                        let { unlockedBlook, tokens, isNewToUser } = await purchaseBlookBox({ boxName: selected });// market[selected].rewards[Math.floor(Math.random() * market[selected].rewards.length)][0] && weighted(market[selected].rewards)
                        setBlooks(b => (b[i] = unlockedBlook, [...b]));
                        setIsNew(n => (n[i] = isNewToUser, [...n]));
                        setTokens(tokens);
                    }
                }}>
                    <div>
                        <input type="number" onChange={({ target: { value } }) => setAmount(parseInt(value))} value={amount} min={0} max={Math.floor(tokens / market[selected]?.price)} /> / {formatNumber(Math.floor(tokens / market[selected]?.price))}
                    </div>
                    <div>
                        <input type="submit" value="Open" />
                        <span style={{ position: "absolute", top: "100%", left: "0", right: "0", lineHeight: "4rem", opacity: "0.5", textAlign: "center" }}>
                            <img style={{ height: "1.75rem", marginBottom: "-2px", marginRight: "10px" }} src={token} alt=""></img>
                            {formatNumber(tokens)} - {market[selected]?.price}x{formatNumber(amount)} = {formatNumber(tokens - market[selected]?.price * amount)}
                        </span>
                    </div>
                </form>
            </div>
        </Sidebar>
        {opening && <div id="openingContainer" onClick={async () => {
            if (startOpen) {
                if (amount > 1 && showing < blooks.length - 1) {
                    shownParticles.current = true;
                    game.scene.game.events.emit("start-particles", allBlooks[blooks[showing + 1]]?.rarity);
                    if (!allBlooks[blooks[showing + 1]]?.rarity) shownParticles.current = false;
                    if (blooks[showing]) setShowing(s => s + 1);
                } else if (blooks[showing]) {
                    setOpening(false);
                    setStartOpen(false);
                }
            } else {
                setStartOpen(true)
                await new Promise(r => setTimeout(r, 500));
                game.scene.game.events.emit("start-particles", allBlooks[blooks[showing]]?.rarity);
            };
        }} style={{ background: market[selected]?.background, cursor: "pointer" }}>
            <img className="cornerIcon" src={packs[selected].setIcon} alt="" />
            <div ref={gameRef}></div>
            <div className={`openContainer${startOpen ? " openingContainer" : ""}`}>
                <img className="blookBackground" src={packs[selected].setBackground} alt="" />
                <div id="blookContainer" className="unlockedBlookImage">
                    {amount == 1 ? <img src={allBlooks[blooks[showing]]?.url} alt={blooks[showing]} /> : <>
                        {showing > 0 && <img style={{ position: "absolute", animation: "market_slideUp .5s linear forwards", zIndex: "11" }} key={`bulkOpen${showing - 1}`} src={allBlooks[blooks[showing - 1]].url} alt={blooks[showing - 1]} />}
                        <img style={blooks[showing] ? {} : { filter: "brightness(0)" }} src={allBlooks[blooks[showing] || "Light Blue"].url} alt={blooks[showing] || "Light Blue"} />
                        {!blooks[showing] && <i style={{ position: "absolute", left: "50%", top: "60%", transform: "translate(-50%, -60%)", fontSize: "5rem" }} className="fas fa-question" />}
                    </>}
                </div>
                <div style={{ position: "absolute", top: "15px", left: "5%", width: "90%", color: "#fff", textAlign: "center", }}>
                    <Textfit mode="single" forceSingleModeWidth={false} min={1} max={30} className="unlockedBlook">{blooks[showing] || "Loading..."}</Textfit>
                    <div style={{
                        color: rarityColors[allBlooks[blooks[showing]]?.rarity],
                        fontSize: "30px",
                        WebkitTextStroke: "#3a3a3a 1.5px",
                        fontFamily: "Adventure"
                    }}>{allBlooks[blooks[showing]]?.rarity}</div>
                </div>
                <div style={{
                    position: "absolute",
                    bottom: "15px",
                    left: "5%",
                    width: "90%",
                    fontFamily: "Adventure",
                    color: "#fff",
                    textAlign: "center",
                    fontSize: "30px",
                    textShadow: "0 0 4px rgba(0,0,0,.4)",
                    letterSpacing: "2.5px",
                    fontWeight: "700"
                }}>{blooks[showing] && `${(market[selected]?.rewards || []).find(([x]) => x == blooks[showing])?.[1]}%${isNew[showing] ? " - NEW!" : ""}`}</div>
                <div style={{ width: "100%", position: "absolute", bottom: "0", left: "0", height: "50px", boxShadow: "inset 0 -9px rgba(0,0,0,.2)", borderBottomLeftRadius: "10px", borderBottomRightRadius: "10px" }}></div>
                {amount > 1 && <div style={{ position: "absolute", top: "100%", left: "0", right: "0", textAlign: "center", lineHeight: "3rem", fontSize: "30px" }}>({showing + 1} / {amount})</div>}
            </div>
            <div className={`openPackContainer${startOpen ? " openingPackContainer" : ""}`}>
                <div className={`openPackTop${startOpen ? " isOpeningPackTop" : ""}`} style={{ backgroundImage: `url(${packTop})` }}></div>
                <img className="openPack" src={imgUrl(market[selected]?.noTopUrl)} alt="" />
            </div>
        </div >}
    </>);
}
export default Market;