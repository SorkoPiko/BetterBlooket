import { useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "../../../context/GameContext";
import { Navigate, useNavigate } from "react-router-dom";
import { audios, getLoadingMessage } from "../../../utils/config";
import TopBar from "../TopBar";
import { Textfit } from "react-textfit";
import { formatNumber, getDimensions, getOrdinal } from "../../../utils/numbers";
import Blook from "../../../blooks/Blook";
import { shuffleArray } from "../../../utils/questions";
import Standings from "./Standings";
import HostQuestion from "../HostQuestion";
import HostResults from "../HostResults";

import "./classic.css";
import { useAuth } from "../../../context/AuthContext";
import Modal from "../../../components/Modal";
import { NodeGroup } from "react-move";

import LoadingPage from "../../../components/LoadingPage";

export function ClassicGetReady() {
    const { host: hostRef, setQuestion, updateHost, liveGameController } = useGame();
    const navigate = useNavigate();
    const answerString = useRef("");
    const question = useRef({});
    const [muted, setMuted] = useState(!!hostRef.current?.muted);
    useEffect(() => {
        const host = hostRef.current;
        let que = host.questions?.find(x => x.number == (host.question?.number + 1 || 1));
        if (!host?.questions || host.question?.number > host.questions.length || !que) return navigate("/sets");
        let answers = que.answers;
        if (que.random) answers = shuffleArray(answers);
        let q = { ...que, answers };
        setQuestion(q);
        for (let i = 0; i < que.answers.length; i++) answerString.current += answers.indexOf(que.answers[i]);
        question.current = q;
    }, []);
    const changeMuted = useCallback(() => {
        setMuted(!muted);
        updateHost({ muted: !muted });
    }, [muted]);
    const next = useCallback(() => {
        liveGameController.setStage({
            clearAnswers: true,
            stage: `q-${question.current.stdNumber}-${answerString.current}`
        }, () => navigate("/host/classic/question"));
    }, []);
    let host = hostRef.current;
    if (!host?.questions || host.question?.number > host.questions.length) return <Navigate to="/sets" />
    return <div className="body" style={{ backgroundColor: "var(--accent2)" }}>
        <TopBar left={host.settings.lateJoin ? `ID: ${liveGameController.liveGameCode}` : ""} right={`QUESTION ${host.question?.number || 1}/${host.questions.length}`} muted={muted} changeMuted={changeMuted} />
        <div className="regularBody">
            <LoadingPage normal={(host.question?.number || 1) == 1} done={next} />
        </div>
    </div>
}

export function ClassicQuestion() {
    const { host: hostRef, updateHost, liveGameController, setClassicResults, standings: standingsRef } = useGame();
    const navigate = useNavigate();
    const [numAnswers, setNumAnswers] = useState(0);
    const [numClients, setNumClients] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const [muted, setMuted] = useState(!!hostRef.current?.muted);
    const dbRef = useRef();
    const responseData = useRef();
    const transitionTimeout = useRef();
    const next = useCallback(() => {
        const host = hostRef.current;
        setTransitioning(true);
        transitionTimeout.current = setTimeout(() => {
            let val = {},
                results = Object.entries(responseData.current).map(([client, data]) => {
                    let correct = false;
                    if (host.question.qType == "typing") for (let i = 0; i < host.question.answers.length; i++) {
                        let correctAnswer = host.question.answers[i];
                        let answer = data.a || "";
                        if (host.question.answerTypes[i] == "contains" && answer.toLowerCase().trim().includes(correctAnswer.toLowerCase().trim()) || answer.toLowerCase().trim() == correctAnswer.toLowerCase().trim()) {
                            correct = true;
                            break;
                        };
                    } else correct = host.question.correctAnswers.includes(host.question.answers[data.a]);
                    return {
                        name: client,
                        blook: data.b,
                        answer: data.a,
                        correct,
                        time: data.t || 1000 * host.question.timeLimit
                    }
                });
            results.sort((a, b) => a.time - b.time);
            let standings = standingsRef.current ? JSON.parse(JSON.stringify(standingsRef.current)) : [],
                place = 0;
            for (let i = 0; i < results.length; i++) {
                let result = results[i];
                if (i == 0 || result.correct && result.time !== results[i - 1] || !result.correct && results[i - 1].correct) place += 1;
                results[i].questionPlace = place;
                let points = numClients + 1 - place;
                if (place == 1) points += 3;
                else if (place == 2) points += 1;
                if (!results[i].correct) points = 0;
                results[i].questionPoints = points;
                let j = standings.findIndex(x => x.name == result.name);
                if (j !== -1) {
                    results[i].points = points + standings[j].points;
                    standings.splice(j, 1);
                } else results[i].points = points;
            }
            for (let standing of standings) results.push({
                name: standing.name,
                blook: standing.blook,
                correct: false,
                time: -1,
                questionPlace: place,
                questionPoints: 0,
                points: standing.points || 0
            });
            results.sort((a, b) => {
                let points = b.points - a.points;
                return points == 0 ? a.time - b.time : points;
            });
            place = 0;
            for (let i = 0; i < results.length; i++) {
                let result = results[i];
                if (i == 0 || result.points !== results[i - 1].points) place += 1;
                results[i].place = place;
                if (result.blook) val[result.name] = {
                    b: result.blook,
                    co: result.correct || false,
                    t: result.time || 0,
                    qPl: result.questionPlace,
                    qP: result.questionPoints || 0,
                    pl: place,
                    p: result.points || 0
                }
            }
            setClassicResults(numClients, results);
            liveGameController.setVal({ path: "c", val }, () => liveGameController.setStage({
                stage: "cres"
            }, () => navigate("/host/classic/results")));
        }, 200)
    }, [numClients]);
    const changeMuted = useCallback(() => {
        setMuted(!muted);
        updateHost({ muted: !muted });
    }, [muted]);
    useEffect(() => {
        const host = hostRef.current;
        if (!host?.question || !host.questions) return navigate("/sets");
        (async () => {
            liveGameController.getDatabaseVal("c", val => setNumClients(Object.keys(val || {}).length));
            dbRef.current = await liveGameController.getDatabaseRef("c");
            dbRef.current.on("value", snapshot => {
                const val = snapshot.val() || {};
                responseData.current = val;
                let clients = Object.values(val);
                let answers = clients.filter(x => x.a != null).length;
                if (answers > 0 && !hostRef.current.muted) new Audio(audios.join).play();
                setNumAnswers(answers);
                setNumClients(clients.length);
                if (answers == clients.length && clients.length !== 0) next();
            });
        })();
        return () => {
            clearTimeout(transitionTimeout.current);
            if (Object.keys(dbRef.current).length) dbRef.current.off("value");
        }
    }, []);
    const host = hostRef.current;
    if (!host?.question || host.questions == null) return <Navigate to="/sets" />
    return <div className="body">
        <TopBar left={host.settings.lateJoin ? `ID: ${liveGameController.liveGameCode}` : ""} right={`QUESTION ${host.question?.number || 1}/${host.questions.length}`} muted={muted} changeMuted={changeMuted} />
        <HostQuestion next={next} question={host.question} numAnswers={numAnswers} numClients={numClients} transitioning={transitioning} muted={muted} />
    </div>
}

export function ClassicResults() {
    const { host: hostRef, updateHost, liveGameController, standings } = useGame();
    const navigate = useNavigate();
    const [muted, setMuted] = useState(!!hostRef.current?.muted);
    const next = useCallback(() => {
        const { current: host } = hostRef;
        if (host?.question.number == host?.questions.length) liveGameController.setStage({ stage: "cfin" }, () => navigate("/host/classic/final"));
        else liveGameController.setStage({ stage: "cstd" }, () => navigate("/host/classic/standings"));
    }, []);
    const changeMuted = useCallback(() => {
        setMuted(!muted);
        updateHost({ muted: !muted });
    }, [muted]);
    const endGame = useCallback(() => {
        liveGameController.setStage({ stage: "cfin" }, () => navigate("/host/classic/final"));
    }, []);
    let { current: host } = hostRef;
    if (!host?.question || host.questions == null) return <Navigate to="/sets" />
    return <div className="body">
        <TopBar left={host.settings.lateJoin ? `ID: ${liveGameController.liveGameCode}` : ""} right={`QUESTION ${host.question.number}/${host.questions.length}`} muted={muted} changeMuted={changeMuted} onRightClick={endGame} />
        <HostResults next={next} time={7} question={hostRef.current.question} clientAnswers={standings.current.reduce((a, b) => ((b.answer || b.answer == 0) && a.push(b.answer), a), [])} numClients={hostRef.current.numClients} muted={muted} canSkip={true} />
    </div>
}

export function ClassicStandings() {
    const { host: hostRef, updateHost, liveGameController, standings } = useGame();
    const navigate = useNavigate();
    const [display, setDisplay] = useState([]);
    const [preShowPoints, setPreShowPoints] = useState(false);
    const [showPoints, setShowPoints] = useState(false);
    const [move, setMove] = useState(false);
    const [muted, setMuted] = useState(!!hostRef.current?.muted);
    const next = useCallback(() => {
        liveGameController.setStage({ stage: "crdy" }, () => navigate("/host/classic/get-ready"));
    }, []);
    const changeMuted = useCallback(() => {
        setMuted(!muted);
        updateHost({ muted: !muted });
    }, [muted]);
    const endGame = useCallback(() => {
        liveGameController.setStage({ stage: "cfin" }, () => navigate("/host/classic/final"));
    }, []);
    const pointsTimeout = useRef();
    const moveTimeout = useRef();
    const exitTimeout = useRef();
    const transitionTimeout = useRef();
    const interval = useRef();
    const displayRef = useRef();
    useEffect(() => { displayRef.current = JSON.parse(JSON.stringify(display)) }, [display]);
    useEffect(() => {
        const host = hostRef.current;
        if (!standings.current || !host.question) return navigate("/sets");
        let e = JSON.parse(JSON.stringify(standings.current));
        let n = JSON.parse(JSON.stringify(standings.current));
        n.sort((a, b) => {
            let place = a.questionPlace - b.questionPlace;
            return place == 0 ? a.time - b.time : place;
        });
        setDisplay(n.slice(0, 5).map(x => ({ ...x, points: x.points - x.questionPoints, totalPoints: x.points })));
        pointsTimeout.current = setTimeout(() => {
            setPreShowPoints(true);
            pointsTimeout.current = setTimeout(() => {
                setShowPoints(true);
                pointsTimeout.current = setTimeout(() => {
                    interval.current = setInterval(() => {
                        for (let i = 0; i < displayRef.current.length; i++) {
                            let n = displayRef.current[i];
                            if (n.points < n.totalPoints) displayRef.current[i].points += 1;
                            else if (i == 0) clearInterval(interval.current);
                        }
                        setDisplay(displayRef.current);
                    }, Math.max(5, displayRef.current[0]?.questionPoints ? 1200 / displayRef.current[0]?.questionPoints : 5));
                }, 1000);
                moveTimeout.current = setTimeout(() => {
                    setDisplay(e.slice(0, 5));
                    setMove(true);
                }, 3000);
            }, 500);
        }, 3000);
        exitTimeout.current = setTimeout(() => {
            setDisplay([]);
            transitionTimeout.current = setTimeout(next, 1500);
        }, 9000);
        return () => {
            clearTimeout(pointsTimeout.current);
            clearTimeout(moveTimeout.current);
            clearTimeout(exitTimeout.current);
            clearTimeout(transitionTimeout.current);
            clearInterval(interval.current);
        }
    }, []);
    let host = hostRef.current;
    console.log(standings.current, host, !standings.current || !host.question)
    if (!standings.current || !host.question) return <Navigate to="/sets" />
    return <div className="hostBody">
        <TopBar left={host.settings.lateJoin ? `ID: ${liveGameController.liveGameCode}` : ""} center="Standings" right={`QUESTION ${host.question?.number || 1}/${host.questions.length}`} muted={muted} changeMuted={changeMuted} onRightClick={endGame} />
        <div className="classic_nextButton" onClick={next}>Next</div>
        <NodeGroup data={display} keyAccessor={({ name }) => name}
            start={(_, place) => ({ opacity: 0.000001, x: 100, y: 13 * (place + 1) - 44 })}
            enter={(_, place) => ({ opacity: [1], x: [0], y: [13 * (place + 1) - 44], timing: { duration: 500, delay: 250 * (place + 1), ease: e => +e } })}
            update={(_, place) => ({ opacity: [1], x: [0], y: [13 * (place + 1) - 44], timing: { duration: 500, delay: 250 * (place + 1), ease: e => +e } })}
            leave={(_, place) => ({ opacity: [0.000001], x: [-160], timing: { duration: 500, delay: 250 * place, ease: e => +e } })}>
            {(display) => <div className="classic_nodesContainer">
                {display.map(({ key, data, state: { x, y }, opacity }) => {
                    return <div key={key} style={{
                        opacity,
                        transform: `translate(${x}vw, ${y}vh)`,
                    }} className="classic_standingContainer">
                        <div className="classic_placeText">{move ? data.place : data.questionPlace}</div>
                        <div className="classic_superPlaceText">{getOrdinal(move ? data.place : data.questionPlace)}</div>
                        <Blook name={data.blook} className="classic_blookBox" />
                        <Textfit className="classic_nameText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5vh")}>{data.name}</Textfit>
                        <div className={className("classic_pointsText", { classic_fadeIn: showPoints, classic_fadeOut: preShowPoints && !showPoints })} style={{ fontSize: showPoints || !data.correct ? "5.35vh" : "4.5vh" }}>
                            {showPoints ? formatNumber(data.points) : data.correct ? `${(data.time / 1000).toFixed(3)}s` : <i className="fas fa-times" />}
                        </div>
                        <div className={className("classic_addText", move ? "classic_fadeOut" : "classic_fadeIn")}>+{data.questionPoints}</div>
                    </div>
                })}
            </div>}
        </NodeGroup>
    </div>
}

export function ClassicFinal() {
    const { standings: { current: standings }, liveGameController, deleteHost, host: { current: host }, hostId } = useGame();
    const { http: { post } } = useAuth();
    const [state, setState] = useState({
        standings,
        historyId: "",
        ready: false,
        muted: !!host && host.muted
    });
    const [askPlayAgain, setAskPlayAgain] = useState(false);
    const { current: hostCopy } = useRef(JSON.parse(JSON.stringify(host)));
    const navigate = useNavigate();
    const startTimeout = useRef();
    const waitTimeout = useRef();
    const askTimeout = useRef();
    const restarting = useRef(false);
    useEffect(() => {
        console.log(state, hostId);
        if (!state.standings?.[0]) return navigate("/sets");
        startTimeout.current = setTimeout(function () {
            let results = {};
            liveGameController.getDatabaseVal("c", val => {
                for (const client in (val || {})) {
                    let user = val[client];
                    results[client] = { corrects: {}, incorrects: {} };
                    if (user.i) if (Array.isArray(user.i)) for (let i = 0; i < user.i.length; i++) {
                        if (user.i[i]) results[client].incorrects[i] = user.i[i];
                    } else results[client].incorrects = user.i;

                    if (user.c) if (Array.isArray(user.c)) for (let i = 0; i < user.c.length; i++) {
                        if (user.c[i]) results[client].corrects[i] = user.c[i];
                    } else results[client].corrects = user.c;
                }
            });
            waitTimeout.current = setTimeout(function () {
                if (!standings.length) return;
                post("https://play.blooket.com/api/history", {
                    t: hostId.current,
                    standings: standings.map(({ blook, name, place, points }) => ({
                        blook, name, place,
                        points: isNaN(points) ? 0 : Math.min(Math.round(Number(points)), 9223372036854775000),
                        corrects: results[name]?.corrects || {},
                        incorrects: results[name]?.incorrects || {}
                    })),
                    settings: hostCopy.settings,
                    setId: hostCopy.setId
                }).then(({ data }) => {
                    setState(s => ({ ...s, historyId: data.id, ready: true }));
                    askTimeout.current = setTimeout(() => setAskPlayAgain(true), 3000);
                }).catch(console.error);
            }, 2000);
        }, 3500);
        return () => {
            clearTimeout(startTimeout.current);
            clearTimeout(waitTimeout.current);
            clearTimeout(askTimeout.current);
            if (!restarting.current && liveGameController.liveGameCode && liveGameController.isHost) {
                liveGameController.removeHostAndDeleteGame();
                deleteHost();
            }
        }
    }, []);
    const onPlayAgain = useCallback(async (again) => {
        if (!again) {
            if (liveGameController.liveGameCode && liveGameController.isHost) {
                liveGameController.removeHostAndDeleteGame();
                deleteHost();
            }
            return setAskPlayAgain(false);
        }
        restarting.current = true;
        await liveGameController.removeVal("st");
        await liveGameController.removeVal("c");
        liveGameController.setStage({ stage: "join" }, () => navigate("/host/join"));
    }, []);
    if (!host?.standings?.[0] && !state.standings?.[0]) return <Navigate to="/sets" />
    return <div className="hostBody" style={{ overflowY: state.ready ? "auto" : "hidden" }}>
        {state.standings.length > 0 && <Standings
            standings={state.standings.map(x => ({ ...x, b: x.blook, n: x.name, p: x.place }))}
            stats={state.standings.map(e => formatNumber(e.points) + (e.points == 1 ? " Point" : " Points"))}
            gameId={hostCopy.setId}
            historyId={state.historyId}
            muted={state.muted}
            ready={state.ready}
        />}
        {askPlayAgain && <Modal text="Would you like to play again right now with the same settings?"
            buttonOne={{ text: "Yes!", click: () => onPlayAgain(true) }}
            buttonTwo={{ text: "No", click: () => onPlayAgain(false) }} />}
    </div>;
}