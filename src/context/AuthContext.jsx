import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { fetch, Body } from "@tauri-apps/api/http";
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
    const [userData, setUserData] = useState(null);
    const [bisd, setBisd] = useLocalStorage("bisd");

    useEffect(() => {
        if (bisd.current) getLoggedIn();
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
                    if (res.data.suspensionEnd) error = `${error} Suspension ends: ${eI()(res.data.suspensionEnd).format("MM-DD-YYYY hh:mm:ss")} UTC"`;
                    if (res.data.suspendedReason && res.data.suspendedReason.includes("District")) error = `${error} Reason: ${res.data.suspendedReason} `;
                }
            } else {
                setBisd(res.headers['set-cookie']);
                getLoggedIn();
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
    }

    return (
        <AuthContext.Provider value={{ login, getLoggedIn, userData }}>
            {children}
        </AuthContext.Provider>
    )
}