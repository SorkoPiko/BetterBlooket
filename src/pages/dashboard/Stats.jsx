import { invoke } from "@tauri-apps/api";
import { useEffect, useRef, useState } from "react";
import CustomBlook from "../../blooks/CustomBlook";
import banners from "../../blooks/banners";
import titles from "../../blooks/titles";
import statistics from "../../blooks/stats";
import Sidebar from "./SideBar";
import "./stats.css";
import allBlooks from "../../blooks/allBlooks";
function Stats() {
    const [stats, setStats] = useState({});
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
        invoke('set_activity', {
            state: "Stats",
            timestampStart: Date.now(),
            largeImage: "icon1024",
            largeText: "BetterBlooket",
            smallImage: "empty",
            smallText: "empty"
        });
    }, []);
    return (<>
        <Sidebar>
            <div id="profile">
                <div id="blook" className="blookContainer">
                    <img src={allBlooks[stats.blook || "Chick"].url} alt={(stats.blook || "Chick") + " Blook"} draggable={false} className="blook" />
                </div>
                <div id="banner">
                    {stats.banner
                        ? <img src={banners[stats.banner].url} alt={banners[stats.banner].name} id="bannerImg" draggable={false} />
                        : <img src={banners.starter.url} alt="Starter Banner" id="bannerImg" draggable={false} />}
                    <div id="username">{stats.name}</div>
                    <div id="userTitle">{titles[stats.title]?.name || "Newbie"}</div>
                </div>
            </div>
            <div id="stats">
                {Object.keys(statistics).map(category => <div key={category} className="statsCategory">
                    <div className="statsHeader">{category}</div>
                    {Object.keys(statistics[category]).map(stat => <div key={stat} className="stat">
                        <div className="statName">{stat}</div>
                        <div className="statValue">{stats[statistics[category][stat]] != null ? stats[statistics[category][stat]] : statistics[category][stat]}</div>
                    </div>)}
                </div>
                )}
            </div>
            <div id="customBlooks">
                {(stats.customBlooks || []).map(code => (
                    code ? <CustomBlook key={code} className="blookContainer customBlook" code={code} /> : <div>empty</div>
                ))}
            </div>
        </Sidebar>
    </>);
}
export default Stats;