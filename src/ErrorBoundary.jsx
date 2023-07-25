import React from "react";
import { useRef } from "react";
import { useEffect } from "react";

function Redirect() {
    const timeout = useRef();
    useEffect(() => {
        timeout.current = setTimeout(() => window.location.href = "/sets", 1000);
        return () => clearTimeout(timeout.current);
    }, []);
    return "There was an error";
}

// There's no hook for componentDidCatch
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        console.error(error);
    }

    render() {
        // if (this.state.hasError) return window.location.href = this.props.fallback;
        return this.props.children;
    }
}