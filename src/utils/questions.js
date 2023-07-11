export const questionColors = {
    default: {
        background: "#fff",
        text: "#3a3a3a",
        answers: [
            { text: "#fff", background: "#ffa31e" },
            { text: "#fff", background: "#3378ff" },
            { text: "#fff", background: "#00cf77" },
            { text: "#fff", background: "#ff462b" }
        ]
    },
    spooky: {
        background: "#292929",
        text: "#fff",
        answers: [
            { text: "#fff", background: "#e57e25" },
            { text: "#fff", background: "#f78000" },
            { text: "#fff", background: "#e17400" },
            { text: "#fff", background: "#d37612" }
        ]
    },
    shamrock: {
        background: "#fff",
        text: "#3a3a3a",
        answers: [
            { text: "#fff", background: "#099441" },
            { text: "#fff", background: "#0aa949" },
            { text: "#fff", background: "#077834" },
            { text: "#fff", background: "#078b3d" }
        ]
    },
    merry: {
        background: "#fff",
        text: "#3a3a3a",
        answers: [
            { text: "#fff", background: "#0cb04a" },
            { text: "#fff", background: "#f23941" },
            { text: "#fff", background: "#f23941" },
            { text: "#fff", background: "#0cb04a" }
        ]
    },
    freeze: {
        background: "#fff",
        text: "#3a3a3a",
        answers: [
            { text: "#fff", background: "#4eb5e4" },
            { text: "#fff", background: "#21a2de" },
            { text: "#fff", background: "#37abe1" },
            { text: "#fff", background: "#64bee8" }
        ]
    },
    orange: {
        background: "#fff",
        text: "#3a3a3a",
        answers: [
            { text: "#fff", background: "#e57e25" },
            { text: "#fff", background: "#f78000" },
            { text: "#fff", background: "#e17400" },
            { text: "#fff", background: "#d37612" }
        ]
    },
    purple: {
        background: "#fff",
        text: "#3a3a3a",
        answers: [
            { text: "#fff", background: "#a14db3" },
            { text: "#fff", background: "#813d8f" },
            { text: "#fff", background: "#9145a1" },
            { text: "#fff", background: "#a95eba" }
        ]
    },
    red: {
        background: "#fff",
        text: "#3a3a3a",
        answers: [
            { text: "#fff", background: "#d4112b" },
            { text: "#fff", background: "#bd0f26" },
            { text: "#fff", background: "#a50d22" },
            { text: "#fff", background: "#ec1330" }
        ]
    },
    hacker: {
        background: "#000",
        text: "#fff",
        answers: [
            { text: "#000", background: "rgba(128, 255, 128, 0.8)" },
            { text: "#000", background: "rgba(128, 255, 128, 0.8)" },
            { text: "#000", background: "rgba(128, 255, 128, 0.8)" },
            { text: "#000", background: "rgba(128, 255, 128, 0.8)" }
        ]
    },
    tower: {
        background: "#292929",
        text: "#fff",
        answers: [
            { text: "#fff", background: "#404040" },
            { text: "#fff", background: "#404040" },
            { text: "#fff", background: "#404040" },
            { text: "#fff", background: "#404040" }
        ]
    }
}

export function imageUrl(url, auto) {
    if (!url) return url;
    let a = url.indexOf("upload/");
    return -1 === a || url.includes("images.unsplash.com") ? url : (a += 7, "".concat(url.slice(0, a)).concat(auto ? "f_auto" : "c_limit,f_auto,h_250,fl_lossy,q_auto:low").concat(url.slice(a - 1, url.length)))
}

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}