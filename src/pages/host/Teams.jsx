import { useEffect, useCallback, useState, useRef } from "react";
import { useGame } from "../../context/GameContext";
import { useNavigate } from "react-router-dom";
import allBlooks from "../../blooks/allBlooks";
import { shuffleArray } from "../../utils/questions";
import TopBar from "./TopBar.jsx";
import { basic } from "../../utils/images.js";
import Blook from "../../blooks/Blook";
import { Textfit } from "react-textfit";
import { getDimensions } from "../../utils/numbers";
import "./teams.css";

function getClients(teams) {
    return teams.reduce((obj, team) => {
        for (const player of team.players) obj[player.name] = {
            b: player.blook,
            t: team.name,
            tb: team.blook
        }
        return obj;
    }, {});
}

function Team({ team, noEnergy, selected, onSelect, canClick }) {
    return <div className="teamHolder">
        <div className="teamContainer">
            {!noEnergy && <div className="energyContainer">
                <div className="energyText" style={{ letterSpacing: team.energy >= 10 ? "-4px" : "normal" }}>{team.energy}</div>
                <i className="fas fa-bolt"></i>
            </div>}
            <Blook name={team.blook} className="teamBlook" />
            <div className="teamText">{team.name}</div>
        </div>
        <div className="teamPlayersContainer">
            {team.players.map(player => {
                return <div key={player.name} className={`${canClick ? "playerContainer" : "playerContainerNo"}${selected == player.name ? " selected" : ""}`} onClick={() => onSelect(player.name)}>
                    <Blook name={player.blook} className="playerBlook" />
                    <Textfit className="playerText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5vw")}>{player.name}</Textfit>
                </div>
            })}
        </div>
    </div>
}

export default function HostTeams() {
    const { host: { current: host }, liveGameController, setPlayers, nextRoyale, prepareRoyale } = useGame();
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [selected, setSelected] = useState("");
    const [transition, setTransition] = useState("");
    const players = useRef([]);
    const shuffleTeams = useCallback(() => {
        let clients = shuffleArray([...players.current]),
            numPlayers = players.current.length,
            teams = [],
            numTeams = 0,
            extraPlayers = 0,
            teamSize = 0;
        if (numPlayers <= 5) (teamSize = 2, numTeams = 2, extraPlayers = numPlayers - 4);
        else if (numPlayers % 3 <= numPlayers % 4 || numPlayers % 4 != 0) (teamSize = 3, numTeams = Math.floor(numPlayers / 3), extraPlayers = numPlayers % 3);
        else (teamSize = 4, numTeams = Math.floor(numPlayers / 4), extraPlayers = numPlayers % 4);
        if (0 !== clients.length) {
            for (let i = 0; i < numTeams; i++) {
                let r = teamSize;
                if (extraPlayers > 0) (r += 1, extraPlayers -= 1);
                let blook = clients[0].blook,
                    name = blook.includes("#") ? clients[0].name : allBlooks[blook].teamName,
                    players = [];
                for (let player of clients.splice(0, r)) players.push(player);
                teams.push({
                    name, blook, players,
                    time: 0,
                    correct: false,
                    energy: host.settings?.energy
                });
            }
            liveGameController.setVal({ path: "c", val: getClients(teams) });
            setTeams(teams);
        }
    }, []);
    const startGame = useCallback(() => {
        setTransition(true);
        goTimeout.current = setTimeout(function () {
            let teamsCopy = JSON.parse(JSON.stringify(teams));
            for (let i = 0; i < teams.length; i++) {
                teamsCopy[i].players = {};
                for (let j = 0; j < teams[i].players.length; j++) {
                    let { name, blook } = teams[i].players[j];
                    teamsCopy[i].players[name] = { blook, time: 0 };
                }
            }
            setPlayers(teamsCopy);
            if (host.settings.instruct) liveGameController.setStage({ stage: "inst" }, function () {
                if (host.settings.type == "Rush") navigate("/host/rush/instructions");
                else navigate("/host/battle-royale/instructions");
            });
            else if (host.settings.type == "Rush") navigate("/host/rush");
            else {
                let royale = nextRoyale(teamsCopy, host.settings.mode == "Teams", host.usedQuestions, host.questionsPlayed, host.questions, host.dead);
                prepareRoyale(1, royale.usedQuestions, royale.questionsPlayed, `q-${royale.question.stdNumber}-${answerString}`, royale.question, royale.matches);
                liveGameController.setVal({
                    path: "c",
                    val: royale.dbPlayers
                }, function () {
                    liveGameController.setStage({ stage: "prv" }, () => navigate("/host/battle-royale/match/preview"))
                })
            }
        }, 500);
    }, [teams]);
    const swap = useCallback((player) => {
        if (!selected) return setSelected(player);
        let updateTeam = team => ({
            ...team,
            name: team.players[0].blook.includes("#") ? team.players[0].name : allBlooks[team.players[0].blook].teamName,
            blook: team.players[0].blook
        });
        let t = [...teams],
            team1 = teams.find(team => team.players.find(plr => plr.name == selected)),
            index1 = team1.players.findIndex(x => x.name == selected),
            player1 = team1.players[index1],
            team2 = teams.find(team => team.players.find(plr => plr.name == player)),
            index2 = team2.players.findIndex(x => x.name == player),
            player2 = team2.players[index2];

        team1.players[index1] = player2;
        team2.players[index2] = player1;
        t[t.findIndex(x => x.name == team1.name)] = updateTeam(team1);
        if (team1 != team2) t[t.findIndex(x => x.name == team2.name)] = updateTeam(team2);

        liveGameController.setVal({ path: "c", val: getClients(t) });
        setSelected("");
        setTeams(t);
    }, [selected, teams]);
    const goTimeout = useRef();
    const resizeTimeout = useRef();
    useEffect(() => {
        if (!host?.settings || !host?.questions || !host?.players) return navigate("/sets");
        players.current = JSON.parse(JSON.stringify(host.players));
        if (host.players[0]?.players) {
            let teams = JSON.parse(JSON.stringify(host.players));
            const createTeam = function (i) {
                teams[i].players = [];
                for (const name in host.players[i].players)
                    teams[i].players.push({ name, blook: host.players[i].players.blook });
                let customBlook = teams[i].name.includes("#");
                if (!customBlook && allBlooks[teams[i].players[0].blook].teamName !== teams[i].name) {
                    let s = teams[i].players.findIndex(({ blook }) => allBlooks[blook].teamName == teams[i].name);
                    [teams[i].players[0], teams[i].players[s]] = [teams[i].players[s], teams[i].players[0]];
                } else if (customBlook && teams[i].players[0].name !== teams[i].name) {
                    let s = teams[i].players.findIndex(({ name }) => name == teams[i].name);
                    [teams[i].players[0], teams[i].players[s]] = [teams[i].players[s], teams[i].players[0]];
                }
            }
            for (let i = 0; i < host.players.length; i++) createTeam(i);
            setTeams(teams);
        } else shuffleTeams();
        resizeTimeout.current = setTimeout(() => window.dispatchEvent(new Event("resize")), 500);
        return () => {
            clearTimeout(goTimeout.current);
            clearTimeout(resizeTimeout.current);
        }
    }, []);
    if (!host?.settings) return navigate("/sets");
    return <div className="body" style={{
        backgroundColor: "var(--accent2)",
        backgroundImage: "Snow" === host.settings.type ? "linear-gradient(#31aae0, #bdf)" : null
    }}>
        <TopBar left={host.settings.type == "Royale" ? "Round 1" : ""} center="Click Players to Swap" right={host.settings.type == "Royale" ? `${teams.length} ${host.settings.mode == "Teams" ? "Teams" : "Players"} Remain` : ""} />
        <div className="teamsBackground">
            <div className="blooksBackground" style={{ backgroundImage: `url(${basic.blookCheckers})` }}></div>
        </div>
        <div className={`hostRegularBody${transition ? " invisible" : ""}`} style={{ zIndex: 1 }}>
            <div className="buttonContainer">
                <div className="teams_button" onClick={shuffleTeams}>
                    <i className="fas fa-redo-alt" style={{ fontSize: 36 }}></i>
                    {"\xa0 Shuffle"}
                </div>
                <div className="teams_button" onClick={startGame}>
                    <i className="fas fa-play" style={{ fontSize: 33 }}></i>
                    {"\xa0 Start"}
                </div>
            </div>
            <div className="teamsArray">
                {teams.map((team, i) =>
                    <Team key={i} team={team} noEnergy={true} selected={selected} onSelect={e => swap(e)} canClick={true} />)}
            </div>
        </div>
    </div>
}