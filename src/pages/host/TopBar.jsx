import { Tooltip } from "react-tooltip";
import "./topbar.css";

export default function TopBar({ color, muted, changeMuted, left, center, right, onRightClick }) {
    return <div className="header" style={{
        backgroundColor: color || "var(--accent1)",
        width: "100%",
        height: "65px",
        paddingBottom: "6px",
        boxShadow: "inset 0 -6px rgba(0,0,0,.2)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        zIndex: "10",
        overflow: "hidden",
        position: "absolute",
        top: "0",
        left: "0",
    }}>
        <div className="headerTextLeft" style={{
            fontSize: "30px",
            textAlign: "left",
            lineHeight: "59px",
            paddingLeft: "20px",
            fontFamily: "Adventure",
            userSelect: "none",
            display: "flex",
            justifyContent: "center"
        }}>
            {muted != null && <i className={`iconButton ${muted ? "fas fa-volume-mute" : "fas fa-volume-up"}`} style={{ fontSize: 26 }} onClick={changeMuted} />}
            {left}
        </div>
        <div className="headerTextCenter" style={{
            fontSize: "38px",
            textAlign: "center",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            fontFamily: "Adventure",
            userSelect: "none",
        }}>{center}</div>
        <div className="headerTextRight" style={{
            fontSize: "30px",
            color: "#fff",
            textAlign: "right",
            lineHeight: "59px",
            paddingRight: "20px",
            fontFamily: "Adventure",
            userSelect: "none",
            display: "flex",
            justifyContent: "center"
        }}>
            {right}
            {onRightClick && <>
                <Tooltip place="left" className="tooltip" id="endnow"></Tooltip>
                <i className="iconButton fas fa-fast-forward" style={{ marginRight: "0", marginLeft: "15px" }} onClick={onRightClick} data-tooltip-id="endnow" data-tooltip-content="End Now" />
            </>}
        </div>
    </div>
}