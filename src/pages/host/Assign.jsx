import { Navigate, useNavigate } from "react-router-dom";
import { getParam } from "../../utils/location"
import { useCallback, useEffect, useRef, useState } from "react";
import { setActivity } from "../../utils/discordRPC";
import { useGame } from "../../context/GameContext";
import { useAuth } from "../../context/AuthContext";
import { basic } from "../../utils/images";
import { getOrdinal } from '../../utils/numbers';
import "./assign.css";
import { hwGamemodes } from "../../utils/gameModes";
import { Fragment } from "react";
import InputSlider from "react-input-slider";

function parseDate(minutes) {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const day = date.getDate();
    const hours = date.getHours();

    return `${months[date.getMonth()]} ${day}${getOrdinal(day)}, ${date.getFullYear()} - ${hours % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

export default function Assign() {
    const { http: { get, post } } = useAuth();
    window.useGame = useGame();
    const { host: hostRef, deleteHost, setSettings, addGameId, liveGameController } = window.useGame;
    const hwId = getParam("hwId");
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [hwTitle, setHwTitle] = useState("");
    const [gamemode, setGamemode] = useState(hwGamemodes.Defense2);
    const [hwSettings, setHwSettings] = useState({
        mode: "",
        type: "",
        method: "",
        amount: 7,
        allowAccounts: true
    });
    const [questionCount, setQuestionCount] = useState(0);
    const [time, setTime] = useState({
        days: 1,
        hours: 0,
        minutes: 0
    });
    const [loading, setLoading] = useState(true);
    const [ready, setReady] = useState(false);
    const duration = useRef(1440);
    const onAssign = useCallback(() => {
        let host = hostRef.current;
        setLoading(true);
        let t = {
            type: host.settings.type,
            allowAccounts: hwSettings.allowAccounts,
            amount: Number(hwSettings.amount)
        };
        if (t.type == "Factory") t.mode = hwSettings.mode;
        post("https://play.blooket.com/api/homeworks/assignments", {
            homeworkId: hwId,
            title: hwTitle,
            duration: duration.current,
            settings: t
        }).then(({ data }) => {
            if (!data) return setLoading(false);
            navigate(`/homework/${hwId}`);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [hwSettings, title, hwTitle]);
    const onAmountUpdate = useCallback((e) => {
        setHwSettings(s => ({ ...s, amount: Math.min("Brawl" === s.type ? 60 : 1e12, Math.max(1, e.target.value)) }))
    }, []);
    const onDurationUpdate = useCallback((e, t) => {
        let value = Math.max(0, e);
        let days = "days" == t ? value : time.days;
        let hours = "hours" == t ? value : time.hours;
        let minutes = "minutes" == t ? value : time.minutes;
        duration.current = 24 * days * 60 + 60 * hours + minutes;
        setTime({ days, hours, minutes });
    }, [time]);
    useEffect(() => {
        if (!hwId) return navigate("/sets");
        let host = hostRef.current;
        if (liveGameController.liveGameCode && liveGameController.isHost) liveGameController.removeHostAndDeleteGame();
        if (!host?.settings || !hwId) {
            console.log(host, hwId)
            deleteHost();
            return navigate("/sets");
        }
        setGamemode(hwGamemodes[host.settings.type]);
        window.scrollTo(0, 0);
        if (host.settings && host.questions) {
            let settings = { ...host.settings },
                setId = host.setId;
            deleteHost();
            setSettings(settings);
            addGameId(setId);
            host = hostRef.current;
        }
        let opts = {
            type: host.settings.type,
            method: host.settings.method,
            mode: "Cash",
            allowAccounts: true
        };
        switch (host.settings.type) {
            case "Kingdom":
            case "Brawl":
                opts.amount = 30;
                break;
            case "Defense":
            case "Defense2":
                opts.amount = 20;
                break;
            case "Cafe":
                opts.amount = 7;
                break;
            default:
                opts.amount = 1000000
        }
        setHwSettings(opts);
        get("https://play.blooket.com/api/questionsets/detailforassignpage", { params: { id: host.setId } }).then(({ data }) => {
            console.log(data, hwId)
            if (data.questionCount == 0) navigate("/sets");
            else {
                setLoading(false);
                setTitle(data.title);
                setHwTitle(data.title + " HW")
                setQuestionCount(data.questionCount);
            }
            setReady(true);
        }).catch(console.error);
        setActivity({
            state: "Assigning Homework",
            timestampStart: Date.now()
        });
    }, []);
    if (!ready) return;
    let host = hostRef.current;
    if (!host?.settings || !hwId) return <Navigate to="/sets" />
    return <div className="body">
        <div className="assign_background">
            <div className="assign_blooksBackground" style={{ backgroundImage: `url(${basic.blookCheckers})` }}></div>
        </div>
        {questionCount == 0 && ready
            ? <div className="assign_nothingContainer">
                <div className="assign_nothingText">Can't assign a set with 0 questions</div>
                <a href="/sets" className="assign_linkText">Go Back</a>
            </div>
            : <div className="assign_center">
                <div className="assign_header">Blooket</div>
                <div className="assign_mainContainer">
                    <div className="assign_setTitleText">{title}</div>
                    {loading || <div className="assign_assignButton" onClick={onAssign}>
                        <div className="assign_assignText">Assign Now</div>
                    </div>}
                    <div className="assign_descText">{"\n                  Assigning Homework allows students to complete a game on their own time.\n                  You'll be given a link and QR code that is valid for the time specified below.\n                  When students use this link, they'll be able to play the game and answer questions.\n                  Then, you'll get live updates on their progress and performance.\n                "}</div>
                    <div className="assign_dateText">Due: {parseDate(duration.current)}</div>
                    <div className="assign_settingsText">Change Time:</div>
                    <div className="assign_amountContainer">
                        <i className="assign_amountIcon fa-regular fa-clock"></i>
                        <div className="assign_amountColumn">
                            <div className="assign_amountHeader">Days</div>
                        </div>
                        <input type="number" className="assign_amountInput" name="days" value={time.days} min={0} onChange={(e) => onDurationUpdate(Math.min(e.target.value, 365), e.target.name)} />
                    </div>
                    <div className="assign_amountContainer">
                        <i className="assign_amountIcon fa-regular fa-clock"></i>
                        <div className="assign_amountColumn">
                            <div className="assign_amountHeader">Hours</div>
                        </div>
                        <input type="number" className="assign_amountInput" name="hours" value={time.hours} min={0} onChange={(e) => onDurationUpdate(Math.min(e.target.value, 23), e.target.name)} />
                    </div>
                    <div className="assign_amountContainer">
                        <i className="assign_amountIcon fa-regular fa-clock"></i>
                        <div className="assign_amountColumn">
                            <div className="assign_amountHeader">Minutes</div>
                        </div>
                        <input type="number" className="assign_amountInput" name="minutes" value={time.minutes} min={0} onChange={(e) => onDurationUpdate(Math.min(e.target.value, 59), e.target.name)} />
                    </div>
                    <div className="assign_settingsText">Change HW Title:</div>
                    <div className="assign_amountContainer">
                        <input className="assign_textInput" value={hwTitle} placeholder="HW Title" onChange={(e) => setHwTitle(e.target.value)} />
                    </div>
                    <div className="assign_settingsText">Settings:</div>
                    {gamemode.desc && <div className="assign_descText" >{gamemode.desc}</div>}
                    {gamemode.modes && <>
                        <div id="hostSettingsModes">
                            {Object.keys(gamemode.modes).map((mode) => {
                                return <div onClick={() => setHwSettings({ ...hwSettings, mode, ...(gamemode.modes[mode].amount ? { amount: gamemode.modes[mode].amount } : {}) })} style={{
                                    opacity: hwSettings.mode == mode ? 1 : 0.6
                                }} key={mode}>
                                    {gamemode.modes[mode].icon ? <i className={`${gamemode.modes[mode].icon}`} /> : <img src={gamemode.modes[mode].image} />}
                                    <div className="hostSettingsModeTitle">{gamemode.modes[mode].title}</div>
                                    <div className="hostSettingsModeDesc">{gamemode.modes[mode].desc}</div>
                                </div>
                            })}
                        </div>
                        {gamemode.modes?.[hwSettings.mode]?.input && <div id="amountContainer">
                            <i className={`${gamemode.modes[hwSettings.mode].inputIcon}`} />
                            <div>{gamemode.modes[hwSettings.mode].input}</div>
                            <input type="number" max={hwSettings.mode == "Time" ? 30 : hwSettings.type == "Brawl" ? 2591 : 1e12} value={hwSettings.amount} onChange={e => setHwSettings({ ...hwSettings, amount: Math.max(1, Math.min((hwSettings.mode == "Time" || hwSettings.type == "Rush") ? 30 : hwSettings.type == "Brawl" ? 2591 : 1e12, parseInt(e.target.value))) })} />
                        </div>}
                    </>}
                    <div id="hostSettings">
                        {Object.entries(gamemode.settings).map(([setting, data], i, arr) => {
                            return <Fragment key={setting}>
                                <div className="assign_amountContainer">
                                    {data.icon
                                        ? <i className={className("assign_amountIcon", data.icon)}></i>
                                        : data.img && <img className="assign_amountImg" src={data.img} />}
                                    <div className="assign_amountColumn">
                                        <div className="assign_amountHeader">{data.title}{setting == "energy" && (hwSettings.mode == "Solo" ? "Person" : "Team")}</div>
                                        <div className="assign_amountDesc">{data.desc || ""}</div>
                                        {/* {typeof hwSettings[setting] !== "boolean" && <input type="number" min={1} className="assign_amountInput" value={hwSettings.amount} onChange={onAmountUpdate} />} */}
                                    </div>
                                    {typeof hwSettings[setting] == "boolean"
                                        ? <div onClick={() => setHwSettings({ ...hwSettings, [setting]: !hwSettings[setting] })} className={`hostSettingCheckbox${hwSettings[setting] ? " hostSettingChecked" : ""}`}><i className="fas fa-check" /></div>
                                        : <input type="number" min={1} className="assign_amountInput" value={hwSettings.amount} onChange={onAmountUpdate} />
                                    }
                                </div>
                                {i < arr.length - 1 && <div style={{
                                    height: "3px",
                                    width: "calc(100% - 20px)",
                                    margin: "10px auto",
                                    backgroundColor: "#e0e0e0",
                                    borderRadius: "3px",
                                }}></div>}
                            </Fragment>
                        })}
                    </div>
                </div>
            </div>}
        <div id="backButton" style={{ backgroundColor: "var(--accent2)" }} onClick={() => navigate(-1)}><i className="fas fa-reply" />Back</div>
    </div>
}