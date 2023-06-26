import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Login from "./Login";
import { useAuth } from "../../context/AuthContext";
// import "./auth.css";

function Auth() {
    const { login, userData } = window.useAuth = useAuth();
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        import("./auth.css");
        if (userData) navigate("/stats")
    }, [])

    return (<>
        <header id="navbar">
            <Link to="/">
                {/* <img></img> */}
                Blooket
            </Link>
        </header>
        <div id="main">
            <form id="form" onSubmit={async (event) => {
                event.preventDefault();
                console.log(event);
                setError(null);
                const { error, result } = await login(event.target);
                if (error) setError(error);
                else navigate("/stats")
            }}>
                <Login />
                {error && <div id="errorMessage">
                    <div>{error}</div>
                </div>}
                <div style={{ textAlign: "center" }}><a href="https://id.blooket.com/signup" target="_blank">Don't have an account? Sign Up</a></div>
            </form>
        </div>
    </>);
}

export default Auth;