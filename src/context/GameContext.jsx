import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { Outlet } from "react-router-dom";
import LiveGameController from "../utils/LiveGameController";
import { useCallback } from "react";
import { useRef } from "react";
import { random, shuffleArray } from "../utils/questions";
// import { fetch, Body } from "@tauri-apps/api/http";
const GameContext = createContext();

export function useGame() {
    return useContext(GameContext);
}

let liveGameController;

function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export const GameProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const { http, userData } = useAuth();
    const host = useRef({});
    const standings = useRef([]);
    const [client, setClient] = useState();
    const hostId = useRef(null);

    useEffect(() => {
        if (!liveGameController) liveGameController = new LiveGameController(http);
        setLoading(false);
        return () => {
            if (liveGameController.liveGameCode && liveGameController.isHost) {
                liveGameController.removeHostAndDeleteGame();
                deleteHost();
            }
        }
    }, []);

    const addGameId = useCallback((setId) => {
        host.current = { ...host.current, setId };
    }, [host]);

    const setSettings = useCallback((settings) => {
        host.current = { ...host.current, settings };
    }, [host]);

    const addHostQuestions = useCallback((questions) => {
        host.current = { ...host.current, questions };
    }, [host]);

    const deleteHost = useCallback(() => {
        host.current = {};
    }, [host]);

    const updateHost = useCallback((data) => {
        host.current = { ...host.current, ...data };
    }, [host]);

    const setPlayers = useCallback(players => {
        host.current = { ...host.current, players };
    }, [host]);

    const updateStandings = useCallback(s => {
        standings.current = s;
    }, [standings]);

    const setHostId = useCallback(id => {
        hostId.current = id;
    }, []);

    const nextRoyale = useCallback((players, isTeams, used, played, questions, dead) => {
        let a = copy(players || []),
            s = shuffleArray(a.filter(x => x?.name && x.blook)),
            c = copy(questions || []);
        if (c.length == 0) return null;
        let usedQuestions = copy(used || []);
        if (usedQuestions.length == c.length) usedQuestions = [];
        let l = c.filter(t => !usedQuestions.includes(t.number)),
            p = random(l);
        usedQuestions.push(p.number);
        let questionsPlayed = [...(played || [])];
        if (questionsPlayed.length < c.length) questionsPlayed.push(p.number);
        let answers = [...p.answers];
        if (p.random) answers = shuffleArray(answers);
        let question = { ...p, answers }, d = [];
        for (let m = 0; m < p.answers.length; m++) d.push(answers.indexOf(p.answers[m]));
        let answerString = d.join(""), matches = [], dbPlayers = {};
        if (s.length % 2 == 1) {
            let $ = random(s);
            s.splice(s.indexOf($), 1);
            let w = random(s);
            matches.push([
                { ...$, time: 0, correct: false },
                { ...w, clone: true, time: 0, correct: false }
            ]);
            dbPlayers[$.name] = {
                b: $.blook,
                e: $.energy,
                op: w.name
            }
        }
        for (let _ = 0; _ < s.length; _ += 2) {
            matches.unshift([
                { ...s[_], time: 0, correct: false },
                { ...s[_ + 1], time: 0, correct: false }
            ]);
            dbPlayers[s[_].name] = {
                b: s[_].blook,
                e: s[_].energy,
                op: s[_ + 1].name
            }
            dbPlayers[s[_ + 1].name] = {
                b: s[_ + 1].blook,
                e: s[_ + 1].energy,
                op: s[_].name
            }
        }
        for (let t in dead)
            for (let o of dead[t]) dbPlayers[o.name] = { b: o.blook, e: 0 };
        if (isTeams) {
            let x = {};
            for (const team in dbPlayers) {
                let n = copy(a).find(x => x.blook == dbPlayers[team].b);
                if (n?.players)
                    for (const [client, { blook }] of Object.entries(n.players))
                        x[client] = {
                            b: blook,
                            e: dbPlayers[client].e,
                            op: dbPlayers[client].op,
                            p: n.name
                        }
            }
            dbPlayers = x;
        }
        return { question, usedQuestions, questionsPlayed, matches, answerString, dbPlayers };
    }, []);

    const prepareRoyale = useCallback((round, usedQuestions, questionsPlayed, questionString, question, matches) => {
        host.current = { ...host.current, round, usedQuestions, questionsPlayed, questionString, question, matches };
    }, []);

    const setRoyaleResults = useCallback((clientAnswers, matches, players, numClients, dead, forDead, safe) => {
        host.current = { ...host.current, clientAnswers, matches, players, numClients, dead, forDead, safe, safes: safe ? [...(host.current.safes || []), host.round] : host.current.safes };
    }, []);

    const setQuestion = useCallback((question) => {
        host.current = { ...host.current, type: question.type, question };
    }, []);

    const setClassicResults = useCallback((numClients, standings) => {
        host.current = { ...host.current, numClients };
        updateStandings(standings);
    }, []);

    return (
        <GameContext.Provider value={{ liveGameController, host, client, addGameId, setSettings, addHostQuestions, deleteHost, hostId, setHostId, updateHost, setPlayers, updateStandings, standings, nextRoyale, prepareRoyale, setRoyaleResults, setQuestion, setClassicResults }}>
            {!loading && children}
        </GameContext.Provider>
    )
}

export const GameLayout = () => {
    return <GameProvider>
        <Outlet />
    </GameProvider>
}