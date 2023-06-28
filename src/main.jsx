import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

import { fetch } from "@tauri-apps/api/http";
import { useAuth } from "./context/AuthContext";
window.tfetch = fetch;

ReactDOM.createRoot(document.getElementById("root")).render(
    // <React.StrictMode> // strict mode makes useEffect render twice on dev server, breaking protobuf
        <BrowserRouter><App /></BrowserRouter>
    // </React.StrictMode>
);
