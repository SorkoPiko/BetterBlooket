import { Fragment, useEffect, useRef, useState, useCallback } from "react";
import CustomBlook from "../../blooks/CustomBlook";
import banners from "../../blooks/banners";
import titles from "../../blooks/titles";
import statistics, { icons } from "../../blooks/stats";
import Sidebar from "./Sidebar.jsx";
import "./stats.css";
import allBlooks, { freeBlooks } from "../../blooks/allBlooks";
import { setActivity } from "../../utils/discordRPC";
import { formatBigNumber, formatNumber, getOrdinal } from "../../utils/numbers";
import { useAuth } from "../../context/AuthContext";
import { getLevel, items } from "../../blooks/classPass";
import parts from "../../blooks/parts";
import BlookEditor from "../../blooks/BlookEditor";
import { readFile, writeFile } from "../../utils/fileSystem";
import { useNavigate } from "react-router-dom";
import { fetch } from "@tauri-apps/api/http";
import Modal from "../../components/Modal";
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
    let statSearch = new URLSearchParams(window.location.search).get("n");
    const navigate = useNavigate();
    const [stats, setStats] = useState({});
    const [blookUsage, setBlookUsage] = useState([]);
    const [classPass, setClassPass] = useState({ level: 0, xp: 0 });
    const [selectedIndex, setIndex] = useState(2);
    const [editing, setEditing] = useState(false);
    const [extraBlooks, setExtraBlooks] = useState([]);
    const [showExtras, setShowExtras] = useState(false);
    const [customBlooks, setCustomBlooks] = useState([]);
    const [changingProfile, setChangingProfile] = useState("");
    const [searching, setSearching] = useState(false);
    const [query, setQuery] = useState("");
    const [searchError, setSearchError] = useState(null);
    const { http: { get, put }, protobuf: { saveCustomBlook, changeUserBlook } } = useAuth();
    const currentPart = useRef();
    const onSearch = useCallback((search) => {
        navigate("/stats?n=" + search);
        getStats(search);
    }, []);
    useEffect(() => {
        setIndex(showExtras ? 0 : 2);
    }, [showExtras]);
    const getStats = useCallback(async (search) => {
        let res;
        if (search) res = await fetch("https://id.blooket.com/api/users?name=" + search);
        if (!res?.ok) res = await get("https://dashboard.blooket.com/api/users/stats");
        if (res.data.name != search && search) return setSearchError("Couldn't find user by that name!");
        else setSearching(false);
        setStats(res.data);
        setCustomBlooks(res.data.customBlooks.concat(Array(5 - res.data.customBlooks.length).fill("")));
    }, []);
    useEffect(() => {
        getExtraBlooks().then(setExtraBlooks);
        getStats();
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
            {changingProfile == "blook" ? <div onClick={(e) => e.target.id == "profileBlooksWrapper" && setChangingProfile(null)} id="profileBlooksWrapper">
                <div>
                    {Object.keys(allBlooks).filter(blook => freeBlooks.includes(blook) || stats.unlocks?.[blook]).map(blook => (<div key={blook} onClick={async () => {
                        await changeUserBlook({ blook });
                        setStats(s => ({ ...s, blook }));
                        setChangingProfile(null);
                    }}>
                        <img src={allBlooks[blook].url} alt={blook} />
                    </div>))}
                </div>
            </div> : changingProfile ? <div onClick={(e) => e.target.id == "profileChooseWrapper" && setChangingProfile(null)} id="profileChooseWrapper">
                <div>
                    <div id="profileChooseButtons">
                        <button onClick={() => setChangingProfile("banner")}>Banners</button>
                        <button onClick={() => setChangingProfile("title")}>Titles</button>
                    </div>
                    <div id="profileChoose">
                        {changingProfile == "banner" ? stats.banners ? Object.values(stats.banners).map(banner => (banner = banners[banner], <div onClick={async () => {
                            await put("https://dashboard.blooket.com/api/users/change/banner", { banner: banner.slug });
                            setStats(s => ({ ...s, banner: banner.slug }));
                            setChangingProfile("");
                        }} key={banner.slug}>
                            <img src={banner.url} alt={banner.name} />
                        </div>)) : "No Banners Unlocked" : stats.titles ? Object.entries(titles).filter(([title]) => "newbie" === title || stats.titles?.includes(title)).map(([title, { name }]) => (<div onClick={async () => {
                            await put("https://dashboard.blooket.com/api/users/change/title", { title });
                            setStats(s => ({ ...s, title }));
                            setChangingProfile("");
                        }} key={title}>
                            {name}
                        </div>)) : "No Titles Unlocked"}
                    </div>
                </div>
            </div> : null}
            {editing && <BlookEditor blookParts={showExtras ? Object.entries(parts).reduce((a, [b, c]) => (a[b] = c.map((x, i) => i), a), {}) : stats.blookParts} startCode={(showExtras ? extraBlooks : customBlooks)[selectedIndex]} close={async function (save, customCode) {
                if (save) if (showExtras) {
                    await writeFile("customBlooks.json", JSON.stringify((extraBlooks[selectedIndex] = customCode, extraBlooks)));
                    getExtraBlooks().then(setExtraBlooks);
                } else {
                    await saveCustomBlook({ customCode, saveSlotIndex: selectedIndex });
                    setCustomBlooks(blooks => (blooks[selectedIndex] = customCode, [...blooks]));
                }
                setEditing(false);
            }} />}
            <div id="topHalf">
                <div id="topLeft">
                    <div id="profile">
                        <div id="profileWrapper">
                            <div id="blook" className="blookContainer" onClick={() => {
                                setChangingProfile("blook");
                            }}>
                                <img src={allBlooks[stats.blook || "Chick"]?.url} alt={(stats.blook || "Chick") + " Blook"} draggable={false} className="blook" />
                            </div>
                            <div id="banner" onClick={() => setChangingProfile("banner")}>
                                {stats.banner
                                    ? <img src={banners[stats.banner]?.url} alt={banners[stats.banner]?.name} id="bannerImg" draggable={false} />
                                    : <img src={banners.starter.url} alt="Starter Banner" id="bannerImg" draggable={false} />}
                                <div id="nameHolder">
                                    <div id="username">{stats.name}</div>
                                    <div id="userTitle">{titles[stats.title]?.name || "Newbie"}</div>
                                </div>
                            </div>
                            <div className="statsSearch" onClick={() => setSearching(true)}>
                                <i className="fas fa-search"></i>
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
                        {(showExtras ? extraBlooks : (customBlooks || [])).map((code, i) => {
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
                            } else {
                                await saveCustomBlook({ customCode: "", saveSlotIndex: selectedIndex });
                                setCustomBlooks(blooks => (blooks[selectedIndex] = "", [...blooks]));
                            }
                        }} disabled={!(showExtras ? extraBlooks : customBlooks)?.[selectedIndex]}><i className="fa fa-trash" /></button>
                        <button onClick={() => setIndex(ind => Math.min((showExtras ? extraBlooks : customBlooks).length - 1, ind + 1))}>{">"}</button>
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
                        {stats.gameHistory?.length ? stats.gameHistory.slice().reverse().map(({ blookUsed, name, place }, i, gameHistory) => {
                            return <div key={i} className="pastGame">
                                {allBlooks[blookUsed] ? <img className="pastBlook" src={allBlooks[blookUsed].url} alt={blookUsed} /> : <CustomBlook className="pastBlook" blookClassName="pastCustomBlook" code={blookUsed} />}
                                <div className="pastInfo">
                                    <div className="pastInfoLeft">
                                        <div className="pastName">{name}</div>
                                        <div className="pastPlace">{place + getOrdinal(place)}</div>
                                    </div>
                                    {gameHistory[i].candy != null ? formatBigNumber(gameHistory[i].candy)
                                        : gameHistory[i].gold != null ? formatBigNumber(gameHistory[i].gold)
                                            : gameHistory[i].xp != null ? formatBigNumber(gameHistory[i].xp)
                                                : gameHistory[i].toys != null ? formatBigNumber(gameHistory[i].toys)
                                                    : gameHistory[i].shamrocks != null ? formatBigNumber(gameHistory[i].shamrocks)
                                                        : gameHistory[i].snow != null ? formatBigNumber(gameHistory[i].snow)
                                                            : gameHistory[i].cash != null ? `$${formatBigNumber(gameHistory[i].cash)}`
                                                                : gameHistory[i].crypto != null ? `₿ ${formatBigNumber(gameHistory[i].crypto)}`
                                                                    : gameHistory[i].weight != null ? `${formatBigNumber(gameHistory[i].weight)} lbs`
                                                                        : gameHistory[i].classicPoints != null ? formatNumber(gameHistory[i].classicPoints)
                                                                            : gameHistory[i].wins != null ? `${gameHistory[i].wins} ${1 === gameHistory[i].wins ? "Win" : "Wins"}`
                                                                                : gameHistory[i].result != null ? gameHistory[i].result
                                                                                    : gameHistory[i].guests != null ? formatNumber(gameHistory[i].guests)
                                                                                        : gameHistory[i].dmg != null ? formatNumber(gameHistory[i].dmg)
                                                                                            : gameHistory[i].numBlooks != null ? formatNumber(gameHistory[i].numBlooks)
                                                                                                : gameHistory[i].fossils != null ? formatNumber(gameHistory[i].fossils)
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
            {searching && <Modal text={"See User's Stats by Name (case sensitive)"} desc={searchError} input={{
                value: query,
                placeholder: "Username",
                change: e => (setSearchError(null), setQuery(e.target.value)),
                icon: "fas fa-search"
            }}
                buttonOne={{
                    text: "Search",
                    click: () => onSearch(query),
                }}
                buttonTwo={{
                    text: "Back",
                    click: () => setSearching(false),
                }} />}
        </Sidebar>
    </>);
}
export default Stats;