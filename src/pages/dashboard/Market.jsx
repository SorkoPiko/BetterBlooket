import { useEffect, useState } from "react";
import Sidebar from "./SideBar";
import packs, { market, token } from "../../blooks/packs";
import "./market.css";
import { setActivity } from "../../utils/discordRPC";
import { useAuth } from "../../context/AuthContext";
import allBlooks, { rarityColors } from "../../blooks/allBlooks";
function imgUrl(url) {
    if (!url) return url;
    let i = url.indexOf("upload/");
    return -1 === i ? url : (i += 7, "".concat(url.slice(0, i)).concat("f_auto,q_auto:best").concat(url.slice(i - 1, url.length)))
}
function Market() {
    const [tokens, setTokens] = useState(0);
    const [toOpen, setToOpen] = useState(1);
    const [opening, setOpening] = useState(false);
    const [selected, setSelected] = useState("Outback");
    const { http: { get } } = useAuth();
    useEffect(() => {
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
                {market[selected].rewards.map(([blook, chance]) => {
                    return (<div key={blook}>
                        {/* {blook} */}
                        <img src={allBlooks[blook].url} alt={blook} />
                        <div style={{ color: rarityColors[allBlooks[blook].rarity] }}>{chance}%</div>
                    </div>)
                })}
            </div>
            <div id="packOpener">
                <form onSubmit={e => {
                    e.preventDefault();
                    const amount = parseInt(e.target[0].value);
                    setOpening(true);
                }}>
                    <div>
                        <input type="number" defaultValue={1} min={1} max={Math.floor(tokens / market[selected].price)} /> / {Math.floor(tokens / market[selected].price)}
                    </div>
                    <input type="submit" value="Open" />
                </form>
            </div>
        </Sidebar>
    </>);
}
export default Market;