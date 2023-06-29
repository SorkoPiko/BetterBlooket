import { invoke } from "@tauri-apps/api";
import { useEffect, useRef, useState } from "react";
import Sidebar from "./SideBar";
function Stats() {
    const [stats, setStats] = useState({});
    const profile = useRef({ name: "MllereA", blook: { name: "King" } });
    useEffect(() => {
        setStats({
            "_id": "5c44b021a9ae51001785036d",
            "isUnsubscribed": true,
            "numUnlocks": 8,
            "wins": 10,
            "topFives": 18,
            "totalPoints": 192,
            "totalBlooks": 14,
            "playersDefeated": 24,
            "avgPoints": 32,
            "tens": 0,
            "fifties": 0,
            "classicPoints": 0,
            "racingProgress": 0,
            "gamesPlayed": 18,
            "correctAnswers": 259,
            "racingCorrects": 6,
            "racesWon": 2,
            "totalCash": 23518656,
            "upgrades": 127,
            "showdownWins": 3,
            "totalCandy": 358,
            "totalGold": 3690,
            "totalToys": 0,
            "totalCrypto": 0,
            "totalFishWeight": 0,
            "boxesOpened": 4,
            "gameHistory": [
                {
                    "blookUsed": "Snowman",
                    "cash": 22509599,
                    "date": "2019-12-10 13:02",
                    "name": "Ben",
                    "place": 1
                },
                {
                    "blookUsed": "Puppy",
                    "blooks": 5,
                    "date": "2020-01-25 12:47",
                    "name": "zxvc",
                    "place": 1,
                    "points": 76
                },
                {
                    "blookUsed": "Arctic Fox",
                    "blooks": 2,
                    "date": "2020-01-25 12:47",
                    "name": "asdf",
                    "place": 2,
                    "points": 61
                },
                {
                    "blookUsed": "Orangutan",
                    "blooks": 2,
                    "date": "2020-01-25 12:52",
                    "name": "zxsadf",
                    "place": 2,
                    "points": 26
                },
                {
                    "blookUsed": "Cow",
                    "blooks": 5,
                    "date": "2020-01-25 12:52",
                    "name": "zxvc",
                    "place": 1,
                    "points": 29
                },
                {
                    "blookUsed": "Cow",
                    "candy": 204,
                    "date": "2020-09-30 16:17",
                    "name": "asdf",
                    "place": 3
                },
                {
                    "blookUsed": "Squirrel",
                    "candy": 1329,
                    "date": "2020-09-30 16:17",
                    "name": "zvc",
                    "place": 2
                },
                {
                    "blookUsed": "Bear",
                    "candy": 2106,
                    "date": "2020-09-30 16:17",
                    "name": "sdfg",
                    "place": 1
                },
                {
                    "blookUsed": "Jaguar",
                    "candy": 358,
                    "date": "2020-09-30 16:28",
                    "name": "afwe",
                    "place": 2
                },
                {
                    "blookUsed": "Orangutan",
                    "date": "2022-01-30 16:57",
                    "gold": 3690,
                    "name": "asdf",
                    "place": 1
                }
            ],
            "favorites": [
                "609e8c99ace3cb00212529cf"
            ],
            "tokens": 272,
            "totalTokens": 388,
            "tokensAvailable": 477,
            "news": true,
            "plan": "Plus",
            "stagesCleared": 0,
            "towerClears": 0,
            "towerSaves": [
                "5e5372286482fd00040341c7",
                "5ec71ef481d00c3d3423e2cc",
                "61f5752c271b4853469714da"
            ],
            "cafeCash": 0,
            "foodServed": 0,
            "cafeSaves": [],
            "defenseRounds": 0,
            "defenseDmg": 0,
            "defenseSaves": [
                "61f5743c271b4853469714d8",
                null,
                null
            ],
            "guestsAnswered": 0,
            "games": [
                "5c09dce29316a35d14598de1",
                "5bc4fdd9709f9e1b0049bdf4",
                "5c0d4fba8059ba00161ca480",
                "5c1087bb6521b600168bffa1",
                "5c0b337e5238b840c8f7d0ec",
                "5c5cff0ddeebc70017245da6",
                "5c5d06a7deebc70017245da7",
                "5c6deb1a0cc4bf001738c848",
                "5d6d2d094de0e90017da5ad1",
                "5c790b6691b757001799d564",
                "5c7dd6d7c7073500174d7a9a",
                "5df02ca892af970017029a0d"
            ],
            "histories": [
                "5dee7c2d61439e001739058f"
            ],
            "homeworks": [
                "600b4c9bda3d9e000443486d"
            ],
            "questCount": 0,
            "numRefers": 4,
            "classes": [],
            "joinedClasses": [],
            "name": "Ben",
            "blook": "",
            "dateCreated": "2019-01-20T12:30:09.58Z",
            "lastTokenDay": "2022-01-30T00:00:00Z",
            "modalMessage": "",
            "quests": {
                "tower": {
                    "win": 0
                }
            },
            "role": "Teacher",
            "unlocks": {
                "Earth": 1,
                "Elf": 2,
                "Fairy": 2,
                "Slime Monster": 3,
                "Snowman": 1,
                "Tiger Zebra": 1,
                "White Peacock": 1,
                "Wizard": 1
            },
            "blookUsage": {
                "Arctic Fox": 1,
                "Bear": 1,
                "Capuchin": 1,
                "Cow": 2,
                "Goldfish": 1,
                "Hedgehog": 1,
                "Horse": 1,
                "Jaguar": 1,
                "Orangutan": 2,
                "Panther": 1,
                "Parrot": 1,
                "Puppy": 2,
                "Seal": 1,
                "Snowman": 1,
                "Squirrel": 1
            },
            "folders": {},
            "favoriteFolders": {
                "test": {
                    "color": "#1f77b4",
                    "sets": []
                }
            },
            "xp": 0,
            "xpAvailable": 287,
            "customBlooks": []
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
            stats
        </Sidebar>
    </>);
}
export default Stats;