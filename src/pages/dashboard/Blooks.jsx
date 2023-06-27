import { useEffect, useState } from "react";
import Sidebar from "./SideBar";
import { useAuth } from "../../context/AuthContext";
import allBlooks, { freeBlooks, rarityColors } from "../../blooks/allBlooks";
import packs, { GenericSetBackground } from "../../blooks/packs";
import hidden from "../../blooks/packs/hidden";
import "./blooks.css";
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
function Blooks() {
    const { protobuf } = useAuth();
    const [blooks, setBlooks] = useState({});
    const [pack, setPack] = useState("");
    const [showHidden, setShowHidden] = useState(true);
    const [showPacks, setShowPacks] = useState(true);
    const [showFree, setShowFree] = useState(false);
    const [selected, setSelected] = useState(rand(Object.keys(allBlooks)));
    const [selectedIndex, setIndex] = useState(1);
    useEffect(() => {
        (async () => {
            const unlocks = Object.entries(allBlooks).reduce((obj, [b, v]) => (obj[b] = v.numOwned || 1, obj), {}); // await protobuf.listUnlockedBlooks({});
            setBlooks(unlocks);
            Object.keys(unlocks).length && setSelected(rand(Object.keys(unlocks)));
            for (const p in packs) {
                packs[p].allBlooks = { ...packs[p].blooks };
                for (const h in hidden) if (hidden[h].realSet == p) packs[p].allBlooks[h] = hidden[h];
            }
        })()
    }, []);
    useEffect(() => {
        if (pack) setSelected(Object.keys(showHidden ? packs[pack].allBlooks : packs[pack].blooks)[selectedIndex]);
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
            <img id="selectedBlook" src={allBlooks[selected]?.mediaUrl} alt={selected} />
            <div id="blookName">{selected}</div>
            <div id="blookRarity" style={{ color: rarityColors[allBlooks[selected]?.rarity] }}>{allBlooks[selected]?.rarity}</div>
            <div id="numOwned">{freeBlooks.includes(selected) ? "Free Blook" : blooks[selected] + " Owned"}</div>
            <div id="filterButtons">
                {pack != "Hidden" && <button id="hiddenButton" onClick={() => setShowHidden(h => !h)}>{showHidden ? "Hide" : "Show"} Hidden Blooks</button>}
                {!pack && <button id="showPacks" onClick={() => setShowPacks(h => !h)}>{showPacks ? "Hide" : "Show"} Pack Names</button>}
                {!pack && <button id="showFree" onClick={() => setShowFree(h => !h)}>{showFree ? "Hide" : "Show"} Free Packs</button>}
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
                                <img onClick={() => setIndex(ind => ind + (i - selectedIndex))} src={allBlooks[blook]?.mediaUrl} alt={blook} />
                            </div>)
                        })}
                    </div>
                    <div id="arrowsContainer">
                        <button onClick={() => setIndex(ind => Math.max(0, ind - 1))}>{"<"}</button>
                        <button onClick={() => setIndex(ind => Math.min(Object.keys(showHidden ? packs[pack].allBlooks : packs[pack].blooks).length - 1, ind + 1))}>{">"}</button>
                    </div>
                </>)
                : showPacks ? <div id="allPacks">
                    {Object.keys(packs).filter(x => (showFree ? true : !packs[x].free) && (showHidden ? true : x != "Hidden")).map(x => (<div className="packContainer" key={"showPacks" + x}>
                        <div className="packTop">
                            <div className="packTexture" style={{ backgroundImage: `url(${packs[x].setTexture})` }}></div>
                            <div className="packName">{x}</div>
                            <div className="packDivider"></div>
                        </div>
                        <div className="packBlooks">
                            {Object.keys(packs[x].blooks).map(x => (<>
                                <div className="blook" key={x} onClick={() => setSelected(x)}>
                                    <img src={allBlooks[x].mediaUrl} alt={x} />
                                </div>
                            </>))}
                        </div>
                    </div>))}
                </div>
                    : Object.keys(blooks).map(blook => {
                        if (!showHidden && allBlooks[blook].set == "Hidden") return;
                        if (!showFree && packs[allBlooks[blook].set]?.free) return;
                        else return <>
                            <div className="blook" key={blook} onClick={() => setSelected(blook)}>
                                <img src={allBlooks[blook].mediaUrl} alt={blook} />
                            </div>
                        </>
                    })
            }
        </div>
    </Sidebar>);
}
export default Blooks;