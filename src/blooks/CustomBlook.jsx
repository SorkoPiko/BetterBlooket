import SVG from "react-inlinesvg";
import parts, { colors } from "./parts";

export function validateBlook(e) {
    const t = e.split("#");
    if (t.length !== 11 || !parts.base[t[0]] || !parts.clothing[t[1]] || !parts.eyes[t[2]] || !parts.glasses[t[3]])
        return false;

    const a = t[4].split("$");
    if (a.length !== 2 || !parts.hair[a[0]] || !colors[a[1]] || !parts.hat[t[5]] || !parts.item[t[6]] || !parts.mouth[t[7]] || !parts.nose[t[8]] || !parts.cheeks[t[9]])
        return false;

    const o = t[10].split("$");
    return o.length === 2 && !!parts.eyebrows[o[0]] && !!colors[o[1]];
}

export default function CustomBlook({ code, className, blookClassName, style, tip }) {
    var l = code.split("#");
    if (!validateBlook(code)) return <div className={`blookContainer ${className}`} style={style} data-tip={tip || null}>
        <img src="https://blooket.s3.us-east-2.amazonaws.com/blooks/colors/lightBlueBlook.svg" alt="Blook" draggable={false} className={`blook ${blookClassName}`} />
    </div>
    // i honestly dont feel like dealing with this
    var base = parts.base[l[0]],
        { tones } = base,
        eyes = parts.eyes[l[2]],
        y = l[4].split("$"),
        hair = parts.hair[y[0]],
        nose = parts.nose[l[8]],
        cheeks = parts.cheeks[l[9]],
        w = l[10].split("$"),
        eyebrows = parts.eyebrows[w[0]];
    return (<div className={`blookContainer ${className}`} style={style} data-tip={tip || null}>
        <img src={base.url} alt={"Custom Blook"} draggable={!1} className={`blook ${blookClassName}`} />
        {hair.url && <SVG src={hair.url} title="Blook Hair" className="part" preProcessor={(e) => {
            let t = e;
            if (hair.changes) Object.entries(hair.changes).forEach(([o, r]) => t = t.replaceAll(o, tones[r]));
            t = t.replaceAll("#3f1c12", colors[y[1]][0]);
            if (hair.hasHighlight) t = t.replaceAll("#592a1e", colors[y[1]][1]);
            return t;
        }} />}
        <img src={parts.mouth[l[7]].url} alt="Blook Mouth" draggable={false} className="part" />
        {nose.url && <SVG src={nose.url} title="Blook Nose" className="part" preProcessor={e => {
            let t = e;
            if (nose.changes) Object.entries(nose.changes).forEach(([o, r]) => t = t.replaceAll(o, tones[r]));
            return t;
        }} />}
        {cheeks.url && <SVG src={cheeks.url} title="Blook Cheeks" className="part" preProcessor={e => {
            let t = e;
            if (cheeks.changes) Object.entries(cheeks.changes).forEach(([o, r]) => t = t.replaceAll(o, tones[r]));
            return t;
        }} />}
        <SVG src={eyes.url} title="Blook Eyes" className="part" preProcessor={e => {
            let t = e;
            if (eyes.changes) Object.entries(eyes.changes).forEach(([o, r]) => t = t.replaceAll(o, tones[r]));
            return t;
        }} />
        {eyebrows.url && <SVG src={eyebrows.url} title="Blook Eyebrows" className="part" preProcessor={e => e.replaceAll("#3f1c12", colors[w[1]][0])} />}
        {parts.clothing[l[1]].url && <img src={parts.clothing[l[1]].url} alt="Blook Clothing" draggable={false} className="part" />}
        {parts.glasses[l[3]].url && <img src={parts.glasses[l[3]].url} alt="Blook Glasses" draggable={false} className="part" />}
        {parts.hat[l[5]].url && <img src={parts.hat[l[5]].url} alt="Blook Hat" draggable={false} className="part" />}
        {parts.item[l[6]].url && <img src={parts.item[l[6]].url} alt="Blook Item" draggable={false} className="part" />}
    </div>)
}