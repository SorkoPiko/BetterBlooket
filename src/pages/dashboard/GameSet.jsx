import { useCallback, useEffect, useState } from "react";
import Sidebar from "./SideBar";
import { setActivity } from "../../utils/discordRPC";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getParam } from "../../utils/location";
import "./gameSet.css";
import { imageUrl, questionColors } from "../../utils/questions";
import { StaticMathField } from "react-mathquill";
import PlayAudio from "../../components/PlayAudio";
function GameSet() {
    const [ready, setReady] = useState(false);
    const [set, setSet] = useState({
        title: "",
        author: "",
        desc: "",
        id: "",
        questions: [],
        private: false,
        coverImage: { id: "", url: "" },
        playCount: 0,
        favoriteCount: 0,
        isVerified: false
    });
    const [favorited, setFavorited] = useState(false);
    const [showAnswers, setShowAnswers] = useState([]);
    const [reporting, setReporting] = useState(false);
    const [report, setReport] = useState("");
    const [copying, setCopying] = useState(false);
    const [loadingCopy, setLoadingCopy] = useState(false);
    const { http: { get, put, post }, userData } = useAuth();
    const [canCopy, setCanCopy] = useState(userData.hasPlus);
    const { setId } = useParams();
    useEffect(() => {
        Promise.all([
            new Promise(r => get("https://dashboard.blooket.com/api/games", { params: { gameId: setId } }).then(({ data }) => r(data)).catch(() => r(null))),
            new Promise(r => get("https://dashboard.blooket.com/api/users/favorited", { params: { id: setId } }).then(({ data }) => r(data)).catch(() => r(false)))
        ]).then(([game, isFavorited]) => {
            if (!game) return setReady(true);
            game.questions.sort((a, b) => a.number - b.number);
            let showAnswers = [];
            if (getParam("open")) showAnswers = game.questions.map(q => q.number);
            setSet(game);
            setFavorited(isFavorited);
            setShowAnswers(showAnswers);
            setReady(true);
        });
    }, []);
    useEffect(() => {
        if (set.title) setActivity({
            state: `Set "${set.title}"`,
            timestampStart: Date.now(),
        });
    }, [set.title]);
    const onShowAnswers = useCallback((num) => {
        let i = showAnswers.indexOf(num);
        if (i == -1) showAnswers.push(num);
        else showAnswers.splice(i, 1);
        setShowAnswers([...showAnswers]);
    }, [showAnswers]);
    const onFavorite = useCallback(() => {
        put("https://dashboard.blooket.com/api/users/updatefavorites", { id: setId, isUnfavoriting: favorited }).then(function () {
            setFavorited(f => !f);
            setSet(s => ({ ...s, favoriteCount: favorited ? set.favoriteCount - 1 : set.favoriteCount + 1 }));
        }).catch(console.error);
    }, [favorited, set.favoriteCount]);
    const onReport = useCallback((send) => {
        if (!setId) return;
        if (!send) return setReporting(false);
        set.isVerified && setReporting(false);
        post("https://dashboard.blooket.com/api/reports", { id: setId, c: report })
            .then(function () {
                setReport("");
                setReporting(false);
            })
            .catch(console.error);
    }, [report, reporting, set]);
    const onCopy = useCallback(() => {
        get("https://dashboard.blooket.com/api/users/plan").then(function ({ data: { hasPlus } }) {
            if (!hasPlus) return setCanCopy(false);
            setCanCopy(true);
            setCopying(true);
        }).catch(function (e) {
            console.error(e);
            setCopying(false);
        })
    }, []);
    const navigate = useNavigate();
    const onCopyConfirm = useCallback(() => {
        setLoadingCopy(true);
        post("https://dashboard.blooket.com/api/games/copy", { id: setId, isDuplicate: true })
            .then(({ data: { _id } }) => navigate("/edit?id=" + _id))
            .catch(e => {
                console.error(e);
                setCopying(false);
                setLoadingCopy(false);
            })
    }, []);
    const [zoomedImage, setZoomedImage] = useState("");
    return (<>
        <Sidebar>
            {ready && <div id="gameSetWrapper">
                <div id="gameHeader">
                    <div id="gameCoverImage">
                        <div id="emptyCover">Blooket</div>
                        {set.coverImage && <img id="gameCover" src={set.coverImage.url} onError={e => e.target.style.display = "none"} />}
                    </div>
                    <div id="gameInfo">
                        <div id="gameTitle">{set.title}</div>
                        <div id="gameDescription">{set.desc}</div>
                        <div id="gameExtraInfo">
                            <Link id="gameAuthor" to={"/discover?n=" + set.author}><i className="fas fa-user" />{set.author}</Link>
                            <div><i className="fas fa-play" />{set.playCount}</div>
                            <div><i className="fas fa-star" />{set.favoriteCount}</div>
                        </div>
                    </div>
                    <div id="gameButtons">
                        <div id="playButtons">
                            <div id="gameSoloButton">Solo</div>
                            <div id="gameHostButton">Host</div>
                        </div>
                        <div id="setButtons">
                            <div onClick={onFavorite}><i className={`fa-${favorited ? "solid" : "regular"} fa-star`} />{favorited ? "Unfavorite" : "Favorite"}</div>
                            <div onClick={() => setCopying(true)}><i className="fas fa-copy" />Copy</div>
                            <div onClick={() => setReporting(true)}><i className="fa-regular fa-flag" />Report</div>
                        </div>
                    </div>
                </div>
                <div id="questionsTop">
                    <div id="questionCount">
                        {set.questions.length} Questions
                    </div>
                    <div onClick={() => {
                        setShowAnswers(showAnswers.length == set.questions.length ? [] : set.questions.map(x => x.number));
                    }} id="toggleAnswers">{showAnswers.length == set.questions.length ? "Hide" : "Show"} Answers</div>
                </div>
                <div id="questions">
                    {set.questions?.map(question => (<div key={question.number} className="questionContainer">
                        <div className="questionRow">
                            <div className="questionTextContainer" onClick={() => onShowAnswers(question.number)}>
                                <div className="questionNum">Question {question.number}</div>
                                <div className="questionTextRow">
                                    <div className="questionText">
                                        {question.question.includes("`*`") ? question.question.slice(0, question.question.indexOf("`*`")) : question.question}
                                    </div>
                                </div>
                            </div>
                            {(question.image?.url || question.audio?.url || question.question.includes("`*`")) && <div className={`questionImageContainer${question.image?.url && !(question.audio?.url) ? " questionImageButton" : ""}`} onClick={!question.image?.url || question.audio?.url ? () => { } : () => setZoomedImage(question.image.url)}>
                                {question.audio?.url
                                    ? <div className="questionFunc">
                                        <PlayAudio audioUrl={question.audio.url} width="60%">a</PlayAudio> {/* AUDIO THING */}
                                    </div>
                                    : question.image?.url
                                        ? <img src={imageUrl(question.image.url)} alt="Question Background" className="questionImage" />
                                        : question.question.includes("`*`") && <div className="questionFunc">
                                            <StaticMathField className="qMathField">
                                                {question.question.slice(question.question.indexOf("`*`") + 3, question.question.length - 3)}
                                            </StaticMathField>
                                        </div>}
                            </div>}
                            <div className="questionInfoRow">
                                {question.qType == "typing"
                                    ? <div className="questionInfo">
                                        <i className="questionInfoIcon fas fa-keyboard" />
                                        Typing
                                    </div>
                                    : question.random && <i className="questionInfo fas fa-random" />}
                                <div className="questionInfo">{`${question.timeLimit} sec`}</div>
                            </div>
                        </div>
                        {showAnswers.includes(question.number) && <div className="answersContainer">
                            {question.qType == "typing"
                                ? question.answers.map(answer => (<div className="typingAnswer" style={{ backgroundColor: questionColors.default.answers[1].background }} key={answer}>
                                    <i className="typingAnswerIcon fas fa-check" />
                                    <div className="answerText">{answer}</div>
                                </div>))
                                : question.answers.map((answer, i) => (
                                    <div className="answer" style={{ backgroundColor: questionColors.default.answers[i].background, opacity: question.correctAnswers.includes(answer) ? 1 : 0.5 }} key={answer}>
                                        <i className={`answerIcon ${question.correctAnswers.includes(answer) ? "fas fa-check" : "fas fa-times"}`} />
                                        <div className={`answerMediaContainer${answer.split("`~`").length == 2 || answer.slice(0, 3) == "`*`" ? " answerMediaCapped" : ""}`}>
                                            {answer.split("`~`").length == 2
                                                ? <img src={imageUrl(answer.split("`~`")[1])} alt="Answer" className="answerImg" />
                                                : answer.slice(0, 3) == "`*`"
                                                    ? <StaticMathField className="mathField">{answer.slice(3, answer.length - 3)}</StaticMathField>
                                                    : <div className="answerText">{answer}</div>}
                                        </div>
                                    </div>
                                ))}
                        </div>}
                    </div>))}
                </div>
            </div>}
            {zoomedImage && <div style={{
                background: "#0004",
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }} onClick={() => setZoomedImage("")}>
                <img src={zoomedImage} alt="Upload" style={{
                    width: "80%",
                    height: "80%",
                    objectFit: "contain"
                }} onError={e => e.target.src = imageUrl(zoomedImage)} />
            </div>}
            {reporting && <div className="reportModal">
                <div className="reportContainer">
                    <div className="reportHeader">Report Set</div>
                    <div className="reportText">
                        If this set is offensive, abusive, inappropriate, misleading, and/or contains false information, please let us know below.
                        We appreciate your time and hope that together we can make Blooket a safe place to learn.
                    </div>
                    <textarea className={`reportInput${report ? " reportInputFilled" : ""}`} onChange={e => setReport(e.target.value)} value={report}></textarea>
                    <div className="reportButtonContainer">
                        <div className="reportYesButton" onClick={() => onReport(true)}>Report</div>
                        <div className="reportNoButton" onClick={() => onReport(false)}>Cancel</div>
                    </div>
                </div>
            </div>}
            {copying && <div className="copyModal">
                <div className="copyContainer">
                    {canCopy ? <>
                        <div className="copyHeader">Copy Set</div>
                        <div className="copyButtonContainer">
                            <div className="copyYesButton" onClick={() => onCopy()}>Copy</div>
                            <div className="copyNoButton" onClick={() => setCopying(false)}>Cancel</div>
                        </div>
                    </> : <>
                        <div className="copyHeader">Get Blooket Plus to Duplicate Sets</div>
                        <div className="copyButtonContainer">
                            <a className="copyUpgradeButton" href="https://dashboard.blooket.com/upgrade" target="_blank">Upgrade</a>
                            <div className="copyNoButton" onClick={() => setCopying(false)}>Cancel</div>
                        </div>
                    </>}
                </div>
            </div>}
        </Sidebar>
    </>);
}
export default GameSet;