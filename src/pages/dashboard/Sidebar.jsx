import { Link } from "react-router-dom";
import "./sidebar.css";
function Sidebar({ children }) {
    return (<>
        <div id="sidebarWrapper">
            <div id="sidebar">
                <div style={{ marginBottom: "25px" }}>
                    <Link to="/">
                        <div className="icon">
                            <img src="b.svg" alt="Blooket" height="30" />
                        </div>
                        <div id="title" style={{ position: "absolute", fontFamily: "Adventure", fontSize: "39px", top: "12px", left: "69px", color: "#9B4BAB" }}>looket</div>
                    </Link>
                </div>
                <ul>
                    <li><Link to="/stats">
                        <div className="icon">
                            <i className="fa-solid fa-chart-column"></i>
                        </div>
                        <div className="page">Stats</div></Link>
                    </li>
                    <li><Link to="/blooks">
                        <div className="icon">
                            <i className="fa-solid fa-suitcase"></i>
                        </div>
                        <div className="page">Blooks</div></Link>
                    </li>
                    <li><Link to="/market">
                        <div className="icon">
                            <i className="fa-solid fa-store"></i>
                        </div>
                        <div className="page">Market</div></Link>
                    </li>
                    <li><Link to="/discover">
                        <div className="icon">
                            <i className="fa-regular fa-compass"></i>
                        </div>
                        <div className="page">Discover</div></Link>
                    </li>
                    <li><Link to="/create">
                        <div className="icon">
                            <i className="fa-solid fa-pen-to-square"></i>
                        </div>
                        <div className="page">Set Creator</div></Link>
                    </li>
                    <li><Link to="/sets">
                        <div className="icon">
                            <i className="fa-solid fa-list"></i>
                        </div>
                        <div className="page">Sets</div></Link>
                    </li>
                    <li><Link to="/favorites">
                        <div className="icon">
                            <i className="fa-solid fa-star"></i>
                        </div>
                        <div className="page">Favorites</div></Link>
                    </li>
                    <li><Link to="/settings">
                        <div className="icon">
                            <i className="fa-solid fa-gear"></i>
                        </div>
                        <div className="page">Settings</div></Link>
                    </li>
                </ul>
            </div>
            <div id="shade"></div>
        </div>
        <div id="content">
            {children}
        </div>
    </>);
}
export default Sidebar;