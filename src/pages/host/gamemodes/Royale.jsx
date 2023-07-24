import { useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "../../../context/GameContext";
import { useNavigate } from "react-router-dom";
import { audios } from "../../../utils/config";
import TopBar from "../TopBar";
import { Textfit } from "react-textfit";
import { formatNumber, getDimensions } from "../../../utils/numbers";
import Blook from "../../../blooks/Blook";
import { animateScroll, Element as ScrollElement } from "react-scroll";
import { royale } from "../../../utils/images";
import { imageUrl, questionColors, random } from "../../../utils/questions";
import PlayAudio from "../../../components/PlayAudio";
import { StaticMathField } from "react-mathquill";
import Standings from "./Standings";
import HostQuestion from "../HostQuestion";
import HostResults from "../HostResults";

import "./royale.css";
import { useAuth } from "../../../context/AuthContext";
import Modal from "../../../components/Modal";

const timeouts = [4200, 2850, 7150, 8150, 8150, 8150, 2575];

export function RoyaleInstruct() {
    const { host: hostRef, nextRoyale, prepareRoyale, updateHost, liveGameController } = useGame();
    const { current: host } = hostRef;
    const navigate = useNavigate();
    const [stage, setStage] = useState(2);
    const [muted, setMuted] = useState(!!host?.muted);
    const { current: audio } = useRef(new Audio(audios.battleRoyale));
    const timeout = useRef();
    const skip = useCallback(() => {
        let royale = nextRoyale(hostRef.current.players, host.settings.mode == "Teams", host.usedQuestions, host.questionsPlayed, host.questions, host.dead);
        prepareRoyale(1, royale.usedQuestions, royale.questionsPlayed, `q-${royale.question.stdNumber}-${royale.answerString}`, royale.question, royale.matches);
        liveGameController.setVal({
            path: "c",
            val: royale.dbPlayers
        }, function () {
            liveGameController.setStage({ stage: "prv" }, () => navigate("/host/battle-royale/match/preview"))
        })
    }, []);
    const changeMuted = useCallback(() => {
        setMuted(!muted);
        audio.muted = !muted;
        updateHost({ muted: !muted });
    }, [muted]);
    const stageTimeout = useCallback(() => {
        timeout.current = setTimeout(() => setStage(s => s + 1), timeouts[stage]);
    }, [stage]);
    useEffect(() => {
        window.dispatchEvent(new Event("resize"));
        if (stage >= 7) skip();
        else stageTimeout();
    }, [stage])
    useEffect(() => {
        if (!host?.settings) return navigate("/sets");
        audio.muted = muted;
        audio.volume = 0.45;
        audio.play();
        audio.addEventListener("ended", function () {
            audio.currentTime = 0;
            audio.play();
        }, false);
        return () => {
            clearTimeout(timeout.current);
            audio.currentTime = 0;
            audio.pause();
            audio.removeEventListener("ended", function () {
                audio.currentTime = 0;
                audio.play();
            }, false);
        }
    }, []);
    if (!host?.settings) return navigate("/sets");
    return <div className="hostBody">
        <TopBar left="" center="Instructions" muted={muted} changeMuted={changeMuted} />
        {stage == 2
            ? <div className="instruct1_container">
                <Textfit className="instruct1_headerOne" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("12vw")}>Step One:</Textfit>
                <Textfit className="instruct1_headerTwo" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>Prepare</Textfit>
                <Blook name="Dog" className="instruct1_leftBlook" />
                <div className="instruct1_vsText">VS</div>
                <Blook name="Cat" className="instruct1_rightBlook" />
                <Textfit className="instruct1_headerThree" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("8vw")}>Each Round You'll Be Randomly Matched Up Against {host.settings.mode == "Teams" ? "A Team" : "Someone"}</Textfit>
            </div>
            : stage == 3
                ? <div className="instruct2_container">
                    <Textfit className="instruct2_headerOne" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("12vw")}>Step Two:</Textfit>
                    <Textfit className="instruct2_headerTwo" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>Answer Questions Correctly</Textfit>
                    <div className="instruct2_answerBox">
                        <div className="instruct2_answerHeader"></div>
                        <div className="instruct2_answerOne"></div>
                        <div className="instruct2_answerTwo"></div>
                        <div className="instruct2_answerThree"></div>
                        <div className="instruct2_answerFour"></div>
                    </div>
                    <div className="instruct2_arrowContainer">
                        <i className="instruct2_arrow fas fa-arrow-right"></i>
                    </div>
                    <div className="instruct2_checkBoxBorder">
                        <div className="instruct2_checkBox">
                            <i className="instruct2_check fas fa-check"></i>
                        </div>
                    </div>
                    <Textfit className="instruct2_headerThree" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("8vw")}>{host.settings.mode == "Teams" ? "Incorrect Answers Count For The Maximum Time" : "Answer Quickly to Beat Your Opponent"}</Textfit>
                </div>
                : stage == 4
                    ? <div className="instruct3_container">
                        <Textfit className="instruct3_headerOne" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("12vw")}>Step Three:</Textfit>
                        <Textfit className="instruct3_headerTwo" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>Showdown</Textfit>
                        <Blook name="Dog" className="instruct3_leftBlook" />
                        <div className="instruct3_vsText">VS</div>
                        <Blook name="Cat" className="instruct3_rightBlook" />
                        <Textfit className="instruct3_headerThree" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("8vw")}>{host.settings.mode == "Teams" ? "The Team With The Lowest Average Time Will Keep Their Energy" : "Answer Correctly and More Quickly To Keep Your Energy"}</Textfit>
                    </div>
                    : stage == 5
                        ? <div className="instruct4_container">
                            <Textfit className="instruct4_headerOne" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("12vw")}>Step Four:</Textfit>
                            <Textfit className="instruct4_headerTwo" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>Survive</Textfit>
                            <Blook name="Chicken" className="instruct4_blookOne" />
                            <Blook name="Dog" className="instruct4_blookTwo" />
                            <Blook name="Fox" className="instruct4_blookThree" />
                            <Blook name="Pig" className="instruct4_blookFour" />
                            <Blook name="Sheep" className="instruct4_blookFive" />
                            <Textfit className="instruct4_headerThree" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("8vw")}>The Last {host.settings.mode == "Teams" ? "Team" : "Player"} With Energy Remaining Wins</Textfit>
                        </div>
                        : stage == 6 && <div className="instruct5_container">
                            <Textfit className="instruct5_headerOne" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("15vw")}>Good Luck</Textfit>
                            <Textfit className="instruct5_headerTwo" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("15vw")}>& Let's Go!</Textfit>
                        </div>}
        <div id="skipButton" onClick={skip}>Skip</div>
    </div>
}

function Opponent({ energy, name, blook, done, win, left, ready, safe }) {
    return <div className={className("opponent_row", { opponent_rowLose: !win && done, opponent_rowRight: left })}>
        <img src={royale.nameplateLeft} alt="background" className={className("opponent_background", { opponent_backgroundRight: left })} />
        <Blook name={blook} className={className("opponent_blook", { opponent_blookRight: left })} />
        <Textfit className="opponent_name" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5vw")}>{name}</Textfit>
        <div className="opponent_energyContainer">
            <div className="opponent_energyText" style={{ color: left ? "#ff490f" : "#324cff" }}>
                {done && ready && !win && !safe ? energy - 1 : energy}
            </div>
            <img src={left ? royale.boltOrange : royale.boltBlue} alt="Energy" className="opponent_energyIcon" />
        </div>
    </div>
}

function Match({ match: [first, second], ready, safe }) {
    let done = Boolean(first.time || second.time);
    return <div className="match_container">
        <Opponent
            energy={first.energy}
            name={first.name} blook={first.blook} done={done}
            win={(first.correct && !second.correct) || (first.correct && first.time < second.time)}
            ready={ready} safe={safe} left={true} />
        <img src={royale.lobbyVs} alt="VS" className="match_vsImg" />
        <Opponent
            energy={second.energy}
            name={second.clone ? `${second.name} \uD83D\uDC7E` : second.name} blook={second.blook} done={done}
            win={(second.correct && !first.correct) || (second.correct && second.time < first.time)}
            ready={ready} safe={safe} />
    </div>
}

function SingleMatch({ name, match, maxEnergy, team, timer }) {
    const [matches, setMatches] = useState({ me: { blook: "", name: "" }, opp: { blook: "", name: "" } });
    const [energyArrays, setEnergyArrays] = useState({ me: [], opp: [] });
    useEffect(() => {
        if (matches.me && matches.opp) {
            let meEnergy = [], oppEnergy = [];
            for (let i = 0; i < maxEnergy; i++) {
                meEnergy.push(matches.me.energy > i);
                oppEnergy.push(matches.opp.energy > i);
            }
            oppEnergy.reverse();
            setEnergyArrays({ me: meEnergy, opp: oppEnergy });
        }
    }, [matches]);
    useEffect(() => {
        if (name && match?.[0]) setMatches({
            me: match[0].name == name ? match[0] : match[1],
            opp: match[0].name == name ? match[1] : match[0],
        });
    }, []);
    return <div className="singlematch_background">
        <div className="singlematch_rightBackground"></div>
        <img src={royale.bgStarburst} alt="Background" className="singlematch_backgroundOverlay" />
        <img src={royale.vsLightningTop} alt="Lightning Top" className="singlematch_lightningTop" />
        <img src={royale.vsLightningBottom} alt="Lightning Bottom" className="singlematch_lightningBottom" />
        <Blook name={matches.me.blook} className="singlematch_leftBlookShadow3" />
        <img src={royale.orangeNameplate} alt="Nameplate" className="singlematch_leftNameplate" />
        <Textfit className="singlematch_leftName" mode="single" min={1} max={getDimensions("8vw")} forceSingleModeWidth={false}>{matches.me.name}</Textfit>
        <Blook name={matches.me.blook} className="singlematch_leftBlookShadow2" />
        <Blook name={matches.me.blook} className="singlematch_leftBlookShadow1" />
        <Blook name={matches.me.blook} className="singlematch_leftBlook" />
        <div className="singlematch_leftEnergyContainer">
            <img src={royale.energyBg} alt="Energy Bar" className="singlematch_leftEnergyBar" />
            <img src={royale.boltBlue} alt="Energy Bolt" className="singlematch_leftEnergyBolt" />
            {energyArrays.me.map((energy, i) => {
                return <img src={energy ? royale.energyBarBlue : royale.energyBarEmpty} alt="Energy" className="singlematch_leftEnergy" style={{ marginRight: i == energyArrays.me.length - 1 ? "17%" : null }} />
            })}
        </div>

        <Blook name={matches.opp.blook} className="singlematch_rightBlookShadow3" />
        <img src={royale.blueNameplate} alt="Nameplate" className="singlematch_rightNameplate" />
        <Textfit className="singlematch_rightName" mode="single" min={1} max={getDimensions("8vw")} forceSingleModeWidth={false}>{matches.opp.name}</Textfit>
        <Blook name={matches.opp.blook} className="singlematch_rightBlookShadow2" />
        <Blook name={matches.opp.blook} className="singlematch_rightBlookShadow1" />
        <Blook name={matches.opp.blook} className="singlematch_rightBlook" />
        <div className="singlematch_rightEnergyContainer">
            <img src={royale.energyBg} alt="Energy Bar" className="singlematch_rightEnergyBar" />
            {energyArrays.opp.map((energy, i) => {
                return <img src={energy ? royale.energyBarOrange : royale.energyBarEmpty} alt="Energy" className="singlematch_rightEnergy" style={{ marginLeft: i == 0 ? "17%" : null }} />
            })}
            <img src={royale.boltOrange} alt="Energy Bolt" className="singlematch_rightEnergyBolt" />
        </div>

        {timer == 3
            ? <img src={royale.countdown3} alt="3" className="singlematch_numText" />
            : timer == 2
                ? <img src={royale.countdown2} alt="2" className="singlematch_numText" />
                : timer == 1
                    ? <img src={royale.countdown1} alt="1" className="singlematch_numText" />
                    : <img src={royale.vs} alt="VS" className="singlematch_vs" />}
    </div>
}

export function RoyalePreview() {
    const { host: hostRef, liveGameController } = useGame();
    const { current: host } = hostRef;
    const [timer, setTimer] = useState(8);
    const [muted, setMuted] = useState(!!hostRef.current?.muted);
    const changeMuted = useCallback(() => {
        setMuted(!muted);
        updateHost({ muted: !muted });
    }, [muted]);
    const navigate = useNavigate();
    const scrollTimeout = useRef();
    const timerInterval = useRef();
    useEffect(() => {
        if (host?.round && host.matches) {
            if (host.matches.length !== 1) scrollTimeout.current = setTimeout(() => animateScroll.scrollToBottom({
                duration: 3000,
                smooth: "linear",
                containerId: "matches"
            }), 2000);
            let seconds = 8;
            timerInterval.current = setInterval(() => {
                seconds--;
                setTimer(seconds);
                if (seconds <= 0) {
                    clearInterval(timerInterval.current);
                    liveGameController.setStage({
                        clearAnswers: true,
                        stage: hostRef.current.questionString
                    }, () => navigate("/host/battle-royale/question"));
                }
            }, 1000);
        }
        return () => {
            clearTimeout(scrollTimeout.current);
            clearInterval(timerInterval.current);
        }
    }, []);
    if (host?.round && host.matches)
        return <div className="body" style={{ backgroundColor: host.matches.length == 1 ? "#f7f7f7" : "var(--accent2)", overflow: "hidden" }}>
            <TopBar left={`Round ${host.round}`} right={`${host.players.length} ${host.settings.mode == "Teams" ? "Teams" : "Players"} Remain`} muted={muted} changeMuted={changeMuted} />
            {host.matches.length !== 1 ? <div className="hostRegularBody" style={{ backgroundColor: "#3907c0" }}>
                <img src={royale.wavyBg} alt="Waves" className="preview_wavesBg" />
                <div className="preview_header">Starting In {timer}</div>
                <ScrollElement className="preview_matchArray" id="matches">
                    {host.matches.map((match, i) => {
                        return <Match match={match} key={i} />
                    })}
                </ScrollElement>
            </div> : <div className="hostRegularBody">
                <SingleMatch name={host.matches[0][0].name} match={host.matches[0]} maxEnergy={host.settings.energy} timer={timer} />
            </div>}
        </div>
}

export function RoyaleQuestion() {
    const { host: hostRef, liveGameController, setRoyaleResults } = useGame();
    const { current: host } = hostRef;
    const [numAnswers, setNumAnswers] = useState(0);
    const [numClients, setNumClients] = useState(0);
    const [players, setPlayers] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const [muted, setMuted] = useState(!!host?.muted);
    const navigate = useNavigate();
    const dbRef = useRef({});
    const answerObj = useRef({});
    const next = useCallback(() => {
        setTransitioning(true);
        if (!host?.matches) return;
        let matchesCopy = JSON.parse(JSON.stringify(host.matches)),
            times = [];
        for (const player in answerObj.current) {
            let submission = answerObj.current[player];
            let correct = false;
            if (host.question.qType == "typing") for (let i = 0; i < host.question.answers.length; i++) {
                let answer = host.question.answers[i];
                let correctAnswer = submission.a || "";
                if (host.question.answerTypes[i] == "contains" && correctAnswer.toLowerCase().trim().includes(answer.toLowerCase().trim()) || correctAnswer.toLowerCase().trim() === answer.toLowerCase().trim()) correct = true;
            } else if (correct = host.question.correctAnswers.includes(host.question.answers[submission.a])) times.push(submission.t);
            if (host.settings.mode == "Teams") {
                let time = correct ? submission.t : 1000 * host.question.timeLimit;
                for (let i = matchesCopy.length - 1; i >= 0; i--) if (Object.keys(matchesCopy[i][0].players.includes(player))) {
                    matchesCopy[i][0].players[player].time = time;
                    if (correct) matchesCopy[i][0].correct = correct;
                    if (matchesCopy[i][0].clone) break;
                } else if (Object.keys(matchesCopy[i][1].players).includes(player)) {
                    matchesCopy[i][1].players[player].time = time;
                    if (correct) matchesCopy[i][1].correct = true;
                    if (matchesCopy[i][1].clone) break;
                }
            } else for (let i = matchesCopy.length - 1; i >= 0; i--) if (matchesCopy[i][0].name == player) {
                matchesCopy[i][0] = { ...matchesCopy[i][0], time: submission.t, correct };
                if (!matchesCopy[i][0].clone) break;
            } else if (matchesCopy[i][1].name == player) {
                matchesCopy[i][1] = { ...matchesCopy[i][1], time: submission.t, correct };
                if (matchesCopy[i][1].clone) break;
            }
        }
        const averageTime = team => parseFloat((Object.values(team.players).reduce((a, b) => (a + (b.time || 1000 * host.question.timeLimit)), 0) / Object.keys(team.players).length).toFixed(3));
        if (host.settings.mode == "Teams")
            for (let i = 0; i < matchesCopy.length; i++) {
                matchesCopy[i][0].time = averageTime(matchesCopy[i][0]);
                matchesCopy[i][1].time = averageTime(matchesCopy[i][1]);
            }
        let playersCopy = host.players.map(x => ({ ...x }));
        for (let i = 0; i < matchesCopy.length; i++) {
            let match = matchesCopy[i];
            let player = playersCopy.find(x => x.name == match[0].name);
            let opponent = playersCopy.find(x => x.name == match[1].name);
            if (match[0].time == 0) {
                matchesCopy[i][0].time = 1000 * host.question.timeLimit
                if (player) player.energy--;
            } else if ((!match[0].correct || match[1].correct && !match[0].correct || match[1].correct && match[1].time < match[0].time) && player) player.energy--;
            if (match[1].clone) {
                if (match[1].time) matchesCopy[i][1].time = 1000 * host.question.timeLimit
            } else if (match[1].time == 0) {
                matchesCopy[i][1].time = 1000 * host.question.timeLimit;
                if (opponent) opponent.energy--;
            } else if ((!match[1].correct || match[0].correct && !match[1].correct || match[0].correct && match[0].time < match[1].time) && opponent) opponent.energy--;
        }
        let dead = { ...host.dead },
            revive = false,
            alive = playersCopy.filter(x => x.energy > 0);
        if (alive.length == 0) {
            revive = true;
            alive = playersCopy.map(x => ({ ...x, energy: 1 }));
        } else dead[host.round] = playersCopy.filter(x => x.energy <= 0);

        let f = numClients - times.length;
        for (let h = 0; h < f; h++) times.push(1000 * host.question.timeLimit + 1);
        transitionTimeout.current = setTimeout(() => {
            setRoyaleResults(Object.values(answerObj.current).map(x => x.a), matchesCopy, alive, numClients, dead, times, revive);
            if (host.settings.mode == "Teams") {
                let val = matchesCopy.reduce((val, match) => {
                    val[match[0].name] = match[0].time;
                    val[match[1].name] = match[1].time;
                    return val;
                }, {});
                liveGameController.setVal({ path: "c", val }, () => liveGameController.setStage({ stage: "bres" }, () => navigate("/host/battle-royale/question/results")));
            } else liveGameController.setStage({ stage: "bres" }, () => navigate("/host/battle-royale/question/results"));
        }, 300);

    }, [numClients]);
    const changeMuted = useCallback(() => {
        setMuted(!muted);
        updateHost({ muted: !muted });
    }, [muted]);
    const dbRefValue = useCallback(snapshot => {
        let val = snapshot.val() || {};
        let answers = val ? Object.values(val) : [];
        if (answers.length > 0 && !muted) new Audio(audios.join).play();
        answerObj.current = val;
        setNumAnswers(answers.length);
        if (answers.length == numClients && numClients !== 0) next();
    }, [numClients]);
    const transitionTimeout = useRef();
    useEffect(() => {
        if (!hostRef.current?.question || !host.matches) return navigate("/sets");
        (async () => {
            if (host.settings.mode == "Teams") setNumClients(Object.values(host.players).reduce((a, b) => a + Object.keys(b.players).length, 0));
            else liveGameController.getDatabaseVal("c", (val) => {
                setNumClients(Object.keys(val || {}).length);
            });
            setPlayers(host.players.length);
            dbRef.current = await liveGameController.getDatabaseRef("a");
            dbRef.current.on("value", dbRefValue);
        })();
        return () => {
            clearTimeout(transitionTimeout.current);
            if (Object.keys(dbRef.current).length) dbRef.current.off("value");
        }
    }, []);

    if (!host?.question || !host.matches) return navigate("/sets");
    return <div className="body">
        <TopBar left={`Round ${host.round}`} right={`${players || host.players.length} ${host.settings.mode == "Teams" ? "Teams" : "Players"} Remain`} muted={muted} changeMuted={changeMuted} />
        <HostQuestion next={next} question={host.question} numAnswers={numAnswers} numClients={numClients} transitioning={transitioning} muted={muted} />
    </div>
}

export function RoyaleQuestionResults() {
    const { host: hostRef, liveGameController } = useGame();
    const { current: host } = hostRef;
    const navigate = useNavigate();
    const [transitioning, setTransitioning] = useState(false);
    const [muted, setMuted] = useState(!!host?.muted);
    const transitionTimeout = useRef();
    const next = useCallback(() => {
        liveGameController.setStage({
            stage: `pmat-${hostRef.current.safe ? "1" : "0"}`
        }, () => {
            setTransitioning(true);
            transitionTimeout.current = setTimeout(() => navigate("/host/battle-royale/match/results"));
        });
    }, []);
    const changeMuted = useCallback(() => {
        setMuted(!muted);
        updateHost({ muted: !muted });
    }, [muted]);
    useEffect(() => {
        return () => clearTimeout(transitionTimeout.current);
    }, []);
    if (!host?.question) return navigate("/sets");
    return <div className="body">
        <TopBar left={`Round ${host.round}`} right={`${host.players.length + (host.dead?.[host.round]?.length || 0)} ${host.settings.mode == "Teams" ? "Teams" : "Players"} Remain`} muted={muted} changeMuted={changeMuted} />
        <HostResults next={next} time={7} question={hostRef.current.question} clientAnswers={hostRef.current.clientAnswers} numClients={hostRef.current.numClients} transitioning={transitioning} muted={muted} canSkip={true} />
    </div>
}

function RoyaleStandings({ winner, loser, bothWin, bothLose, win, safe, isPlayer }) {
    let playerWin = !win && isPlayer ? loser : winner;
    let playerLose = !win && isPlayer ? winner : loser;
    return <div className="standings_background">
        {
            win
                ? <>
                    <div className="standings_winnerBackground"></div>
                    <img src={royale.bgStarburst} alt="Background" className="standings_winnerOverlay" />
                </>
                : <>
                    <img src={royale.lineBg} alt="Sadness" className="standings_loserOverlay" />
                    <img src={royale.wavyBg} alt="Waves" className="standings_loserOverlay2" />
                </>
        }
        <img src={royale.bgStarburst} alt="Background" className="standings_resultsOverlay" />
        <div className="standings_resultsText">Match Results</div>
        <Blook name={playerWin.blook} className="standings_winnerBlookShadow3" />
        <img src={royale.victoryDefeatBg} alt="Nameplate" className="standings_victoryTextBg" />
        <img src={win ? royale.victoryText : royale.defeatedText} alt={win ? "Victory" : "Defeat"} className="standings_victoryText" />
        <div className="standings_winnerBlookContainer">
            <div className="standings_winnerCorrectContainer">
                <img src={royale.energyBg} alt="Nameplate" className="standings_winnerCorrectBg" />
                <img src={playerWin.correct ? royale.greenCheck : royale.redX} alt={playerWin.correct ? "Correct" : "Incorrect"} className="standings_winnerCheck" />
                <div className="standings_winnerTime" style={{ color: playerWin.correct ? "#4fcb11" : "#ff1700" }}>
                    {(playerWin.time / 1000 || 0).toFixed(3)}s
                </div>
            </div>
            <div className="standings_winnerEnergyContainer">
                <img src={royale.energyBg} alt="Nameplate" className="standings_winnerCorrectBg" />
                <div className="standings_winnerEnergy">{playerWin.energy}</div>
                <img src={royale.boltOrange} alt="Energy" className="standings_winnerEnergyIcon" />
            </div>
            <Blook name={playerWin.blook} className="standings_winnerBlookShadow2" />
            <Blook name={playerWin.blook} className="standings_winnerBlookShadow1" />
            <Blook name={playerWin.blook} className={className("standings_winnerBlook", { standings_grayBlook: bothWin || (!win && isPlayer) })} />
        </div>
        <img src={royale.orangeNameplate} alt="Energy" className="standings_winnerNameplate" />
        <Textfit className="standings_winnerName" mode="single" min={1} max={getDimensions("8vw")} forceSingleModeWidth={false}>
            {playerWin.name}{playerWin.clone ? ' \uD83D\uDC7E' : ""}
        </Textfit>

        <Blook name={playerLose.blook} className="standings_LoserBlookShadow3" />
        <img src={royale.victoryDefeatBg} alt="Nameplate" className="standings_defeatTextBg" />
        <img src={(bothWin || (!win && isPlayer)) && !bothLose ? royale.victoryText : royale.defeatedText} alt={(bothWin || (!win && isPlayer)) && !bothLose ? "Victory" : "Defeat"} className="standings_defeatText" />
        <div className="standings_LoserBlookContainer">
            <div className="standings_loserCorrectContainer">
                <img src={royale.energyBg} alt="Nameplate" className="standings_loserCorrectBg" />
                <img src={playerLose.correct ? royale.greenCheck : royale.redX} alt={playerLose.correct ? "Correct" : "Incorrect"} className="standings_loserCheck" />
                <div className="standings_loserTime" style={{ color: playerLose.correct ? "#4fcb11" : "#ff1700" }}>
                    {(playerLose.time / 1000 || 0).toFixed(3)}s
                </div>
            </div>
            <div className="standings_loserEnergyContainer">
                <img src={royale.energyBg} alt="Nameplate" className="standings_loserCorrectBg" />
                <div className="standings_loserEnergy">{playerLose.energy}</div>
                <img src={royale.boltBlue} alt="Energy" className="standings_loserEnergyIcon" />
            </div>
            <Blook name={playerLose.blook} className="standings_loserBlookShadow2" />
            <Blook name={playerLose.blook} className="standings_loserBlookShadow1" />
            <Blook name={playerLose.blook} className={className("standings_loserBlook", { standings_grayBlook: bothLose || !(bothWin || (!win && isPlayer)) })} />
        </div>
        <img src={royale.blueNameplate} alt="Energy" className="standings_loserNameplate" />
        <Textfit className="standings_loserName" mode="single" min={1} max={getDimensions("8vw")} forceSingleModeWidth={false}>
            {playerLose.name}{playerLose.clone ? ' \uD83D\uDC7E' : ""}
        </Textfit>

        {bothLose || bothWin && <div className="standings_rightText">{safe ? "You Can't All Lose" : bothLose ? "You Both Lose" : bothWin ? "You Both Win" : ""}</div>}
    </div>
}

export function RoyaleMatchResults() {
    const { host: hostRef, updateStandings, nextRoyale, prepareRoyale, liveGameController } = useGame();
    const navigate = useNavigate();
    const [winner, setWinner] = useState({});
    const [loser, setLoser] = useState({});
    const [bothWin, setBothWin] = useState(false);
    const [bothLose, setBothLose] = useState(false);
    const [ready, setReady] = useState(false);
    const [muted, setMuted] = useState(!!hostRef.current?.muted);
    const changeMuted = useCallback(() => {
        setMuted(!muted);
        updateHost({ muted: !muted });
    }, [muted]);
    const { current: audio } = useRef(new Audio(audios.royaleResults));
    const scrollTimeout = useRef();
    const readyTimeout = useRef();
    const timeout = useRef();
    useEffect(() => {
        const { current: host } = hostRef;
        if (!host?.round || !host.matches) return navigate("/sets");
        audio.muted = muted;
        let r = Math.max(10500, 6000 + 500 * host.matches.length);
        if (host.matches.length !== 1) scrollTimeout.current = setTimeout(() => {
            animateScroll.scrollToBottom({
                duration: 0.3 * r,
                smooth: "linear",
                containerId: "matches"
            });
        }, 0.4 * r);
        readyTimeout.current = setTimeout(() => {
            audio.play();
            setReady(true);
        }, 4600);
        let [first, second] = host.matches[0],
            firstWon = first.correct && !second.correct || first.correct && first.time <= second.time,
            secondWon = second.correct && !first.correct || second.correct && second.time <= first.time;
        setWinner(firstWon ? first : second);
        setLoser(firstWon ? second : first);
        setBothLose(!firstWon && !secondWon);
        setBothWin(firstWon && secondWon);
        timeout.current = setTimeout(() => {
            let host = hostRef.current;
            if (host.players.length == 1) {
                let standings = [],
                    r = host.dead,
                    n = host.settings.energy,
                    o = host.safes,
                    i = 2;
                for (let dead in r) i += r[dead].length;
                for (let a = n; a <= host.round; a++) if (r[a]) {
                    i -= r[a].length;
                    let s = a - n;
                    if (o?.[0] && o[0] < a) for (let c = 0; c < o.length; c++) if (o[c] < a) a--;
                    for (let u = 0; u < r[a].length; u++) standings.push(host.settings.mode == "Teams" ? {
                        name: r[a][u].name,
                        blook: r[a][u].blook,
                        players: r[a][u].players,
                        place: i,
                        wins: s
                    } : {
                        name: r[a][u].name,
                        blook: r[a][u].blook,
                        place: i,
                        wins: s
                    });
                    console.log({ r, n, o, i, a, s });
                }
                standings.push(host.settings.mode == "Teams" ? {
                    name: host.players[0].name,
                    blook: host.players[0].blook,
                    players: host.players[0].players,
                    place: 1,
                    wins: standings.length > 0 ? standings[standings.length - 1].wins + host.players[0].energy : host.players[0].energy
                } : {
                    name: host.players[0].name,
                    blook: host.players[0].blook,
                    place: 1,
                    wins: standings.length > 0 ? standings[standings.length - 1].wins + host.players[0].energy : host.players[0].energy
                });
                standings.reverse();
                updateStandings(standings);
                let val = {};
                for (let standing of standings) if (standing.blook) val[standing.name] = {
                    n: standing.name,
                    b: standing.blook,
                    p: standing.place,
                    w: standing.wins,
                    nu: host.settings.mode == "Teams" ? Object.keys(standing.players).length : 1,
                }
                liveGameController.setVal({ path: "st", val }, () => liveGameController.setStage({
                    stage: "fin"
                }, navigate("/host/battle-royale/final")))
            } else {
                let p = nextRoyale(host.players, host.settings.mode == "Teams", host.usedQuestions, host.questionsPlayed, host.questions, host.dead)
                prepareRoyale(host.round + 1, p.usedQuestions, p.questionsPlayed, `q-${p.question.stdNumber}-${p.answerString}`, p.question, p.matches);
                liveGameController.setVal({ path: "c", val: p.dbPlayers }, () => liveGameController.setStage({
                    stage: "prv"
                }, () => navigate("/host/battle-royale/match/preview")));
            }
        }, r + 600);
        return () => {
            clearTimeout(scrollTimeout);
            clearTimeout(readyTimeout);
            clearTimeout(timeout);
        }
    }, []);
    if (!hostRef.current?.round || !hostRef.current.matches) return navigate("/sets");
    const { current: host } = hostRef;
    return <div className="body">
        <TopBar left={`Round ${host.round}`} right={ready
            ? `${host.players.length} ${host.players.length == 1 ? `${host.settings.mode == "Teams" ? "Team" : "Player"} Remains` : `${host.settings.mode == "Teams" ? "Teams" : "Players"} Remain`}`
            : `${host.players.length + (host.dead[host.round]?.length || 0)} ${host.settings.mode == "Teams" ? "Teams" : "Players"} Remain`}
            muted={muted} changeMuted={changeMuted} />
        <div className="hostRegularBody" style={{ backgroundColor: "#3907c0" }}>
            {host.matches.length !== 1
                ? <>
                    <img src={royale.wavyBg} alt="Waves" className="matchresults_wavesBg" />
                    <div className="matchresults_header">Match Results</div>
                    <ScrollElement className="matchresults_matchArray" id="matches">
                        {host.matches.map((match, i) => <Match match={match} key={i} ready={ready} safe={host.safe} />)}
                    </ScrollElement>
                </>
                : <RoyaleStandings winner={winner} loser={loser} bothWin={bothWin} bothLose={bothLose} win={!bothLose && !host.safe} safe={host.safe} teams={host.settings.mode == "Teams"} />}
        </div>
    </div>
}

export function RoyaleFinal() {
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
                if (hostCopy.settings.mode == "Teams") post("https://play.blooket.com/api/history", {
                    t: hostId.current,
                    standings: standings.map(({ blook, name, place, wins, players }) => ({
                        blook, name, place,
                        wins: isNaN(wins) ? 0 : Math.min(Math.round(Number(wins)), 9223372036854775000),
                        players: Object.entries(players).map(([name, data]) => ({
                            name, blook: data.blook,
                            corrects: results[name]?.corrects || {},
                            incorrects: results[name]?.incorrects || {}
                        }))
                    })),
                    settings: hostCopy.settings,
                    setId: hostCopy.setId
                }).then(({ data }) => {
                    setState(s => ({ ...s, historyId: data.id, ready: true }));
                    askTimeout.current = setTimeout(() => setAskPlayAgain(true), 3000);
                }).catch(console.error);
                else post("https://play.blooket.com/api/history", {
                    t: hostId.current,
                    standings: standings.map(({ blook, name, place, wins }) => ({
                        blook, name, place,
                        wins: isNaN(wins) ? 0 : Math.min(Math.round(Number(wins)), 9223372036854775000),
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
    if (host?.standings?.[0] || state.standings?.[0]) return <div className="hostBody" style={{ overflowY: state.ready ? "auto" : "hidden" }}>
        {state.standings.length > 0 && <Standings
            standings={state.standings.map(x => ({ ...x, b: x.blook, n: x.name, p: x.place }))}
            stats={state.standings.map(e => formatNumber(e.wins) + (e.wins == 1 ? " Win" : " Wins"))}
            gameId={hostCopy.setId}
            historyId={state.historyId}
            muted={state.muted}
            ready={state.ready}
            team={hostCopy.settings.mode == "Teams"}
        />}
        {askPlayAgain && <Modal text="Would you like to play again right now with the same settings?"
            buttonOne={{ text: "Yes!", click: () => onPlayAgain(true) }}
            buttonTwo={{ text: "No", click: () => onPlayAgain(false) }} />}
    </div>;
}