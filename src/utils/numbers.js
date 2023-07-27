// i dont feel like making this look good either
export function formatNumber(n) {
    return n || 0 === n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
}
let c = ["st", "nd", "rd", "th"];
export function getOrdinal(o) {
    return o % 100 < 11 || o % 100 > 13 ? o % 10 == 1 ? c[0] : o % 10 == 2 ? c[1] : o % 10 == 3 ? c[2] : c[3] : c[3]
};
let powers = ["⁰", "\xb9", "\xb2", "\xb3", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
export function formatBigNumber(o) {
    var e = o;
    if (o >= 1e3) {
        var suffixes = ["", "K", "M", "B", "T"],
            t = Math.floor((o.toString().length - 1) / 3);
        if (t < suffixes.length) {
            for (var s = "", r = 3; r >= 1 && !((s = parseFloat((0 !== t ? o / Math.pow(1e3, t) : o).toPrecision(r))).toString().replace(/[^a-zA-Z 0-9]+/g, "").length <= 3); r--);
            s % 1 != 0 && (s = s.toFixed(1)), e = s + suffixes[t]
        } else {
            for (var l, n, i = o, m = 0; i >= 100;) i = Math.floor(i / 10), m += 1;
            e = "".concat(i / 10, " \xd7 10").concat((n = "", (l = m + 1).toString().split("").forEach((o) => n += powers[Number(o)]), n))
        }
    }
    return e
}
export function getDimensions(o) {
    var [_, number, unit] = o.match(/([0-9\.]+)(vh|vw)/);
    return window[["innerHeight", "innerWidth"][["vh", "vw"].indexOf(unit)]] * (number / 100)
}

export function diffObjects(obj1, obj2) {
    const changed = {};

    for (const key in obj1) {
        if (!obj2.hasOwnProperty(key)) continue;

        const value1 = obj1[key];
        const value2 = obj2[key];

        if (typeof value1 === "object" && typeof value2 === "object") {
            const recChanged = diffObjects(value1, value2);
            if (recChanged !== null && Object.keys(recChanged).length !== 0) changed[key] = recChanged;
        } else if (value1 !== value2) changed[key] = value2;
    }

    for (const key in obj2) if (!obj1.hasOwnProperty(key)) changed[key] = obj2[key];

    if (Object.keys(changed).length === 0) return null;

    return changed;
}

export function listKeys(players) {
    var names = Object.keys(players), list = names[0];
    if (names.length === 2) list += " & ".concat(names[1]);
    else for (var i = 1; i < names.length; i++) if (names.length - 1 === i) list += `, & ${names[i]}`;
    else list += `, ${names[i]}`;
    return list
}

export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export function ratedRandom(array, length) {
    let result = [];
    for (; result.length < length;) {
        let rand = Math.random(),
            total = 0,
            pick = null;
        for (let i = 0; i < array.length; i++)
            if ((total += array[i].rate) >= rand) {
                pick = array[i];
                break
            }
        if (pick && !result.includes(pick)) result.push(pick)
    }
    return result
}

const rtf = new Intl.RelativeTimeFormat("en", { localeMatcher: "best fit", numeric: "always", style: "long" });
const units = [
    ['year', 31536000000],
    ['month', 2628000000],
    ['day', 86400000],
    ['hour', 3600000],
    ['minute', 60000],
    ['second', 1000],
]

export function relativeTime(timestamp) {
    let elapsed = timestamp - Date.now();
    for (const [unit, amount] of units)
        if (Math.abs(elapsed) > amount || unit === 'second')
            return rtf.format(Math.round(elapsed / amount), unit);
}