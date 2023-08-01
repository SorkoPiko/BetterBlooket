import { useRef, useEffect } from "react";
import { audios } from "../../../utils/config";
import { Textfit } from "react-textfit";
import { getDimensions, getOrdinal, listKeys } from "../../../utils/numbers";
import Blook from "../../../blooks/Blook";
import "./standings.css";

export default function Standings({ muted, theme, historyId, gameId, standings, stats, team, ready }) {
    const { current: audio } = useRef(new Audio(audios.final));
    const audioTimeout = useRef();
    const { current: classes } = useRef(({
        spooky: { standing: "standings_spookyContainer", container: ["standings_spookyContainer"], inside: ["standings_spookyInside"], place: ["standings_spookyContainer"] },
        winter: { standing: "", container: ["standings_winterContainer1", "standings_winterContainer2", "standings_winterContainer3"], inside: ["standings_winterInside1", "standings_winterInside2", "standings_winterInside3"], place: [""] },
        royal: { standing: "standings_royalContainer", container: ["standings_royalContainer"], inside: ["standings_royalInside"], place: [""] },
        shamrock: { standing: "standings_shamrockContainer", container: ["standings_shamrockContainer"], inside: ["standings_shamrockInside"], place: [""] },
        cafe: { standing: "", container: ["standings_cafeContainer"], inside: [""], place: [""] },
        hack: { standing: "standings_hackContainer", container: ["standings_hackContainer"], inside: [""], place: ["standings_hackContainer"] },
        fish: { standing: "standings_fishContainer", container: ["standings_fishContainer"], inside: ["standings_fishInside"], place: [""] },
        rush: { standing: "standings_rushContainer", container: ["standings_rushContainer"], inside: ["standings_rushInside"], place: [""] },
        brawl: { standing: "standings_brawlContainer", container: ["standings_brawlContainer"], inside: [""], place: [""] },
        factory: { standing: "standings_factoryStandingContainer", container: ["standings_factoryContainer"], inside: [""], place: [""] },
        defense2: { standing: "standings_defense2Container", container: ["standings_defense2Container"], inside: [""], place: [""] },
    })?.[theme] || { standing: "", container: [""], inside: [""], place: [""] });
    const resizeTimeout = useRef();
    useEffect(() => {
        audio.volume = 0.7;
        if (muted) audio.muted = true;
        audioTimeout.current = setTimeout(() => audio.play(), 3500);
        resizeTimeout.current = setTimeout(() => window.dispatchEvent(new Event('resize')), 1000);
        return () => {
            clearTimeout(audioTimeout.current);
            clearTimeout(resizeTimeout.current);
        }
    }, []);
    return <div>
        <div className="standings_header" style={{
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
            {ready && <a className="standings_headerTextLeft" style={{
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
            <div className="standings_headerTextCenter" style={{
                fontSize: "38px",
                textAlign: "center",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                fontFamily: "Adventure",
                userSelect: "none",
            }}>Final Standings</div>
            {historyId && <a className="standings_headerTextRight" style={{
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
            <a className="standings_again" href={"/host?id=" + gameId}>Play Again</a>
            {standings[0] && <div className={className("standings_containerOne", classes.container[0])}>
                {theme == "defense2" && <>
                    <div className="standings_standingBorderLeft"></div>
                    <div className="standings_standingBorderRight"></div>
                    <div className="standings_standingTopBottom"></div>
                    <div className="standings_standingTexture"></div>
                </>}
                <div className={className("standings_containerInside", classes.inside[0])}>
                    <Textfit className="standings_nameTextOne" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{standings[0].n}</Textfit>
                    <Textfit className="standings_scoreTextOne" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{stats[0]}</Textfit>
                    <div className={className("standings_placeOne", classes.place[0])}>
                        <Textfit className="standings_placeText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5.5vw")}>1</Textfit>
                        <Textfit className="standings_superPlaceText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("2.5vw")}>st</Textfit>
                    </div>
                    <Blook className="standings_firstBlook" name={standings[0].b} />
                </div>
            </div>}
            {standings[1] && <div className={className("standings_containerTwo", classes.container[1] || classes.container[0])}>
                {theme == "defense2" && <>
                    <div className="standings_standingBorderLeft"></div>
                    <div className="standings_standingBorderRight"></div>
                    <div className="standings_standingTopBottom"></div>
                    <div className="standings_standingTexture"></div>
                </>}
                <div className={className("standings_containerInside", (classes.inside[1] || classes.inside[0]))}>
                    <Textfit className="standings_nameTextTwo" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{standings[1].n}</Textfit>
                    <Textfit className="standings_scoreTextTwo" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{stats[1]}</Textfit>
                    <div className={className("standings_placeTwo", (classes.place[1] || classes.place[0]))}>
                        <Textfit className="standings_placeText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5.5vw")}>{standings[1].p}</Textfit>
                        <Textfit className="standings_superPlaceText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("2.5vw")}>{getOrdinal(standings[1].p)}</Textfit>
                    </div>
                    <Blook className="standings_secondBlook" name={standings[1].b} />
                </div>
            </div>}
            {standings[2] && <div className={className("standings_containerThree", (classes.container[2] || classes.container[0]))}>
                {theme == "defense2" && <>
                    <div className="standings_standingBorderLeft"></div>
                    <div className="standings_standingBorderRight"></div>
                    <div className="standings_standingTopBottom"></div>
                    <div className="standings_standingTexture"></div>
                </>}
                <div className={className("standings_containerInside", (classes.inside[2] || classes.inside[0]))}>
                    <Textfit className="standings_nameTextThree" mode="multi" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{standings[2].n}</Textfit>
                    <Textfit className="standings_scoreTextThree" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("10vw")}>{stats[2]}</Textfit>
                    <div className={className("standings_placeThree", classes.place[2] || classes.place[0])}>
                        <Textfit className="standings_placeText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5.5vw")}>{standings[2].p}</Textfit>
                        <Textfit className="standings_superPlaceText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("2.5vw")}>{getOrdinal(standings[2].p)}</Textfit>
                    </div>
                    <Blook className="standings_thirdBlook" name={standings[2].b} />
                </div>
            </div>}
            {(standings[3] || team) && <div className="standings_standingsArray">
                {standings.slice(team ? 0 : 3, standings.length).map((standing, i) => {
                    return <div key={standing.n} className="standings_standingHolder">
                        <div className={className("standings_standingContainer", classes.standing)}>
                            <div className="standings_standingPlaceText">{standing.p}</div>
                            <div className="standings_standingSuperPlaceText">{getOrdinal(standing.p)}</div>
                            <Blook name={standing.b} className="standings_standingBlook" />
                            <div className="standings_standingNameText">{standing.n}</div>
                            <div className="standings_standingStatText">{stats[standings.indexOf(standing)]}</div>
                        </div>
                        {standing.players && <div className="standings_standingPlayerContainer">
                            <div className="standings_playerText">{listKeys(standing.players)}</div>
                        </div>}
                    </div>
                })}
            </div>}
            {theme == "hack" && <>
                <div className="standings_noise"></div>
                <div className="standings_overlay"></div>
            </>}
        </div>
    </div>
}