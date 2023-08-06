import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { fetch, Body } from "@tauri-apps/api/http";
import Fetch from "../utils/Fetch.js";
import Protobuf from "../utils/protobuf.js";
import { DateFormat } from "../utils/numbers.js";
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
    const [accounts, setAccounts] = useLocalStorage("accounts", {});
    const [accountId, setAccountId] = useLocalStorage("id", 0);
    const [protobuf, setProtobuf] = useUpdate();

    useEffect(() => {
        (async function () {
            if (typeof accounts.current != 'object' || Array.isArray(accounts.current) || accounts.current == null) setAccounts({});
            if (accounts.current[accountId.current]?.bisd) await getLoggedIn();
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
                    if (res.data.suspensionEnd) error = `${error} Suspension ends: ${new DateFormat(new Date(res.data.suspensionEnd)).format("MMMM/DD/YYYY - hh:mm a")}`;
                    if (res.data.suspendedReason) error = `${error} Reason: ${res.data.suspendedReason} `;
                }
            } else {
                let account = accounts.current[res.data.user.ID];
                if (account) account.bisd = res.headers['set-cookie'].split(' ')[0];
                else accounts.current[res.data.user.ID] = {
                    id: res.data.user.ID,
                    bisd: res.headers['set-cookie'].split(' ')[0]
                };
                setAccounts(accounts.current);
                setAccountId(res.data.user.ID);
                await getLoggedIn();
            }
        } catch (e) {
            console.error(e);
            error = "There was an error";
        }
        return { error, result: res.data };
    }

    async function getLoggedIn() {
        const account = accounts.current[accountId.current];
        const res = await fetch("https://dashboard.blooket.com/api/users/me", { headers: { Cookie: account.bisd, "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)" } });
        setUserData(res.data);
        if (res.data) {
            account.blook = res.data.blook;
            account.name = res.data.name;
            setAccounts(accounts.current);
            setProtobuf(Protobuf(account.bisd, account.csrf, c => {
                account.csrf = c;
                setAccounts(accounts.current);
            }));
        }
        setLoading(false);
    }

    function switchAccount({ id, adding }) {
        if (adding) {
            setAccountId(null);
            setUserData(null);
            return;
        }
        if (id) {
            setAccountId(id);
            setLoading(true);
            getLoggedIn();
        }
    }

    function removeAccount(id, relog) {
        if (relog) setLoading(true);
        let curId = accountId;
        delete accounts.current[id];
        setAccounts(accounts.current);
        if (curId == id) setAccountId(null);
        if (relog) getLoggedIn();
    }

    const http = {
        async get(url, { params } = {}) {
            return fetch(`${url}${params ? "?" + new URLSearchParams(params) : ""}`, { headers: { Cookie: accounts.current[accountId.current].bisd, "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)" } });
        },
        async put(url, body, { params } = {}) {
            return fetch(`${url}${params ? "?" + new URLSearchParams(params) : ""}`, {
                headers: { Cookie: accounts.current[accountId.current].bisd, "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)" },
                method: "PUT",
                body: Body.json(body)
            });
        },
        async post(url, body, { params } = {}) {
            return fetch(`${url}${params ? "?" + new URLSearchParams(params) : ""}`, {
                headers: { Cookie: accounts.current[accountId.current].bisd, "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)" },
                method: "POST",
                body: Body.json(body)
            });
        },
        async delete(url, { params } = {}) {
            return fetch(`${url}${params ? "?" + new URLSearchParams(params) : ""}`, {
                headers: { Cookie: accounts.current[accountId.current].bisd, "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)" },
                method: "DELETE"
            });
        },
    }

    return (
        <AuthContext.Provider value={{ login, getLoggedIn, userData, protobuf, http, accounts, accountId, switchAccount, removeAccount }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}