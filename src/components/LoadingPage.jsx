import { useEffect, useRef, useState } from "react";
import { getLoadingMessage } from "../utils/config";
import { Textfit } from "react-textfit";
import { getDimensions } from "../utils/numbers";

import "./loadingPage.css";

export default function LoadingPage({ normal, done }) {
    const [timer, setTimer] = useState(3);
    const [loops, setLoops] = useState(3);
    const [timerChange, setTimerChange] = useState(false);
    const { current: phrase } = useRef(normal ? "Get Ready" : getLoadingMessage());
    const timerInterval = useRef();
    const timerTimeout = useRef();
    useEffect(() => {
        let seconds = 3;
        setTimer(3);
        setLoops(3);
        timerInterval.current = setInterval(() => {
            if ((seconds -= 1) <= 0) {
                clearInterval(timerInterval.current);
                return done();
            }
            setTimerChange(true);
            timerTimeout.current = setTimeout(() => {
                setTimer(seconds);
                setTimerChange(false);
            }, 15);
        }, 1000);
        return () => {
            clearInterval(timerInterval.current);
            clearTimeout(timerTimeout.current);
        }
    }, []);
    return <div>
        <Textfit className="loadingPage_heading" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{phrase}</Textfit>
        <div className="loadingPage_timerHolder">
            <div className={timer == 0 ? "loadingPage_timerContainerDone" : "loadingPage_timerContainer"}>
                <div className={timerChange ? "loadingPage_timer" : "loadingPage_timerAnimate"}>{timer > 0 ? timer : ""}</div>
                <div className={timer == 0 ? "loadingPage_spinnerContainerDone" : "loadingPage_spinnerContainer"}>
                    <div className="loadingPage_spinner" style={{ animationIterationCount: loops }}></div>
                    <div className="loadingPage_filler" style={{ animationIterationCount: loops }}></div>
                    <div className="loadingPage_mask" style={{ animationIterationCount: loops }}></div>
                </div>
            </div>
        </div>
    </div>
}