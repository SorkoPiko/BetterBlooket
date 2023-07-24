import { useCallback, useEffect, useRef, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { audios } from "../../utils/config";
import PlayAudio from "../../components/PlayAudio";
import { StaticMathField } from "react-mathquill";
import { Textfit } from "react-textfit";
import { imageUrl, questionColors } from "../../utils/questions";
import { getDimensions } from "../../utils/numbers";

export default function HostResults({ next, time, question, clientAnswers, numClients, transitioning, muted, canSkip, theme }) {
    const [timer, setTimer] = useState(time);
    const [timerChange, setTimerChange] = useState(true);
    const [ready, setReady] = useState(false);
    const [paused, setPaused] = useState(false);
    const [unpause, setUnpause] = useState(false);
    const [showImage, setShowImage] = useState(false);
    const [answerAmounts, setAnswerAmounts] = useState([]);
    const [isZoomed, setIsZoomed] = useState(false);
    const [numAnswers, setNumAnswers] = useState(0);
    const [numCorrectAnswers, setNumCorrectAnswers] = useState(0);
    const played = useRef(false);
    const getChartData = useCallback(() => {
        let opacity = ready ? 0.5 : 1;
        return {
            datasets: [
                {
                    data: answerAmounts,
                    backgroundColor: question.qType == "typing"
                        ? ['#d9d9d9', '#4bc22e']
                        : [
                            'spooky' === theme
                                ? `rgba(229, 126, 37, ${question.correctAnswers.includes(question.answers[1]) ? 1 : opacity})`
                                : `rgba(51, 120, 255, ${question.correctAnswers.includes(question.answers[1]) ? 1 : opacity})`,
                            'spooky' === theme
                                ? `rgba(247, 128, 0, ${question.correctAnswers.includes(question.answers[3]) ? 1 : opacity})`
                                : `rgba(255, 70, 43, ${question.correctAnswers.includes(question.answers[3]) ? 1 : opacity})`,
                            'spooky' === theme
                                ? `rgba(225, 116, 0, ${question.correctAnswers.includes(question.answers[2]) ? 1 : opacity})`
                                : `rgba(0, 207, 119, ${question.correctAnswers.includes(question.answers[2]) ? 1 : opacity})`,
                            'spooky' === theme
                                ? `rgba(211, 118, 18, ${question.correctAnswers.includes(question.answers[0]) ? 1 : opacity})`
                                : `rgba(255, 163, 30, ${question.correctAnswers.includes(question.answers[0]) ? 1 : opacity})`,
                            'spooky' === theme ? `rgba(217, 217, 217, ${opacity})` : '#d9d9d9',
                        ]
                }
            ]
        }
    }, [ready, answerAmounts]);
    const pausePlay = useCallback(() => {
        if (paused) {
            setUnpause(true);
            unpauseTimeout.current = setTimeout(() => {
                intervalSetup();
                setUnpause(false);
                setPaused(false);
            }, 25);
        } else {
            clearInterval(interval.current);
            setPaused(true);
        }
    }, [paused]);
    const intervalSetup = useCallback(() => {
        if (!played.current) {
            audio.play();
            played.current = true;
        }
        let seconds = timer;
        interval.current = setInterval(() => {
            if (paused) return;
            if ((seconds -= 1) == time - 2) setReady(true);
            if (seconds <= 0) {
                clearInterval(interval.current);
                return next();
            }
            if (seconds <= 5) {
                setTimerChange(true);
                timeout.current = setTimeout(() => {
                    setTimer(seconds);
                    setTimerChange(false);
                }, 15);
            }
            setTimer(seconds);
        }, 1000);
    }, [timer, paused]);
    const { current: audio } = useRef(new Audio(audios.questionResults));
    const interval = useRef();
    const timeout = useRef();
    const unpauseTimeout = useRef();
    useEffect(() => {
        let totalCorrect = 0;
        if (question.qType == "typing") for (const clientAnswer of clientAnswers) {
            let correct = false;
            for (let i = 0; i < question.answers.length; i++)
                if ((question.answerTypes[i] == "contains" && question.answers[i].toLowerCase().trim().includes(clientAnswer.toLowerCase().trim())) || question.answers[i].toLowerCase().trim() == clientAnswer.toLowerCase().trim()) correct = true;
            if (correct) totalCorrect++;
        } else for (let i = 0; i < question.correctAnswers.length; i++)
            totalCorrect += clientAnswers.filter(x => question.answers[x] == question.correctAnswers[i]).length;
        let thing = question.qType == "typing"
            ? [totalCorrect == 0 ? 1 : numClients - totalCorrect, totalCorrect]
            : [
                clientAnswers.filter(x => 1 == x).length,
                clientAnswers.filter(x => 3 == x).length,
                clientAnswers.filter(x => 2 == x).length,
                clientAnswers.filter(x => 0 == x).length,
                clientAnswers.length == 0 ? 1 : numClients - clientAnswers.length
            ];
        setAnswerAmounts(thing);
        setNumAnswers(Math.max(1, numClients));
        setNumCorrectAnswers(totalCorrect);
        intervalSetup();
        return () => {
            audio.currentTime = 0;
            audio.pause();
            clearInterval(interval.current);
            clearTimeout(timeout.current);
            clearTimeout(unpauseTimeout.current);
        }
    }, []);
    useEffect(() => { audio.muted = muted });
    let isSpooky = theme == "spooky";
    console.log(question)
    return <div className={transitioning ? "hostresults_invisible" : null}>
        <div className="hostresults_transition">
            <div className="hostresults_upperContainer">
                {question.image || question.audio || question.question.includes('`*`')
                    ? <div>
                        {showImage
                            ? question.audio
                                ? <div className={className("hostresults_questionContainerImage", { hostresults_spooky: isSpooky })}>
                                    <PlayAudio audioUrl={question.audio} autoplay={true} width="80%" />
                                </div>
                                : question.image
                                    ? <div className={className("hostresults_questionContainerImage", { hostresults_spooky: isSpooky })} onClick={() => setIsZoomed(true)} style={{ cursor: "pointer" }}>
                                        <img src={imageUrl(question.image)} alt="Question" className="hostresults_image" />
                                    </div>
                                    : <div className={className("hostresults_questionContainerImage", { hostresults_spooky: isSpooky })}>
                                        <StaticMathField className="hostresults_qMathField">
                                            {question.question.slice(question.question.indexOf("`*`") + 3, question.question.length - 3)}
                                        </StaticMathField>
                                    </div>
                            : <div className={className("hostresults_questionContainerImage", { hostresults_spooky: isSpooky })}>
                                <Textfit className="hostresults_questionText" mode="multi" min={1} max={getDimensions("3vw")}>
                                    {question.question.includes('`*`')
                                        ? question.question.slice(0, question.question.indexOf('`*`'))
                                        : question.question}
                                </Textfit>
                            </div>}
                        <div className={className("hostresults_mediaButton", { hostresults_spooky: isSpooky })} onClick={() => setShowImage(s => !s)}>
                            <i className="hostresults_mediaIcon far fa-image"></i>
                            <div className="hostresults_mediaText">
                                {showImage ? "Hide" : "Show"} {question.audio ? "Audio" : question.image ? "Image" : "Math"}
                            </div>
                        </div>
                    </div>
                    : <div className={className("hostresults_questionContainerImage", { hostresults_spooky: isSpooky })}>
                        <Textfit className="hostresults_questionText" mode="multi" min={1} max={getDimensions("3vw")}>
                            {question.question.includes('`*`')
                                ? question.question.slice(0, question.question.indexOf('`*`'))
                                : question.question}
                        </Textfit>
                    </div>}
                <div className={className("hostresults_centerContainer", { hostresults_spooky: isSpooky })}>
                    <div className="hostresults_upperCenter">
                        <div className="hostresults_upperCenterText">Responses:</div>
                    </div>
                    <div className="hostresults_lowerCenter">
                        <Doughnut data={getChartData()} options={{
                            maintainAspectRatio: false,
                            responsive: true,
                            legend: { display: false },
                            tooltips: { enabled: false },
                            animation: {
                                duration: ready ? 250 : 1500,
                                easing: ready ? 'linear' : 'easeInQuint',
                            },
                            layout: { padding: 15 },
                        }} />
                        <div className={ready ? "percentageText" : "percentageTextFaded"}>
                            {Math.round((numCorrectAnswers / numAnswers) * 100)}%
                        </div>
                        {question.qType == "typing"
                            ? <>
                                <div className="hostresults_boxOneTwo" style={{ backgroundColor: "#4bc22e" }}>
                                    <div className="hostresults_amountText">{answerAmounts[1]}</div>
                                </div>
                                <div className="hostresults_boxTwoTwoThree" style={{ backgroundColor: "#d9d9d9" }}>
                                    <div className="hostresults_amountText">{answerAmounts[0]}</div>
                                </div>
                            </>
                            : <>
                                {question.answers[0] && <div className={className(question.answers.length == 2 ? "hostresults_boxOneTwo" : "hostresults_boxOneThreeFour", ready && !question.correctAnswers.includes(question.answers[0]) && "hostresults_faded")} style={{ backgroundColor: questionColors[isSpooky ? "spooky" : "default"].answers[0].background }}>
                                    <div className="hostresults_amountText">{answerAmounts[3]}</div>
                                </div>}
                                {question.answers[1] && <div className={className(question.answers.length == 4 ? "hostresults_boxTwoFour" : "hostresults_boxTwoTwoThree", ready && !question.correctAnswers.includes(question.answers[1]) && "hostresults_faded")} style={{ backgroundColor: questionColors[isSpooky ? "spooky" : "default"].answers[1].background }}>
                                    <div className="hostresults_amountText">{answerAmounts[0]}</div>
                                </div>}
                                {question.answers[2] && <div className={className("hostresults_boxThree", ready && !question.correctAnswers.includes(question.answers[2]) && "hostresults_faded")} style={{ backgroundColor: questionColors[isSpooky ? "spooky" : "default"].answers[2].background }}>
                                    <div className="hostresults_amountText">{answerAmounts[2]}</div>
                                </div>}
                                {question.answers[3] && <div className={className("hostresults_boxFour", ready && !question.correctAnswers.includes(question.answers[1]) && "hostresults_faded")} style={{ backgroundColor: questionColors[isSpooky ? "spooky" : "default"].answers[3].background }}>
                                    <div className="hostresults_amountText">{answerAmounts[1]}</div>
                                </div>}
                            </>}
                    </div>
                </div>
                <div className={className("hostresults_rightTopContainer", { hostresults_spooky: isSpooky })}>
                    <div className={timer == 0 ? "timerContainerDone" : "timerContainer"} style={{ background: isSpooky ? timer == 0 ? "#d37612" : "#ef9c43" : null }}>
                        <div className={timerChange || unpause ? "timer" : "timerAnimate"} style={paused ? { animationPlayState: 'paused' } : {}}>{timer}</div>
                        <div className={timer == 0 ? "spinnerContainerDone" : "spinnerContainer"}>
                            <div className={unpause ? "spinner" : "spinnerAnimate"} style={{ background: isSpooky ? "#e57e35" : null, animationPlayState: paused ? 'paused' : null }}></div>
                            <div className={unpause ? "filler" : "fillerAnimate"} style={{ background: isSpooky ? "#e57e35" : null, animationPlayState: paused ? 'paused' : null }}></div>
                            <div className={unpause ? "mask" : "maskAnimate"} style={{ animationPlayState: paused ? 'paused' : null }}></div>
                        </div>
                    </div>
                </div>
                <div className={className("hostresults_pauseButton", { hostresults_spooky: isSpooky })} onClick={pausePlay} style={{ left: canSkip ? "84vw" : "87.5vw" }}>
                    <i className={className("hostresults_pauseIcon", "fas", paused ? "fa-play" : "fa-pause")}></i>
                </div>
                {canSkip && <div className={className("hostresults_pauseButton", { hostresults_spooky: isSpooky })} onClick={next} style={{ left: "91vw" }}>
                    <i className="hostresults_pauseIcon fas fa-forward"></i>
                </div>}
            </div>
        </div>
        {question.qType == "typing"
            ? <div className="hostresults_typingAnswerWrapper">
                <div className="hostresults_typingAnswerHolder">
                    <div className="hostresults_typingAnswerInside">
                        <div className="hostresults_typingAnswerHeader">Possible answers</div>
                        {question.answers.map(answer => <div key={answer} className="hostresults_typingAnswerContainer">{ready ? answer : ""}</div>)}
                    </div>
                </div>
            </div>
            : <div className="hostresults_answersHolder">
                {question.answers.map((answer, i) => {
                    return <div className={className("hostresults_answerContainer", {
                        hostresults_answerTwo: question.answers.length == 2,
                        hostresults_answerThree: question.answers.length == 3 && 2 == i,
                        hostresults_faded: ready && !question.correctAnswers.includes(answer)
                    })} style={{ backgroundColor: questionColors[isSpooky ? "spooky" : "default"].answers[i].background }} key={answer}>
                        {ready && question.correctAnswers.includes(answer) && <i className="hostresults_selectedIcon fas fa-check" />}
                        {answer.split("`~`").length == 2
                            ? <div className={className("hostresults_answerImgContainer", { hostresults_selectedImg: ready && question.correctAnswers.includes(answer) })}>
                                <img src={imageUrl(answer.split("`~`")[1])} alt="Answer" className="hostresults_answerImg" />
                            </div>
                            : '`*`' == answer.slice(0, 3)
                                ? <div className={className("hostresults_answerImgContainer", { hostresults_selectedImg: ready && question.correctAnswers.includes(answer) })}>
                                    <StaticMathField className="hostresults_mathField" style={{
                                        color: questionColors[isSpooky ? "spooky" : "default"].answers[i].text,
                                        borderColor: questionColors[isSpooky ? "spooky" : "default"].answers[i].text
                                    }}>{answer.slice(3, answer.length - 3)}</StaticMathField>
                                </div>
                                : <Textfit className={className("hostresults_answerText", { hostresults_selectedText: ready && question.correctAnswers.includes(answer) })} mode="multi" min={1} max={getDimensions("2.5vw")} style={{
                                    color: questionColors[isSpooky ? "spooky" : "default"].answers[i].text
                                }}>{answer}</Textfit>
                        }
                    </div>
                })}
            </div>}
        {isZoomed && <div className="hostresults_modal modalButton" onClick={() => setIsZoomed(false)}>
            <img src={imageUrl(question.image, true)} alt="Upload" className="hostresults_bigImage" />
        </div>}
    </div >
}