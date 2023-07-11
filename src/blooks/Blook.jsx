import CustomBlook from "./CustomBlook";
import allBlooks from "./allBlooks";

export default function Blook({ name, className, blookClassName, style, tip }) {
    return name && (typeof name == "string" || name instanceof String) && name.includes("#")
        ? <CustomBlook code={name} className={className} blookClassName={blookClassName} style={style} tip={tip} />
        : <div className={`blookContainer${className ? ` ${className}` : ""}`} style={style} data-tip={tip || null}>
            <img src={allBlooks[name]?.url || null} alt={`${name} Blook`} draggable={false} className={`blook${blookClassName ? ` ${blookClassName}` : ""}${name == "Spooky Ghost" ? " spookyGhost" : ""}`} />
        </div>;
}