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

let csrfToken, queue = new Queue(1, 300);
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
        const body = options.body;
        try {
            options.responseType = ResponseType.Binary;
            options.body = Body.bytes(options.body);
            if (!options.headers) options.headers = {};
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