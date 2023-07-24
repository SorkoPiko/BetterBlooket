import { useCallback, useEffect, useRef, useState } from "react";
import { Textfit } from "react-textfit";
import "./playAudio.css";

export default function PlayAudio({ autoplay, audioUrl, width, onEnd, onStart }) {
    const [audioDuration, setAudioDuration] = useState(0);
    const [playingAudio, setPlayingAudio] = useState(false);
    const audio = useRef();
    const aaudioDuration = useRef(0);
    const triedAgain = useRef(false);
    const delayTimeout = useRef();
    const playAudio = useCallback(() => {
        if (playingAudio) {
            audio.current.pause();
            onEnd?.();
            setPlayingAudio(false);
        } else if (audioDuration) setPlayingAudio(true);
        else if (aaudioDuration.current) {
            setPlayingAudio(true);
            setAudioDuration(aaudioDuration.current);
            audio.current.currentTime = 0;
        } else {
            audio.current = new Audio((src => {
                if (!src) return src;
                let i = src.indexOf("upload/");
                return -1 === i ? src : (i += 7, "".concat(src.slice(0, i)).concat("af_22050,br_48k").concat(src.slice(i - 1, src.length)))
            })(audioUrl));
            audio.current.addEventListener("loadedmetadata", function () {
                if (audio.current.duration == Infinity && !triedAgain.current) {
                    triedAgain.current = true;
                    return playAudio();
                }
                aaudioDuration.current = audio.current.duration;
                setAudioDuration(audio.current.duration);
                setPlayingAudio(true);
            });
            audio.current.addEventListener("ended", () => {
                onEnd?.();
                setPlayingAudio(false);
                setAudioDuration(0);
            }, false);
        }

    }, [playingAudio]);
    useEffect(() => {
        if (playingAudio) {
            onStart?.();
            audio.current.play();
        }
    }, [playingAudio]);
    useEffect(() => {
        if (autoplay) delayTimeout.current = setTimeout(() => {
            if (!playingAudio) playAudio();
        }, 500);
        return () => {
            if (audio.current) audio.current.pause();
            clearTimeout(delayTimeout.current);
        }
    }, []);

    return <div className="audioButton" onClick={playAudio} style={{ width }}>
        <Textfit className="audioIcon" mode="multi" min={1} max={40}>
            <i className={playingAudio ? "fas fa-pause" : "fas fa-play"} />
        </Textfit>
        {audioDuration && <div className="spinnerContainer">
            <div className="spinner" style={{
                animationDuration: `${audioDuration}s`,
                animationPlayState: playingAudio ? "running" : "paused"
            }}></div>
            <div className="filler" style={{
                animationDuration: `${audioDuration}s`,
                animationPlayState: playingAudio ? "running" : "paused"
            }}></div>
            <div className="mask" style={{
                animationDuration: `${audioDuration}s`,
                animationPlayState: playingAudio ? "running" : "paused"
            }}></div>
        </div>}
    </div>
}