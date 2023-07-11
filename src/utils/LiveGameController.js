import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import color from "../blooks/packs/color.js";
import { freeBlooks } from "../blooks/allBlooks.js";

export default class LiveGameController {
    isHost = false;
    liveGameCode;
    liveShardURL;
    liveApp;
    http;
    constructor(http) {
        this.http = http;
    };
    async getDatabaseVal(path, fn) {
        let value;
        try {
            value = await this.liveApp.database().ref(this.liveGameCode + "/" + path).once("value");
        } catch (e) {
            console.error(e);
        } finally {
            const val = await value.val();
            fn?.(val);
            return val;
        }
    }
    getDatabaseRef(path) {
        return this.liveApp.database().ref(this.liveGameCode + "/" + path);
    }
    async blockUser(user) {
        if (!this.isHost) throw new Error("players cannot block other users");
        await this.setVal({
            path: "bu/" + user,
            val: 1
        });
        this.removeVal("c/" + user);
        await this.http.post("https://fb.blooket.com/c/firebase/block", { g: this.liveGameCode, u: user });
    }
    async setVal({ path, val }, fn) {
        await this.liveApp.database().ref(this.liveGameCode + "/" + path).set(val);
        fn?.();
    }
    async removeVal(path) {
        await this.liveApp.database().ref(this.liveGameCode + "/" + path).remove();
    }
    setClient(name, blook) {
        return new Promise(res => this.setVal({ id: this.liveGameCode, path: "c/" + name, val: { b: blook } }, () => res(true)));
    }
    async setStage(e, fn) {
        if (!this.isHost) throw new Error("players cannot update stg");
        if (e.clearAnswers) await this.setVal({ id: this.liveGameCode, path: "a", val: [] });
        await this.setVal({ id: this.liveGameCode, path: "stg", val: e.stage });
        await this.http.post("https://fb.blooket.com/c/firebase/gamestageupdate", { stage: e.stage, gameId: this.liveGameCode });
        fn?.();
    }
    async removeHostAndDeleteGame() {
        if (!this.isHost) throw new Error("players cannot delete a game");
        if (!this.liveGameCode) throw new Error("cannot delete a game without the game id");
        try {
            await this.liveApp.database().ref(this.liveGameCode).remove();
            await this.liveApp.database().ref("ids/" + this.liveGameCode).remove();
            await this.http.delete("https://fb.blooket.com/c/firebase/game?id=" + this.liveGameCode);
            this.isHost = false;
            this.liveGameCode = null;
        } catch (e) {
            console.error(e);
        }
    }
    async hostNewGame({ qSetId, settings, userId }) {
        if (!qSetId) throw new Error("cannot setHost without a valid qSetId");
        if (!settings) throw new Error("cannot setHost without a valid settings object");
        if (!userId) throw new Error("cannot setHost without a valid host user id");

        const initialGame = { p: true, set: qSetId, s: settings, c: {}, a: [], stg: "join", ho: userId };

        const { data } = await this.http.post("https://fb.blooket.com/c/firebase/hosted-games", { initialGame });
        if (!data.ok) return data.msg;

        await this.setLiveGameCode(data.id, data.fbToken, data.fbShardURL);
        this.isHost = true;
        await this.liveApp.database().ref(this.liveGameCode).set(initialGame);
        await this.liveApp.database().ref(`ids/${this.liveGameCode}`).set(data.createdAt);

        return data;
    }
    async joinGame(gameId, inGameName) {
        if (this.isHost) await this.removeHostAndDeleteGame();
        if (!gameId) throw new Error("cannot join game without valid gameId");
        if (!inGameName) throw new Error("cannot join game without valid inGameName");

        const { data } = await this.http.put("https://fb.blooket.com/c/firebase/join", { id: gameId, name: inGameName });
        let blook = "";
        if (!data.success) {
            await this.setLiveGameCode(null, null, null, true);
            return {
                success: data.success,
                fbToken: data.fbToken,
                msg: data.msg,
                blook, host,
                shardURL: data.fbShardURL
            }
        }
        await this.setLiveGameCode(gameId, data.fbToken, data.fbShardURL);
        const value = await this.liveApp.database().ref(this.liveGameCode).once("value").then(value => value.val());
        let players = {};
        for (const name in value.c) {
            if (name == inGameName) continue;
            players[value.c[name].b] = true;
        }
        let available = [];
        for (const blook of freeBlooks) if (!players[blook]) available.push(blook);
        if (!available.length) for (const blook in color) if (!players[blook]) available.push(blook);
        if (!available.length) available.push(...freeBlooks);
        await this.setClient(inGameName, available[Math.random() * available.length]);
    }
    async setLiveGameCode(id, fbToken, fbShardURL, newGame) {
        this.isHost = false;
        this.liveGameCode = null;
        this.liveShardURL = null;
        if (this.liveApp) {
            await this.liveApp.delete();
            this.liveApp = null;
        }
        if (newGame) return;
        if (!id) throw new Error("Got empty gameCode when setting live game code");
        if (!fbToken) throw new Error("cannot set firebase auth token without a token");
        this.liveGameCode = id;
        this.liveShardURL = fbShardURL;
        this.liveApp = firebase.initializeApp({
            apiKey: "AIzaSyCA-cTOnX19f6LFnDVVsHXya3k6ByP_MnU",
            authDomain: "blooket-2020.firebaseapp.com",
            projectId: "blooket-2020",
            storageBucket: "blooket-2020.appspot.com",
            messagingSenderId: "741533559105",
            appId: "1:741533559105:web:b8cbb10e6123f2913519c0",
            measurementId: "G-S3H5NGN10Z",
            databaseURL: this.liveShardURL
        });
        let auth = firebase.auth(this.liveApp);
        await auth.setPersistence(firebase.auth.Auth.Persistence.NONE).catch(console.error);
        return await auth.signInWithCustomToken(fbToken).catch(console.error);
    }
    async rejoinGame(fbToken, shardURL, id) {
        await this.setLiveGameCode(id, fbToken, shardURL)
    }
    async gameStatus(gameId) {
        if (!gameId) throw new Error("cannot check game status without gameId");
        return await this.http.get("https://fb.blooket.com/c/firebase/id", { params: { id: Number(gameId) } }).then(res => res.data);
    }
}