import { Fragment, useCallback, useEffect, useState } from "react";
import { useGame } from "../../context/GameContext"
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getParam } from "../../utils/location";
import gameModes from "../../utils/gameModes";
import InputSlider from "react-input-slider";
import "./settings.css";
import { setActivity } from "../../utils/discordRPC";
import { shuffleArray } from "../../utils/questions";

export default function HostSettings() {
    const navigate = useNavigate();
    const gid = getParam("gid");
    const [gameSet, setGameSet] = useState({
        title: "",
        questions: []
    });
    const [ready, setReady] = useState(false);
    const [gameMode, setGameMode] = useState(gameModes.Gold);
    const [settings, setSettings] = useState({
        randomOrder: false,
        raceEvery: 5,
        energy: 5,
        instruct: true,
        mode: "",
        type: "",
        method: "host",
        amount: 7,
        glitchesOn: true,
        lateJoin: true,
        randomNames: false,
        allowAccounts: true,
        map: "meadow",
        difficulty: "normal"
    });
    const [que, setQue] = useState({ numQ: 25, maxQ: 0 })
    const { addHostQuestions, setSettings: addSettings } = useGame();
    const { http: { get } } = useAuth();
    useEffect(() => {
        window.gameModes = gameModes;
        get("https://play.blooket.com/api/hostedgames/forhost", { params: { id: gid } }).then(({ data }) => {
            setGameMode(gameModes[data.gameMode]);
            setSettings({
                ...settings,
                amount: "Racing" == data.gameMode ? 30 : 7,
                type: data.gameMode,
                method: "host",
                mode: ["Factory", "Cafe", "Gold", "Brawl", "Hack", "Fish", "Toy", "Defense", "Defense2", "Dino",].includes(data.gameMode) ? "Time" : "Rush" === data.gameMode ? "Teams" : "Solo"
            });
            setActivity({
                state: `${gameModes[data.gameMode].name} Settings`,
                timestampStart: Date.now()
            });
            get("https://play.blooket.com/api/questionsets/detailforhostsettingspage", { params: { id: data.questionSetId } }).then(({ data: set }) => {
                if (!set.questions) return navigate("/sets");
                let questions = set.questions.map(question => ({
                    ...question,
                    timeLimit: parseInt(question.timeLimit, 10),
                    stdNumber: question.number,
                    image: question.image?.url,
                    audio: question.audio?.url,
                }));
                addHostQuestions(questions);
                setGameSet({ ...set, questions });
                setQue({ maxQ: questions.length, numQ: Math.min(25, questions.length) });
                setReady(true);
            });
        });
    }, []);
    const onHost = useCallback(() => {
        let opts = {
            type: settings.type,
            mode: settings.mode,
            lateJoin: settings.lateJoin,
            randomNames: settings.randomNames,
            allowAccounts: settings.allowAccounts
        }
        switch (settings.type) {
            case "Classic":
            case "Candy":
                let questions = JSON.parse(JSON.stringify(gameSet.questions));
                if (settings.randomOrder) {
                    questions = shuffleArray(questions);
                    for (let i = 0; i < questions.length; i++) questions[i].number = i + 1;
                }
                questions.sort((a, b) => a.number - b.number);
                questions = questions.slice(0, que.numQ);
                addHostQuestions(questions);
                opts.mode = "Solo";
                if (settings.type == "Candy") opts.instruct = settings.instruct;
                break;
            case "Racing":
                opts.mode = "Solo";
                opts.amount = settings.amount;
                break;
            case "Factory":
                opts.amount = settings.amount;
                opts.glitchesOn = settings.glitchesOn;
                break;
            case "Cafe":
            case "Brawl":
                opts.amount = settings.amount;
                break;
            case "Gold":
            case "Hack":
            case "Fish":
            case "Toy":
            case "Dino":
                opts.instruct = settings.instruct;
                opts.amount = settings.amount;
                break;
            case "Defense":
                opts.map = settings.map;
                opts.amount = settings.amount;
                break;
            case "Defense2":
                opts.map = settings.map;
                opts.difficulty = settings.difficulty;
                opts.amount = settings.amount;
                break;
            case "Rush":
                opts.lateJoin = "Solo" === settings.mode && settings.lateJoin;
                opts.instruct = settings.instruct;
                opts.amount = settings.amount;
                break;
        }
        addSettings(opts);
        navigate("/host/join");
    }, [settings, que]);
    return ready && <>
        <div id="hostSettingsBackground" style={{
            position: "fixed",
            width: "100%",
            height: "100%",
            left: "0",
            top: "0",
            background: "linear-gradient(var(--accent2), var(--accent4))",
            overflow: "hidden",
        }}>
            <div style={{
                position: "absolute",
                width: "200%",
                height: "200%",
                top: "50%",
                left: "50%",
                backgroundSize: "20%",
                backgroundPosition: "-100px -100px",
                opacity: ".1",
                transform: "translate(-50%,-50%) rotate(15deg)",
                backgroundImage: 'url("https://ac.blooket.com/play/65a43218fd1cabe52bdf1cda34613e9e.png")'
            }}></div>
        </div>
        <div id="backButton" style={{ backgroundColor: "var(--accent2)" }} onClick={() => navigate(-1)}><i className="fas fa-reply" />Back</div>
        <div id="hostSettingsWrapper">
            <div id="hostSettingsContainer">
                <div id="hostSettingsSet">{gameSet.title}</div>
                <div id="hostButton" onClick={onHost}>Host Now</div>
                {gameMode.modes && <>
                    <div id="hostSettingsModes">
                        {Object.keys(gameMode.modes).map((mode) => {
                            return <div onClick={() => setSettings({ ...settings, mode, ...(gameMode.modes[mode].amount ? { amount: gameMode.modes[mode].amount } : {}) })} style={{
                                opacity: settings.mode == mode ? 1 : 0.6
                            }} key={mode}>
                                {gameMode.modes[mode].icon ? <i className={`${gameMode.modes[mode].icon}`} /> : <img src={gameMode.modes[mode].image} />}
                                <div className="hostSettingsModeTitle">{gameMode.modes[mode].title}</div>
                                <div className="hostSettingsModeDesc">{gameMode.modes[mode].desc}</div>
                            </div>
                        })}
                    </div>
                    {gameMode.modes?.[settings.mode]?.input && <div id="amountContainer">
                        <i className={`${gameMode.modes[settings.mode].inputIcon}`} />
                        <div>{gameMode.modes[settings.mode].input}</div>
                        <input type="number" max={settings.mode == "Time" ? 30 : settings.type == "Brawl" ? 2591 : 1e12} value={settings.amount} onChange={e => setSettings({ ...settings, amount: Math.max(1, Math.min((settings.mode == "Time" || settings.type == "Rush") ? 30 : settings.type == "Brawl" ? 2591 : 1e12, parseInt(e.target.value))) })} />
                    </div>}
                    {gameMode.extra?.map && <>
                        <div id="hostSettingsHeader">Map Selection</div>
                        <div id="hostSettingsMaps">
                            {Object.entries(gameMode.extra.map).map(([map, data]) => (<div className="hostSettingMap" data-selected={settings.map == map} key={map} onClick={() => setSettings({ ...settings, map })}>
                                <div style={{ position: "relative" }}>
                                    <img src={data.img || data.smallImg} alt={data.name} />
                                </div>
                                {data.name}
                            </div>))}
                        </div>
                    </>}
                    {gameMode.extra?.difficulty && <>
                        <div id="hostSettingsHeader">Difficulty Selection</div>
                        <div id="hostSettingsMaps">
                            {Object.entries(gameMode.extra.difficulty).map(([difficulty, data]) => (<div className="hostSettingDifficulty" data-selected={settings.difficulty == difficulty} key={difficulty} onClick={() => setSettings({ ...settings, difficulty })}>
                                <div style={{
                                    position: "relative",
                                    width: "100px",
                                    height: "130px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}>
                                    <img style={{ width: data.width }} src={data.img} alt={data.name} />
                                </div>
                                {data.name}
                            </div>))}
                        </div>
                    </>}
                </>}
                <div id="hostSettings">
                    <div id="hostSettingsHeader">{gameMode.name} Settings</div>
                    {Object.entries(gameMode.settings).map(([setting, data], i, arr) => {
                        return <Fragment key={setting}>
                            <div style={typeof settings[setting] == "boolean" ? {} : {
                                flexDirection: "column"
                            }} className="hostSetting">
                                <div className="hostSettingInfo" style={typeof settings[setting] == "boolean" ? {} : {
                                    maxWidth: "unset"
                                }}>
                                    <div className="hostSettingText">{data.title}{setting == "energy" && (settings.mode == "Solo" ? "Person" : "Team")}</div>
                                    <div className="hostSettingDesc">{data.desc || ""}</div>
                                </div>
                                {typeof settings[setting] == "boolean"
                                    ? <div onClick={() => {
                                        setSettings({ ...settings, [setting]: !settings[setting] });
                                    }} className={`hostSettingCheckbox${settings[setting] ? " hostSettingChecked" : ""}`}><i className="fas fa-check" /></div>
                                    : data.choices
                                        ? <div className="hostSettingChoices">
                                            {data.choices.map(choice => {
                                                return <div onClick={() => setSettings({ ...settings, [setting]: choice })} data-selected={settings[setting] == choice} key={`choice${choice}`}>
                                                    {choice}
                                                </div>
                                            })}
                                        </div>
                                        : <div className="hostSettingSlider">
                                            <InputSlider axis="x" x={setting == "numQ" ? que.numQ : settings[setting]} xmin={1} xmax={setting == "numQ" ? que.maxQ : data.max} onChange={setting == "numQ" ? e => setQue({ ...que, numQ: e.x }) : (e) => setSettings({ ...settings, [setting]: e.x })} styles={{
                                                track: {
                                                    height: 10,
                                                    width: "75%",
                                                    borderRadius: 10,
                                                    marginLeft: 10
                                                },
                                                active: {
                                                    backgroundColor: "var(--accent2)",
                                                    borderRadius: 10
                                                },
                                                thumb: {
                                                    height: 25,
                                                    width: 25,
                                                    boxShadow: "0 0 8px rgba(0,0,0,.4)",
                                                    cursor: "pointer"
                                                }
                                            }} />
                                            <input className="hostSettingInput" type="number" min={1} max={setting == "numQ" ? que.maxQ : data.max} value={setting == "numQ" ? que.numQ : settings[setting]} onChange={setting == "numQ" ? e => setQue({ ...que, numQ: parseInt(e.target.value) }) : (e) => setSettings({ ...settings, [setting]: parseInt(e.target.value) })} />
                                        </div>
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
        </div>
    </>
}