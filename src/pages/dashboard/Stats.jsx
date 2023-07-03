import { Fragment, useEffect, useRef, useState } from "react";
import CustomBlook from "../../blooks/CustomBlook";
import banners from "../../blooks/banners";
import titles from "../../blooks/titles";
import statistics, { icons } from "../../blooks/stats";
import Sidebar from "./SideBar";
import "./stats.css";
import allBlooks from "../../blooks/allBlooks";
import { setActivity } from "../../utils/discordRPC";
import { formatBigNumber, formatNumber, getOrdinal } from "../../utils/numbers";
import { useAuth } from "../../context/AuthContext";
import { getLevel, items } from "../../blooks/classPass";
import parts from "../../blooks/parts";
import BlookEditor from "../../blooks/BlookEditor";
import { readFile, writeFile } from "../../utils/fileSystem";
async function getExtraBlooks() {
    const data = await readFile("customBlooks.json")
    let result;
    try {
        result = JSON.parse(data);
        return [...result.filter(Boolean), ""];
    } catch {
        writeFile("customBlooks.json", "[]");
        return [""];
    }
}
function Stats() {
    const [stats, setStats] = useState({});
    const [blookUsage, setBlookUsage] = useState([]);
    const [classPass, setClassPass] = useState({ level: 0, xp: 0 });
    const [selectedIndex, setIndex] = useState(2);
    const [editing, setEditing] = useState(false);
    const [extraBlooks, setExtraBlooks] = useState([]);
    const [showExtras, setShowExtras] = useState(false);
    const { http: { get } } = useAuth();
    const currentPart = useRef();
    useEffect(() => {
        setIndex(showExtras ? 0 : 2);
    }, [showExtras])
    useEffect(() => {
        getExtraBlooks().then(setExtraBlooks);
        get("https://dashboard.blooket.com/api/users/stats").then(({ data }) => setStats(data));
        setActivity({
            state: "Stats",
            timestampStart: Date.now(),
        });
    }, []);
    useEffect(() => {
        if (stats.blookUsage) setBlookUsage(Object.entries(stats.blookUsage).sort((a, b) => b[1] - a[1]));
        if (stats.xp) setClassPass(getLevel(stats.xp));
    }, [stats]);
    useEffect(() => {
        currentPart.current?.scrollIntoViewIfNeeded?.();
        window.classPass = classPass;
    }, [classPass]);
    return (<>
        <Sidebar>
            {editing && <BlookEditor blookParts={showExtras ? Object.entries(parts).reduce((a, [b, c]) => (a[b] = c.map((x, i) => i), a), {}) : stats.blookParts} startCode={(showExtras ? extraBlooks : stats.customBlooks)[selectedIndex]} close={async function (save, code) {
                if (save) {
                    if (showExtras) {
                        await writeFile("customBlooks.json", JSON.stringify((extraBlooks[selectedIndex] = code, extraBlooks)));
                        getExtraBlooks().then(setExtraBlooks);
                    }
                }
                setEditing(false);
            }} />}
            <div id="topHalf">
                <div id="topLeft">
                    <div id="profile">
                        <div id="profileWrapper">
                            <div id="blook" className="blookContainer">
                                <img src={allBlooks[stats.blook || "Chick"]?.url} alt={(stats.blook || "Chick") + " Blook"} draggable={false} className="blook" />
                            </div>
                            <div id="banner">
                                {stats.banner
                                    ? <img src={banners[stats.banner]?.url} alt={banners[stats.banner]?.name} id="bannerImg" draggable={false} />
                                    : <img src={banners.starter.url} alt="Starter Banner" id="bannerImg" draggable={false} />}
                                <div id="nameHolder">
                                    <div id="username">{stats.name}</div>
                                    <div id="userTitle">{titles[stats.title]?.name || "Newbie"}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="classPassWrapper">
                        <div id="classPass">
                            {items.map((item, level) => {
                                return item.partType && <Fragment key={`part${level}`}>
                                    <div data-passed={classPass?.level >= level + 1} ref={Math.min(level + 1, 100) == classPass?.level ? currentPart : null} style={{ left: `${level * 25}%` }} className="classPassPart">
                                        <img src={parts[item.partType][item.part].url} alt={item.partType} />
                                    </div>
                                    <div data-xp-needed={(level == classPass?.level) ? `${classPass?.xp} / ${items[classPass?.level].xp}` : ""} style={{ left: `${level * 25}%` }} className="levelWrapper">
                                        <div data-passed={classPass?.level >= level + 1} className="partLevel">{level + 1}</div>
                                    </div>
                                </Fragment>
                            })}
                            <div id="classPassBar">
                                <div style={{
                                    width: `calc(calc(${classPass?.level}% - 1.5vw) + ${classPass?.level == 100 ? 1 : classPass?.xp / items[classPass?.level]?.xp - .5}%)`
                                }} id="barInner"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="customBlooks">
                    <div id="packUnlocksWrapper">
                        {(showExtras ? extraBlooks : (stats.customBlooks || [])).map((code, i) => {
                            let x = -Math.pow(Math.E, -.45 * Math.abs(i - selectedIndex));
                            return (<div className="packBlook" key={i} data-place={i} style={{
                                left: `calc(50% + ${Math.sign(i - selectedIndex) * (65 + x * 65)}%)`,
                                width: `${-25 * x}%`,
                            }}>
                                <div onClick={() => setIndex(ind => ind + (i - selectedIndex))} style={{ position: "relative" }}>
                                    <CustomBlook key={code} className={`${code ? "" : "emptyBlook"}`} code={code || "0#0#0#0#0$0#0#0#0#0#0#0$0"} />
                                    {!code && <i className="fas fa-plus" style={{ fontSize: `${-7.5 * x}vw`, transition: "0.5s", top: "60%", transform: "translate(-50%, -60%)" }}></i>}
                                </div>
                            </div>)
                        })}
                    </div>
                    <div id="customArrowsContainer">
                        <button style={{ position: "absolute", left: "0", aspectRatio: "unset" }} onClick={() => setShowExtras(e => !e)}>{showExtras ? "Hide" : "Show"} Extras</button>
                        <button onClick={() => setIndex(ind => Math.max(0, ind - 1))}>{"<"}</button>
                        <button onClick={() => setEditing(true)}><i className="fas fa-pencil" /></button>
                        <button onClick={async () => {
                            if (showExtras) {
                                extraBlooks.splice(selectedIndex, 1);
                                await writeFile("customBlooks.json", JSON.stringify(extraBlooks));
                                getExtraBlooks().then(setExtraBlooks);
                            }
                        }} disabled={!(showExtras ? extraBlooks : stats.customBlooks)?.[selectedIndex]}><i className="fa fa-trash" /></button>
                        <button onClick={() => setIndex(ind => Math.min((showExtras ? extraBlooks : stats.customBlooks).length - 1, ind + 1))}>{">"}</button>
                    </div>
                </div>
            </div>
            <div id="bottomHalf">
                <div id="blookUsage">
                    <div id="usageHeader">Blook Usage</div>
                    <div id="usageStart">0</div>
                    <div id="usageTip">Plays</div>
                    <div id="usageEnd">{blookUsage[0]?.[1] || 1}</div>
                    <div id="usageWrapper">
                        {blookUsage.length ? blookUsage.map(([blook, usage]) => {
                            return <div key={`${blook} Usage`} s className="blookUse">
                                <img className="usageBlook" src={allBlooks[blook]?.url} alt={blook} style={{ width: "50px" }} />
                                <div className="usageBarWrapper">
                                    <div className="usageBar" style={{ backgroundColor: allBlooks[blook]?.color, transform: `scaleX(${usage / blookUsage[0][1]})` }}></div>
                                </div>
                            </div>
                        }) : <div style={{
                            position: "absolute",
                            display: "flex",
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px"
                        }}>No Games Played Yet</div>}
                    </div>
                </div>
                <div id="gameHistory">
                    <div id="historyHeader">Game History</div>
                    <div id="historyWrapper">
                        {stats.gameHistory?.length ? stats.gameHistory.map(({ blookUsed, name, place }, i) => {
                            return <div key={i} className="pastGame">
                                {allBlooks[blookUsed] ? <img className="pastBlook" src={allBlooks[blookUsed].url} alt={blookUsed} /> : <CustomBlook className="pastBlook" blookClassName="pastCustomBlook" code={blookUsed} />}
                                <div className="pastInfo">
                                    <div className="pastInfoLeft">
                                        <div className="pastName">{name}</div>
                                        <div className="pastPlace">{place + getOrdinal(place)}</div>
                                    </div>
                                    {stats.gameHistory[i].candy != null ? formatBigNumber(stats.gameHistory[i].candy)
                                        : stats.gameHistory[i].gold != null ? formatBigNumber(stats.gameHistory[i].gold)
                                        : stats.gameHistory[i].xp != null ? formatBigNumber(stats.gameHistory[i].xp)
                                        : stats.gameHistory[i].toys != null ? formatBigNumber(stats.gameHistory[i].toys)
                                        : stats.gameHistory[i].shamrocks != null ? formatBigNumber(stats.gameHistory[i].shamrocks)
                                        : stats.gameHistory[i].snow != null ? formatBigNumber(stats.gameHistory[i].snow)
                                        : stats.gameHistory[i].cash != null ? `$${formatBigNumber(stats.gameHistory[i].cash)}`
                                        : stats.gameHistory[i].crypto != null ? `₿ ${formatBigNumber(stats.gameHistory[i].crypto)}`
                                        : stats.gameHistory[i].weight != null ? `${formatBigNumber(stats.gameHistory[i].weight)} lbs`
                                        : stats.gameHistory[i].classicPoints != null ? formatNumber(stats.gameHistory[i].classicPoints)
                                        : stats.gameHistory[i].wins != null ? `${stats.gameHistory[i].wins} ${1 === stats.gameHistory[i].wins ? "Win" : "Wins"}`
                                        : stats.gameHistory[i].result != null ? stats.gameHistory[i].result
                                        : stats.gameHistory[i].guests != null ? formatNumber(stats.gameHistory[i].guests)
                                        : stats.gameHistory[i].dmg != null ? formatNumber(stats.gameHistory[i].dmg)
                                        : stats.gameHistory[i].numBlooks != null ? formatNumber(stats.gameHistory[i].numBlooks)
                                        : stats.gameHistory[i].fossils != null ? formatNumber(stats.gameHistory[i].fossils)
                                        : null}
                                </div>
                            </div>
                        }) : <div style={{
                            position: "absolute",
                            display: "flex",
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px"
                        }}>No Games Played Yet</div>}
                    </div>
                </div>
                <div id="stats">
                    {Object.keys(statistics).map(category => {
                        const Icon = icons[category];
                        return <div key={category} className="statsCategory">
                            <div className="statsHeader">{<Icon className="statIcon" />}{category}</div>
                            {Object.keys(statistics[category]).map(stat => {
                                let value = stats[statistics[category][stat]];
                                return (<div key={stat} className="stat">
                                    <div className="statName">{stat}</div>
                                    <div className="statValue">{value != null ? (
                                        typeof value == "number" ? value > 9999999999 ? formatBigNumber(value) : formatNumber(value) : value
                                    ) : statistics[category][stat]}</div>
                                </div>)
                            })}
                        </div>
                    })}
                </div>
            </div>
        </Sidebar>
    </>);
}
export default Stats;