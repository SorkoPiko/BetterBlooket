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
    const [client, setClient] = useState();
    const [hostId, setHostId] = useState(null);

    useEffect(() => {
        if (!liveGameController) liveGameController = new LiveGameController(http);
        setLoading(false);
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

    return (
        <GameContext.Provider value={{ liveGameController, host, client, addGameId, setSettings, addHostQuestions, deleteHost, hostId, setHostId, updateHost, setPlayers }}>
            {!loading && children}
        </GameContext.Provider>
    )
}

export const GameLayout = () => {
    return <GameProvider>
        <Outlet />
    </GameProvider>
}