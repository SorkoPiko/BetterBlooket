import "./accounts.css";
import { useEffect, useState, useCallback } from "react";
import { fetch } from "@tauri-apps/api/http";
import Blook from "../../blooks/Blook";
import { Textfit } from "react-textfit";
import { useAuth } from "../../context/AuthContext";

export default function AccountSwitcher({ ind, back }) {
    const { switchAccount, removeAccount, accounts: accountsRef } = useAuth();
    const [accounts, setAccounts] = useState(accountsRef.current);
    const getAccs = useCallback(async () => {
        let accs = [];
        for (let i = 0; i < accountsRef.current.length; i++) {
            const acc = accountsRef.current[i];
            let current = ind == i;
            let blook = await fetch("https://dashboard.blooket.com/api/users/me", { headers: { Cookie: acc.bisd, "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)" } }).then(x => x.data?.blook);
            accs.push({ ...acc, signedIn: current || !!blook, current, blook });
        }
        setAccounts(accs.sort((a, b) => (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0));
    }, []);
    useEffect(() => {
        getAccs();
    }, []);
    return <div className="modalModal">
        <div className="modalContainer">
            <div className="modalHeader">Choose an account</div>
            <div className="accountSwitcherList">
                {accounts.map((acc, i) => {
                    return <div key={acc.id} className="accountSwitcherAcc">
                        <Blook name={acc.blook} className="accountSwitcherBlook" />
                        <Textfit mode="single" min={1} max={32} className="accountSwitcherName">{acc.name}</Textfit>
                        <div className="accountSwitcherSignedIn" style={{
                            color: Object.hasOwnProperty.call(acc, "signedIn") && (acc.signedIn
                                ? acc.current ? "var(--accent1)" : "var(--accent2)"
                                : "var(--red)"),
                            cursor: acc.current ? "default" : "pointer"
                        }} onClick={acc.current ? null : () => switchAccount({ id: acc.id })}>{Object.hasOwnProperty.call(acc, "signedIn")
                            ? acc.signedIn
                                ? acc.current
                                    ? "Signed In"
                                    : "Switch"
                                : "Login"
                            : "Loading"}</div>
                        <div className="accountSwitcherRemove" onClick={() => (removeAccount(acc.id, acc.current), acc.current || getAccs())}>
                            <i className="far fa-trash-alt"></i>
                        </div>
                    </div>
                })}
                <div className="accountSwitcherNew">
                    {/* <Blook name={acc.blook} className="accountSwitcherBlook" /> */}
                    <div className="accountSwitcherNewText" onClick={() => switchAccount({ adding: true })}>Add Account</div>
                </div>
            </div>
            <div className="modalButtonContainer">
                <div style={{ "--color": "var(--accent1)" }} className="modalButton" onClick={back}>Back</div>
            </div>
        </div>
    </div>
}