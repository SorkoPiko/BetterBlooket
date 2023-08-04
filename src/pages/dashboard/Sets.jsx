import { useEffect, useState, useCallback, useRef } from "react";
import { setActivity } from "../../utils/discordRPC";
import { useAuth } from "../../context/AuthContext.jsx";
import Sidebar from "./Sidebar.jsx";
import { formatNumber, relativeTime } from "../../utils/numbers";
import { Tooltip } from "react-tooltip";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";

import "./sets.css";

function Sets() {
    const { http } = useAuth();
    const navigate = useNavigate();
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
    const [mergeGame, setMergeGame] = useState(null);
    const [copied, setCopied] = useState(false);
    const copyTimeout = useRef();
    useEffect(() => {
        if (copied) copyTimeout.current = setTimeout(() => setCopied(false), 1500);
    }, [copied]);
    const getSets = useCallback(() => http.get("https://dashboard.blooket.com/api/users/allsets").then(({ data }) => {
        setFolders(Object.keys(data.folders || []).map(name => ({ ...data.folders[name], name })));
        setAllGames(data.games);
        setGames(data.games.sort(function (a, b) {
            return a.playCount !== b.playCount ? b.playCount - a.playCount : a.title < b.title ? -1 : a.title > b.title ? 1 : 0
        }).filter(x => folder ? Object.values(data.folders)[folder]?.sets.includes(x._id) : Object.values(data.folders).every(f => !f.sets.includes(x._id))));
    }), [folder]);
    const onEdit = useCallback((setId) => {
        navigate(`/edit?id=${setId}${folder ? `&f=${folders.findIndex(x => x.name == folder.name)}` : ""}`);
    }, [folder, folders]);
    const onDelete = useCallback(async (gameId) => {
        await http.delete("https://dashboard.blooket.com/api/games", { params: { gameId } });
        await getSets();
        setModal(null);
    }, []);
    const onDeleteFolder = useCallback(async (folderName) => {
        await http.put("https://dashboard.blooket.com/api/users/folders/delete", { folderName });
        await getSets();
        setModal(null);
    }, []);
    const getIsPlus = useCallback(() => http.get("https://dashboard.blooket.com/api/users/plan").then(({ data }) => data.hasPlus), []);
    const plusModal = useCallback((action) => {
        setModal({
            text: `Get Blooket Plus to ${action}`,
            buttonOne: {
                text: "Upgrade",
                click: () => window.open("https://dashboard.blooket.com/upgrade", "_blank"),
                color: "var(--orange)"
            },
            buttonTwo: {
                text: "Cancel",
                click: () => setModal(null)
            },
        })
    }, []);
    const onCopy = useCallback(async (toCopy) => {
        if (await getIsPlus()) setModal({
            text: `Do you want to create a copy of "${toCopy.title}"?`,
            buttonOne: {
                text: "Yes",
                click: async () => {
                    try {
                        const { data: { _id } } = await http.post("https://dashboard.blooket.com/api/games/copy", {
                            newAuthor: toCopy.author,
                            id: toCopy._id,
                            isDuplicate: false
                        });
                        navigate(`/edit?id=${_id}`);
                    } catch (e) {
                        console.error(e);
                        setModal(null);
                    }
                }
            },
            buttonTwo: {
                text: "No",
                click: () => setModal(null)
            }
        });
        else plusModal("Copy Sets");
    }, []);
    const onMerge = useCallback(async (game) => {
        if (await getIsPlus()) return setMergeGame(game);
        plusModal("Merge Sets");
    }, []);
    const onMergeChoose = useCallback(async (mergeWith) => {
        setModal({
            text: `Do you want to merge these two sets?`,
            buttonOne: {
                text: "Yes",
                click: async () => {
                    try {
                        const { data: { _id } } = await http.post("https://dashboard.blooket.com/api/games/merge", {
                            game1Id: mergeGame,
                            game2Id: mergeWith,
                        });
                        navigate(`/edit?id=${_id}`);
                    } catch (e) {
                        console.error(e);
                        setModal(null);
                    }
                }
            },
            buttonTwo: {
                text: "No",
                click: () => setModal(null)
            }
        });
    }, [mergeGame]);
    useEffect(() => {
        getSets();
        setActivity({
            state: "My Sets",
            timestampStart: Date.now(),
        });
        return () => {
            clearTimeout(copyTimeout.current);
        }
    }, []);
    const [folderName, setFolderName] = useState("");
    const newFolder = useCallback(async () => {
        const { data: { success, user, msg } } = await http.put("https://dashboard.blooket.com/api/users/folders/new", { folderName, folderColor });
        if (success) setFolders(Object.keys(user.folders || []).map(name => ({ ...user.folders[name], name })));
        else console.error(msg);
        setCreatingFolder(false);
    }, [folderName, folderColor]);
    const editFolder = useCallback(async () => {
        const { data: { success, user, msg } } = await http.put("https://dashboard.blooket.com/api/users/folders/edit", { folderName, folderColor, oldFolderName: editingFolder });
        if (success) setFolders(Object.keys(user.folders || []).map(name => ({ ...user.folders[name], name })));
        else console.error(msg);
        setEditingFolder(null);
    }, [folderName, folderColor]);
    useEffect(() => {
        setGames([]);
        getSets();
    }, [folder]);
    return (<>
        <Sidebar>
            <div className="setsHeader">My Sets</div>
            {allGames.length > 0
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
                        <div className="setsFolder" style={{ backgroundColor: "var(--accent1)" }} onClick={() => (setFolderName(""), setFolderColor("#1f77b4"), setCreatingFolder(true))}>
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
                                {mergeGame && (mergeGame._id == game._id
                                    ? <div className="setsGameMergeInfo">
                                        <div className="setsGameMergeHeader">Choose a set to merge with</div>
                                        <div className="setsGameCancelMerge" onClick={() => setMergeGame(null)}><i className="fas fa-xmark"></i> Cancel</div>
                                    </div>
                                    : <div className="setsGameMergeButton" onClick={() => onMergeChoose(game)}></div>)}
                                <div className="setsGameImage">
                                    <div className="setsGameEmptyImg">Blooket</div>
                                    {game.coverImage && <img onError={e => e.target.style.display = "none"} src={game.coverImage.url} alt="Cover" />}
                                    {game.private || <Link to={`/set/${game._id}`} className="setsGamePrivate"><i className="far fa-eye" /></Link>}
                                    <div className="setsGameNumQuestions">{game.questions.length} Questions</div>
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
                                        <div data-tooltip-id="game-buttons" data-tooltip-content="Edit" className="setsGameEdit" onClick={() => onEdit(game._id)}><i className="fas fa-pencil-alt"></i></div>
                                        <div data-tooltip-id="game-buttons" data-tooltip-content="Delete" className="setsGameDelete" onClick={() => setModal({
                                            text: `Do you really want to delete this set?`,
                                            buttonOne: {
                                                text: "Yes",
                                                click: () => onDelete(game._id),
                                                color: "var(--red)"
                                            },
                                            buttonTwo: {
                                                text: "No",
                                                click: () => setModal(null)
                                            }
                                        })}><i className="far fa-trash-alt"></i></div>
                                        <div className="setsGameSettings">
                                            <div className="setsGameSettingsPopup">
                                                <div className="setsGameSetting" onClick={() => navigate(`/hw?id=${game._id}`)}>
                                                    <i className="fas fa-file-alt"></i>
                                                    Assign
                                                </div>
                                                <div className="setsGameSetting">
                                                    <i className="fas fa-folder"></i>
                                                    Move
                                                </div>
                                                <div className="setsGameSetting" onClick={() => onCopy(game)}>
                                                    <i className="fas fa-copy"></i>
                                                    Copy
                                                </div>
                                                <div className="setsGameSetting" onClick={() => onMerge(game)}>
                                                    <i className="fas fa-shuffle"></i>
                                                    Merge
                                                </div>
                                                <div className="setsGameSetting" style={{ color: copied ? "var(--accent1)" : null }} onClick={(() => navigator.clipboard.writeText(new URL(`https://dashboard.blooket.com/set/${game._id}`).href).then(() => setCopied(true)))}>
                                                    <i className="fas fa-chain"></i>
                                                    {copied ? "Copied" : "Link"}
                                                </div>
                                            </div>
                                            <i className="fas fa-cog"></i>
                                        </div>
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
                    <div className="setsEmptyHeader">You Need a Question Set to Host</div>
                    <div className="setsEmptyLinks">
                        <div style={{ backgroundColor: "var(--accent1)" }} className="setsCreateSet"><i className="fas fa-edit"></i>Create a Set</div>
                        <div style={{ backgroundColor: "var(--accent2)" }} className="setsDiscoverSet"><i className="far fa-compass"></i>Discover Sets</div>
                    </div>
                    <div className="setsGettingStarted">
                        <a target="_blank" href="https://www.youtube.com/watch?v=hhn7dAP6BF8">Getting Started Tutorial</a>
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
        </Sidebar >
    </>);
}
export default Sets;