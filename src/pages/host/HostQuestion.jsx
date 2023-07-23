import { useCallback, useEffect, useRef, useState } from "react";
import { audios } from "../../utils/config";
import PlayAudio from "../../components/PlayAudio";
import { StaticMathField } from "react-mathquill";
import { imageUrl, questionColors } from "../../utils/questions";
import { Textfit } from "react-textfit";

export default function HostQuestion({ next, question, numAnswers, numClients, transitioning, muted, theme }) {
    const [timer, setTimer] = useState(question.timeLimit);
    const [timerChange, setTimerChange] = useState(true);
    const [isZoomed, setIsZoomed] = useState(false);
    const { current: audio } = useRef(new Audio(random(audios.questionMusic)));
    const readingAloud = useRef(false);
    const onReadAloud = useCallback(() => {
        audio.muted = true;
        readingAloud.current = true;
    }, []);
    const onReadAloudEnd = useCallback(() => {
        audio.muted = muted;
        readingAloud.current = false;
    }, []);
    const timerInterval = useRef();
    const timerTimeout = useRef();
    useEffect(() => {
        audio.muted = muted;
        audio.volume = 0.6;
        audio.play();
        audio.addEventListener("ended", function () {
            audio.currentTime = 0;
            audio.play();
        }, false);
        let seconds = question.timeLimit;
        timerInterval.current = setInterval(() => {
            if ((seconds -= 1) <= 0) {
                clearInterval(timerInterval.current);
                return next();
            }
            if (seconds <= 5) {
                setTimerChange(true);
                timerTimeout.current = setTimeout(() => {
                    setTimer(seconds);
                    setTimerChange(false);
                }, 15);
            } else setTimer(seconds);
        }, 1000);
        return () => {
            clearTimeout(timerTimeout.current);
            clearInterval(timerInterval.current);
            audio.currentTime = 0;
            audio.pause();
            audio.removeEventListener("ended", function () {
                audio.currentTime = 0;
                audio.play();
            }, false);
        }
    }, []);
    useEffect(() => {
        if (!readingAloud.current) audio.muted = muted;
    });
    let isSpooky = theme == "spooky";
    return <div>
        <div className={transitioning ? "hostquestion_invisible" : ""}>
            <div className="hostquestion_upperContainer">
                {question.audio
                    ? <div className={className("hostquestion_imageContainer", { hostquestion_spooky: isSpooky })}>
                        <PlayAudio audioUrl={question.audio} onStart={onReadAloud} onEnd={onReadAloudEnd} autoplay={true} width="80%" />
                    </div>
                    : question.image
                        ? <div className={className("hostquestion_imageContainer", { hostquestion_spooky: isSpooky })} onClick={() => setIsZoomed(true)}>
                            <img src={imageUrl(question.image)} alt="Missing" className="hostquestion_image" draggable={false} />
                        </div>
                        : question.question.includes("`*`") && <div className={className("hostquestion_imageContainer", "hostquestion_funcContainer", { hostquestion_spooky: isSpooky })}>
                            <StaticMathField className="hostquestion_qMathField">
                                {question.question.slice(question.question.indexOf("`*`") + 3, question.question.length - 3)}
                            </StaticMathField>
                        </div>}
                <div className={className((question.image || question.audio || question.question.includes("`*`")) ? "hostquestion_questionContainerImage" : "hostquestion_questionContainerNoImage", { hostquestion_spooky: isSpooky })}>
                    <Textfit className={(question.image || question.audio || question.question.includes("`*`")) ? "hostquestion_questionTextImage" : "hostquestion_questionTextNoImage"} mode="multi" min={1} max={getDimensions("4vw")}>
                        {question.question.includes('`*`')
                            ? question.question.slice(0, question.question.indexOf('`*`'))
                            : question.question}
                    </Textfit>
                </div>
                <div className={className("hostquestion_upperRightContainer", { hostquestion_spooky: isSpooky })}>
                    <div className={timer == 0 ? "hostquestion_timerContainerDone" : "hostquestion_timerContainer"} style={{ background: isSpooky ? timer == 0 ? "#d37612" : "#ef9c43" : null }}>
                        <div className={timerChange ? "hostquestion_timer" : "hostquestion_timerAnimate"}>{timer}</div>
                        <div className={timer == 0 ? "hostquestion_spinnerContainerOne" : "hostquestion_spinnerContainer"}>
                            <div className="hostquestion_spinner" style={{
                                animationIterationCount: question.timeLimit,
                                background: isSpooky ? "#e57e25" : null
                            }}></div>
                            <div className="hostquestion_filler" style={{
                                animationIterationCount: question.timeLimit,
                                background: isSpooky ? "#e57e25" : null
                            }}></div>
                            <div className="hostquestion_mask" style={{ animationIterationCount: question.timeLimit }}></div>
                        </div>
                    </div>
                    <div className="hostquestion_numAnswersText">{`${numAnswers}/${numClients}`}</div>
                </div>
                <div className={className("hostquestion_nextButton", { hostquestion_spooky: isSpooky })} onClick={next}>
                    <div className="hostquestion_nextText">Next</div>
                </div>
            </div>
        </div>
        {question.qType == "typing"
            ? <div className="hostquestion_typingAnswerWrapper">
                <div className="hostquestion_typingAnswerHolder">
                    <div className="hostquestion_typingAnswerHeader">Students Type Your Answer</div>
                    <div className="hostquestion_typingAnswerSubheader">(not case sensitive)</div>
                    <div className="hostquestion_typingAnswerContainer">
                        <input type="text" className="hostquestion_typingAnswerInput" value="" placeholder="Answer" onChange={() => { }} />
                    </div>
                </div>
            </div>
            : <div className="hostquestion_answerHolder">
                {question.answers.map((answer, i) => {
                    return <div className={className("hostquestion_answerContainer", { hostquestion_answerTwo: question.answers.length == 2, hostquestion_answerThree: question.answers.length == 3 && i == 2 })} style={{
                        backgroundColor: questionColors[isSpooky ? "spooky" : "default"].answers[i].background
                    }} key={answer}>
                        {answer.split("`~`").length == 2
                            ? <div className="hostquestion_answerImgContainer">
                                <img src={imageUrl(answer.split("`~`")[1])} alt="Answer" className="hostquestion_answerImg" />
                            </div>
                            : '`*`' == answer.slice(0, 3)
                                ? <div className="hostquestion_answerImgContainer">
                                    <StaticMathField className="hostquestion_mathField" style={{
                                        color: questionColors[isSpooky ? "spooky" : "default"].answers[i].text,
                                        borderColor: questionColors[isSpooky ? "spooky" : "default"].answers[i].text
                                    }}>{answer.slice(3, answer.length - 3)}</StaticMathField>
                                </div>
                                : <Textfit className="hostquestion_answerText" mode="multi" min={1} max={getDimensions("2.5vw")} style={{ color: questionColors[isSpooky ? "spooky" : "default"].answers[i].text }}>{answer}</Textfit>}
                    </div>
                })}
            </div>}
        {isZoomed && <div className="hostquestion_modal modalButton" onClick={() => setIsZoomed(false)}>
            <img src={imageUrl(question.image, true)} alt="Upload" className="hostquestion_bigImage" draggable={false} />
        </div>}
    </div>
}