import { useEffect, useState, useCallback, useRef } from "react";
import { setActivity } from "../../utils/discordRPC";
import { useAuth } from "../../context/AuthContext.jsx";
import Sidebar from "./Sidebar.jsx";
import { formatNumber, relativeTime } from "../../utils/numbers";
import { Tooltip } from "react-tooltip";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";

import "./sets.css";

function Favorites() {
    const { http } = useAuth();
    const [folders, setFolders] = useState([]);
    const [games, setGames] = useState([]);
    const [allGames, setAllGames] = useState([]);
    const [modal, setModal] = useState({
        text: "", desc: "", timeValue: null, timeChange: null,
        buttonOne: {
            text: "",
            click: null,
            color: ""
        },
        buttonTwo: {
            text: "",
            click: null,
            color: ""
        }
    });
    const [folder, setFolder] = useState(null);
    const [folderColor, setFolderColor] = useState("");
    const [creatingFolder, setCreatingFolder] = useState(false);
    const [editingFolder, setEditingFolder] = useState(null);
    const [movingFolder, setMovingFolder] = useState(null);
    const [moveGame, setMoveGame] = useState(null);
    const [copied, setCopied] = useState(false);
    const copyTimeout = useRef();
    useEffect(() => {
        if (copied) copyTimeout.current = setTimeout(() => setCopied(false), 1500);
    }, [copied]);
    const getSets = useCallback(() => http.get("https://dashboard.blooket.com/api/users/favoriteGames").then(({ data }) => {
        setFolders(Object.keys(data.folders || {}).map((name, id) => ({ ...data.folders[name], name, id })));
        setAllGames(data.games);
        setGames(data.games.sort(function (a, b) {
            return a.playCount !== b.playCount ? b.playCount - a.playCount : a.title < b.title ? -1 : a.title > b.title ? 1 : 0
        }).filter(x => typeof folder == "number" ? Object.values(data.folders)[folder]?.sets.includes(x._id) : Object.values(data.folders || {}).every(f => !f.sets.includes(x._id))));
    }), [folder]);
    const unfavorite = useCallback(async (id) => {
        setModal({ text: "Unfavoriting..." });
        await http.put("https://dashboard.blooket.com/api/users/updatefavorites", { id, isUnfavoriting: true });
        setModal(null);
        await getSets();
    }, []);
    const onDeleteFolder = useCallback(async (folderName) => {
        await http.put("https://dashboard.blooket.com/api/users/favorite-folders/delete", { folderName });
        await getSets();
        setModal(null);
    }, []);
    const onMove = useCallback(async () => {
        try {
            if (typeof folder == "number") await http.put("https://dashboard.blooket.com/api/users/favorite-folders/removeset", {
                folderName: folders[folder].name,
                setId: moveGame._id
            });
            await http.put("https://dashboard.blooket.com/api/users/favorite-folders/addsets", {
                folderName: movingFolder,
                sets: [moveGame._id]
            });
            setMoveGame(null);
        } catch (e) {
            console.error(e);
        } finally {
            setModal(null);
            await getSets();
        }
    }, [moveGame, folder, movingFolder]);
    useEffect(() => {
        getSets();
        setActivity({
            state: "Favorites",
            timestampStart: Date.now(),
        });
        return () => {
            clearTimeout(copyTimeout.current);
        }
    }, []);
    const [folderName, setFolderName] = useState("");
    const newFolder = useCallback(async () => {
        const { data: { success, user, msg } } = await http.put("https://dashboard.blooket.com/api/users/favorite-folders/new", { folderName, folderColor });
        if (success) setFolders(Object.keys(user.favoriteFolders || []).map(name => ({ ...user.favoriteFolders[name], name })));
        else console.error(msg);
        setCreatingFolder(false);
    }, [folderName, folderColor]);
    const editFolder = useCallback(async () => {
        const { data: { success, user, msg } } = await http.put("https://dashboard.blooket.com/api/users/favorite-folders/edit", { folderName, folderColor, oldFolderName: editingFolder });
        if (success) setFolders(Object.keys(user.favoriteFolders || []).map(name => ({ ...user.favoriteFolders[name], name })));
        else console.error(msg);
        setEditingFolder(null);
    }, [folderName, folderColor]);
    useEffect(() => {
        setGames([]);
        getSets();
    }, [folder]);
    return (<>
        <Sidebar>
            <div className="setsHeader">Favorites</div>
            {allGames?.length > 0
                ? <>{folder == null
                    ? <div className="setsFolders">
                        {folders.map((folder, i) => {
                            return <div className="setsFolder" onClick={e => !e.target.matches(".setsFolderSettings, .setsFolderSettings *") && setFolder(i)} style={{ backgroundColor: folder.color }} key={folder.name}>
                                <div className="setsFolderInside">
                                    <i className="fas fa-folder"></i>
                                    <div style={{ marginRight: "5px" }}>{folder.name}</div>
                                    <div style={{ width: "75px", marginLeft: "auto" }}>
                                        <div className="setsFolderSettings">
                                            <div className="setsFolderSettingButtons">
                                                <i onClick={() => (setFolderName(folder.name), setFolderColor(folder.color), setEditingFolder(folder.name))} className="setsFolderEdit fas fa-pencil alt"></i>
                                                <i onClick={() => setModal({
                                                    text: "Do you really want to delete this folder? (this will not delete the sets inside)",
                                                    buttonOne: {
                                                        text: "Yes",
                                                        color: "var(--red)",
                                                        click: () => onDeleteFolder(folder.name)
                                                    },
                                                    buttonTwo: {
                                                        text: "No",
                                                        color: "var(--accent2)",
                                                        click: () => setModal(null)
                                                    }
                                                })} className="setsFolderDelete far fa-trash-alt"></i>
                                            </div>
                                            <i className="fas fa-ellipsis-v"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        })}
                        <div className="setsFolder" style={{ backgroundColor: "var(--accent1)" }} onClick={() => (setFolderName("New Folder"), setFolderColor("#1f77b4"), setCreatingFolder(true))}>
                            <div className="setsFolderInside" style={{ minWidth: "unset" }}>
                                <i style={{ fontSize: "22px", margin: "0" }} className="fas fa-folder-plus"></i>
                            </div>
                        </div>
                    </div>
                    : <div className="setsFolders">
                        <div className="setsBackButton" onClick={() => setFolder(null)}><i className="fas fa-reply" />Back</div>
                    </div>}
                    {games.length > 0 && <div className="setsGames">
                        {games.map(game => {
                            return <div className="setsGame" key={game._id}>
                                <div className="setsGameImage">
                                    <div className="setsGameEmptyImg">Blooket</div>
                                    {game.coverImage && <img onError={e => e.target.style.display = "none"} src={game.coverImage.url} alt="Cover" />}
                                    {typeof folder == "number" && <div className="setsGameRemoveFolder" onClick={() => http.put("https://dashboard.blooket.com/api/users/favorite-folders/removeset", {
                                        folderName: folders[folder].name,
                                        setId: game._id
                                    }).then(getSets)}><i className="fas fa-folder-minus"></i></div>}
                                    <div className="setsGameNumQuestions">{game.questions?.length || 0} Question{game.questions?.length == 1 ? "" : "s"}</div>
                                </div>
                                <div className="setsGameBody">
                                    <div className="setsGameInfo">
                                        <div className="setsGameTitle">{game.title}</div>
                                        <div className="setsGameInfoBottom">
                                            <div className="setsGamePlays"><i style={{ marginRight: "5px" }} className="fas fa-play" />{formatNumber(game.playCount)}<i style={{ marginInline: "10px 5px" }} className="fas fa-star" />{formatNumber(game.favoriteCount)}</div>
                                            <div className="setsGameEdited">Edited {relativeTime(new Date(game.date))}</div>
                                        </div>
                                    </div>
                                    <Tooltip id="game-buttons" />
                                    <div className="setsGameButtons">
                                        <div data-tooltip-id="game-buttons" data-tooltip-content="Unfavorite" className="setsGameUnfavorite" onClick={() => unfavorite(game._id)}><i className="fas fa-star"></i></div>
                                        <Link to={`/set/${game._id}`} data-tooltip-id="game-buttons" data-tooltip-content="View" className="setsGameView"><i className="far fa-eye"></i></Link>
                                        <div data-tooltip-id="game-buttons" data-tooltip-content="Move" className="setsGameMove" onClick={() => (setMovingFolder(null), setMoveGame(game))}><i className="fas fa-folder"></i></div>
                                    </div>
                                    <div className="setsGamePlayButtons">
                                        <div className="setsGameSolo"><i className="fas fa-user-astronaut"></i>Solo</div>
                                        <Link to={`/host?id=${game._id}`} className="setsGameHost"><i className="fas fa-play"></i>Host</Link>
                                    </div>
                                </div>
                            </div>
                        })}
                    </div>}
                </>
                : <div className="setsEmpty">
                    <div className="setsEmptyHeader">You don't have any favorites</div>
                    <div className="setsEmptyLinks">
                        <Link to="/discover" style={{ backgroundColor: "var(--accent2)" }} className="setsDiscoverSet"><i className="far fa-compass"></i>Discover Favorites</Link>
                    </div>
                </div>}
            {modal?.text && <Modal text={modal.text} desc={modal.desc} buttonOne={modal.buttonOne} buttonTwo={modal.buttonTwo} />}
            {creatingFolder && <Modal text="Create Folder"
                buttonOne={{
                    text: "Create",
                    click: newFolder,
                    color: folderColor
                }}
                buttonTwo={{
                    text: "Cancel",
                    click: () => setCreatingFolder(false),
                    color: "var(--accent2)"
                }}
                input={{
                    type: "text",
                    change: e => {
                        setFolderName(e.target.value)
                    },
                    value: folderName,
                    placeholder: "Name",
                    icon: null
                }}
                colors={{
                    current: folderColor,
                    colors: ['#1f77b4', '#ffa31e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#b3dc23', '#0bc2cf'],
                    change: ({ hex }) => setFolderColor(hex)
                }}
            />}
            {editingFolder != null && <Modal text="Edit Folder"
                buttonOne={{
                    text: "Edit",
                    click: editFolder,
                    color: folderColor
                }}
                buttonTwo={{
                    text: "Cancel",
                    click: () => setEditingFolder(null),
                    color: "var(--accent2)"
                }}
                input={{
                    type: "text",
                    change: e => {
                        setFolderName(e.target.value)
                    },
                    value: folderName,
                    placeholder: "Name",
                    icon: null
                }}
                colors={{
                    current: folderColor,
                    colors: ['#1f77b4', '#ffa31e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#b3dc23', '#0bc2cf'],
                    change: ({ hex }) => setFolderColor(hex)
                }}
            />}
            {moveGame && <Modal text="Choose a folder to move the set into"
                folder={{ folders, choose: setMovingFolder, chosen: movingFolder }}
                buttonOne={movingFolder ? {
                    text: "Move",
                    click: onMove,
                } : {
                    text: "Back",
                    click: () => setMoveGame(null)
                }}
                buttonTwo={movingFolder ? {
                    text: "Back",
                    click: () => setMoveGame(null)
                } : null} />}
        </Sidebar >
    </>);
}
export default Favorites;