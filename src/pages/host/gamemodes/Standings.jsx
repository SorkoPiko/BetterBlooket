import { useRef, useEffect } from "react";
import { audios } from "../../../utils/config";
import { Textfit } from "react-textfit";
import { getDimensions, getOrdinal, listKeys } from "../../../utils/numbers";
import Blook from "../../../blooks/Blook";

export default function Standings({ muted, theme, historyId, gameId, standings, stats, team, ready }) {
    const { current: audio } = useRef(new Audio(audios.final));
    const audioTimeout = useRef();
    const { current: classes } = useRef(({
        spooky: { standing: "spookyContainer", container: ["spookyContainer"], inside: ["spookyInside"], place: ["spookyContainer"] },
        winter: { standing: "", container: ["winterContainer1", "winterContainer2", "winterContainer3"], inside: ["winterInside1", "winterInside2", "winterInside3"], place: [""] },
        royal: { standing: "royalContainer", container: ["royaleContainer"], inside: ["royaleInside"], place: [""] },
        shamrock: { standing: "shamrockContainer", container: ["shamrockContainer"], inside: ["shamrockInside"], place: [""] },
        cafe: { standing: "", container: ["cafeContainer"], inside: [""], place: [""] },
        hack: { standing: "hackContainer", container: ["hackContainer"], inside: [""], place: ["hackContainer"] },
        fish: { standing: "fishContainer", container: ["fishContainer"], inside: ["fishInside"], place: [""] },
        rush: { standing: "rushContainer", container: ["rushContainer"], inside: ["rushInside"], place: [""] },
        brawl: { standing: "brawlContainer", container: ["brawlContainer"], inside: [""], place: [""] },
        factory: { standing: "factoryStandingContainer", container: ["factoryContainer"], inside: [""], place: [""] },
        defense2: { standing: "defense2Container", container: ["defense2Container"], inside: [""], place: [""] },
    })[theme])
    useEffect(() => {
        import("./standings.css");
        audio.volume = 0.7;
        if (muted) audio.muted = true;
        audioTimeout.current = setTimeout(() => audio.play(), 3500);
        return () => clearTimeout(audioTimeout.current);
    }, []);
    return <div>
        <div className="header" style={{
            backgroundColor: "var(--accent1)",
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
            {ready && <a className="headerTextLeft" style={{
                fontSize: "30px",
                textAlign: "left",
                lineHeight: "59px",
                paddingLeft: "20px",
                fontFamily: "Adventure",
                userSelect: "none",
                display: "flex",
                justifyContent: "center"
            }} href="/sets">
                Sets
            </a>}
            <div className="headerTextCenter" style={{
                fontSize: "38px",
                textAlign: "center",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                fontFamily: "Adventure",
                userSelect: "none",
            }}>Final Standings</div>
            {historyId && <a className="headerTextRight" style={{
                fontSize: "30px",
                color: "#fff",
                textAlign: "right",
                lineHeight: "59px",
                paddingRight: "20px",
                fontFamily: "Adventure",
                userSelect: "none",
                display: "flex",
                justifyContent: "center"
            }} href={`/history/game/${historyId}`}>
                View Report
            </a>}
        </div>
        <div className="hostRegularBody">
            <a className="again" href={"/host?id=" + gameId}>Play Again</a>
            {standings[0] && <div className={`containerOne ${classes.container[0]}`}>
                {theme == "defense2" && <>
                    <div className="standingBorderLeft"></div>
                    <div className="standingBorderRight"></div>
                    <div className="standingTopBottom"></div>
                    <div className="standingTexture"></div>
                </>}
                <div className={`containerInside ${classes.inside[0]}`}>
                    <Textfit className="nameTextOne" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{standings[0].n}</Textfit>
                    <Textfit className="scoreTextOne" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{stats[0]}</Textfit>
                    <div className={`placeOne ${classes.place[0]}`}>
                        <Textfit className="placeText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5.5vw")}>1</Textfit>
                        <Textfit className="superPlaceText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("2.5vw")}>st</Textfit>
                    </div>
                    <Blook className="firstBlook" name={standings[0].b} />
                </div>
            </div>}
            {standings[1] && <div className={`containerTwo ${classes.container[1] || classes.container[0]}`}>
                {theme == "defense2" && <>
                    <div className="standingBorderLeft"></div>
                    <div className="standingBorderRight"></div>
                    <div className="standingTopBottom"></div>
                    <div className="standingTexture"></div>
                </>}
                <div className={`containerInside ${classes.inside[1] || classes.inside[0]}`}>
                    <Textfit className="nameTextTwo" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{standings[1].n}</Textfit>
                    <Textfit className="scoreTextTwo" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{stats[1]}</Textfit>
                    <div className={`placeTwo ${classes.place[1] || classes.place[0]}`}>
                        <Textfit className="placeText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5.5vw")}>2</Textfit>
                        <Textfit className="superPlaceText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("2.5vw")}>nd</Textfit>
                    </div>
                    <Blook className="secondBlook" name={standings[1].b} />
                </div>
            </div>}
            {standings[2] && <div className={`containerThree ${classes.container[2] || classes.container[0]}`}>
                {theme == "defense2" && <>
                    <div className="standingBorderLeft"></div>
                    <div className="standingBorderRight"></div>
                    <div className="standingTopBottom"></div>
                    <div className="standingTexture"></div>
                </>}
                <div className={`containerInside ${classes.inside[2] || classes.inside[0]}`}>
                    <Textfit className="nameTextThree" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{standings[2].n}</Textfit>
                    <Textfit className="scoreTextThree" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{stats[2]}</Textfit>
                    <div className={`placeThree ${classes.place[2] || classes.place[0]}`}>
                        <Textfit className="placeText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5.5vw")}>3</Textfit>
                        <Textfit className="superPlaceText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("2.5vw")}>rd</Textfit>
                    </div>
                    <Blook className="thirdBlook" name={standings[2].b} />
                </div>
            </div>}
            {(standings[3] || team) && <div className="standingsArray">
                {standings.slice(team ? 0 : 3, standings.length).map(standing => {
                    return <div key={standing.n} className="standingHolder">
                        <div className={`standingContainer ${classes.standing}`}>
                            <div className="standingPlaceText">{standing.place}</div>
                            <div className="standingSuperPlaceText">{getOrdinal(standing.place)}</div>
                            <Blook name={standing.b} className="standingBlook" />
                            <div className="standingNameText">{standing.n}</div>
                            <div className="standingStatText">{stats[standings.indexOf(standing)]}</div>
                            {standing.players && <div className="playerText">{listKeys(standing.players)}</div>}
                        </div>
                    </div>
                })}
            </div>}
            {theme == "hack" && <>
                <div className="noise"></div>
                <div className="overlay"></div>
            </>}
        </div>
    </div>
}