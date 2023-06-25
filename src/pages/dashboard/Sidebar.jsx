import "./sidebar.css";
function Sidebar({ children }) {
    return (<>
        <div id="sidebarWrapper">
            <div id="sidebar">
                <div style={{
                    marginBottom: "25px"
                }}>
                    <a href="/">
                        <div className="icon">
                            <img src="b.svg" alt="Blooket" height="30" />
                        </div>
                        <div id="title" style={{
                            position: "absolute",
                            fontFamily: "Adventure",
                            fontSize: "39px",
                            top: "12px",
                            left: "69px",
                            color: "#9B4BAB",
                        }}>looket</div>
                    </a>
                </div>
                <ul>
                    <li><a href="/stats">
                        <div className="icon">
                            <i className="fa-solid fa-chart-column"></i>
                        </div>
                        <div className="page">Stats</div></a>
                    </li>
                    <li><a href="/blooks">
                        <div className="icon">
                            <i className="fa-solid fa-suitcase"></i>
                        </div>
                        <div className="page">Blooks</div></a>
                    </li>
                    <li><a href="/market">
                        <div className="icon">
                            <i className="fa-solid fa-store"></i>
                        </div>
                        <div className="page">Market</div></a>
                    </li>
                    <li><a href="/discover">
                        <div className="icon">
                            <i className="fa-regular fa-compass"></i>
                        </div>
                        <div className="page">Discover</div></a>
                    </li>
                    <li><a href="/set-creator">
                        <div className="icon">
                            <i className="fa-solid fa-pen-to-square"></i>
                        </div>
                        <div className="page">Set Creator</div></a>
                    </li>
                    <li><a href="/sets">
                        <div className="icon">
                            <i className="fa-solid fa-list"></i>
                        </div>
                        <div className="page">Sets</div></a>
                    </li>
                    <li><a href="/favorites">
                        <div className="icon">
                            <i className="fa-solid fa-star"></i>
                        </div>
                        <div className="page">Favorites</div></a>
                    </li>
                    <li><a href="/settings">
                        <div className="icon">
                            <i className="fa-solid fa-gear"></i>
                        </div>
                        <div className="page">Settings</div></a>
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