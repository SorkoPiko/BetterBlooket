import { Fragment, useEffect, useState } from "react";
import Sidebar from "./SideBar";
import packs, { market, packTop, token } from "../../blooks/packs";
import "./market.css";
import { setActivity } from "../../utils/discordRPC";
import { useAuth } from "../../context/AuthContext";
import allBlooks, { rarityColors } from "../../blooks/allBlooks";
import { Textfit } from "react-textfit";
import CustomBlook from "../../blooks/CustomBlook";
function imgUrl(url) {
    if (!url) return url;
    let i = url.indexOf("upload/");
    return -1 === i ? url : (i += 7, "".concat(url.slice(0, i)).concat("f_auto,q_auto:best").concat(url.slice(i - 1, url.length)))
}
function Market() {
    const [tokens, setTokens] = useState(0);
    const [opening, setOpening] = useState(false);
    const [startOpen, setStartOpen] = useState(false);
    const [selected, setSelected] = useState("Space");
    const [amount, setAmount] = useState(1);
    const [blooks, setBlooks] = useState([]);
    const [isNew, setIsNew] = useState([]);
    const [showing, setShowing] = useState(-1);
    const { http: { get } } = useAuth();
    useEffect(() => {
        window.setStartOpen = setStartOpen;
        get("https://dashboard.blooket.com/api/users/market").then(({ data: { tokens } }) => setTokens(tokens));
        setActivity({
            state: "Market",
            timestampStart: Date.now(),
        });
    }, []);
    return (<>
        <Sidebar>
            <div id="marketHeader">Market</div>
            <div id="tokens">
                <img id="balanceIcon" src={token} alt="Tokens"></img>
                {tokens}
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
                        <div style={{ color: rarityColors[allBlooks[blook].rarity] }}>{chance}%</div>
                    </div>)
                })}
            </div>
            <div id="packOpener">
                <form onSubmit={async e => {
                    e.preventDefault();
                    setOpening(true);
                    setBlooks(Array(amount));
                    setIsNew(Array(amount));
                    setShowing(0);
                    for (let i = 0; i < amount; i++) {
                        let unlock = market[selected].rewards[Math.floor(Math.random() * market[selected].rewards.length)][0]
                        setBlooks(b => (b[i] = unlock, [...b]));
                        setIsNew(n => (n[i] = (Math.random() > 0.5), [...n]));
                        await new Promise(r => setTimeout(r, Math.random() * 1500));
                    }
                }}>
                    <div>
                        <input type="number" onChange={({ target: { value } }) => setAmount(parseInt(value))} defaultValue={1} min={1} max={Math.floor(tokens / market[selected]?.price) + 1000} /> / {Math.floor(tokens / market[selected]?.price)}
                    </div>
                    <div>
                        <input type="submit" value="Open" />
                        <span style={{ position: "absolute", top: "100%", left: "0", right: "0", lineHeight: "4rem", opacity: "0.5", textAlign: "center"}}>
                            <img style={{ height: "1.75rem", marginBottom: "-2px", marginRight: "10px" }} src={token} alt=""></img>
                            {tokens} - {market[selected]?.price}x{amount} = {tokens - market[selected]?.price*amount}
                        </span>
                    </div>
                </form>
            </div>
        </Sidebar>
        {opening && <div id="openingContainer" onClick={() => {
            if (startOpen) {
                if (amount > 1 && showing < blooks.length - 1) {
                    if (blooks[showing]) setShowing(s => s + 1);
                } else if (blooks[showing]) {
                    setOpening(false);
                    setStartOpen(false);
                }
            } else setStartOpen(true);
        }} style={{ background: market[selected]?.background, cursor: "pointer" }}>
            <img className="cornerIcon" src={packs[selected].setIcon} alt="" />
            <div className={`openContainer${startOpen ? " openingContainer" : ""}`}>
                <img className="blookBackground" src={packs[selected].setBackground} alt="" />
                <div id="blookContainer" className="unlockedBlookImage">
                    {amount == 1 ? <img src={allBlooks[blooks[showing]]?.url} alt={blooks[showing]} /> : <>
                        {showing > 0 && <img style={{ position: "absolute", animation: "slideUp .5s linear forwards", zIndex: "11" }} key={`bulkOpen${showing - 1}`} src={allBlooks[blooks[showing - 1]].url} alt={blooks[showing - 1]} />}
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