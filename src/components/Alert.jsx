import Blook from "../blooks/Blook";
import allBlooks from "../blooks/allBlooks";

export default function Alert({ name, blook, message, night, glitchInfo, isWhite }) {
    return <div style={{
        color: night || isWhite ? "#fff" : null,
        position: "relative",
        margin: "3px 1.5vw",
        padding: "0",
        width: "calc(100% - 3vw)",
        lineHeight: "2.45vw",
        fontSize: "1.8vw",
        display: "flex",
        flexDirection: "row",
    }}>
        <Blook name={blook} style={{
            marginRight: ".5vw",
            height: "2.415vw",
            width: "2.1vw",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            userSelect: "none",
            display: "inline-block",
        }} />
        <div style={{ width: "calc(100% - 4vw)" }}>
            <span style={{
                fontWeight: "bold",
                color: night || isWhite ? "#fff" : (blook.includes("#") ? "#0bc2cf" : allBlooks[blook].color)
            }}>{name}</span>
            {`\xA0${message}\xA0`}
            {glitchInfo && glitchInfo[0] && <i className={glitchInfo[0]} style={{ lineHeight: "2.45vw", fontSize: "1.8vw", color: night || isWhite ? "#fff" : glitchInfo[1] }} />}
        </div>
    </div>
}