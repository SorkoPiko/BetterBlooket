import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { addStyles } from "react-mathquill";
import { Chart, ArcElement } from 'chart.js'
Chart.register(ArcElement);

import { fetch } from "@tauri-apps/api/http";
window.tfetch = fetch;

import "./styles.css";
addStyles();

Object.defineProperty(window, "className", {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function className() {
        let classes = [];
        for (let i = 0; i < arguments.length; i++) {
            const arg = arguments[i];
            if (!arg) continue;

            const argType = typeof arg;
            if (argType == "string" || argType == "number") classes.push(arg);
            else if (Array.isArray(arg)) {
                if (arg.length) classes.push(className.apply(null, arg));
            } else if (argType == "object") {
                if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes('[native code]')) classes.push(arg.toString());
                else for (var key in arg) if (Object.hasOwnProperty.call(arg, key) && arg[key]) classes.push(key);
            }
        }
        return classes.join(" ");
    }
});

ReactDOM.createRoot(document.getElementById("root")).render(
    // <React.StrictMode> // strict mode makes useEffect render twice on dev server, breaking protobuf
    <BrowserRouter basename="/"><App /></BrowserRouter>
    // </React.StrictMode>
);