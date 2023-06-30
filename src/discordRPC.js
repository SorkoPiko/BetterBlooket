import { invoke } from "@tauri-apps/api";

let previous = {
    state: "Loading...",
    timestampStart: Date.now(),
    largeImage: "icon1024",
    largeText: "BetterBlooket",
    smallImage: "empty",
    smallText: "empty"
};

export function setActivity(state) {
    previous = { ...previous, ...state };
    if (!state.timestampEnd) delete previous.timestampEnd;
    invoke(state.timestampEnd ? 'set_activity_countdown' : "set_activity", previous);
}

export const getState = () => previous;