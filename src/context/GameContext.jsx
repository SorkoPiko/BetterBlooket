import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { Outlet } from "react-router-dom";
import LiveGameController from "../utils/LiveGameController";
import { useCallback } from "react";
import { useRef } from "react";
// import { fetch, Body } from "@tauri-apps/api/http";
const GameContext = createContext();

export function useGame() {
    return useContext(GameContext);
}

let liveGameController;

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
    }, [standings]);

    return (
        <GameContext.Provider value={{ liveGameController, host, client, addGameId, setSettings, addHostQuestions, deleteHost, hostId, setHostId, updateHost, setPlayers, updateStandings, standings }}>
            {!loading && children}
        </GameContext.Provider>
    )
}

export const GameLayout = () => {
    return <GameProvider>
        <Outlet />
    </GameProvider>
}