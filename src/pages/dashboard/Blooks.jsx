import { useEffect, useState } from "react";
import Sidebar from "./SideBar";
import { useAuth } from "../../context/AuthContext";
import allBlooks, { freeBlooks, rarityColors } from "../../blooks/allBlooks";
import packs, { GenericSetBackground } from "../../blooks/packs";
import hidden from "../../blooks/packs/hidden";
import "./blooks.css";
import { setActivity } from "../../utils/discordRPC";
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
function Blooks() {
    const { protobuf } = useAuth();
    const [blooks, setBlooks] = useState({});
    const [pack, setPack] = useState("");
    const [showHidden, setShowHidden] = useState(true);
    const [showPacks, setShowPacks] = useState(true);
    const [showFree, setShowFree] = useState(false);
    const [hideLocked, setHideLocked] = useState(false);
    const [selected, setSelected] = useState(rand(Object.keys(allBlooks)));
    const [selectedIndex, setIndex] = useState(0);
    useEffect(() => {
        (async () => {
            let owned = await protobuf.listUnlockedBlooks({}).then(x => x.blooks)
            let unlocks = owned.reduce((obj, { name, numOwned }) => (obj[name] = numOwned, obj), {});
            // let unlocks = Object.keys(allBlooks).reduce((obj, blook) => (obj[blook] = Math.floor(Math.random() * 20),obj), {});
            // console.log(unlocks, owned)
            setBlooks(unlocks);
            Object.keys(unlocks).length && setSelected(rand(Object.keys(unlocks)));
            for (const p in packs) {
                packs[p].allBlooks = { ...packs[p].blooks };
                for (const h in hidden) if (hidden[h].realSet == p) packs[p].allBlooks[h] = hidden[h];
            }
        })();
        setActivity({
            state: "Blooks",
            timestampStart: Date.now(),
        });
    }, []);
    useEffect(() => {
        if (pack) setSelected(Object.keys((showHidden ? packs[pack]?.allBlooks : packs[pack]?.blooks) || {})[selectedIndex]);
    }, [pack, selectedIndex]);
    useEffect(() => {
        if (pack) setIndex(Math.min(Object.keys(showHidden ? packs[pack].allBlooks : packs[pack].blooks).length - 1, selectedIndex));
    }, [pack, showHidden]);
    // useEffect(() => {
    //     console.log(allBlooks[selected], selected)
    // }, [selected]);
    return (<Sidebar>
        <div id="selected">
            <img id="blookBackground" src={packs[allBlooks[selected]?.realSet || allBlooks[selected]?.set]?.setBackground || GenericSetBackground} />
            <div id="backgroundBottom"></div>
            <img id="selectedBlook" data-locked={!blooks[selected]} style={!blooks[selected] ? { opacity: 0.75 } : {}} src={allBlooks[selected]?.mediaUrl} alt={selected} />
            <div id="blookName">{!blooks[selected] ? "???" : selected}</div>
            <div id="blookRarity" style={{ color: rarityColors[allBlooks[selected]?.rarity] }}>{allBlooks[selected]?.rarity}</div>
            <div id="numOwned">{freeBlooks.includes(selected) ? "Free Blook" : (blooks[selected] || 0) + " Owned"}</div>
            <div id="filterButtons">
                {pack != "Hidden" && <button id="hiddenButton" onClick={() => setShowHidden(h => !h)}>{showHidden ? "Hide" : "Show"} Hidden Blooks</button>}
                {!pack && <button id="showPacks" onClick={() => setShowPacks(h => !h)}>{showPacks ? "Hide" : "Show"} Pack Names</button>}
                {!pack && <button id="showFree" onClick={() => setShowFree(h => !h)}>{showFree ? "Hide" : "Show"} Free Blooks</button>}
                {!pack && !showPacks && <button id="hideLocked" onClick={() => setHideLocked(h => !h)}>{hideLocked ? "Hide" : "Show"} Locked Blooks</button>}
            </div>
        </div>
        <div id="packButtons">
            {Object.keys(packs).map(x => (
                <div className="packButton" key={x} data-selected={pack == x} onClick={() => {
                    let blooks = Object.keys(packs[x]?.blooks || {})
                    if (pack == "") setSelected(blooks?.[Math.min(blooks.length - 1, selectedIndex)])
                    setPack(pack == x ? "" : x);
                }}>
                    <img src={packs[x].setIcon} alt={x} />
                </div>
            ))}
        </div>
        <div id={pack ? "packUnlocks" : "unlocks"}>
            {pack
                ? (<>
                    <div id="packUnlocksWrapper">
                        {Object.keys((showHidden ? packs[pack]?.allBlooks : packs[pack]?.blooks) || {}).map((blook, i) => {
                            let x = -Math.pow(Math.E, -.45 * Math.abs(i - selectedIndex));
                            return (<div className="packBlook" key={blook} data-place={i} style={{
                                left: `calc(50% + ${Math.sign(i - selectedIndex) * (65 + x * 65)}%)`,
                                width: `${-25 * x}%`,
                            }}>
                                <img data-locked={!blooks[blook]} onClick={() => setIndex(ind => ind + (i - selectedIndex))} src={allBlooks[blook]?.mediaUrl} alt={blook} />
                                {/* {blooks[blook] == 0 && <i style={{fontSize:`${-2500 * x}%`}} className="fa-solid fa-lock"></i>} */}
                            </div>)
                        })}
                    </div>
                    <div id="arrowsContainer">
                        <button onClick={() => setIndex(ind => Math.max(0, ind - 1))}>{"<"}</button>
                        <button onClick={() => setIndex(ind => Math.min(Object.keys(showHidden ? packs[pack].allBlooks : packs[pack].blooks).length - 1, ind + 1))}>{">"}</button>
                    </div>
                </>)
                : showPacks ? <div id="allPacks">
                    {Object.keys(packs).filter(x => (showFree ? true : !packs[x].free) && (showHidden ? true : x != "Hidden")).map(x => {
                        if (x == "Hidden") {
                            let hide = true;
                            for (const b in hidden) if (blooks[b]) {
                                hide = false;
                                break;
                            }
                            if (hide) return;
                        }
                        return (<div className="packContainer" key={"showPacks" + x}>
                            <div className="packTop">
                                <div className="packTexture" style={{ backgroundImage: `url(${packs[x].setTexture})` }}></div>
                                <div className="packName">{x}</div>
                                <div className="packDivider"></div>
                            </div>
                            <div className="packBlooks">
                                {Object.keys(packs[x].blooks).map(blook => {
                                    if (allBlooks[blook].set == "Hidden") if (!showHidden || !blooks[blook]) return;
                                    return (<div className="blook" key={"showPacks" + blook} onClick={() => setSelected(blook)}>
                                        <img data-locked={!blooks[blook] && !packs[x]?.free} src={allBlooks[blook].mediaUrl} alt={blook} />
                                        {(blooks[blook] || packs[x]?.free) ? ((!packs[allBlooks[blook]?.set || allBlooks[blook]?.set]?.free && allBlooks[blook]?.set !== "Color") && <div className="count" style={{ backgroundColor: rarityColors[allBlooks[blook]?.rarity] }}>{blooks[blook]}</div>) : <i className="fa-solid fa-lock"></i>}
                                    </div>)
                                })}
                            </div>
                        </div>)
                    })}
                </div>
                    : Object.keys(allBlooks).map(blook => {
                        if (allBlooks[blook]?.set == "Hidden") if (!showHidden || !blooks[blook]) return;
                        if (!showFree && packs[allBlooks[blook]?.set]?.free) return;
                        if (!hideLocked && !blooks[blook] && !packs[allBlooks[blook]?.set]?.free) return;
                        return <>
                            <div className="blook" key={blook} onClick={() => setSelected(blook)}>
                                <img data-locked={!blooks[blook] && !packs[allBlooks[blook]?.set]?.free} src={allBlooks[blook].mediaUrl} alt={blook} />
                                {(blooks[blook] || packs[allBlooks[blook]?.set]?.free) ? ((!packs[allBlooks[blook]?.set || allBlooks[blook]?.set]?.free && allBlooks[blook]?.set !== "Color") && <div className="count" style={{ backgroundColor: rarityColors[allBlooks[blook]?.rarity] }}>{blooks[blook]}</div>) : <i className="fa-solid fa-lock"></i>}
                            </div>
                        </>
                    })
            }
        </div>
    </Sidebar>);
}
export default Blooks;