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

export const GameProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [liveGameController, setLiveGameController] = useState();
    const { http, userData } = useAuth();
    const host = useRef({});
    const [client, setClient] = useState();

    useEffect(() => {
        setLiveGameController(new LiveGameController(http));
    }, []);

    useEffect(() => {
        if (liveGameController) setLoading(false);
    }, [liveGameController]);

    const addGameId = useCallback((id) => {
        host.current = { ...host.current, id };
    }, [host]);

    const setSettings = useCallback((settings) => {
        host.current = { ...host.current, settings };
    }, [host]);

    const addHostQuestions = useCallback((questions) => {
        host.current = { ...host.current, questions };
    }, [host]);

    return (
        <GameContext.Provider value={{ liveGameController, host, client, addGameId, setSettings, addHostQuestions }}>
            {!loading && children}
        </GameContext.Provider>
    )
}

export const GameLayout = () => {
    return <GameProvider>
        <Outlet />
    </GameProvider>
}