import { useEffect, useState, useCallback, useRef } from "react";
import Sidebar from "./Sidebar.jsx";
import { setActivity } from "../../utils/discordRPC";
import { useAuth } from "../../context/AuthContext.jsx";
import gameModes, { hwGamemodes } from "../../utils/gameModes.js";
import { relativeTime, DateFormat, formatNumber, getDimensions, getOrdinal } from "../../utils/numbers.js";
import { Link, useNavigate, useParams } from "react-router-dom";
import Modal from "../../components/Modal.jsx";
import QRCode from "react-qr-code";
import { freeBlooks } from "../../blooks/allBlooks.js";
import { imageUrl, shuffleArray } from "../../utils/questions.js";
import Blook from "../../blooks/Blook.jsx";
import { Textfit } from "react-textfit";
import { Doughnut } from "react-chartjs-2";
import "./homeworks.css";
import PlayAudio from "../../components/PlayAudio.jsx";
import { StaticMathField } from "react-mathquill";
import { basic, shamrock } from "../../utils/images.js";
import { holidays } from "../../utils/config.js";
import { Fragment } from "react";

function Game({ game, onDelete, ended }) {
    return <div className="homeworkWrapper">
        <Link style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }} to={`/history/game/${game._id}`} className={className("homeworkContainer", { ended })}>
            <Blook style={{ width: "65px" }} name={game.standings[0].blook} />
            <div>
                <div className="homeworkTitle">
                    {game.set}
                </div>
                <div className="homeworkInfo">
                    <div className="info">
                        <i className="fas fa-gamepad"></i>{gameModes[game.settings.type].name}
                    </div>
                    <div className="info">
                        <i className="fas fa-users"></i>{game.settings?.mode == "Teams" ? game.standings.reduce((a, b) => (a + b.players.length), 0) : game.standings?.length || 0}
                    </div>
                    <div className="info">
                        <i className="far fa-clock"></i>{new DateFormat(new Date(game.date)).format("hh:mm a, MM/DD/YY")}
                    </div>
                </div>
            </div>
        </Link>
        <div className="deleteGame" onClick={onDelete}>
            <i className="far fa-trash-alt"></i>
        </div>
    </div>
}

export default function History() {
    const { http, userData } = useAuth();
    const { get } = http;
    const [history, setHistory] = useState([]);
    const [toDelete, setToDelete] = useState(null);
    const onDelete = useCallback(async () => {
        try {
            await http.delete("https://dashboard.blooket.com/api/homeworks", { params: { id: toDelete._id } });
        } catch (e) {
            console.error(e);
        }
        getHistory();
        setToDelete(null);
    }, [toDelete]);
    const getHistory = useCallback(() => {
        get("https://dashboard.blooket.com/api/users/histories", { params: { id: userData._id } }).then(({ data }) => {
            // let hws = [], ended = [];
            // for (let hw of data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))) {
            //     let ends = new Date(hw.startTime).getTime() + hw.duration * 60 * 1000,
            //         isEnded = ends < Date.now();
            //     if (isEnded) ended.push({ ...hw, ends, isEnded });
            //     else hws.push({ ...hw, ends, isEnded });
            // }
            console.log(data)
            setHistory(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
            // setEnded(ended);
            // window.homeworks = { hws, ended };
        });
    }, []);
    useEffect(() => {
        getHistory();
        setActivity({
            state: "History",
            timestampStart: Date.now(),
        });
    }, []);
    return (<>
        <Sidebar>
            <div className="homeworkHeader">History</div>
            {history.length > 0
                ? <div className="homeworks">
                    {/* {JSON.stringify(history)} */}
                    {history.map(game => <Game key={game._id} game={game} onDelete={() => setToDelete(game)} />)}
                </div>
                : <div style={{ textAlign: "center" }}>You haven't hosted a game yet
                    <Link style={{
                        display: "block",
                        textAlign: "center",
                        padding: "5px 10px 5px 10px",
                        margin: "auto",
                        width: "fit-content",
                        fontSize: "1vw",
                    }} to="/discover">Discover Sets</Link>
                </div>}
            {toDelete && <Modal text={`Do you really want to delete homework "${toDelete.title}"?`} buttonOne={{ text: "Yes", click: onDelete, color: "red" }} buttonTwo={{ text: "No", click: () => setToDelete(null) }} />}
        </Sidebar>
    </>);
}

function listAnswers(answers, color, size) {
    return answers.map((answer, t) => {
        return <div className="correctContainer" key={t}>
            {t !== 0 && <span className="leftBack">& </span>}
            {answer.split("`~`").length == 2
                ? <img src={imageUrl(answer.split("`~`")[1])} alt="Answer" draggable={false} className="img" style={{
                    maxWidth: `calc(1.5 * ${size || 2.5}vw)`,
                    maxHeight: `calc(1.5 * ${size || 2}vh)`
                }} />
                : answer.slice(0, 3) == "`*`"
                    ? <StaticMathField className="mathField" style={{
                        color: color || "white",
                        borderColor: color || "white",
                        fontSize: `${size || 20}px`
                    }}>{answer.slice(3, answer.length - 3)}</StaticMathField>
                    : <span>{answer}</span>}
        </div>
    })
}

export function GameHistory() {
    const { id } = useParams();
    const { http, userData } = useAuth();
    const navigate = useNavigate();
    const [game, setGame] = useState({});
    const [results, setResults] = useState([]);
    const [justCopied, setJustCopied] = useState(false);
    const [totals, setTotals] = useState({ correct: 0, incorrect: 0, total: 0 });
    const [zoomedImage, setZoomedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const copyTimeout = useRef();
    useEffect(() => {
        if (justCopied) copyTimeout.current = setTimeout(() => setJustCopied(false), 1500);
    }, [justCopied])
    const refresh = useCallback(() => {
        setLoading(true);
        http.get("https://dashboard.blooket.com/api/history/byid", { params: { id: "" || id } }).then(({ data }) => {
            console.log(window.hw = data);
            let totalCorrect = 0, totalIncorrect = 0;
            data.questions.sort((a, b) => a.number - b.number)
            for (let i = 0; i < data.questions.length; i++) {
                data.questions[i].corrects = 0;
                data.questions[i].incorrects = 0;
            }
            setResults(data.standings.map((res, i) => {
                switch (data.settings.type) {
                    case "Racing":
                        res.amount = formatNumber(res.progress);
                        res.statText = `${res.amount}`; break;
                    case "Royale":
                        res.amount = formatNumber(res.wins);
                        res.statText = `${res.amount} Win${res.amount == 1 ? "" : "s"}`; break;
                    case "Classic":
                        res.amount = formatNumber(res.points);
                        res.statText = `${res.amount} Points${res.amount == 1 ? "" : "s"}`; break;
                    case "Factory":
                    case "Cafe":
                        res.amount = formatNumber(res.cash);
                        res.statText = `$${res.amount}`; break;
                    case "Hack":
                        res.amount = formatNumber(res.crypto);
                        res.statText = `\u20BF ${res.amount}`; break;
                    case "Fish":
                        res.amount = formatNumber(res.weight);
                        res.statText = `${res.amount} lbs`; break;
                    case "Defense":
                        res.amount = formatNumber(res.dmg);
                        res.statText = res.amount;
                        res.statEl = <i style={{ lineHeight: "50px", marginLeft: "5px" }} className="fas fa-splotch" />; break;
                    case "Defense2":
                        res.amount = formatNumber(res.dmg);
                        res.statText = res.amount;
                        res.statEl = <img src={basic.DamageIcon} alt="Damage" />; break;
                    case "Snow":
                        res.amount = formatNumber(res.health);
                        res.statText = res.amount;
                        res.statEl = <i style={{ lineHeight: "50px", marginLeft: "5px" }} className="far fa-snowflake" />; break;
                    case "Dino":
                        res.amount = formatNumber(res.fossils);
                        res.statText = res.amount;
                        res.statEl = <i style={{ lineHeight: "50px", transform: "rotate(-45deg)", marginLeft: "5px" }} className="fas fa-bone" />; break;
                    case "Shamrock":
                        res.amount = formatNumber(res.shamrocks);
                        res.statText = res.amount;
                        res.statEl = <img src={shamrock.shamrockWhite} alt="Shamrock" />; break;
                    case "Gold":
                        res.amount = formatNumber(res.gold);
                        res.statText = res.amount;
                        res.statEl = <img src={holidays.halloween ? basic.candy : basic.gold} alt="Gold" />; break;
                    case "Brawl":
                        res.amount = formatNumber(res.xp);
                        res.statText = res.amount;
                        res.statEl = <img src={basic.xp} alt="Xp" />; break;
                    case "Toy":
                        res.amount = formatNumber(res.toys);
                        res.statText = res.amount;
                        res.statEl = <img src={basic.toy} alt="Toy" />; break;
                    case "Rush":
                        res.amount = formatNumber(res.numBlooks);
                        res.statText = res.amount;
                        res.statEl = <Blook style={{ width: "65px", marginInline: "5px 15px" }} name={res.blook} className="standingBlook" />; break;
                    default:
                        res.amount = formatNumber(res.candy);
                        res.statText = res.amount
                        res.statEl = <img style={{ filter: "brightness(0) invert(1)" }} src={basic.candyDark} alt="Candy" />;
                }
                res.totalAnswers = 0;
                res.correctAnswers = 0;
                res.incorrects ||= {};
                res.corrects ||= {};
                if (data.settings.mode != "Teams") {
                    for (let incorrect in res.incorrects) {
                        res.totalAnswers += res.incorrects[incorrect];
                        totalIncorrect += res.incorrects[incorrect];
                        data.questions[incorrect - 1].incorrects += res.incorrects[incorrect]
                    }
                    for (let correct in res.corrects) {
                        res.totalAnswers += res.corrects[correct];
                        res.correctAnswers += res.corrects[correct];
                        totalCorrect += res.corrects[correct];
                        data.questions[correct - 1].corrects += res.corrects[correct]
                    }
                } else for (let player of res.players) {
                    player.totalAnswers = 0;
                    player.correctAnswers = 0;
                    player.incorrects ||= {};
                    player.corrects ||= {};
                    for (let incorrect in player.incorrects) {
                        res.incorrects[incorrect] = (res.incorrects[incorrect] || 0) + player.incorrects[incorrect];
                        player.totalAnswers += player.incorrects[incorrect];
                        res.totalAnswers += player.incorrects[incorrect];;
                        totalIncorrect += player.incorrects[incorrect];
                        data.questions[incorrect - 1].incorrects += player.incorrects[incorrect]
                    }
                    for (let correct in player.corrects) {
                        res.corrects[correct] = (res.corrects[correct] || 0) + player.corrects[correct];
                        player.totalAnswers += player.corrects[correct];
                        player.correctAnswers += player.corrects[correct];
                        res.totalAnswers += player.corrects[correct];
                        res.correctAnswers += player.corrects[correct];
                        totalCorrect += player.corrects[correct];
                        data.questions[correct - 1].corrects += player.corrects[correct]
                    }
                }
                return res;
            }))//.sort((a, b) => b.data.amount - a.data.amount));
            setGame(data);
            setTotals({ correct: totalCorrect, incorrect: totalIncorrect, total: totalCorrect + totalIncorrect });
            setLoading(false);
            setActivity({
                state: `"${data.set}" History`,
                timestampStart: Date.now(),
            });
        });
    }, []);
    useEffect(() => {
        window.dispatchEvent(new Event("resize"))
    }, [results]);
    const onDelete = useCallback(() => {
        setLoading(true);
        http.delete('https://dashboard.blooket.com/api/history', { params: { id, name: userData.name } })
            .then(() => {
                navigate("/history", { replace: true });
            }).catch((err) => {
                setDeleting(false);
                console.error(err);
            });
    }, []);
    useEffect(() => {
        refresh();
        return () => {
            clearTimeout(copyTimeout.current);
        }
    }, []);
    useEffect(() => { window.response = response }, [response]);
    return <Sidebar>
        <div className="hwResults">
            <div className="hwResultsTitle">{game.set}</div>
            <div className="hwDate">{new DateFormat(game.date).format("M/DD/YY")}</div>
            <div className="hwResultsData">
                <div className="chartContainer">
                    <Doughnut data={{
                        datasets: [
                            {
                                data: [totals.correct, totals.incorrect, totals.correct || totals.incorrect ? 0 : 1],
                                backgroundColor: ['#4bc22e', '#c43a35', '#737373'],
                                hoverBackgroundColor: ['#4bc22e', '#c43a35', '#737373'],
                            }
                        ]
                    }} options={{
                        maintainAspectRatio: false,
                        responsive: true,
                        legend: { display: false },
                        tooltips: { enabled: false },
                        animation: {
                            duration: 1500,
                            easing: "easeInQuint"
                        },
                        layout: { padding: 15 },
                        borderColor: "hsl(220, 10%, 12%)"
                    }} />
                    <div className="chartPercent">
                        {totals.total != 0 ? Math.round(totals.correct * 100 / totals.total) : 0}%
                        <div className="chartPercentSub">Correct</div>
                    </div>
                </div>
                <div className="resultsRight">
                    <div className="resultsPlayers">{game.settings?.mode == "Teams" ? results.reduce((a, b) => (a + b.players.length), 0) : results?.length} Players</div>
                    <div className="resultsCorrect">{totals.correct} Correct</div>
                    <div className="resultsincorrect">{totals.incorrect} Incorrect</div>
                </div>
            </div>
            <div className="resultsButtons">
                <div className="deleteHw" style={{ backgroundColor: "var(--red)" }} onClick={() => setDeleting(true)}>
                    <i className="far fa-trash-alt"></i>
                    Delete
                </div>
            </div>
        </div>
        {!loading && <>
            {results.length > 0 &&
                <div className="hwLeaderboard">
                    {results.map(result => {
                        return <Fragment>
                            <div key={result.name} className="resultWrapper">
                                <div className="resultContainer" onClick={() => result.totalAnswers > 0 && setResponse(result)}>
                                    {result.totalAnswers > 0
                                        ? <div className="hwProgress">
                                            <div className="hwResultPercent">
                                                {Math.round(result.correctAnswers * 100 / result.totalAnswers)}%
                                            </div>
                                            Correct
                                        </div>
                                        : <div className="hwProgress">Left Early</div>}
                                    <Blook style={{ maxWidth: "3.5vw", margin: "15px 5px" }} name={result.blook} />
                                    <Textfit mode="single" forceSingleModeWidth={false} min={1} max={26} className="hwPlayer">{result.name}</Textfit>
                                    <div className="progressBarContainer">
                                        <div className="progressCorrect">{result.correctAnswers}</div>
                                        <div className="progressBar" style={{ width: "100%", height: "100%", backgroundColor: "var(--red)" }}>
                                            <div className="barFill" style={{ width: `${result.correctAnswers * 100 / result.totalAnswers}%`, height: "100%", backgroundColor: result.totalAnswers == 0 ? '#737373' : "var(--green)" }}></div>
                                        </div>
                                        <div className="progressIncorrect">{result.totalAnswers - result.correctAnswers}</div>
                                    </div>
                                    <div className="resultStats">
                                        <Textfit mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("1.25vw")} className="resultStatText">{result.statText}</Textfit>
                                        {result.statEl}
                                    </div>
                                </div>
                            </div>
                            {game.settings.mode == "Teams" && result.players.map((result) => {
                                return <div key={result.name} className="resultWrapper teamPlayer">
                                    <div className="resultContainer" onClick={() => result.totalAnswers > 0 && setResponse(result)}>
                                        {result.totalAnswers > 0
                                            ? <div className="hwProgress">
                                                <div className="hwResultPercent">
                                                    {Math.round(result.correctAnswers * 100 / result.totalAnswers)}%
                                                </div>
                                                Correct
                                            </div>
                                            : <div className="hwProgress">Left Early</div>}
                                        <Blook style={{ maxWidth: "2vw", margin: "15px 5px" }} name={result.blook} />
                                        <Textfit mode="single" forceSingleModeWidth={false} min={1} max={26} className="hwPlayer">{result.name}</Textfit>
                                        <div className="progressBarContainer">
                                            <div className="progressCorrect">{result.correctAnswers}</div>
                                            <div className="progressBar" style={{ width: "100%", height: "100%", backgroundColor: "var(--red)" }}>
                                                <div className="barFill" style={{ width: `${result.correctAnswers * 100 / result.totalAnswers}%`, height: "100%", backgroundColor: result.totalAnswers == 0 ? '#737373' : "var(--green)" }}></div>
                                            </div>
                                            <div className="progressIncorrect">{result.totalAnswers - result.correctAnswers}</div>
                                        </div>
                                        <div className="resultStats">
                                            <Textfit mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("1.25vw")} className="resultStatText">{result.statText}</Textfit>
                                            {result.statEl}
                                        </div>
                                    </div>
                                </div>
                            })}
                        </Fragment>
                    })}
                </div>}
        </>}
        <div className="questionsWrapper" style={{ paddingBottom: "50px" }}>
            <div className="hw_questionHeader">Questions</div>
            <div className="hw_questionsContainer">
                {game.questions?.map(question => {
                    return <div key={question.num} className="hw_question">
                        <div className="hw_imageContainer" onClick={() => question.image && setZoomedImage(question.image)}>
                            {question.image
                                ? <img style={{ width: "100%", height: "100%", objectFit: "cover" }} src={imageUrl(question.image)} alt="Question Background" className="hw_questionImage" />
                                : <div className="hw_imageNumber">{question.num}</div>}
                        </div>
                        {question.audio
                            ? <div className="hw_questionFunc"><PlayAudio audioUrl={question.audio} width="45%" /></div>
                            : question.text.includes("`*`") && <Textfit className="hw_questionFunc" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("1vw")}>
                                <StaticMathField className="hw_qMathField">{question.text.slice(question.text.indexOf("`*`") + 3, question.text.length - 3)}</StaticMathField>
                            </Textfit>}
                        <div className={className("hw_questionBox", { hw_questionWithFunc: question.text.includes("`*`") || question.audio })}>
                            <div className="hw_questionText">
                                {question.text.includes("`*`")
                                    ? question.text.slice(0, question.text.indexOf("`*`"))
                                    : question.text}
                            </div>
                            <div className="hw_answerText">Answer: {listAnswers(question.answers)}</div>
                        </div>
                        <div className="hw_statsBox">
                            <Doughnut data={{
                                datasets: [
                                    {
                                        data: [question.corrects, question.incorrects, question.corrects || question.incorrects ? 0 : 1],
                                        backgroundColor: ['#4bc22e', '#c43a35', '#737373'],
                                        hoverBackgroundColor: ['#4bc22e', '#c43a35', '#737373']
                                    }
                                ]
                            }} options={{
                                cutout: '75%',
                                maintainAspectRatio: false,
                                responsive: true,
                                legend: { display: false },
                                tooltips: { enabled: false },
                                animation: { duration: 0 },
                                layout: { padding: 2 },
                                borderColor: "hsl(210, 8%, 5%)"
                            }} />
                            <div className="hw_statsText">
                                {question.corrects}/{question.corrects + question.incorrects}
                            </div>
                        </div>
                    </div>
                })}
            </div>
        </div>
        {zoomedImage && <div className="hwModal" onClick={() => setZoomedImage("")}>
            <img src={zoomedImage} alt="Upload" style={{
                width: "80%",
                height: "80%",
                objectFit: "contain"
            }} onError={e => e.target.src = imageUrl(zoomedImage, true)} />
        </div>}
        {response && <div className="hwModal" onClick={(e) => {
            if (e.target.className == "hwModal") setResponse(null)
        }}>
            <div className="hwStanding">
                <div className="standingTop">
                    <Blook name={response.blook} className="hwStandingBlook" />
                    <Textfit className="hwStandingName" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5vw")}>{response.place && `${response.place}${getOrdinal(response.place)}. `}{response.name}</Textfit>
                    <div className="hwStandingChart">
                        <Doughnut data={{
                            datasets: [
                                {
                                    data: [response.correctAnswers, response.totalAnswers - response.correctAnswers],
                                    backgroundColor: ['#4bc22e', '#c43a35'],
                                    hoverBackgroundColor: ['#4bc22e', '#c43a35']
                                }
                            ]
                        }} options={{
                            cutout: '75%',
                            maintainAspectRatio: false,
                            responsive: true,
                            legend: { display: false },
                            tooltips: { enabled: false },
                            animation: { duration: 0 },
                            layout: { padding: 2 },
                            borderColor: "hsl(210, 8%, 5%)"
                        }} />
                        <div className="hwStandingGrade">{Math.round(response.correctAnswers * 100 / (response.totalAnswers))}%</div>
                    </div>
                </div>
                <div className="hwStandingData">
                    <div className="hwStandingAnswers">
                        {game.questions?.map(question => {
                            return <div key={question.num} className="hwStandingQuestion">
                                <div className="hwStandingImageContainer">
                                    {question.image
                                        ? <img style={{ width: "100%", height: "100%", objectFit: "cover" }} src={imageUrl(question.image)} alt="Question Background" className="hw_questionImage" />
                                        : <div className="hw_imageNumber">{question.num}</div>}
                                </div>
                                {question.audio
                                    ? <div className="hw_questionFunc"><PlayAudio audioUrl={question.audio} width="45%" /></div>
                                    : question.text.includes("`*`") && <Textfit className="hwStandingQuestionFunc" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("3vw")}>
                                        <StaticMathField className="hw_qMathField">{question.text.slice(question.text.indexOf("`*`") + 3, question.text.length - 3)}</StaticMathField>
                                    </Textfit>}
                                <div className={className("hw_questionBox", { hw_questionWithFunc: question.text.includes("`*`") || question.audio })}>
                                    <div className="hwStandingQuestionText">
                                        <span style={{ fontWeight: "700" }}>{question.num}.</span> {question.text.includes("`*`")
                                            ? question.text.slice(0, question.text.indexOf("`*`"))
                                            : question.text}
                                    </div>
                                </div>
                                <div className="hwStandingStatsBox">
                                    <Doughnut data={{
                                        datasets: [
                                            {
                                                data: (console.log(question), [response.corrects[question.num], response.incorrects[question.num], response.corrects[question.num] || response.incorrects[question.num] ? 0 : 1]),
                                                backgroundColor: ['#4bc22e', '#c43a35', '#737373'],
                                                hoverBackgroundColor: ['#4bc22e', '#c43a35', '#737373']
                                            }
                                        ]
                                    }} options={{
                                        cutout: '75%',
                                        maintainAspectRatio: false,
                                        responsive: true,
                                        legend: { display: false },
                                        tooltips: { enabled: false },
                                        animation: { duration: 0 },
                                        layout: { padding: 2 },
                                        borderColor: "hsl(210, 8%, 5%)"
                                    }} />
                                    <div className="hw_statsText" style={{ fontSize: "1vw" }}>
                                        {response.corrects[question.num] || 0}/{(response.corrects[question.num] || 0) + (response.incorrects[question.num] || 0)}
                                    </div>
                                </div>
                            </div>
                        })}
                    </div>
                </div>
            </div>
        </div>}
        {deleting && <Modal text={`Do you really want to delete this history?`}
            buttonOne={{ text: "Yes", click: onDelete, color: "var(--red)" }}
            buttonTwo={{ text: "No", click: () => setDeleting(false) }} />}
        {/* {JSON.stringify(game, null, 4).split("\n").map((x, i) => {
            return <div key={i} style={{ paddingLeft: (x.split("  ").length - 1) * 16 }}>{x}</div>
        })}
        {JSON.stringify(results, null, 4).split("\n").map((x, i) => {
            return <div key={i} style={{ paddingLeft: (x.split("  ").length - 1) * 16 }}>{x}</div>
        })} */}
    </Sidebar>
}