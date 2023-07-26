import React from "react";

function Redirect({ error, stack }) {
    console.log(error);
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100vh", justifyContent: "space-evenly" }}>
        <div style={{ fontSize: "4vw", fontWeight: "700" }}>There was an error:</div>
        <div style={{ border: "3px solid var(--accent1)", padding: "10px" }}>
            {(stack || error.stack)
                ? (`Error: ${error.message}${stack}` || error.stack).split('\n').map((x, i) => <div key={i} style={i > 0 ? { marginLeft: "2rem" } : null}>{x}</div>)
                : `Error: ${error.message}`}
        </div>
        <div style={{ fontSize: "2.5vw" }}>Please report this to either the <a href="https://github.com/Minesraft2/BetterBlooket" target="_blank">GitHub Repository</a> or <a href="https://discord.gg/QznzysxvX4" target="_blank">Discord Server</a></div>
        <a href="/" style={{ fontSize: "2vw" }}>Back to Home</a>
    </div>;
}

// There's no hook for componentDidCatch
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            componentStack: null
        };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        this.setState({
            error: error,
            componentStack: info.componentStack
        });
    }

    render() {
        if (this.state.error) return <Redirect error={this.state.error} stack={this.state.componentStack} />
        // if (this.state.hasError) return window.location.href = this.props.fallback;
        return this.props.children;
    }
}