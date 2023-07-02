import { Fragment, useEffect, useRef, useState } from "react";
import CustomBlook from "../../blooks/CustomBlook";
import banners from "../../blooks/banners";
import titles from "../../blooks/titles";
import statistics, { icons } from "../../blooks/stats";
import Sidebar from "./SideBar";
import "./stats.css";
import allBlooks from "../../blooks/allBlooks";
import { setActivity } from "../../utils/discordRPC";
import { formatBigNumber, formatNumber, getOrdinal } from "../../utils/numbers";
import { useAuth } from "../../context/AuthContext";
import { getLevel, items } from "../../blooks/classPass";
import parts from "../../blooks/parts";
function Stats() {
    const [stats, setStats] = useState({});
    const [blookUsage, setBlookUsage] = useState([]);
    const [classPass, setClassPass] = useState({ level: 0, xp: 0 });
    const [selectedIndex, setIndex] = useState(2);
    // const {http: {get}} = useAuth();
    useEffect(() => {
        setStats({
            "_id": "630c2e356fa5f4c8d863a6e1",
            "isUnsubscribed": false,
            "numUnlocks": 122,
            "wins": 43,
            "topFives": 48,
            "totalPoints": 0,
            "totalBlooks": 0,
            "playersDefeated": 146,
            "avgPoints": 0,
            "tens": 0,
            "fifties": 0,
            "classicPoints": 0,
            "racingProgress": 30,
            "gamesPlayed": 59,
            "correctAnswers": 2214,
            "racingCorrects": 0,
            "racesWon": 0,
            "totalCash": 9307448,
            "upgrades": 85,
            "showdownWins": 11,
            "totalCandy": 0,
            "totalGold": 5556794,
            "totalToys": 1826546,
            "totalCrypto": 8982592,
            "totalFishWeight": 1001037801,
            "boxesOpened": 15415,
            "gameHistory": [
                {
                    "blookUsed": "Orangutan",
                    "cash": 1013110,
                    "date": "2023-03-01 18:04",
                    "name": "AerellM",
                    "place": 1
                },
                {
                    "blookUsed": "Chick",
                    "cash": 77770,
                    "date": "2023-03-05 17:27",
                    "name": "You",
                    "place": 1
                },
                {
                    "blookUsed": "Pumpkin King",
                    "date": "2023-03-09 22:57",
                    "gold": 1076920,
                    "name": "jod",
                    "place": 1
                },
                {
                    "blookUsed": "Pumpkin King",
                    "date": "2023-03-09 23:06",
                    "name": "You",
                    "place": 1,
                    "xp": 2591
                },
                {
                    "blookUsed": "Pumpkin King",
                    "date": "2023-03-10 23:41",
                    "name": "Jod",
                    "place": 1,
                    "weight": 999999990
                },
                {
                    "blookUsed": "Lucky Frog",
                    "date": "2023-03-14 19:52",
                    "gold": 4479320,
                    "name": "Jod",
                    "place": 1
                },
                {
                    "blookUsed": "Arctic Fox",
                    "crypto": 0,
                    "date": "2023-03-16 16:32",
                    "name": "Jod",
                    "place": 19
                },
                {
                    "blookUsed": "Pumpkin King",
                    "crypto": 8978110,
                    "date": "2023-04-14 17:08",
                    "name": "AerellM",
                    "place": 1
                },
                {
                    "blookUsed": "5#7#0#0#6$0#14#5#16#3#0#9$0",
                    "date": "2023-04-14 17:19",
                    "name": "Cheihk",
                    "place": 1,
                    "wins": 8
                },
                {
                    "blookUsed": "Pumpkin King",
                    "cash": 0,
                    "date": "2023-04-14 17:33",
                    "name": "MllereA",
                    "place": 8
                }
            ],
            "favorites": null,
            "tokens": 2810,
            "totalTokens": 111953,
            "tokensAvailable": 0,
            "news": false,
            "plan": "Starter",
            "stagesCleared": 7,
            "towerClears": 0,
            "towerSaves": [
                "63b5f3305c36132c536f06fd",
                "634329035ae59a86e684bda6",
                "63b5f4a65c36132c536f08de"
            ],
            "cafeCash": 110421153,
            "foodServed": 91,
            "cafeSaves": [
                null,
                "636fb86ffb5de19b8dd9af7f",
                null
            ],
            "defenseRounds": 58,
            "defenseDmg": 1344759,
            "defenseSaves": [
                "6355ed4ce28329a4d55e17c8",
                "6393dba86ac017e2dcc60312",
                null
            ],
            "guestsAnswered": 0,
            "games": [
                "6368436a976422d8a3f70cd7",
                "6393d82c870511b516f4eace"
            ],
            "histories": [
                "6320987e4634b6b3794972fc",
                "632131e181136c036a3488c4",
                "63226b1472b2263ba7244cb7",
                "6323dbb35f209738dccac062",
                "6323e73d5659b6b01835a747",
                "632923ed4d73ab83a934cd42",
                "635af102231224e11c6766e4",
                "635af7f31d945549324c6ed7",
                "638f6e491e31aa3c5c034749",
                "63c580cedfa7724738fdc661",
                "63c88e6755877c3e4a81bb0f",
                "63d2d49f489b9e60d12a2341",
                "63d562a384130fa965a06eb4",
                "63f3d4e5d82ce97a43911e4b",
                "640a646b647ad8e2512572b4",
                "640bc0188450885e710a5091",
                "6410d096f7011b50eb19870e"
            ],
            "homeworks": null,
            "questCount": 0,
            "numRefers": 0,
            "classes": null,
            "joinedClasses": null,
            "name": "MllereA",
            "blook": "Pumpkin King",
            "dateCreated": "2022-08-29T03:10:45.037Z",
            "lastTokenDay": "2023-06-07T00:00:00Z",
            "modalMessage": "",
            "quests": {},
            "role": "Student",
            "unlocks": {
                "Alice": 1,
                "Alien": 1,
                "Amber": 1,
                "Anaconda Wizard": 1,
                "Angry Bot": 1,
                "Astronaut": 1,
                "Baby Shark": 1,
                "Blobfish": 1,
                "Brainy Bot": 1,
                "Breakfast Combo": 1,
                "Brontosaurus": 1,
                "Buddy Bot": 1,
                "Bush Monster": 1,
                "Caramel Apple": 1,
                "Cereal": 1,
                "Cheshire Cat": 1,
                "Chick Chicken": 1,
                "Chicken Chick": 1,
                "Chocolate Rabbit": 1,
                "Clownfish": 1,
                "Crab": 1,
                "Crocodile": 1,
                "Dingo": 1,
                "Dink": 1,
                "Dino Egg": 1,
                "Dino Fossil": 1,
                "Dolphin": 1,
                "Dormouse": 1,
                "Dragon": 1,
                "Drink Me": 1,
                "Earth": 1,
                "Eat Me": 5,
                "Echidna": 3,
                "Elf": 1,
                "Fairy": 1,
                "Flamingo": 1,
                "Frankenstein": 1,
                "French Toast": 1,
                "Frog": 1,
                "Frozen Fossil": 1,
                "Ghost": 1,
                "Ghost Cookie": 1,
                "Gingerbread House": 1,
                "Gingerbread Man": 1,
                "Happy Bot": 1,
                "Holiday Gift": 1,
                "Holiday Wreath": 1,
                "Hot Chocolate": 1,
                "Ice Bat": 1,
                "Ice Bug": 1,
                "Ice Elemental": 1,
                "Ice Slime": 2,
                "Jellyfish": 1,
                "Jester": 1,
                "Joey": 2,
                "Kangaroo": 1,
                "King": 1,
                "King of Hearts": 1,
                "Lil Bot": 1,
                "Lion": 1,
                "Lovely Bot": 1,
                "Lovely Frog": 1,
                "Lovely Planet": 1,
                "Lucky Frog": 1,
                "Lucky Hamster": 1,
                "Mega Bot": 1,
                "Megalodon": 1,
                "Meteor": 1,
                "Milk": 1,
                "Mummy": 1,
                "Narwhal": 1,
                "Octopus": 1,
                "Old Boot": 1,
                "Orange Juice": 1,
                "Owl Sheriff": 1,
                "Pancakes": 1,
                "Panda": 1,
                "Pizza": 1,
                "Planet": 1,
                "Platypus": 4,
                "Pufferfish": 1,
                "Pumpkin": 1,
                "Pumpkin King": 1,
                "Queen": 1,
                "Raccoon Bandit": 1,
                "Rainbow Panda": 1,
                "Reindeer": 1,
                "Rock Monster": 1,
                "Santa Claus": 1,
                "Slime Monster": 1,
                "Sloth": 1,
                "Snow Globe": 1,
                "Snowman": 1,
                "Spaceship": 1,
                "Spooky Mummy": 1,
                "Spooky Pumpkin": 1,
                "Spring Frog": 1,
                "Stars": 1,
                "Stegosaurus": 1,
                "Stocking": 1,
                "Sugar Glider": 1,
                "Swamp Monster": 1,
                "Tenrec": 1,
                "Toast": 1,
                "Triceratops": 1,
                "Two of Spades": 2,
                "Tyrannosaurus Rex": 1,
                "UFO": 1,
                "Unicorn": 1,
                "Vampire": 1,
                "Vampire Frog": 1,
                "Velociraptor": 1,
                "Waffle": 1,
                "Watson": 1,
                "Werewolf": 1,
                "White Rabbit": 1,
                "Witch": 1,
                "Wizard": 1,
                "Yeti": 1,
                "Yogurt": 1,
                "Zebra": 1,
                "Zombie": 1
            },
            "blookUsage": {
                "Arctic Fox": 1,
                "Chick": 2,
                "Dormouse": 1,
                "Fox": 1,
                "Frost Wreath": 1,
                "Ghost Cookie": 6,
                "Goldfish": 2,
                "Ice Bug": 1,
                "Jaguar": 1,
                "Lucky Frog": 1,
                "Moose": 1,
                "Orangutan": 2,
                "Polar Bear": 1,
                "Pumpkin King": 18,
                "Rainbow Astronaut": 1,
                "Sugar Glider": 2,
                "Teal Platypus": 1,
                "Toucan": 1,
                "Turtle": 1,
                "Walrus": 1
            },
            "folders": null,
            "favoriteFolders": null,
            "xp": 59410,
            "xpAvailable": 0,
            "customBlooks": [
                "0#0#9#0#0$0#0#0#2#2#0#4$0",
                "0#12#9#6#0$0#0#0#2#2#0#4$0",
                "0#0#9#16#0$0#0#0#2#2#0#4$0",
                "5#7#0#0#6$0#14#5#16#3#0#9$0",
                ""
            ]
        });
        // get("https://dashboard.blooket.com/api/users/stats").then(({data}) => setStats(data));
        setActivity({
            state: "Procrastinating",
            timestampStart: 1688241474453 || Date.now(),
        });
    }, []);
    const currentPart = useRef();
    useEffect(() => {
        if (stats.blookUsage) setBlookUsage(Object.entries(stats.blookUsage).sort((a, b) => b[1] - a[1]));
        if (stats.xp) setClassPass(getLevel(stats.xp));
    }, [stats]);
    useEffect(() => {
        currentPart.current?.scrollIntoViewIfNeeded?.();
        window.classPass = classPass;
    }, [classPass]);
    return (<>
        <Sidebar>
            <div id="topHalf">
                <div id="topLeft">
                    <div id="profile">
                        <div id="profileWrapper">
                            <div id="blook" className="blookContainer">
                                <img src={allBlooks[stats.blook || "Chick"].url} alt={(stats.blook || "Chick") + " Blook"} draggable={false} className="blook" />
                            </div>
                            <div id="banner">
                                {stats.banner
                                    ? <img src={banners[stats.banner].url} alt={banners[stats.banner].name} id="bannerImg" draggable={false} />
                                    : <img src={banners.starter.url} alt="Starter Banner" id="bannerImg" draggable={false} />}
                                <div id="nameHolder">
                                    <div id="username">{stats.name}</div>
                                    <div id="userTitle">{titles[stats.title]?.name || "Newbie"}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="classPassWrapper">
                        <div id="classPass">
                            {items.map((item, level) => {
                                return item.partType && <Fragment key={`part${level}`}>
                                    <div data-passed={classPass.level >= level + 1} ref={Math.min(level + 1, 100) == classPass.level ? currentPart : null} style={{ left: `${level * 25}%` }} className="classPassPart">
                                        <img src={parts[item.partType][item.part].url} alt={item.partType} />
                                    </div>
                                    <div data-xp-needed={(level == classPass.level) ? `${classPass.xp} / ${items[classPass.level].xp}` : ""} style={{ left: `${level * 25}%` }} className="levelWrapper">
                                        <div data-passed={classPass.level >= level + 1} className="partLevel">{level + 1}</div>
                                    </div>
                                </Fragment>
                            })}
                            <div id="classPassBar">
                                <div style={{
                                    width: `calc(calc(${classPass?.level}% - 1.5vw) + ${classPass?.level == 100 ? 1 : classPass?.xp / items[classPass?.level]?.xp - .5}%)`
                                }} id="barInner"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="customBlooks">
                    <div id="packUnlocksWrapper">
                        {(stats.customBlooks || []).map((code, i) => {
                            let x = -Math.pow(Math.E, -.45 * Math.abs(i - selectedIndex));
                            return (<div className="packBlook" key={code} data-place={i} style={{
                                left: `calc(50% + ${Math.sign(i - selectedIndex) * (65 + x * 65)}%)`,
                                width: `${-25 * x}%`,
                            }}>
                                <div onClick={() => setIndex(ind => ind + (i - selectedIndex))} style={{ position: "relative" }}>
                                    <CustomBlook key={code} className={`${code ? "" : "emptyBlook"}`} code={code || "0#0#0#0#0$0#0#0#0#0#0#0$0"} />
                                    {!code && <i className="fas fa-ban" style={{ fontSize: `${-7.5 * x}vw`, transition: "0.5s", top: "60%", transform: "translate(-50%, -60%)" }}></i>}
                                </div>
                                {/* <img onClick={() => setIndex(ind => ind + (i - selectedIndex))} src={allBlooks[blook]?.mediaUrl} alt={blook} /> */}
                                {/* {blooks[blook] == 0 && <i style={{fontSize:`${-2500 * x}%`}} className="fa-solid fa-lock"></i>} */}
                            </div>)
                        })}
                    </div>
                    <div id="customArrowsContainer">
                        <button onClick={() => setIndex(ind => Math.max(0, ind - 1))}>{"<"}</button>
                        <button><i className="fas fa-pencil" /></button>
                        <button disabled={!stats.customBlooks?.[selectedIndex]}><i className="fa fa-trash" /></button>
                        <button onClick={() => setIndex(ind => Math.min(stats.customBlooks.length - 1, ind + 1))}>{">"}</button>
                    </div>
                    {/* {(stats.customBlooks || []).map((code, i) => (
                        code ? <CustomBlook key={code} className="blookContainer customBlook" code={code} /> : <div key={i}>empty</div>
                    ))} */}
                </div>  {/* this is filler until i start working on the custom blook viewer */}
            </div>
            <div id="bottomHalf">
                <div id="blookUsage">
                    <div id="usageHeader">Blook Usage</div>
                    <div id="usageStart">0</div>
                    <div id="usageTip">Plays</div>
                    <div id="usageEnd">{blookUsage[0]?.[1] || 1}</div>
                    <div id="usageWrapper">
                        {blookUsage.length ? blookUsage.map(([blook, usage]) => {
                            return <div key={`${blook} Usage`} s className="blookUse">
                                <img className="usageBlook" src={allBlooks[blook].url} alt={blook} style={{ width: "50px" }} />
                                <div className="usageBarWrapper">
                                    <div className="usageBar" style={{ backgroundColor: allBlooks[blook].color, transform: `scaleX(${usage / blookUsage[0][1]})` }}></div>
                                </div>
                            </div>
                        }) : <div style={{
                            position: "absolute",
                            display: "flex",
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px"
                        }}>No Games Played Yet</div>}
                    </div>
                </div>
                <div id="gameHistory">
                    <div id="historyHeader">Game History</div>
                    <div id="historyWrapper">
                        {stats.gameHistory?.length ? stats.gameHistory.map(({ blookUsed, name, place }, i) => {
                            return <div key={i} className="pastGame">
                                {allBlooks[blookUsed] ? <img className="pastBlook" src={allBlooks[blookUsed].url} alt={blookUsed} /> : <CustomBlook className="pastBlook" blookClassName="pastCustomBlook" code={blookUsed} />}
                                <div className="pastInfo">
                                    <div className="pastInfoLeft">
                                        <div className="pastName">{name}</div>
                                        <div className="pastPlace">{place + getOrdinal(place)}</div>
                                    </div>
                                    {stats.gameHistory[i].candy != null ? formatBigNumber(stats.gameHistory[i].candy)
                                        : stats.gameHistory[i].gold != null ? formatBigNumber(stats.gameHistory[i].gold)
                                        : stats.gameHistory[i].xp != null ? formatBigNumber(stats.gameHistory[i].xp)
                                        : stats.gameHistory[i].toys != null ? formatBigNumber(stats.gameHistory[i].toys)
                                        : stats.gameHistory[i].shamrocks != null ? formatBigNumber(stats.gameHistory[i].shamrocks)
                                        : stats.gameHistory[i].snow != null ? formatBigNumber(stats.gameHistory[i].snow)
                                        : stats.gameHistory[i].cash != null ? `$${formatBigNumber(stats.gameHistory[i].cash)}`
                                        : stats.gameHistory[i].crypto != null ? `₿ ${formatBigNumber(stats.gameHistory[i].crypto)}`
                                        : stats.gameHistory[i].weight != null ? `${formatBigNumber(stats.gameHistory[i].weight)} lbs`
                                        : stats.gameHistory[i].classicPoints != null ? formatNumber(stats.gameHistory[i].classicPoints)
                                        : stats.gameHistory[i].wins != null ? `${stats.gameHistory[i].wins} ${1 === stats.gameHistory[i].wins ? "Win" : "Wins"}`
                                        : stats.gameHistory[i].result != null ? stats.gameHistory[i].result
                                        : stats.gameHistory[i].guests != null ? formatNumber(stats.gameHistory[i].guests)
                                        : stats.gameHistory[i].dmg != null ? formatNumber(stats.gameHistory[i].dmg)
                                        : stats.gameHistory[i].numBlooks != null ? formatNumber(stats.gameHistory[i].numBlooks)
                                        : stats.gameHistory[i].fossils != null ? formatNumber(stats.gameHistory[i].fossils)
                                        : null}
                                </div>
                            </div>
                        }) : <div style={{
                            position: "absolute",
                            display: "flex",
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px"
                        }}>No Games Played Yet</div>}
                    </div>
                </div>
                <div id="stats">
                    {Object.keys(statistics).map(category => {
                        const Icon = icons[category];
                        return <div key={category} className="statsCategory">
                            <div className="statsHeader">{<Icon className="statIcon" />}{category}</div>
                            {Object.keys(statistics[category]).map(stat => {
                                let value = stats[statistics[category][stat]];
                                return (<div key={stat} className="stat">
                                    <div className="statName">{stat}</div>
                                    <div className="statValue">{value != null ? (
                                        typeof value == "number" ? value > 9999999999 ? formatBigNumber(value) : formatNumber(value) : value
                                    ) : statistics[category][stat]}</div>
                                </div>)
                            })}
                        </div>
                    })}
                </div>
            </div>
            {/* <div style={{position:"absolute", top: "50%", left: "0", right: "0", bottom: "0", background:"white", zIndex: "-1"}}></div> */}
        </Sidebar>
    </>);
}
export default Stats;