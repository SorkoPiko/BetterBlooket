import { useEffect, useRef, useState } from "react";
import SVG from "react-inlinesvg";
import CustomBlook, { validateBlook } from "./CustomBlook";
import parts, { colors } from "./parts";
import { items } from "./classPass";

function BlookEditor({ blookParts, close, startCode }) {
    const [partSelected, setPartSelected] = useState("");
    const [unlocks, setUnlocks] = useState([]);
    const [selectedParts, setSelectedParts] = useState({
        base: 0,
        clothing: 0,
        eyes: 0,
        glasses: 0,
        hair: 0,
        hairColor: 0,
        hat: 0,
        item: 0,
        mouth: 0,
        nose: 0,
        cheeks: 0,
        eyebrows: 0,
        eyebrowsColor: 0
    });
    const { current: classPass } = useRef(items.filter(({ partType }) => partType).map(({ partType, part }) => `${partType}-${part}`));
    useEffect(() => {
        var unlocks = {
            clothing: [0],
            eyes: [0],
            glasses: [0],
            hair: [0],
            hat: [0],
            item: [0],
            mouth: [0],
            nose: [0],
            cheeks: [0],
            eyebrows: [0]
        };
        blookParts && Object.entries(blookParts).forEach(([part, unlocked]) => unlocked.forEach(e => unlocks[part].push(e)));
        setUnlocks({ unlocks });
        if (startCode && validateBlook(startCode)) {
            var [base, clothing, eyes, glasses, hair, hat, item, mouth, nose, cheeks, eyebrows] = startCode.split("#");
            setSelectedParts({
                base, clothing, eyes, glasses, hat, item, mouth, nose, cheeks,
                hair: hair.split("$")[0],
                hairColor: hair.split("$")[1],
                eyebrows: eyebrows.split("$")[0],
                eyebrowsColor: eyebrows.split("$")[1]
            })
        }
    }, []);
    return (<div className="modal">
        <div className="mainContainer">
            <div className="leftSide">
                {["base", "hair", "nose", "cheeks", "mouth", "item"].map(part => {
                    return <div key={part} className="partContainer" tabIndex="0" onClick={() => setPartSelected(partSelected !== part ? part : "")}>
                        {parts[part][selectedParts[part]].url ?
                            <img src={parts[part][selectedParts[part]].url} alt={`Blook ${part}`} className="partImg" draggable={false} />
                            : <i className="fas fa-ban noPart"></i>}
                        <div className="partText">{part.charAt(0).toUpperCase() + part.slice(1)}</div>
                    </div>
                })}
            </div>
            <div className="rightSide">
                {["hat", "eyebrows", "eyes", "glasses", "clothing"].map(part => {
                    return <div key={part} className="partContainer" tabIndex="0" onClick={() => setPartSelected(partSelected !== part ? part : "")}>
                        {parts[part][selectedParts[part]].url ?
                            <img src={parts[part][selectedParts[part]].url} alt={`Blook ${part}`} className="partImg" draggable={false} />
                            : <i className="fas fa-ban noPart"></i>}
                        <div className="partText">{part.charAt(0).toUpperCase() + part.slice(1)}</div>
                    </div>
                })}
            </div>
            <div className="centerContainer">
                {partSelected ? <div className="centerInside">
                    <div className="choiceHeader">{`Choose ${partSelected.charAt(0).toUpperCase() + partSelected.slice(1)}`}</div>
                    {["hair", "eyebrows"].includes(partSelected) && <div className="colorRow">
                        {colors.map((color, i) => {
                            {
                                return <div className="colorButton" style={{ backgroundColor: color[0] }} key={color[0]} tabIndex={0} onClick={() => {
                                    setPartSelected("");
                                    setSelectedParts(parts => (parts[[`${partSelected}Color`]] = i, parts));
                                }}>
                                    {selectedParts[`${e.state.partSelected}Color`] === i && <i className="fas fa-check"></i>}
                                </div>
                            }
                        })}
                    </div>}
                    <div className={`choicesContainer${["hair", "eyebrows"].includes(partSelected) ? " choiceContainerWithColors" : ""}`}>
                        {parts[partSelected].map((part, i) => {
                            return ("base" === partSelected || unlocks[partSelected].includes(i) || classPass.includes(`${partSelected}-${i}`)) && <div
                                key={i}
                                className={`partChoice ${selectedParts[partSelected] === i ? "partChosen" : ""} ${partSelected != "base" && !unlocks[partSelected].includes(i) ? "partLocked" : ""}`}
                                tabIndex={0}
                                onClick={partSelected == "base" || unlocks[partSelected].includes(i) ? () => {
                                    setSelectedParts(parts => (parts[partSelected] = i, parts));
                                    setPartSelected("");
                                } : () => { }}>
                                {part.url && !["base", "clothing", "mouth", "item", "glasses", "hat"].includes(partSelected)
                                    ? <SVG src={part.url} title={`Blook ${partSelected}`} className="choiceImg" preProcessor={(a) => {
                                        var o = a;
                                        part.changes && Object.entries(part.changes).forEach(function ([r, s]) {
                                            o = o.replaceAll(r, parts.base[selectedParts.base].tones[s])
                                        });
                                        if (["hair", "eyebrows",].includes(partSelected)) {
                                            o = o.replaceAll("#3f1c12", colors[selectedParts[`${e.state.partSelected}Color`]][0]);
                                            if (part.hasHighlight) o = o.replaceAll("#592a1e", colors[selectedParts[`${partSelected}Color`]][1]);
                                        }
                                        return o;
                                    }} />
                                    : part.url
                                        ? <img src={part.url} alt={`Blook ${partSelected}`} className="choiceImg" draggable={false} />
                                        : <i className="fas fa-ban noChoice"></i>}
                                {partSelected !== "base" && !unlocks[partSelected].includes(i) && <i className="fas fa-lock lockedIcon"></i>}
                            </div>
                        })}
                    </div>
                </div> : <div className="centerInside">
                    <div className="circle">
                        <CustomBlook code={w} className="blook"></CustomBlook>
                    </div>
                </div>}
            </div>
        </div>
        <div className="buttonRow">
            <div className="button" tabIndex={0} onClick={() => close(true, w)}>
                <i className="fas fa-save buttonIcon"></i>
                Save
            </div>
            <div className="button" tabIndex={0} onClick={() => close(false)}>
                <i className="fas fa-reply buttonIcon"></i>
                Exit
            </div>
        </div>
    </div>);
}