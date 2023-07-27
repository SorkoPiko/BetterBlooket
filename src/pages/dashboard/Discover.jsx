import { useCallback, useEffect, useRef } from "react";
import Sidebar from "./Sidebar.jsx";
import { setActivity } from "../../utils/discordRPC";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatNumber } from "../../utils/numbers";
import { getParam } from "../../utils/location";
import "./discover.css";

import { relativeTime } from "../../utils/numbers";

function Set({ set }) {
    return <Link className="questionSet" to={`/set/${set._id}`}>
        <div className="setImg">
            <div className="emptyImg">Blooket</div>
            {set.coverImage && <img onError={e => e.target.style.display = "none"} src={set.coverImage.url} alt="Cover" />}
            <div className="setNumQuestions">{set.numQuestions} Questions</div>
        </div>
        <div className="setTitle">{set.title}</div>
        <div className="setDesc">{set.desc}</div>
        <div className="setInfo">
            <div className="setNums"><i className="setIcon fas fa-play" />{formatNumber(set.playCount)}<div className="divider" style={{ display: "inline", marginInline: "5px" }} /><i className="setIcon fas fa-star" />{formatNumber(set.favoriteCount)}</div>
            <div className="setCreated"><i className="setIcon fas fa-user" />{set.author}<div className="divider" style={{ display: "inline", marginInline: "5px" }} /><i className="setIcon fa-solid fa-calendar-days" />Created {relativeTime(new Date(set.date))}</div>
        </div>
    </Link>
}

function Discover() {
    const { http: { get } } = useAuth();
    const [discovery, setDiscovery] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [search, setSearch] = useState("");
    const [sets, setSets] = useState([]);
    const [searched, setSearched] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [pageIndex, setPageIndex] = useState(0);
    const [filter, setFilter] = useState({
        minQuestions: 1,
        hasCoverImage: false,
        minPlays: 10
    });
    const loadSearch = useRef(false);
    const onSearch = useCallback(function (evt, page = 0) {
        evt?.preventDefault();
        if (page == 0) window.history.pushState({}, null, "".concat(window.location.origin, "/discover?s=").concat(encodeURIComponent(search)));
        get("https://dashboard.blooket.com/api/games/search", {
            params: {
                text: search,
                page,
                minQuestions: filter.minQuestions,
                hasCoverImage: filter.hasCoverImage,
                minPlays: filter.minPlays
            }
        }).then(function ({ data }) {
            setHasMore(data.length >= 8);
            setPageIndex(page);
            if (0 === page) {
                setSearched(true);
                setSets(data);
            } else setSets(sets.concat(data));
        }).catch(function (e) {
            setSearched(true);
            setHasMore(false);
            setPageIndex(page);
            setSets([]);
            console.error(e);
        })
    }, [search, filter, sets]);
    const searchUser = useCallback(function (name) {
        get("https://dashboard.blooket.com/api/users/games", { params: { name } }).then(function ({ data }) {
            const sets = data.filter(set => !set.private && set.numQuestions > 0).sort((a, b) => b.playCount - a.playCount);
            setSets(sets);
            setSearched(true);
            setHasMore(false);
            setSearch(search || name);
        }).catch(function (e) {
            console.error(e)
        })
    }, []);
    useEffect(() => {
        const user = getParam("n"), query = getParam("s");
        if (user) {
            searchUser(decodeURIComponent(user));
            setSearch(search || decodeURIComponent(user));
        } else if (query) {
            loadSearch.current = true;
            setSearch(decodeURIComponent(query));
        } else get("https://dashboard.blooket.com/api/games/featured").then(({ data: { discoverGames, featuredGames } }) => {
            setDiscovery(discoverGames.sort((a, b) => b.playCount - a.playCount));
            setFeatured(featuredGames.sort((a, b) => b.playCount - a.playCount));
        });
        setActivity({
            state: "Discover",
            timestampStart: Date.now(),
        });
    }, []);
    useEffect(() => {
        if (loadSearch.current && search) {
            onSearch();
            loadSearch.current = false;
        }
    }, [search]);
    return (<>
        <Sidebar>
            <div id="discoverContainer">
                <div id="searchBar">
                    <form onSubmit={onSearch}>
                        <input id="searchInput" type="search" placeholder="Search for a Set..." value={search} onChange={e => setSearch(e.target.value.slice(0, 50))} />
                        <i id="searchIcon" className="fas fa-search" onClick={onSearch} />
                    </form>
                </div>
                {!searched && discovery.length > 0 && <div id="discoverySets">
                    {discovery.map(set => <Set set={set} key={set._id} />)}
                </div>}
                {!searched && featured.length > 0 && <>
                    <div className="featuredHeader">Featured</div>
                    <div id="featuredSets">
                        {featured.map(set => <Set set={set} key={set._id} />)}
                    </div>
                </>}
                {searched && <>
                    <div id="featuredSets">
                        {sets.map(set => <Set set={set} key={set._id} />)}
                        {hasMore && <div onClick={e => onSearch(e, pageIndex + 1)} id="moreButton">Load More</div>}
                    </div>
                </>}
            </div>
        </Sidebar>
    </>);
}
export default Discover;