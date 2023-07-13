import { Tooltip } from "react-tooltip";

export default function TopBar({ color, muted, changeMuted, left, center, right, onRightClick }) {
    return <div className="header" style={{
        backgroundColor: color || null
    }}>
        <div className="headerTextLeft" style={{ fontSize: "30px" }}>
            {muted != null && <i className={`iconButton ${muted ? "fas fa-volume-mute" : "fas fa-volume-up"}`} style={{ fontSize: 26 }} onClick={changeMuted} />}
            {left}
        </div>
        <div className="headerTextCenter">{center}</div>
        <div className="headerTextRight">
            {right}
            {onRightClick && <>
                <Tooltip place="left" className="tooltip" id="endnow"></Tooltip>
                <i className="iconButton fas fa-fast-forward" style={{ marginRight: "0", marginLeft: "15px" }} onClick={onRightClick} data-tooltip-id="endnow" data-tooltip-content="End Now" />
            </>}
        </div>
    </div>
}