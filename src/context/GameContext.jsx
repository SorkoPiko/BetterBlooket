import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { Outlet } from "react-router-dom";
import LiveGameController from "../utils/LiveGameController";
// import { fetch, Body } from "@tauri-apps/api/http";
const GameContext = createContext();

export function useGame() {
    return useContext(GameContext);
}

export const GameProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [liveGameController, setLiveGameController] = useState();
    const { http } = useAuth();

    useEffect(() => {
        setLiveGameController(new LiveGameController(http));
    }, []);

    useEffect(() => {
        if (liveGameController) setLoading(false);
    }, [liveGameController]);

    return (
        <GameContext.Provider value={{ liveGameController }}>
            {!loading && children}
        </GameContext.Provider>
    )
}

export const GameLayout = () => {
    return <GameProvider>
        <Outlet />
    </GameProvider>
}