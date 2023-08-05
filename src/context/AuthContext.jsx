import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { fetch, Body } from "@tauri-apps/api/http";
import Fetch from "../utils/Fetch.js";
import Protobuf from "../utils/protobuf.js";
const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

function useLocalStorage(name, init) {
    if (localStorage.getItem(name) == null && init != null) localStorage.setItem(name, JSON.stringify(init));
    const ref = useRef(JSON.parse(localStorage.getItem(name)));
    return [ref, (val) => {
        localStorage.setItem(name, JSON.stringify(val));
        return (ref.current = val);
    }];
}

function useUpdate(init) {
    const ref = useRef(init);
    return [ref.current, (val) => ref.current = val];
}

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [accounts, setAccounts] = useLocalStorage("accounts", []);
    const [accountIndex, setAccountIndex] = useLocalStorage("index", 0);
    const [protobuf, setProtobuf] = useUpdate();

    useEffect(() => {
        (async function () {
            if (accounts.current[accountIndex.current]?.bisd) await getLoggedIn();
            setLoading(false);
        })();
    }, []);

    useEffect(() => {
        window.protobuf = protobuf;
        if (protobuf) protobuf.me({}).then(console.log)
    }, [protobuf])

    useEffect(() => {
        if (userData) console.log(`Logged in to ${userData?.name}`, userData);
    }, [userData])

    async function login([name, password]) {
        const res = await fetch("https://id.blooket.com/api/users/login", {
            headers: {
                Origin: "https://id.blooket.com",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
            },
            body: Body.json({ name: name.value, password: password.value }),
            method: "post"
        });
        let error;
        try {
            if (!res.data.success) {
                error = res.data.msg;
                if ("name" === res.data.errType) {
                    if (res.data.suspensionEnd) error = `${error} Suspension ends: ${res.data.suspensionEnd}`;
                    if (res.data.suspendedReason) error = `${error} Reason: ${res.data.suspendedReason} `;
                }
            } else {
                let account = accounts.current.find(account => account.id == res.data.user.ID);
                if (account) account.bisd = res.headers['set-cookie'].split(' ')[0];
                else accounts.current.push({
                    id: res.data.user.ID,
                    bisd: res.headers['set-cookie'].split(' ')[0]
                });
                setAccounts(accounts.current);
                setAccountIndex(accounts.current.findIndex(account => account.id == res.data.user.ID));
                await getLoggedIn();
            }
        } catch (e) {
            console.error(e);
            error = "There was an error";
        }
        return { error, result: res.data };
    }

    async function getLoggedIn() {
        const account = accounts.current[accountIndex.current];
        const res = await fetch("https://dashboard.blooket.com/api/users/me", { headers: { Cookie: account.bisd, "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)" } });
        setUserData(res.data);
        account.blook = res.data.blook;
        account.name = res.data.name;
        setAccounts(accounts.current);
        setProtobuf(Protobuf(account.bisd, account.csrf, c => {
            account.csrf = c;
            setAccounts(accounts.current);
        }));
        setLoading(false);
    }

    function switchAccount({ id, adding }) {
        if (adding) {
            setAccountIndex(accounts.current.length);
            setUserData(null);
            return;
        }
        if (id) {
            setAccountIndex(accounts.current.findIndex(x => x.id == id));
            setLoading(true);
            getLoggedIn();
        }
    }

    function removeAccount(id, relog) {
        if (relog) setLoading(true);
        let curId = accounts.current[accountIndex.current].id;
        setAccounts(accounts.current.filter(x => x.id !== id));
        if (curId == id) setAccountIndex(0);
        else setAccountIndex(accounts.current.findIndex(x => x.id == curId));
        if (relog) getLoggedIn();
    }

    const http = {
        async get(url, { params } = {}) {
            return fetch(`${url}${params ? "?" + new URLSearchParams(params) : ""}`, { headers: { Cookie: accounts.current[accountIndex.current].bisd, "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)" } });
        },
        async put(url, body, { params } = {}) {
            return fetch(`${url}${params ? "?" + new URLSearchParams(params) : ""}`, {
                headers: { Cookie: accounts.current[accountIndex.current].bisd, "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)" },
                method: "PUT",
                body: Body.json(body)
            });
        },
        async post(url, body, { params } = {}) {
            return fetch(`${url}${params ? "?" + new URLSearchParams(params) : ""}`, {
                headers: { Cookie: accounts.current[accountIndex.current].bisd, "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)" },
                method: "POST",
                body: Body.json(body)
            });
        },
        async delete(url, { params } = {}) {
            return fetch(`${url}${params ? "?" + new URLSearchParams(params) : ""}`, {
                headers: { Cookie: accounts.current[accountIndex.current].bisd, "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)" },
                method: "DELETE"
            });
        },
    }

    return (
        <AuthContext.Provider value={{ login, getLoggedIn, userData, protobuf, http, accounts, accountIndex, switchAccount, removeAccount }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}