export const icons = {
    General: ({ className }) => <img className={className} src="emptyIcon.svg" alt="icon" />,
    Gameplay: ({ className }) => <i className={`${className} fa-solid fa-gamepad`}></i>
}
export default {
    General: {
        "Blooks Unlocked": "numUnlocks",
        "Total Tokens": "totalTokens",
        "Total Blooks": "totalBlooks",
        "Boxes Opened": "boxesOpened",
        "Games Won": "wins",
        "Games Played": "gamesPlayed",
        "Questions Answered Correctly": "correctAnswers",
        "Players Defeated": "playersDefeated",
        "Top Fives": "topFives",
    },
    Gameplay: {
        "Total Gold": "totalGold",

        "Total Crypto": "totalCrypto",

        "Total Fish Weight": "totalFishWeight",

        "Total Damage": "defenseDmg",
        "Defense Rounds": "defenseRounds",

        "Showdown Wins": "showdownWins",

        "Total Cafe Cash": "cafeCash",
        "Total Food Served": "foodServed",

        "Total Factory Cash": "totalCash",
        "Total Upgrades": "upgrades",

        "Racing Progress": "racingProgress",
        "Correct Racing Answers": "racingCorrects",
        "Races Won": "racesWon",

        "Guests Answers": "guestsAnswered",

        "Stages Cleared": "stagesCleared",
        "Towers Cleared": "towerClears",

        // "Total Points": "totalPoints",
        "Average Points": "avgPoints",
        "Classic Points": "classicPoints",

        "Total Candy": "totalCandy",

        "Total Toys": "totalToys",
    },
}