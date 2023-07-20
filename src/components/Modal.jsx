import "./modal.css";

export default function Modal({ text, desc, buttonOne, buttonTwo }) {
    return <div className="modalModal">
        <div className="modalContainer">
            <div className="modalHeader">{text}</div>
            <div className="modalText">{desc}</div>
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