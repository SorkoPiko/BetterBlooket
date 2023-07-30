import { useCallback, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import { useAuth } from "../../context/AuthContext";
import "./sidebar.css";
import { relativeTime } from "../../utils/numbers";

function Sidebar({ children }) {
    const { http } = useAuth();
    const [hovering, setHovering] = useState(true);
    const [showNews, setShowNews] = useState(false);
    const [news, setNews] = useState("loading");
    const sidebar = useRef();
    const getNews = useCallback(async (open) => {
        setNews("loading");
        const { data } = await http.get("https://dashboard.blooket.com/api/news");
        setNews(data.filter(x => x.date).sort((a, b) => new Date(b.date) - new Date(a.date)));
    }, []);
    useEffect(() => { if (showNews) getNews() }, [showNews]);
    useEffect(() => { sidebar.current.classList.toggle("hover", hovering) }, [hovering]);
    useEffect(() => {
        sidebar.current.onpointerenter = () => setHovering(true);
        sidebar.current.onpointerleave = () => setHovering(false);
        setHovering(sidebar.current.matches(":hover"));
    }, []);
    return (<>
        <div id="sidebarWrapper">
            <div id="sidebar" ref={sidebar} className={hovering ? "hover" : null}>
                <ul>
                    <li>
                        <Link style={{ position: "relative" }} to="/">
                            <div className="icon">
                                <div style={{ backgroundColor: "var(--accent1)", mask: "url(/b.svg)", WebkitMask: "url(/b.svg)", height: "30px", aspectRatio: "26 / 30" }}></div>
                            </div>
                            <div id="title" style={{ position: "absolute", fontFamily: "Adventure", fontSize: "39px", top: "calc(50% - 2px)", left: "43px", transform: "translateY(-50%)", color: "var(--accent1)" }}>looket</div>
                            <div className="page" style={{ opacity: "0" }}>Home</div>
                        </Link>
                    </li>
                    <li>
                        <Link to="/play">
                            <div className="icon">
                                <i className="fa-solid fa-play"></i>
                            </div>
                            <div className="page">Play</div>
                        </Link>
                    </li>
                    <li>
                        <Link to="/stats">
                            <div className="icon">
                                <i className="fa-solid fa-chart-column"></i>
                            </div>
                            <div className="page">Stats</div>
                        </Link>
                    </li>
                    <li>
                        <Link to="/blooks">
                            <div className="icon">
                                <i className="fa-solid fa-suitcase"></i>
                            </div>
                            <div className="page">Blooks</div>
                        </Link>
                    </li>
                    <li>
                        <Link to="/market">
                            <div className="icon">
                                <i className="fa-solid fa-store"></i>
                            </div>
                            <div className="page">Market</div>
                        </Link>
                    </li>
                    <li>
                        <Link to="/discover">
                            <div className="icon">
                                <i className="fa-regular fa-compass"></i>
                            </div>
                            <div className="page">Discover</div>
                        </Link>
                    </li>
                    <li>
                        <Link to="/create">
                            <div className="icon">
                                <i className="fa-solid fa-pen-to-square"></i>
                            </div>
                            <div className="page">Set Creator</div>
                        </Link>
                    </li>
                    <li>
                        <Link to="/sets">
                            <div className="icon">
                                <i className="fa-solid fa-list"></i>
                            </div>
                            <div className="page">Sets</div>
                        </Link>
                    </li>
                    <li>
                        <Link to="/favorites">
                            <div className="icon">
                                <i className="fa-solid fa-star"></i>
                            </div>
                            <div className="page">Favorites</div>
                        </Link>
                    </li>
                </ul>
                <Tooltip id="bottom-icon" place="top" className="sidebarTooltip" />
                <div className="bottomRow">
                    <Link data-tooltip-id="bottom-icon" data-tooltip-content="History" to="/history">
                        <i className="fas fa-history"></i>
                    </Link>
                    <Link data-tooltip-id="bottom-icon" data-tooltip-content="Homework" to="/homework">
                        <i className="fas fa-file-alt"></i>
                    </Link>
                    <Link data-tooltip-id="bottom-icon" data-tooltip-content="Settings" to="/settings">
                        <i className="fas fa-cog"></i>
                    </Link>
                    <a data-tooltip-id="bottom-icon" data-tooltip-content="News" style={{ cursor: "pointer" }} onClick={() => setShowNews(s => !s)}>
                        <i className="fas fa-newspaper"></i>
                    </a>
                </div>
            </div>
            <div id="shade" onClick={showNews ? () => setShowNews(false) : null}></div>
            <div id="news" className={className({ showNews })}>
                {news != "loading" && news.map(news => {
                    return <div className="newsPost" key={news._id}>
                        <div className="newsTag">{news.tag}</div>
                        <div className="newsHeader">{news.header}</div>
                        <img src={news.image} alt={news.imageAlt} className="newsImage" />
                        <div className="newsText">{news.text.split("***").map((x, i) => {
                            return <>
                                <div key={i}>{x}</div>
                                <br />
                            </>
                        })}</div>
                        <div className="newsDate">
                            <i className="fas fa-calendar-alt"></i>
                            {relativeTime(new Date(news.date))}
                        </div>
                    </div>
                })}
            </div>
        </div>
        <div id="content">
            {children}
        </div>
    </>);
}
export default Sidebar;