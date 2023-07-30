import { useEffect, useState, useCallback, useRef } from "react";
import Sidebar from "./Sidebar.jsx";
import { setActivity } from "../../utils/discordRPC";
import { useAuth } from "../../context/AuthContext.jsx";
import { hwGamemodes } from "../../utils/gameModes.js";
import { relativeTime, DateFormat, formatNumber, getDimensions } from "../../utils/numbers.js";
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

function HW({ hw, onDelete, ended }) {
    return <div className="homeworkWrapper">
        <Link to={`/homework/${hw._id}`} className={className("homeworkContainer", { ended })}>
            <div className="homeworkTitle">
                {hw.title}
            </div>
            <div className="homeworkInfo">
                <div className="info">
                    <i className="fas fa-gamepad"></i>{hwGamemodes[hw.settings.type].name}
                </div>
                <div className="info">
                    <i className="fas fa-users"></i>{hw.resultIds?.length || 0}
                </div>
                <div className="info">
                    <i className="far fa-clock"></i>Due {relativeTime(hw.ends)}
                </div>
            </div>
        </Link>
        <div className="deleteGame" onClick={onDelete}>
            <i className="far fa-trash-alt"></i>
        </div>
    </div>
}

export default function Homeworks() {
    const { http } = useAuth();
    const { get } = http;
    const [homeworks, setHomeworks] = useState([]);
    const [ended, setEnded] = useState([]);
    const [toDelete, setToDelete] = useState(null);
    const onDelete = useCallback(async () => {
        try {
            await http.delete("https://dashboard.blooket.com/api/homeworks", { params: { id: toDelete._id } });
        } catch (e) {
            console.error(e);
        }
        // getHomeworks();
        if (toDelete.isEnded) setEnded(e => e.filter(x => x._id != toDelete._id));
        setHomeworks(e => e.filter(x => x._id != toDelete._id));
        setToDelete(null);
    }, [toDelete]);
    const getHomeworks = useCallback(() => {
        get("https://dashboard.blooket.com/api/users/homeworks").then(({ data }) => {
            let hws = [], ended = [];
            for (let hw of data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))) {
                let ends = new Date(hw.startTime).getTime() + hw.duration * 60 * 1000,
                    isEnded = ends < Date.now();
                if (isEnded) ended.push({ ...hw, ends, isEnded });
                else hws.push({ ...hw, ends, isEnded });
            }
            setHomeworks(hws);
            setEnded(ended);
            window.homeworks = { hws, ended };
        });
    }, []);
    useEffect(() => {
        getHomeworks();
        setActivity({
            state: "Homework",
            timestampStart: Date.now(),
        });
    }, []);
    return (<>
        <Sidebar>
            {homeworks.length > 0 ? <>
                <div className="homeworkHeader">Homework</div>
                <div className="homeworks">
                    {homeworks.map(hw => <HW hw={hw} onDelete={() => setToDelete(hw)} />)}
                </div>
            </> : ended.length == 0 && <>
                <div className="homeworkHeader">Homework</div>
                <div style={{ textAlign: "center" }}>You haven't assigned any Homeworks yet</div>
            </>
            }
            {ended.length > 0 && <>
                <div className="homeworkHeader">Ended</div>
                <div className="endedHw">
                    {ended.map(hw => <HW hw={hw} onDelete={() => setToDelete(hw)} ended={true} />)}
                </div>
            </>}
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

export function Homework() {
    const { id } = useParams();
    const { http } = useAuth();
    const navigate = useNavigate();
    const [game, setGame] = useState({});
    const [results, setResults] = useState([]);
    const [justCopied, setJustCopied] = useState(false);
    const [totals, setTotals] = useState({ correct: 0, incorrect: 0, total: 0 });
    const [zoomedImage, setZoomedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState(null);
    const [deleteStanding, setDeleteStanding] = useState(null);
    const [extending, setExtending] = useState(false);
    const [extendAmount, setExtendAmount] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const copyTimeout = useRef();
    useEffect(() => {
        if (justCopied) copyTimeout.current = setTimeout(() => setJustCopied(false), 1500);
    }, [justCopied])
    const refresh = useCallback(() => {
        setLoading(true);
        http.get("https://dashboard.blooket.com/api/homeworks/byid/results", { params: { id: "" || id } }).then(({ data }) => {
            console.log(window.hw = data);
            let totalCorrect = 0, totalIncorrect = 0;
            let blooks = shuffleArray(freeBlooks).slice(0, data.results.length);
            data.metaData.questions.sort((a, b) => a.number - b.number)
            for (let i = 0; i < data.metaData.questions.length; i++) {
                data.metaData.questions[i].corrects = 0;
                data.metaData.questions[i].incorrects = 0;
            }
            setResults(data.results.map((res, i) => {
                res.blook = blooks[i]
                for (let key in res.data) if (["stage", "cash", "day", "round", "guests", "level"].includes(key)) {
                    let amount = res.data[key];
                    switch (key) {
                        case "stage": res.data.statText = amount == 34 ? "Ascended the Tower!" : `Cleared ${amount} Stage${amount == 1 ? "" : "s"}`; break;
                        case "cash": res.data.statText = `$${formatNumber(amount)}`; break;
                        case "day": res.data.statText = `Day ${amount}`; break;
                        case "round": res.data.statText = `Round ${amount - 1}`; break;
                        case "guests": res.data.statText = <>{amount}<i className="fas fa-users"></i></>; break;
                        case "level": res.data.statText = `Level ${amount}`; break;
                    }
                    res.data.amount = amount;
                }
                res.data.totalAnswers = 0;
                res.data.correctAnswers = 0;
                for (let incorrect in res.data.incorrects) {
                    res.data.totalAnswers += res.data.incorrects[incorrect];
                    totalIncorrect += res.data.incorrects[incorrect];
                    data.metaData.questions[incorrect - 1].incorrects += res.data.incorrects[incorrect]
                }
                for (let correct in res.data.corrects) {
                    res.data.totalAnswers += res.data.corrects[correct];
                    res.data.correctAnswers += res.data.corrects[correct];
                    totalCorrect += res.data.corrects[correct];
                    data.metaData.questions[correct - 1].corrects += res.data.corrects[correct]
                }
                return res;
            }).sort((a, b) => b.data.amount - a.data.amount));
            let endDate = new Date(new Date(data.metaData.startTime).getTime() + data.metaData.duration * 60000);
            setGame({
                ...data.metaData,
                date: new DateFormat(new Date(data.metaData.startTime)).format("MM/DD/YY"),
                endDate, isEnded: endDate < new Date(), daysLeft: Math.floor((endDate.getTime() - Date.now()) / (24 * 3600000))
            });
            setTotals({ correct: totalCorrect, incorrect: totalIncorrect, total: totalCorrect + totalIncorrect });
            setLoading(false);
            setActivity({
                state: `Homework "${data.metaData.title}"`,
                timestampStart: Date.now(),
            });
        });
    }, []);
    useEffect(() => {
        window.dispatchEvent(new Event("resize"))
    }, [results]);
    const onCopy = useCallback(() => {
        navigator.clipboard.writeText(new URL(`https://play.blooket.com/play?hwId=${game._id}`).href).then(() => setJustCopied(true));
    }, [game]);
    const onDeleteStanding = useCallback(() => {
        http.put("https://dashboard.blooket.com/api/homeworks/delete-result", {
            resultId: deleteStanding._id,
            hwId: deleteStanding.hwId,
            name: deleteStanding.name
        }).then(() => {
            setDeleteStanding(null);
            refresh();
        });
    }, [deleteStanding]);
    const onExtend = useCallback(() => {
        if (extendAmount <= 0) return setExtending(false);
        setLoading(true);
        http.put('https://dashboard.blooket.com/api/homeworks/extend', {
            hwId: id,
            minutes: 24 * extendAmount * 60,
            plus: true,
        }).then(() => {
            setExtending(false)
            refresh()
        }).catch((err) => {
            setExtending(false)
            console.error(err)
        });
    }, [extendAmount]);
    const onDelete = useCallback(() => {
        setLoading(true);
        http.delete('https://dashboard.blooket.com/api/homeworks', { params: { id } })
            .then(() => {
                navigate("/homework", { replace: true });
            }).catch((err) => {
                setDeleting(false);
                console.error(err);
            });
    }, [extendAmount]);
    useEffect(() => {
        refresh();
        return () => {
            clearTimeout(copyTimeout.current);
        }
    }, []);
    useEffect(() => { window.response = response }, [response]);
    return <Sidebar>
        {!game.isEnded && <div className="hwInfo">
            <div className="hwJoin">
                {justCopied && <div className="hwCopiedNotification">Copied!</div>}
                <div className="hwLink" onClick={onCopy}>Click to copy and share the link</div>
                OR<br/>
                Scan the QR code to join
            </div>
            <QRCode className="hwQrCode" size={1000} bgColor="white" fgColor="black" value={new URL(`https://play.blooket.com/play?hwId=${game._id}`).href}></QRCode>
        </div>}
        <div className="hwResults">
            <div className="hwResultsTitle">{game.title}</div>
            <div className="hwDate">{game.date}</div>
            {game.isEnded ? "Closed On" : "Closes At"}: {new DateFormat(game.endDate).format("MM/DD/YY - hh:mm A")}
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
                    <div className="resultsPlayers">{results.length} Players</div>
                    <div className="resultsCorrect">{totals.correct} Correct</div>
                    <div className="resultsincorrect">{totals.incorrect} Incorrect</div>
                </div>
            </div>
            <div className="resultsButtons">
                <div className="deleteHw" style={{ backgroundColor: "var(--red)" }} onClick={() => setDeleting(true)}>
                    <i className="far fa-trash-alt"></i>
                    Delete
                </div>
                <div className="extendHw" style={{ backgroundColor: "var(--accent1)" }} onClick={() => (setExtendAmount(1), setExtending(true))}>
                    <i className="fas fa-history"></i>
                    Extend
                </div>
                <div className="refreshHw" style={{ backgroundColor: "var(--accent2)" }} onClick={refresh}>
                    <i className="fas fa-sync-alt"></i>
                    Refresh
                </div>
            </div>
        </div>
        {!loading && <>
            {results.length > 0 &&
                <div className="hwLeaderboard">
                    {results.map(result => {
                        return <div key={result._id} className="resultWrapper">
                            <div className="resultContainer" onClick={() => result.data.totalAnswers > 0 && setResponse(result)}>
                                {result.data.totalAnswers > 0
                                    ? <div className="hwProgress">
                                        <div className="hwResultPercent">
                                            {Math.round(result.data.correctAnswers * 100 / result.data.totalAnswers)}%
                                        </div>
                                        Correct
                                    </div>
                                    : <div className="hwProgress">No Progress</div>}
                                <Blook style={{ maxWidth: "3.5vw", margin: "15px 5px" }} name={result.blook} />
                                <Textfit mode="single" forceSingleModeWidth={false} min={1} max={26} className="hwPlayer">{result.name}</Textfit>
                                <div className="progressBarContainer">
                                    <div className="progressCorrect">{result.data.correctAnswers}</div>
                                    <div className="progressBar" style={{ width: "100%", height: "100%", backgroundColor: "var(--red)" }}>
                                        <div className="barFill" style={{ width: `${result.data.correctAnswers * 100 / result.data.totalAnswers}%`, height: "100%", backgroundColor: result.data.totalAnswers == 0 ? '#737373' : "var(--green)" }}></div>
                                    </div>
                                    <div className="progressIncorrect">{result.data.totalAnswers - result.data.correctAnswers}</div>
                                </div>
                                <Textfit mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("1.25vw")} className="statText">{result.data.statText}</Textfit>
                            </div>
                            <div className="deleteButton" onClick={() => setDeleteStanding(result)}>
                                <i className="far fa-trash-alt"></i>
                            </div>
                        </div>
                    })}
                </div>}
        </>}
        <div className="questionsWrapper" style={{ paddingBottom: "50px" }}>
            <div className="hw_questionHeader">Questions</div>
            <div className="hw_questionsContainer">
                {game.questions?.map(question => {
                    return <div key={question.number} className="hw_question">
                        <div className="hw_imageContainer" onClick={() => question.image && setZoomedImage(question.image)}>
                            {question.image
                                ? <img style={{ width: "100%", height: "100%", objectFit: "cover" }} src={imageUrl(question.image)} alt="Question Background" className="hw_questionImage" />
                                : <div className="hw_imageNumber">{question.number}</div>}
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
                            <div className="hw_answerText">Answer: {listAnswers(question.qType == "typing" ? question.answers : question.correctAnswers)}</div>
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
                    <Textfit className="hwStandingName" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5vw")}>{response.name}</Textfit>
                    <div className="hwStandingChart">
                        <Doughnut data={{
                            datasets: [
                                {
                                    data: [response.data.correctAnswers, response.data.totalAnswers - response.data.correctAnswers],
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
                        <div className="hwStandingGrade">{Math.round(response.data.correctAnswers * 100 / (response.data.totalAnswers))}%</div>
                    </div>
                </div>
                <div className="hwStandingData">
                    <div className="hwStandingAnswers">
                        {game.questions?.map(question => {
                            return <div key={question.number} className="hwStandingQuestion">
                                <div className="hwStandingImageContainer">
                                    {question.image
                                        ? <img style={{ width: "100%", height: "100%", objectFit: "cover" }} src={imageUrl(question.image)} alt="Question Background" className="hw_questionImage" />
                                        : <div className="hw_imageNumber">{question.number}</div>}
                                </div>
                                {question.audio
                                    ? <div className="hw_questionFunc"><PlayAudio audioUrl={question.audio} width="45%" /></div>
                                    : question.text.includes("`*`") && <Textfit className="hwStandingQuestionFunc" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("3vw")}>
                                        <StaticMathField className="hw_qMathField">{question.text.slice(question.text.indexOf("`*`") + 3, question.text.length - 3)}</StaticMathField>
                                    </Textfit>}
                                <div className={className("hw_questionBox", { hw_questionWithFunc: question.text.includes("`*`") || question.audio })}>
                                    <div className="hwStandingQuestionText">
                                        <span style={{ fontWeight: "700" }}>{question.number}.</span> {question.text.includes("`*`")
                                            ? question.text.slice(0, question.text.indexOf("`*`"))
                                            : question.text}
                                    </div>
                                </div>
                                <div className="hwStandingStatsBox">
                                    <Doughnut data={{
                                        datasets: [
                                            {
                                                data: [response.data.corrects[question.number], response.data.incorrects[question.number], response.data.corrects[question.number] || response.data.incorrects[question.number] ? 0 : 1],
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
                                        {response.data.corrects[question.number] || 0}/{(response.data.corrects[question.number] || 0) + (response.data.incorrects[question.number] || 0)}
                                    </div>
                                </div>
                            </div>
                        })}
                    </div>
                </div>
            </div>
        </div>}
        {deleteStanding && <Modal text={`Do you want to delete "${deleteStanding.name}"?`}
            buttonOne={{ text: "Yes", click: onDeleteStanding, color: "var(--red)" }}
            buttonTwo={{ text: "No", click: () => setDeleteStanding(null) }} />}
        {extending && <Modal text={!game.isEnded && 365 - game.daysLeft <= 0
            ? `Homework is already open for the max time (365 days).`
            : `How long would you like to ${game.isEnded ? 'reopen' : 'extend'} this homework for (in days)?`}
            timeValue={!game.isEnded && 365 - game.daysLeft <= 0 ? null : extendAmount}
            timeChange={(e) => setExtendAmount(Math.min(365 - (game.isEnded ? 0 : game.daysLeft), Math.max(0, Math.round(e.target.value))))}
            buttonOne={{ text: "Confirm", click: onExtend }}
            buttonTwo={{ text: "Cancel", click: () => setExtending(null) }} />}
        {deleting && <Modal text={`Do you really want to delete this HW?`}
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