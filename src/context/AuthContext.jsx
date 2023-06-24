import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { fetch, Body } from "@tauri-apps/api/http";
import Fetch from "../utils/Fetch.js";
const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

function useLocalStorage(name) {
    const ref = useRef(localStorage.getItem(name));
    return [ref, (val) => {
        localStorage.setItem(name, val);
        return (ref.current = val);
    }];
}

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [bisd, setBisd] = useLocalStorage("bisd");
    const csrfFetch = useRef();

    useEffect(() => {
        async function run() {
            if (bisd.current) await getLoggedIn();
            setLoading(false);
        }
        run();
    }, [])

    async function login([name, password]) {
        const res = await fetch("https://id.blooket.com/api/users/login", {
            body: Body.json({ name: name.value, password: password.value }),
            method: "post"
        });
        let error;
        try {
            if (!res.data.success) {
                error = res.data.msg;
                if ("name" === res.data.errType) {
                    if (res.data.suspensionEnd) error = `${error} Suspension ends: ${res.data.suspensionEnd}`;
                    if (res.data.suspendedReason && res.data.suspendedReason.includes("District")) error = `${error} Reason: ${res.data.suspendedReason} `;
                }
            } else {
                setBisd(res.headers['set-cookie']);
                await getLoggedIn();
            }
        } catch (e) {
            console.error(e);
            error = "There was an error";
        }
        return { error, result: res.data };
    }

    async function getLoggedIn() {
        const res = await fetch("https://dashboard.blooket.com/api/users/me", { headers: { Cookie: bisd.current } });
        setUserData(res.data);
        csrfFetch.current = Fetch(bisd.current, (cookie) => (bisd.current += cookie));
    }

    return (
        <AuthContext.Provider value={{ login, getLoggedIn, userData, csrfFetch }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}