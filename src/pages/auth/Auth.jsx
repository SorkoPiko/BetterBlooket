import { useEffect, useState } from "react";
import Login from "./Login";
import { useAuth } from "../../context/AuthContext";
// import "./auth.css";

function Auth() {
    useEffect(() => {
        import("./auth.css");
    }, [])
    const { login } = window.useAuth = useAuth();
    const [error, setError] = useState(null);

    return (<>
        <header id="navbar">
            <a href="/">
                {/* <img></img> */}
                Blooket
            </a>
        </header>
        <div id="main">
            <form id="form" onSubmit={async (event) => {
                event.preventDefault();
                console.log(event);
                setError(null);
                const { error, result } = await login(event.target);
                if (error) setError(error);
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