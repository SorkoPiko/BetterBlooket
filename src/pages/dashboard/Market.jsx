import { useEffect } from "react";
import Sidebar from "./SideBar";
import { market } from "../../blooks/packs";
import "./market.css";
import { setActivity } from "../../discordRPC";
function imgUrl(url) {
    if (!url) return url;
    let i = url.indexOf("upload/");
    return -1 === i ? url : (i += 7, "".concat(url.slice(0, i)).concat("f_auto,q_auto:best").concat(url.slice(i - 1, url.length)))
}
function Market() {
    useEffect(() => {
        setActivity({
            state: "Market",
            timestampStart: Date.now(),
        });
    }, []);
    return (<>
        <Sidebar>
            Market
            <div id="packsWrapper">
                {Object.keys(market).map(pack => {
                    return (<div className="packWrapper" style={{ background: market[pack].background }} key={pack}>
                        <div className="packImgContainer">
                            <img className="packShadow" src={imgUrl(market[pack].url)} alt="" />
                            <img className="packImg" src={imgUrl(market[pack].url)} alt="" />
                        </div>
                        <div className="packBottom">
                            <img className="packpriceImg" src="" alt=""></img>
                            {market[pack].price}
                        </div>
                    </div>)
                })}
            </div>
        </Sidebar>
    </>);
}
export default Market;