import { Fragment, useEffect, useState } from "react";
import { useGame } from "../../context/GameContext"
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getParam } from "../../utils/location";
import gameModes from "../../utils/gameModes";
import InputSlider from "react-input-slider";
import "./settings.css";

export default function HostSettings() {
    const navigate = useNavigate();
    const gid = getParam("gid");
    const [gameSet, setGameSet] = useState({
        title: "",
        questions: []
    });
    const [gameMode, setGameMode] = useState(gameModes.Gold);
    const [settings, setSettings] = useState({
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
    const { addHostQuestions } = useGame();
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
            });
        });
    }, []);
    return <>
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
        <div id="hostSettingsContainer">
            <div id="hostSettingsSet">{gameSet.title}</div>
            <div id="hostButton">Host Now</div>
            {gameMode.modes && <>
                <div id="hostSettingsModes">
                    {Object.keys(gameMode.modes).map((mode) => {
                        return <div onClick={() => setSettings({ ...settings, mode })} style={{
                            opacity: settings.mode == mode ? 1 : 0.6
                        }} key={mode}>
                            {gameMode.modes[mode].icon ? <i className={`${gameMode.modes[mode].icon}`} /> : <img src={gameMode.modes[mode].image} />}
                            <div className="hostSettingsModeTitle">{gameMode.modes[mode].title}</div>
                            <div className="hostSettingsModeDesc">{gameMode.modes[mode].desc}</div>
                        </div>
                    })}
                </div>
                {gameMode.modes?.[settings.mode]?.input && <>
                    <i className={`${gameMode.modes[settings.mode].inputIcon}`} />
                    {gameMode.modes[settings.mode].input}
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
                                        <InputSlider axis="x" x={settings[setting]} xmin={1} xmax={data.max} onChange={(e) => setSettings({ ...settings, [setting]: e.x })} styles={{
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
                                        <input className="hostSettingInput" type="number" min={1} max={data.max} value={settings[setting]} onChange={(e) => setSettings({ ...settings, [setting]: parseInt(e.target.value) })} />
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
    </>
}