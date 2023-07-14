import "./fog.css";

export default function Fog({ isFaded }) {
    return <>
        <div className="fog fog1">
            <div className="img1" style={{ opacity: isFaded ? 0.6 : null }}></div>
            <div className="img2" style={{ opacity: isFaded ? 0.6 : null }}></div>
        </div>
        <div className="fog fog2">
            <div className="img1" style={{ opacity: isFaded ? 0.6 : null }}></div>
            <div className="img2" style={{ opacity: isFaded ? 0.6 : null }}></div>
        </div>
        <div className="fog fog3">
            <div className="img1" style={{ opacity: isFaded ? 0.6 : null }}></div>
            <div className="img2" style={{ opacity: isFaded ? 0.6 : null }}></div>
        </div>
    </>
}