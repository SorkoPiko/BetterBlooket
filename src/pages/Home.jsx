import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./home.css";
import { setActivity } from "../discordRPC";

function Home() {
    useEffect(() => {
        setActivity({
            state: "Home",
            timestampStart: Date.now(),
        });
    }, []);
    return (<>
        <div id="mainHome" style={{ height: "100vh", width: "100%", overflow: "hidden", position: "relative" }}>
            <header id="header">
                <div>Blooket</div>
                <a href="#" id="play">Join a Game</a> {/* todo */}
            </header>
            <Link to="/login" id="login">Login</Link>
            <div id="welcomeMessage">Improved<br />Blooket<br />Experience</div>
            <div id="welcomeDescription">An open-sourced Blooket client made in Tauri by OneMinesraft2</div>
            <div id="sources">
                <a href="https://github.com/Minesraft2/BetterBlooket" target="_blank" id="github">GitHub</a>
                <a href="https://discord.gg/QznzysxvX4" target="_blank" id="discord">Discord</a>
            </div>
            <div id="headerBackground"></div>
            {/* <div style={{ position: "absolute", bottom: "-1px", left: "0px", width: "100%", height: "5vh" }}>
                <svg style={{ width: "100%", height: "100%" }} preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M 0 100 L 100 100 L 100 0 Z" fill="#1c1e22"></path>
                </svg>
            </div> */}
        </div>
        {/* <div style={{ display: "flex", background: "#1c1e22", height: "50px" }}></div> */}
    </>);
}

export default Home;