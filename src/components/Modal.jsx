import { TwitterPicker } from "react-color";

import "./modal.css";

export default function Modal({ text, desc, timeValue, timeChange, buttonOne, buttonTwo, input, colors }) {
    return <div className="modalModal">
        <div className="modalContainer">
            <div className="modalHeader">{text}</div>
            <div className="modalText">{desc}</div>
            {timeValue != null && <div className="timeInput">
                <input value={timeValue} type="number" onChange={timeChange}></input>
                <i className="far fa-clock"></i>
            </div>}
            {input != null && <div className="modalInput">
                <input style={{ marginRight: input.icon ? "0" : null }} value={input.value} type={input.type} onChange={input.change} placeholder={input.placeholder || null} />
                {input.icon && <i className={input.icon} />}
            </div>}
            {colors && <>
                <TwitterPicker onChange={colors.change} onChangeComplete={colors.change} className="modalColorPicker" triangle="hide" color={colors.current} colors={colors.colors} styles={{
                    default: {
                        card: {
                            backgroundColor: "var(--main1)",
                            borderRadius: "10px",
                            boxShadow: ""
                        },
                        swatch: {
                            marginRight: "5px",
                            // marginInline: "auto"
                        },
                        body: {
                            // display: "grid",
                            gridTemplateColumns: "repeat(10, 30px)",
                            // gap: "5px",
                            // justifyContent: "center",
                            // alignItems: "flex-start",
                            padding: "15px",
                            paddingRight: "10px"
                            // height: "75px"
                            // position: "relative"
                        },
                        hash: {
                            display: "none"
                        },
                        input: {
                            display: "none"
                        }
                    },
                }} width="75%" />
                <div className="modalInput" style={{ border: `3px solid ${colors.current}` }}>
                    <input value={colors.current} type="text" onChange={(e) => colors.change({ hex: `#${e.target.value.replaceAll(/[^a-fA-F0-9]/g, "").slice(0, 8)}` })} />
                </div>
            </>
            }
            <div className="modalButtonContainer">
                {buttonOne && <div style={{ "--color": buttonOne.color || "var(--accent1)" }} className="modalButton" onClick={buttonOne.click}>
                    {buttonOne.text}
                </div>}
                {buttonTwo && <div style={{ "--color": buttonTwo.color || "var(--accent1)" }} className="modalButton" onClick={buttonTwo.click}>
                    {buttonTwo.text}
                </div>}
            </div>
        </div>
    </div>
}