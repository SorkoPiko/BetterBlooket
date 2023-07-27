import { useEffect } from "react";
import Sidebar from "./Sidebar.jsx";
import { setActivity } from "../../utils/discordRPC";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { hwGamemodes } from "../../utils/gameModes.js";
import { relativeTime } from "../../utils/numbers.js";
import { Link, useParams } from "react-router-dom";
import "./homeworks.css";
import Modal from "../../components/Modal.jsx";
import { useCallback } from "react";

function HW({ hw, onDelete }) {
    return <div className="homeworkWrapper">
        <Link to={`/homework/${hw._id}`} className="homeworkContainer">
            <div className="homeworkTitle">
                {hw.title}
            </div>
            <div className="homeworkInfo">
                <div className="info">
                    <i className="fas fa-gamepad"></i>{hwGamemodes[hw.settings.type].name}
                </div>
                <div className="info">
                    <i className="fas fa-users"></i>{hw.resultIds?.length || 0}
                </div>
                <div className="info">
                    <i className="far fa-clock"></i>Due {relativeTime(hw.ends)}
                </div>
            </div>
        </Link>
        <div className="deleteGame" onClick={onDelete}>
            <i className="far fa-trash-alt"></i>
        </div>
    </div>
}

export default function Homeworks() {
    const { http } = useAuth();
    const { get } = http;
    const [homeworks, setHomeworks] = useState([]);
    const [ended, setEnded] = useState([]);
    const [toDelete, setToDelete] = useState(null);
    const onDelete = useCallback(async () => {
        try {
            await http.delete("https://dashboard.blooket.com/api/homeworks", { params: { id: toDelete._id } });
        } catch (e) {
            console.error(e);
        }
        // getHomeworks();
        if (toDelete.isEnded) setEnded(e => e.filter(x => x._id != toDelete._id));
        setHomeworks(e => e.filter(x => x._id != toDelete._id));
        setToDelete(null);
    }, [toDelete]);
    const getHomeworks = useCallback(() => {
        get("https://dashboard.blooket.com/api/users/homeworks").then(({ data }) => {
            let hws = [], ended = [];
            for (let hw of data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))) {
                let ends = new Date(hw.startTime).getTime() + hw.duration * 60 * 1000,
                    isEnded = ends < Date.now();
                if (isEnded) ended.push({ ...hw, ends, isEnded });
                else hws.push({ ...hw, ends, isEnded });
            }
            setHomeworks(hws);
            setEnded(ended);
            window.homeworks = { hws, ended };
        });
    }, []);
    useEffect(() => {
        getHomeworks();
        setActivity({
            state: "Homework",
            timestampStart: Date.now(),
        });
    }, []);
    return (<>
        <Sidebar>
            {homeworks.length > 0 ? <>
                <div className="homeworkHeader">Homework</div>
                <div className="homeworks">
                    {homeworks.map(hw => <HW hw={hw} onDelete={() => setToDelete(hw)} />)}
                </div>
            </> : ended.length == 0 && <>
                <div className="homeworkHeader">Homework</div>
                <div style={{ textAlign: "center" }}>You haven't assigned any Homeworks yet</div>
            </>
            }
            {ended.length > 0 && <>
                <div className="homeworkHeader">Ended</div>
                <div className="endedHw">
                    {ended.map(hw => <HW hw={hw} onDelete={() => setToDelete(hw)} />)}
                </div>
            </>}
            {toDelete && <Modal text={`Do you really want to delete homework "${toDelete.title}"?`} buttonOne={{ text: "Yes", click: onDelete, color: "red" }} buttonTwo={{ text: "No", click: () => setToDelete(null) }} />}
        </Sidebar>
    </>);
}

export function Homework() {
    const { id } = useParams();
    const { http } = useAuth();
    const [set, setSet] = useState({});
    const [results, setResults] = useState([]);
    const refresh = useCallback(() => {
        http.get("https://dashboard.blooket.com/api/homeworks/byid/results", { params: { id: id } }).then(({ data }) => {
            console.log(data);
            setSet(data.metaData);
            setResults(data.results);
        });
    }, []);
    useEffect(() => {
        refresh();
        setActivity({
            state: "Homework",
            timestampStart: Date.now(),
        });
    }, []);
    return <Sidebar>
        {JSON.stringify(set, null, 4).split("\n").map((x, i) => {
            return <div key={i} style={{ paddingLeft: (x.split("  ").length - 1) * 16 }}>{x}</div>
        })}
        {JSON.stringify(results, null, 4).split("\n").map((x, i) => {
            return <div key={i} style={{ paddingLeft: (x.split("  ").length - 1) * 16 }}>{x}</div>
        })}
    </Sidebar>
}