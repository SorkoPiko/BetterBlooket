import { fetch } from "@tauri-apps/api/http";

export default function (Cookie, cb) {
    const init = fetch("https://dashboard.blooket.com/apipbinit", { headers: { Cookie } });
    let token = init.then(res => (cb(res.headers["set-cookie"]), res.headers["X-CSRF-Token"]));
    return async function () {
        arguments[1] = { ...(arguments[1] || {}), headers: { ...(arguments[1]?.headers || {}), "X-CSRF-Token": await token } };
        let res = await fetch(...arguments);
        console.log(res);
        token = res.headers["X-CSRF-Token"];
        return res;
    }
}