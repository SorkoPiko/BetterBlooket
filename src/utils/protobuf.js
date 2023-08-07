import { createConnectTransport } from "@bufbuild/connect-web";
import { createPromiseClient } from "@bufbuild/connect";
import { MethodKind, proto3, ScalarType } from "@bufbuild/protobuf";
import { fetch, Body, ResponseType } from "@tauri-apps/api/http";
import Queue from "./queue";
const dashboardLayout = proto3.makeEnum('dashboardservice.v1.DashboardLayout', [
    { no: 0, name: 'DASHBOARD_LAYOUT_UNKNOWN', localName: 'UNKNOWN' },
    { no: 1, name: 'DASHBOARD_LAYOUT_TEACHER', localName: 'TEACHER' },
    { no: 2, name: 'DASHBOARD_LAYOUT_STUDENT', localName: 'STUDENT' },
]);
const blook = proto3.makeMessageType("dashboardservice.v1.ProfileBlook", () => [
    { no: 1, name: "name", kind: "scalar", T: ScalarType.STRING },
    { no: 2, name: "svg_url", kind: "scalar", T: ScalarType.STRING },
    { no: 3, name: "num_owned", kind: "scalar", T: ScalarType.INT32 },
    { no: 4, name: "set", kind: "scalar", T: ScalarType.STRING },
    { no: 5, name: "rarity", kind: "scalar", T: ScalarType.STRING },
    { no: 6, name: "team_name", kind: "scalar", T: ScalarType.STRING },
    { no: 7, name: "color", kind: "scalar", T: ScalarType.STRING }
])
// const baseURLs = proto3.makeMessageType('idservice.v1.BaseURLs', () => [
//     { no: 1, name: 'dashboard', kind: 'scalar', T: ScalarType.STRING }
// ]);
// const devUser = proto3.makeMessageType('idservice.v1.DevUser', () => [
//     { no: 1, name: 'id', kind: 'scalar', T: ScalarType.STRING },
//     { no: 2, name: 'email', kind: 'scalar', T: ScalarType.STRING },
//     { no: 3, name: 'non_receivable_email', kind: 'scalar', T: ScalarType.STRING },
//     { no: 4, name: 'name', kind: 'scalar', T: ScalarType.STRING },
//     { no: 5, name: 'created_at', kind: 'scalar', T: ScalarType.STRING }
// ])
//

let csrfToken, queue = new Queue(1, 300), blooketBuild = fetch("https://ac.blooket.com/dashboard/68b1175a04805a7327c6.main~2898eb0e.e649014febe5e77cc3d8.js", { responseType: ResponseType.Text }).then(({ data }) => data.match(/'(bi.+?|[a-zA-Z0-9]{51,51})'/)[1]);
window.blooketBuild = blooketBuild
export default (bisd, csrf, cb) => createPromiseClient({
    typeName: "dashboardservice.v1.DashboardService",
    methods: {
        me: {
            name: "Me",
            I: proto3.makeMessageType("dashboardservice.v1.MeRequest", []),
            O: proto3.makeMessageType("dashboardservice.v1.MeReply", () => [
                { no: 1, name: "name", kind: "scalar", T: ScalarType.STRING },
                { no: 2, name: "blook", kind: "message", T: blook },
                { no: 3, name: 'dashboard_layout', kind: 'enum', T: proto3.getEnumType(dashboardLayout) }
            ]),
            kind: MethodKind.Unary
        },
        changeUserBlook: {
            name: "ChangeUserBlook",
            I: proto3.makeMessageType("dashboardservice.v1.ChangeUserBlookRequest", () => [{ no: 1, name: "blook", kind: "scalar", T: ScalarType.STRING }]),
            O: proto3.makeMessageType("dashboardservice.v1.ChangeUserBlookReply", []),
            kind: MethodKind.Unary
        },
        saveCustomBlook: {
            name: "SaveCustomBlook",
            I: proto3.makeMessageType("dashboardservice.v1.SaveCustomBlookRequest", () => [
                { no: 1, name: "custom_code", kind: "scalar", T: ScalarType.STRING },
                { no: 2, name: "save_slot_index", kind: "scalar", T: ScalarType.INT32 }]
            ),
            O: proto3.makeMessageType("dashboardservice.v1.SaveCustomBlookReply", []),
            kind: MethodKind.Unary
        },
        purchaseBlookBox: {
            name: "PurchaseBlookBox",
            I: proto3.makeMessageType("dashboardservice.v1.PurchaseBlookBoxRequest", () => [{ no: 1, name: "box_name", kind: "scalar", T: ScalarType.STRING }]),
            O: proto3.makeMessageType("dashboardservice.v1.PurchaseBlookBoxReply", () => [
                { no: 1, name: "unlocked_blook", kind: "scalar", T: ScalarType.STRING },
                { no: 2, name: "is_new_to_user", kind: "scalar", T: ScalarType.BOOL },
                { no: 3, name: "tokens", kind: "scalar", T: ScalarType.INT32 }
            ]),
            kind: MethodKind.Unary
        },
        sellBlook: {
            name: "SellBlook",
            I: proto3.makeMessageType("dashboardservice.v1.SellBlookRequest", () => [
                { no: 1, name: "blook", kind: "scalar", T: ScalarType.STRING },
                { no: 2, name: "num_to_sell", kind: "scalar", T: ScalarType.INT32 }
            ]),
            O: proto3.makeMessageType("dashboardservice.v1.SellBlookReply", () => [{ no: 1, name: "blooks", kind: "message", T: blook, repeated: true }]),
            kind: MethodKind.Unary
        },
        listUnlockedBlooks: {
            name: "ListUnlockedBlooks",
            I: proto3.makeMessageType("dashboardservice.v1.ListUnlockedBlooksRequest", []),
            O: proto3.makeMessageType("dashboardservice.v1.ListUnlockedBlooksReply", () => [{ no: 1, name: "blooks", kind: "message", T: blook, repeated: true }]),
            kind: MethodKind.Unary
        },
        setDashboardLayout: {
            name: "SetDashboardLayout",
            I: proto3.makeMessageType('dashboardservice.v1.SetDashboardLayoutRequest', () => [{ no: 1, name: 'layout', kind: 'enum', T: proto3.getEnumType(dashboardLayout) }]),
            O: proto3.makeMessageType('dashboardservice.v1.SetDashboardLayoutReply', []),
            kind: MethodKind.Unary
        }
    }
}, createConnectTransport({
    baseUrl: "https://dashboard.blooket.com/apipb",
    useBinaryFormat: true,
    fetch: async function (url, options) {
        let res;
        if (typeof blooketBuild == "object") blooketBuild = await blooketBuild;
        const body = options.body;
        try {
            options.responseType = ResponseType.Binary;
            options.body = Body.bytes(options.body);
            if (!options.headers) options.headers = {};
            if (blooketBuild) options.headers["X-BLOOKET-BUILD"] = blooketBuild;
            if (csrfToken) options.headers["X-CSRF-Token"] = csrfToken;
            options.headers.cookie = `${bisd} ${csrf}`;
            options.headers["content-length"] = String(body.byteLength);
            options.headers["content-type"] = "application/proto";
            options.headers["user-agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)";
            options.headers.origin = "https://dashboard.blooket.com";
            res = await fetch(url, options);
        } catch (e) { console.warn(e, arguments) }
        res.json = () => res.data;
        res.headers = new Headers(res.headers);
        res.arrayBuffer = () => res.data;
        return res;
    },
    interceptors: [((async function () {
        let symbol = Symbol("csrfinitializer");
        await queue.wait(symbol, -1);
        let res = await fetch("https://dashboard.blooket.com/apipbinit", {
            headers: { cookie: bisd }
        });
        let token = res.headers["x-csrf-token"];
        if (!token) throw Error("no CSRF token found when initializing");
        csrfToken = token;
        if (res.headers["set-cookie"]) {
            csrf = res.headers["set-cookie"].split(' ')[0];
            cb(res.headers["set-cookie"].split(' ')[0]);
        }
        queue.end(symbol);
    })(), function (next) {
        return async function (req) {
            if (queue.queueWaiting.size() > 5) console.warn("/logout");
            let symbol = Symbol("csrfinterceptor");
            await queue.wait(symbol, -1);
            if (!csrfToken) throw Error("could not make request without csrf token");
            let r = next(req);
            return new Promise((resolve, reject) => {
                r.then(res => {
                    let token = res.header.get("X-CSRF-Token");
                    if (res.header.get("set-cookie")) console.log(res.header.get("set-cookie"), cb(res.header.get("set-cookie").split(' ')[0]))
                    if (!token) throw Error("token not found in response");
                    csrfToken = token;
                    resolve(res);
                }).catch(res => {
                    console.warn(res)
                    if (res.metadata.get("set-cookie")) console.log(res.metadata.get("set-cookie"), 69, cb(res.metadata.get("set-cookie").split(' ')[0]))
                    let token = res.metadata.get("X-CSRF-Token");
                    if (!token) throw Error("token not found in response");
                    csrfToken = token;
                    reject(res);
                }).finally(() => queue.end(symbol));
            })
        }
    })]
}));
// export const idProtobuf = (bisd, csrf, cb) => createPromiseClient({
//     typeName: "idservice.v1.IdService",
//     methods: {
//         config: {
//             name: 'Config',
//             I: proto3.makeMessageType("idservice.v1.ConfigRequest", []),
//             O: proto3.makeMessageType('idservice.v1.ConfigReply', () => [
//                 { no: 1, name: 'user_id', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 3, name: 'google_client_id', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 4, name: 'base_urls', kind: 'message', T: baseURLs },
//                 { no: 5, name: 'recaptcha_site_key', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             kind: MethodKind.Unary
//         },
//         devUser: {
//             name: 'DevUser',
//             I: proto3.makeMessageType('idservice.v1.DevUserRequest', []),
//             O: proto3.makeMessageType('idservice.v1.DevUserReply', () => [
//                 { no: 1, name: 'user', kind: 'message', T: devUser }
//             ]),
//             kind: MethodKind.Unary
//         },
//         signInGoogle: {
//             name: 'SignInGoogle',
//             I: proto3.makeMessageType('idservice.v1.SignInGoogleRequest', () => [
//                 { no: 1, name: 'credential', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 2, name: 'recaptcha_token', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             O: proto3.makeMessageType('idservice.v1.SignInGoogleReply', []),
//             kind: MethodKind.Unary
//         },
//         signInPassword: {
//             name: 'SignInPassword',
//             I: proto3.makeMessageType('idservice.v1.SignInPasswordRequest', () => [
//                 { no: 1, name: 'identifier', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 2, name: 'password', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 3, name: 'recaptcha_token', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             O: proto3.makeMessageType('idservice.v1.SignInPasswordReply', () => [
//                 { no: 1, name: 'user_id', kind: 'scalar', T: ScalarType.STRING, 'opt': true },
//                 { no: 2, name: 'error', kind: 'scalar', T: ScalarType.STRING, 'opt': true }
//             ]),
//             kind: MethodKind.Unary
//         },
//         logout: {
//             name: 'Logout',
//             I: proto3.makeMessageType('idservice.v1.LogoutRequest', []),
//             O: proto3.makeMessageType('idservice.v1.LogoutReply', []),
//             kind: MethodKind.Unary
//         },
//         initiateGoogleSignup: {
//             name: 'InitiateGoogleSignup',
//             I: proto3.makeMessageType('idservice.v1.InitiateGoogleSignupRequest', () => [
//                 { no: 1, name: 'credential', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 2, name: 'recaptcha_token', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             O: proto3.makeMessageType('idservice.v1.InitiateGoogleSignupReply', () => [
//                 { no: 1, name: 'pending_user_id', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             kind: MethodKind.Unary
//         },
//         initiateEmailSignup: {
//             name: 'InitiateEmailSignup',
//             I: proto3.makeMessageType('idservice.v1.InitiateEmailSignupRequest', () => [
//                 { no: 1, name: 'email', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 2, name: 'email_receivable', kind: 'scalar', T: ScalarType.BOOL },
//                 { no: 3, name: 'recaptcha_token', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             O: proto3.makeMessageType('idservice.v1.InitiateEmailSignupReply', () => [
//                 { no: 1, name: 'pending_user_id', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             kind: MethodKind.Unary
//         },
//         verifyEmailSignupCode: {
//             name: 'VerifyEmailSignupCode',
//             I: proto3.makeMessageType('idservice.v1.VerifyEmailSignupCodeRequest', () => [
//                 { no: 1, name: 'pending_user_id', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 2, name: 'code', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 3, name: 'recaptcha_token', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             O: proto3.makeMessageType('idservice.v1.VerifyEmailSignupCodeReply', () => [
//                 { no: 1, name: 'verified', kind: 'scalar', T: ScalarType.BOOL }
//             ]),
//             kind: MethodKind.Unary
//         },
//         setSignupPassword: {
//             name: 'SetSignupPassword',
//             I: proto3.makeMessageType('idservice.v1.SetSignupPasswordRequest', () => [
//                 { no: 1, name: 'pending_user_id', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 3, name: 'password', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 4, name: 'password_confirmation', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             O: proto3.makeMessageType('idservice.v1.SetSignupPasswordReply', []),
//             kind: MethodKind.Unary
//         },
//         completeSignupWithUsername: {
//             name: 'CompleteSignupWithUsername',
//             I: proto3.makeMessageType('idservice.v1.CompleteSignupWithUsernameRequest', () => [
//                 { no: 1, name: 'pending_user_id', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 2, name: 'username', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 3, name: 'recaptcha_token', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             O: proto3.makeMessageType('idservice.v1.CompleteSignupWithUsernameReply', []),
//             kind: MethodKind.Unary
//         },
//         genConfirmGoogleAccountAccessCode: {
//             name: 'GenConfirmGoogleAccountAccessCode',
//             I: proto3.makeMessageType('idservice.v1.GenConfirmGoogleAccountAccessCodeRequest', () => [
//                 { no: 1, name: 'credential', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 2, name: 'recaptcha_token', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             O: proto3.makeMessageType('idservice.v1.GenConfirmGoogleAccountAccessCodeReply', () => [
//                 { no: 1, name: 'code', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             kind: MethodKind.Unary
//         },
//         genConfirmPasswordAccountAccessCode: {
//             name: 'GenConfirmPasswordAccountAccessCode',
//             I: proto3.makeMessageType('idservice.v1.GenConfirmPasswordAccountAccessCodeRequest', () => [
//                 { no: 1, name: 'email', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 2, name: 'password', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 3, name: 'recaptcha_token', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             O: proto3.makeMessageType('idservice.v1.GenConfirmPasswordAccountAccessCodeReply', () => [
//                 { no: 1, name: 'code', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             kind: MethodKind.Unary
//         },
//         verifyConfirmAccountCode: {
//             name: 'VerifyConfirmAccountCode',
//             I: proto3.makeMessageType('idservice.v1.VerifyConfirmAccountCodeRequest', () => [
//                 { no: 1, name: 'code', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 2, name: 'recatcha_token', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             O: proto3.makeMessageType('idservice.v1.VerifyConfirmAccountCodeReply', () => [
//                 { no: 1, name: 'valid', kind: 'scalar', T: ScalarType.BOOL }
//             ]),
//             kind: MethodKind.Unary
//         },
//         deleteUser: {
//             name: 'DeleteUser',
//             I: proto3.makeMessageType('idservice.v1.DeleteUserRequest', () => [
//                 { no: 1, name: 'code', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 2, name: 'recaptcha_token', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             O: proto3.makeMessageType('idservice.v1.DeleteUserReply', () => [
//                 { no: 1, name: 'job_id', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             kind: MethodKind.Unary
//         },
//         genPasswordResetCode: {
//             name: 'GenPasswordResetCode',
//             I: proto3.makeMessageType('idservice.v1.GenPasswordResetCodeRequest', () => [
//                 { no: 1, name: 'email', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 2, name: 'recaptcha_token', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             O: proto3.makeMessageType('idservice.v1.GenPasswordResetCodeReply', () => [
//                 { no: 1, name: 'sent', kind: 'scalar', T: ScalarType.BOOL }
//             ]),
//             kind: MethodKind.Unary
//         },
//         changePassword: {
//             name: 'ChangePassword',
//             I: proto3.makeMessageType('idservice.v1.ChangePasswordRequest', () => [
//                 { no: 1, name: 'email', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 2, name: 'code', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 3, name: 'password', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 4, name: 'password_confirmation', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 5, name: 'recaptcha_token', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             O: proto3.makeMessageType('idservice.v1.ChangePasswordReply', []),
//             kind: MethodKind.Unary
//         },
//         recaptchaFeedback: {
//             name: 'RecaptchaFeedback',
//             I: proto3.makeMessageType('idservice.v1.RecaptchaFeedbackRequest', () => [
//                 { no: 1, name: 'token', kind: 'scalar', T: ScalarType.STRING },
//                 { no: 2, name: 'message', kind: 'scalar', T: ScalarType.STRING }
//             ]),
//             O: proto3.makeMessageType('idservice.v1.RecaptchaFeedbackReply', []),
//             kind: MethodKind.Unary
//         }
//     }
// }, createConnectTransport({
//     baseUrl: "https://id.blooket.com/apipb",
//     useBinaryFormat: true,
//     fetch: async function (url, options) {
//         let res;
//         const body = options.body;
//         try {
//             options.responseType = ResponseType.Binary;
//             options.body = Body.bytes(options.body);
//             if (!options.headers) options.headers = {};
//             if (csrfToken) options.headers["X-CSRF-Token"] = csrfToken;
//             options.headers.cookie = csrf;
//             options.headers["content-length"] = String(body.byteLength);
//             options.headers["content-type"] = "application/proto";
//             options.headers["user-agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)";
//             options.headers.origin = "https://dashboard.blooket.com";
//             res = await fetch(url, options);
//         } catch (e) { console.warn(e, arguments) }
//         res.json = () => res.data;
//         res.headers = new Headers(res.headers);
//         res.arrayBuffer = () => res.data;
//         return res;
//     },
//     interceptors: [((async function () {
//         let symbol = Symbol("csrfinitializer");
//         await queue.wait(symbol, -1);
//         let res = await fetch("https://id.blooket.com/apipbinit");
//         let token = res.headers["x-csrf-token"];
//         if (!token) throw Error("no CSRF token found when initializing");
//         csrfToken = token;
//         if (res.headers["set-cookie"]) {
//             csrf = res.headers["set-cookie"].split(' ')[0];
//             cb(res.headers["set-cookie"].split(' ')[0]);
//         }
//         queue.end(symbol);
//     })(), function (next) {
//         return async function (req) {
//             if (queue.queueWaiting.size() > 5) console.warn("/logout");
//             let symbol = Symbol("csrfinterceptor");
//             await queue.wait(symbol, -1);
//             if (!csrfToken) throw Error("could not make request without csrf token");
//             let r = next(req);
//             return new Promise((resolve, reject) => {
//                 r.then(res => {
//                     let token = res.header.get("X-CSRF-Token");
//                     if (res.header.get("set-cookie")) console.log(res.header.get("set-cookie"), cb(res.header.get("set-cookie").split(' ')[0]))
//                     if (!token) throw Error("token not found in response");
//                     csrfToken = token;
//                     resolve(res);
//                 }).catch(res => {
//                     console.warn(res)
//                     if (res.metadata.get("set-cookie")) console.log(res.metadata.get("set-cookie"), 69, cb(res.metadata.get("set-cookie").split(' ')[0]))
//                     let token = res.metadata.get("X-CSRF-Token");
//                     if (!token) throw Error("token not found in response");
//                     csrfToken = token;
//                     reject(res);
//                 }).finally(() => queue.end(symbol));
//             })
//         }
//     })]
// }));