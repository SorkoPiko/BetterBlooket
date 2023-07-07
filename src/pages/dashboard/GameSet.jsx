import { useCallback, useEffect, useState } from "react";
import Sidebar from "./SideBar";
import { setActivity } from "../../utils/discordRPC";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getParam } from "../../utils/location";
import "./gameSet.css";
function GameSet() {
    const [ready, setReady] = useState(false);
    const [set, setSet] = useState({
        title: "",
        author: "",
        desc: "",
        id: "",
        questions: [],
        private: false,
        coverImage: { id: "", url: "" },
        playCount: 0,
        favoriteCount: 0,
        isVerified: false
    });
    const [favorited, setFavorited] = useState(false);
    const [showAnswers, setShowAnswers] = useState([]);
    const [reporting, setReporting] = useState(false);
    const [report, setReport] = useState("");
    const [canCopy, setCanCopy] = useState(false);
    const [copying, setCopying] = useState(false);
    const [loadingCopy, setLoadingCopy] = useState(false);
    const { http: { get, put, post }, userData } = useAuth();
    const { setId } = useParams();
    useEffect(() => {
        Promise.all([
            new Promise(r => get("https://dashboard.blooket.com/api/games", { params: { gameId: setId } }).then(({ data }) => r(data)).catch(() => r(null))),
            new Promise(r => get("https://dashboard.blooket.com/api/users/favorited", { params: { id: setId } }).then(({ data }) => r(data)).catch(() => r(false)))
        ]).then(([game, isFavorited]) => {
            if (!game) return setReady(true);
            game.questions.sort((a, b) => a.number - b.number);
            let showAnswers = [];
            if (getParam("open")) showAnswers = game.questions.map(q => q.number);
            setSet(game);
            setFavorited(isFavorited);
            setShowAnswers(showAnswers);
            setReady(true);
        });
    }, []);
    useEffect(() => {
        console.log(set.title)
        if (set.title) setActivity({
            state: `Set "${set.title}"`,
            timestampStart: Date.now(),
        });
    }, [set.title]);
    const onShowAnswers = useCallback((num) => {
        let i = showAnswers.indexOf(num);
        if (i == -1) showAnswers.push(num);
        else showAnswers.splice(i, 1);
        setShowAnswers(showAnswers)
    }, [showAnswers]);
    const onFavorite = useCallback(() => {
        put("https://dashboard.blooket.com/api/users/updatefavorites", { id: setId, isUnfavoriting: favorited }).then(function () {
            setFavorited(f => !f);
            setSet(s => ({ ...s, favoriteCount: favorited ? set.favoriteCount - 1 : set.favoriteCount + 1 }));
        }).catch(console.error);
    }, [favorited, set.favoriteCount]);
    const onReport = useCallback((cancel) => {
        if (!setId) return;
        if (cancel) return setReporting(false);
        set.isVerified && setReporting(false);
        post("https://dashboard.blooket.com/api/reports", { id: setId, c: report })
            .then(function () {
                setReport("");
                setReporting(false);
            })
            .catch(console.error);
    }, [report, reporting]);
    const onCopy = useCallback(() => {
        get("https://dashboard.blooket.com/api/users/plan").then(function ({ data: { hasPlus } }) {
            if (!hasPlus) return setCopying(false);
            setCanCopy(true);
            setCopying(true);
        }).catch(function (e) {
            console.error(e);
            setCopying(false);
        })
    }, []);
    const navigate = useNavigate();
    const onCopyConfirm = useCallback(() => {
        setLoadingCopy(true);
        post("/api/games/copy", { id: setId, isDuplicate: true })
            .then(({ data: { _id } }) => navigate("/edit?id=" + _id))
            .catch(e => {
                console.error(e);
                setCopying(false);
                setLoadingCopy(false);
            })
    }, []);
    return (<>
        <Sidebar>
            {ready && <>
                <div id="gameHeader">
                    <div id="gameCoverImage">
                        {set.coverImage ? <img id="gameCover" src={set.coverImage.url} alt="Cover" /> : <div id="emptyCover">Blooket</div>}
                    </div>
                    <div id="gameInfo">
                        <div id="gameTitle">{set.title}</div>
                        <div id="gameDescription">{set.desc}</div>
                        <Link id="gameAuthor" to={"/discover?n=" + set.author}><i className="fas fa-user" />{set.author}</Link>
                    </div>
                    <div id="gameButtons">
                        <div id="playButtons">
                            <div id="gameSoloButton">Solo</div>
                            <div id="gameHostButton">Host</div>
                        </div>
                        <div id="setButtons">
                            <div><i className={`fa-${favorited ? "solid" : "regular"} fa-star`} />{favorited ? "Unfavorite" : "Favorite"}</div>
                            <div><i className="fas fa-copy" />Copy</div>
                            <div><i className="fa-regular fa-flag" />Report</div>
                        </div>
                    </div>
                </div>
                <div id="questions">
                    {set.questions?.map(question => (<div key={question.number} className="question">
                        {JSON.stringify(question)}
                    </div>))}
                </div>
            </>}
        </Sidebar>
    </>);
}
export default GameSet;