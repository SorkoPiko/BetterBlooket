import { useState, useRef, useCallback, useEffect } from "react";
import { useGame } from "../../../context/GameContext";
import { audios, holidays } from "../../../utils/config";
import { formatBigNumber, formatNumber, getDimensions, getOrdinal } from "../../../utils/numbers";
import { useNavigate } from "react-router-dom";
import TopBar from "../topBar";
import { Textfit } from "react-textfit";
import Blook from "../../../blooks/Blook";
import { NodeGroup } from "react-move";
import { useAuth } from "../../../context/AuthContext";
import Standings from "./Standings";
import { basic, brawl } from "../../../utils/images";
import Alert from "../../../components/Alert";

export const abilities = {
    egg: {
        active: !0,
        canBeFirst: !0,
        title: "Rapid Eggs",
        img: brawl.egg,
        imgAng: 45,
        levels: [{
            desc: "Fire eggs in the direction you're moving.",
            dmg: 5,
            maxTargets: 1,
            fireRate: 1e3,
            intervalRate: 100,
            speed: 600,
            numProjectiles: 1,
            width: 15,
            lifespan: 1e3,
            knockback: .5
        }, {
            desc: "Fire 1 more egg",
            numProjectiles: 1
        }, {
            desc: "Fire 1 more egg",
            numProjectiles: 1
        }, {
            desc: "+5 damage per egg",
            dmg: 5
        }, {
            desc: "Rapid-Fire: Increase firing rate and piercing",
            fireRate: 200,
            maxTargets: 1
        }, {
            desc: "Fire 1 more egg",
            numProjectiles: 1
        }, {
            desc: "+5 damage per egg",
            dmg: 5
        }, {
            desc: "Pass through 2 more enemies",
            maxTargets: 2
        }, {
            desc: "+10 damage per egg",
            dmg: 10
        }, {
            desc: "EGGS EGGS EGGS: Double the number of eggs fired",
            numProjectiles: 4
        },]
    },
    nut: {
        active: !0,
        canBeFirst: !0,
        title: "Crazy Acorns",
        img: brawl.nut,
        levels: [{
            desc: "Fire acorns at the nearest enemy",
            dmg: 5,
            maxTargets: 1,
            fireRate: 1200,
            intervalRate: 150,
            speed: 450,
            numProjectiles: 1,
            width: 18,
            lifespan: 1200,
            knockback: .5
        }, {
            desc: "Fire 1 more acorn",
            numProjectiles: 1
        }, {
            desc: "Fire 1 more acorn",
            numProjectiles: 1
        }, {
            desc: "+5 damage per acorn",
            dmg: 5
        }, {
            desc: "Burst Fire: Fire acorns in more frequent bursts",
            fireRate: 200,
            intervalRate: 100
        }, {
            desc: "Pass through 1 more enemy",
            maxTargets: 1
        }, {
            desc: "Increase firing rate",
            fireRate: 300
        }, {
            desc: "+5 damage per acorn",
            dmg: 5
        }, {
            desc: "Pass through 2 more enemies",
            maxTargets: 2
        }, {
            desc: "Rapid Fire: Never stop firing acorns",
            fireRate: 575
        },]
    },
    slime: {
        active: !0,
        title: "Bouncing Slime",
        img: brawl.slime,
        levels: [{
            desc: "Shoot out bouncy slime balls",
            dmg: 5,
            maxTargets: 1e3,
            fireRate: 3500,
            intervalRate: 250,
            speed: 500,
            numProjectiles: 1,
            width: 23,
            lifespan: 2500,
            knockback: 0
        }, {
            desc: "+5 damage per slime",
            dmg: 5
        }, {
            desc: "Increase slime lifespan",
            lifespan: 500
        }, {
            desc: "Increase fire rate",
            fireRate: 500
        }, {
            desc: "More Slime: +2 Slime Balls",
            numProjectiles: 2,
            width: 5
        }, {
            desc: "+5 damage per slime",
            dmg: 5
        }, {
            desc: "Increase slime lifespan",
            lifespan: 500
        }, {
            desc: "+7 damage per slime",
            dmg: 7
        }, {
            desc: "Increase fire rate",
            fireRate: 500
        }, {
            desc: "Operation Slime: +2 Slime Balls",
            numProjectiles: 2,
            width: 5
        },]
    },
    jesterBall: {
        active: !0,
        title: "Juggling Spheres",
        img: brawl.jesterBall,
        imgAng: 0,
        levels: [{
            desc: "Throw arching Jester juggling spheres",
            dmg: 10,
            maxTargets: 3,
            fireRate: 4e3,
            intervalRate: 200,
            speed: 575,
            numProjectiles: 1,
            width: 40,
            lifespan: 2500,
            texture: "jesterBall-1",
            evolution: 0,
            knockback: .5
        }, {
            desc: "Fire 1 more sphere",
            numProjectiles: 1
        }, {
            desc: "Pass through 2 more enemies",
            maxTargets: 2
        }, {
            desc: "Fire 1 more sphere",
            numProjectiles: 1
        }, {
            desc: "Spiked Spheres: +15 damage per sphere",
            texture: "jesterBall-2",
            width: 10,
            dmg: 15
        }, {
            desc: "Fire 1 more sphere",
            numProjectiles: 1
        }, {
            desc: "Pass through 2 more enemies",
            maxTargets: 2
        }, {
            desc: "Pass through 2 more enemies",
            maxTargets: 2
        }, {
            desc: "+15 damage per sphere",
            dmg: 15
        }, {
            desc: "Wheel of Spheres: Fire spheres in all directions",
            width: 15,
            numProjectiles: 4,
            evolution: 1,
            speed: -150
        },]
    },
    horseshoe: {
        active: !0,
        title: "Revolving Horseshoes",
        img: brawl.horseshoe,
        levels: [{
            desc: "Spin horseshoes around yourself",
            dmg: 5,
            maxTargets: 1e3,
            fireRate: 4e3,
            speed: 400,
            numProjectiles: 1,
            width: 40,
            lifespan: 2e3,
            targetRefresh: 1200,
            texture: "horseshoe-1",
            knockback: .3
        }, {
            desc: "Fire 1 more horseshoe",
            numProjectiles: 1
        }, {
            desc: "Increase damage by 5",
            dmg: 5
        }, {
            desc: "Fire 1 more horseshoe",
            numProjectiles: 1
        }, {
            desc: "Steel Upgrade: Increase size and speed",
            texture: "horseshoe-2",
            width: 10,
            speed: 50
        }, {
            desc: "Increase effect duration",
            lifespan: 500
        }, {
            desc: "Fire 1 more horseshoe",
            numProjectiles: 1
        }, {
            desc: "Increase damage by 10",
            dmg: 10
        }, {
            desc: "Fire 1 more horseshoe",
            numProjectiles: 1
        }, {
            desc: "Obsidian Upgrade: Increase size and speed",
            texture: "horseshoe-3",
            width: 10,
            speed: 50,
            dmg: 10
        },]
    },
    shell: {
        active: !0,
        title: "Rebounding Shell",
        img: brawl.shell,
        levels: [{
            desc: "Throw a shell that rebounds off enemies",
            dmg: 5,
            maxTargets: 5,
            fireRate: 3e3,
            intervalRate: 250,
            speed: 300,
            numProjectiles: 1,
            width: 30,
            lifespan: 2e3,
            texture: "shell-1",
            evolution: 0,
            knockback: 1
        }, {
            desc: "Throw 1 more shell",
            numProjectiles: 1
        }, {
            desc: "+5 damage per shell",
            dmg: 5
        }, {
            desc: "Bounces for longer",
            lifespan: 300,
            maxTargets: 5
        }, {
            desc: "Auto-Target Shells: Shells guide themselves towards enemies",
            texture: "shell-2",
            evolution: 1,
            width: 10,
            speed: 50
        }, {
            desc: "Throw 1 more shell",
            numProjectiles: 1
        }, {
            desc: "+5 damage per shell",
            dmg: 5
        }, {
            desc: "Bounces for longer",
            lifespan: 500,
            maxTargets: 10
        }, {
            desc: "+10 damage per shell",
            dmg: 10
        }, {
            desc: "Destruction Shells: These shells stop for nothing",
            texture: "shell-3",
            evolution: 2,
            width: 20,
            speed: 50,
            dmg: 10
        },]
    },
    pizza: {
        active: !0,
        title: "Boomerang Pizza",
        img: brawl.pizza,
        levels: [{
            desc: "Throw a boomeranging pizza",
            dmg: 5,
            maxTargets: 1e3,
            fireRate: 2e3,
            intervalRate: 150,
            speed: 400,
            numProjectiles: 1,
            width: 40,
            lifespan: 2500,
            texture: "pizza-1",
            knockback: .3
        }, {
            desc: "Increase pizza size",
            width: 10
        }, {
            desc: "+5 damage per slice",
            dmg: 5
        }, {
            desc: "Throw 1 more slice",
            numProjectiles: 1
        }, {
            desc: "Pepperoni Slice: Throw larger slices that deal more damage",
            texture: "pizza-2",
            width: 10,
            dmg: 10
        }, {
            desc: "Throw 1 more slice",
            numProjectiles: 1
        }, {
            desc: "Increase speed of throw",
            speed: 100
        }, {
            desc: "Increase speed and damage",
            speed: 100,
            dmg: 5
        }, {
            desc: "Throw 1 more slice",
            numProjectiles: 1
        }, {
            desc: "Combo Slice: Throw larger slices that deal more damage",
            texture: "pizza-3",
            width: 10,
            dmg: 5
        },]
    },
    banana: {
        active: !0,
        title: "Curving Banana",
        img: brawl.banana,
        imgAng: 135,
        levels: [{
            desc: "Throw a curving banana",
            dmg: 5,
            maxTargets: 5,
            fireRate: 1500,
            intervalRate: 100,
            speed: 400,
            numProjectiles: 1,
            width: 50,
            lifespan: 1500,
            texture: "banana",
            evolution: 0,
            knockback: .3
        }, {
            desc: "Fire 1 more banana",
            numProjectiles: 1
        }, {
            desc: "+5 damage per banana",
            dmg: 5
        }, {
            desc: "Fire 1 more banana",
            numProjectiles: 1
        }, {
            desc: "Go Bananas: Fire 3 more bananas",
            numProjectiles: 3,
            evolution: 1
        }, {
            desc: "Pass through 5 more enemies",
            maxTargets: 5
        }, {
            desc: "+7 damage per banana",
            dmg: 7
        }, {
            desc: "Increase banana speed",
            speed: 100
        }, {
            desc: "+8 damage per banana",
            dmg: 8
        }, {
            desc: "Banana Whirl: Fire 3 more bananas",
            numProjectiles: 3,
            evolution: 2
        },]
    },
    arrow: {
        active: !0,
        canBeFirst: !0,
        title: "Speeding Arrows",
        img: brawl.arrow,
        levels: [{
            desc: "Fire arrows in the direction you're moving",
            dmg: 5,
            maxTargets: 3,
            fireRate: 1500,
            speed: 600,
            numProjectiles: 1,
            width: 8,
            lifespan: 1e3,
            texture: "arrow-1",
            evolution: 0,
            knockback: .7
        }, {
            desc: "Fire one more arrow",
            numProjectiles: 1
        }, {
            desc: "+5 damage per arrow",
            dmg: 5
        }, {
            desc: "Fire one more arrow",
            numProjectiles: 1
        }, {
            desc: "Arrow Upgrade: Fire 2 more stronger arrows",
            texture: "arrow-2",
            numProjectiles: 2,
            width: 4,
            dmg: 5,
            evolution: 1
        }, {
            desc: "Arrows pass through 3 more enemies",
            maxTargets: 3
        }, {
            desc: "Fire arrows more often",
            fireRate: 300
        }, {
            desc: "Fire two more arrows",
            numProjectiles: 2
        }, {
            desc: "Arrows pass through 5 more enemies",
            maxTargets: 5
        }, {
            desc: "Enchanted Upgrade: Fire 2 more stronger arrows",
            texture: "arrow-3",
            numProjectiles: 2,
            width: 6,
            dmg: 10
        },]
    },
    peacock: {
        active: !0,
        canBeFirst: !0,
        title: "Peacock Feathers",
        img: brawl.peacock,
        levels: [{
            desc: "Fire peacock feathers at the nearest enemy",
            dmg: 3,
            maxTargets: 3,
            fireRate: 3500,
            intervalRate: 200,
            pullBackRate: 4e3,
            speed: 1e3,
            numProjectiles: 1,
            width: 15,
            lifespan: 350,
            texture: "peacock-1",
            knockback: 0
        }, {
            desc: "Fire 1 more feather",
            numProjectiles: 1
        }, {
            desc: "Pass through 2 more enemies",
            maxTargets: 2
        }, {
            desc: "Fire 1 more feather",
            numProjectiles: 1
        }, {
            desc: "Better Feathers: Fire larger, more damaging feathers",
            texture: "peacock-2",
            width: 4,
            dmg: 7,
            lifespan: 150
        }, {
            desc: "Pass through 5 more enemies",
            maxTargets: 5
        }, {
            desc: "Fire feathers more often",
            fireRate: 1150
        }, {
            desc: "+10 damage per feather",
            dmg: 10
        }, {
            desc: "Fire feathers more often",
            fireRate: 1150
        }, {
            desc: "Feather Excellence: Fire larger, faster feathers",
            texture: "peacock-3",
            width: 6,
            dmg: 10,
            speed: 100
        },]
    },
    bone: {
        active: !0,
        title: "Whirling Bones",
        img: brawl.bone,
        levels: [{
            desc: "Summon bones that whirl across the screen",
            dmg: 5,
            maxTargets: 5,
            fireRate: 3e3,
            speed: 600,
            width: 35,
            knockback: 0
        }, {
            desc: "+5 damage per bone",
            dmg: 5
        }, {
            desc: "Summon larger bones",
            width: 10
        }, {
            desc: "Pass through 5 more enemies",
            maxTargets: 5
        }, {
            desc: "More Bones: Summon bones way more frequently",
            fireRate: 1300
        }, {
            desc: "+5 damage per bone",
            dmg: 5
        }, {
            desc: "Pass through 10 more enemies",
            maxTargets: 10
        }, {
            desc: "Summon larger bones",
            width: 10
        }, {
            desc: "+7 damage per bone",
            dmg: 7
        }, {
            desc: "Bone Rampage: Summon bones even more often",
            fireRate: 1200
        },]
    },
    bee: {
        active: !0,
        title: "Buzzing Bees",
        img: brawl.bee,
        levels: [{
            desc: "Fire bees that buzz back and forth",
            dmg: 5,
            maxTargets: 3,
            fireRate: 2500,
            intervalRate: 100,
            speed: 400,
            waveAmplitude: 50,
            numProjectiles: 1,
            width: 35,
            lifespan: 1200,
            texture: "bee-1",
            knockback: .5
        }, {
            desc: "Fire 1 more bee",
            numProjectiles: 1
        }, {
            desc: "+5 damage per bee",
            dmg: 5
        }, {
            desc: "Fire 1 more bee",
            numProjectiles: 1
        }, {
            desc: "Stronger Bees: Increase buzzing and damage of bees",
            dmg: 10,
            waveAmplitude: 75,
            texture: "bee-2",
            width: 10
        }, {
            desc: "Fire 1 more bee",
            numProjectiles: 1
        }, {
            desc: "Pass through 5 more enemies",
            maxTargets: 5
        }, {
            desc: "Pass through 7 more enemies",
            maxTargets: 7
        }, {
            desc: "+8 damage per bee",
            dmg: 8
        }, {
            desc: "Bee Swarm: Double the number of bees",
            numProjectiles: 4,
            texture: "bee-3"
        },]
    },
    bubble: {
        active: !0,
        canBeFirst: !0,
        title: "Booming Bubbles",
        img: brawl.bubble,
        imgAng: 0,
        levels: [{
            desc: "Fire growing bubbles",
            dmg: 1,
            maxTargets: 1,
            fireRate: 2e3,
            intervalRate: 100,
            speed: 450,
            numProjectiles: 3,
            width: 15,
            lifespan: 900,
            knockback: .3
        }, {
            desc: "+2 damage per bubble",
            dmg: 2
        }, {
            desc: "Increase bubble size",
            width: 5
        }, {
            desc: "Pass through 2 more targets",
            maxTargets: 2
        }, {
            desc: "Bubble Blaster: Increase bubble spread",
            evolution: 1,
            numProjectiles: 3,
            dmg: 2
        }, {
            desc: "+5 damage per bubble",
            dmg: 5
        }, {
            desc: "Increase bubble size",
            width: 5
        }, {
            desc: "Fire bubbles more often",
            fireRate: 500
        }, {
            desc: "+10 damage per bubble",
            dmg: 10
        }, {
            desc: "Bubble Storm: Fire bubbles from everywhere",
            evolution: 2,
            numProjectiles: 6,
            intervalRate: 70,
            fireRate: 500,
            dmg: 3
        },]
    },
    card: {
        active: !0,
        canBeFirst: !0,
        title: "Slicing Cards",
        img: brawl.card,
        levels: [{
            desc: "Throw cards at enemies",
            dmg: 3,
            maxTargets: 1,
            fireRate: 1200,
            intervalRate: 300,
            speed: 600,
            numProjectiles: 1,
            width: 25,
            lifespan: 1e3,
            evolution: 0,
            knockback: .5
        }, {
            desc: "+2 damage per card",
            dmg: 2
        }, {
            desc: "Pass through 2 more enemies",
            maxTargets: 2
        }, {
            desc: "Throw cards more often",
            fireRate: 200
        }, {
            desc: "Four Suits: Fire 4 cards each time",
            width: 3,
            evolution: 1
        }, {
            desc: "+5 damage per card",
            dmg: 5
        }, {
            desc: "Pass through 5 more enemies",
            maxTargets: 5
        }, {
            desc: "Throw cards more often",
            fireRate: 350
        }, {
            desc: "+7 damage per card",
            dmg: 7
        }, {
            desc: "Card Shuffle: Fire 2 bursts of cards",
            width: 2,
            numProjectiles: 1
        },]
    },
    laser: {
        active: !0,
        canBeFirst: !0,
        title: "Rapid-fire Lasers",
        img: brawl.laser,
        imgAng: 315,
        levels: [{
            desc: "Fire lasers quickly",
            dmg: 1,
            maxTargets: 1,
            fireRate: 300,
            speed: 700,
            width: 35,
            numProjectiles: 1,
            lifespan: 700,
            texture: "laser-1",
            evolution: 0,
            knockback: .5
        }, {
            desc: "+2 damage per laser",
            dmg: 2
        }, {
            desc: "Pass through 2 more enemies",
            maxTargets: 2
        }, {
            desc: "Fire lasers more quickly",
            fireRate: 50
        }, {
            desc: "Double Laser: Shoot two lasers at once",
            texture: "laser-2",
            width: 5,
            evolution: 1,
            numProjectiles: 1
        }, {
            desc: "+2 damage per laser",
            dmg: 2
        }, {
            desc: "Fire lasers more quickly",
            fireRate: 50
        }, {
            desc: "+5 damage per laser",
            dmg: 5
        }, {
            desc: "Pass through 2 more enemies",
            maxTargets: 2
        }, {
            desc: "Laser Cannon: Shoot a larger, more powerful laser",
            texture: "laser-3",
            width: 45,
            dmg: 25,
            maxTargets: 15,
            evolution: 2,
            numProjectiles: -1
        },]
    },
    darkEnergy: {
        active: !0,
        canBeFirst: !0,
        title: "Dark Energy",
        img: brawl.darkEnergy,
        levels: [{
            desc: "Summon dark energy around you",
            dmg: 3,
            maxTargets: 1e3,
            speed: 90,
            width: 130,
            targetRefresh: 1200,
            texture: "darkEnergy-1",
            knockback: .2
        }, {
            desc: "+2 damage",
            dmg: 2
        }, {
            desc: "Increase size of energy",
            width: 20
        }, {
            desc: "+5 damage",
            dmg: 5
        }, {
            desc: "Dark Magic: Increase power and size of energy",
            texture: "darkEnergy-2",
            width: 25,
            targetRefresh: 100
        }, {
            desc: "+10 damage",
            dmg: 10
        }, {
            desc: "Increase size of energy",
            width: 40
        }, {
            desc: "+10 damage",
            dmg: 10
        }, {
            desc: "Increase size of energy",
            width: 35
        }, {
            desc: "The Darkness: Increase power and size of energy",
            texture: "darkEnergy-3",
            width: 65,
            targetRefresh: 100,
            dmg: 5
        },]
    },
    syrup: {
        active: !0,
        title: "Sticky Syrup",
        img: brawl.syrup,
        imgAng: 0,
        levels: [{
            desc: "Drop syrup puddles around the map",
            dmg: 10,
            maxTargets: 1e3,
            fireRate: 4e3,
            intervalRate: 200,
            bottleWidth: 40,
            width: 100,
            numProjectiles: 1,
            targetRefresh: 500,
            lifespan: 1500,
            knockback: 0
        }, {
            desc: "Fire one more syrup bottle",
            numProjectiles: 1
        }, {
            desc: "Increase syrup puddle size",
            width: 20
        }, {
            desc: "Fire one more syrup bottle",
            numProjectiles: 1
        }, {
            desc: "Big Puddles: Increase syrup puddle size",
            width: 20
        }, {
            desc: "+10 damage",
            dmg: 10
        }, {
            desc: "Fire one more syrup bottle",
            numProjectiles: 1
        }, {
            desc: "Increase syrup puddle duration",
            lifespan: 500
        }, {
            desc: "+10 damage",
            dmg: 10
        }, {
            desc: "Dropzone: Increase rate of syrup dropping",
            fireRate: 1500,
            dmg: 10
        },]
    },
    birdFeather: {
        active: !0,
        title: "Flying Feathers",
        img: brawl.birdFeather,
        levels: [{
            desc: "Summon a bird that shoots feathers",
            dmg: 5,
            maxTargets: 1,
            fireRate: 1500,
            birdSpeed: 100,
            speed: 600,
            birdWidth: 40,
            width: 12,
            numProjectiles: 1,
            lifespan: 800,
            evolution: 0,
            knockback: 0
        }, {
            desc: "Fire 1 more feather",
            numProjectiles: 1
        }, {
            desc: "Pass through 2 more enemies",
            maxTargets: 2
        }, {
            desc: "Fire 1 more feather",
            numProjectiles: 1
        }, {
            desc: "Mighty Macaw: Recruit to fly around and fire feathers",
            evolution: 1,
            numProjectiles: 1,
            width: 3
        }, {
            desc: "+5 damage per feather",
            dmg: 5
        }, {
            desc: "Pass through 3 more targets",
            maxTargets: 3
        }, {
            desc: "Fire feathers more often",
            fireRate: 500
        }, {
            desc: "+8 damage per feather",
            dmg: 8
        }, {
            desc: "Cool Cockatoo: Recruit to fly around and fire feathers",
            evolution: 2,
            numProjectiles: 1,
            width: 3
        },]
    }
}

export default function BrawlHost() {
    const { host: { current: host }, liveGameController, updateHost, updateStandings } = useGame();
    const [timer, setTimer] = useState("00:00");
    const [players, setPlayers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [totalXp, setTotalXp] = useState(0);
    const [muted, setMuted] = useState(!!host && host.muted);
    const [userToBlock, setUserToBlock] = useState("");
    const dbRef = useRef();
    const lastClients = useRef({});
    const navigate = useNavigate();
    const endGame = useRef(false);
    const getClients = useCallback(() => {
        window.dispatchEvent(new Event('resize')); // Fix React-Textfit not sizing right
        liveGameController.getDatabaseVal("c", snapshot => {
            const val = snapshot || {};
            if (!val || Object.keys(val).length == 0) return setPlayers([]);
            let clients = [];
            for (const [name, { b: blook, xp }] of Object.entries(val)) clients.push({ name, blook, xp });
            clients.sort((a, b) => b.xp - a.xp);
            setPlayers(clients);
        });
    }, []);
    const goNext = useCallback(() => {
        let val = players.map((s, i) => ({
            n: s.name,
            b: s.blook,
            xp: s.xp,
            p: i + 1
        }));
        updateStandings(val);
        liveGameController.setVal({
            path: "st", val
        }, () => liveGameController.setStage({ stage: "fin" }, () => navigate("/host/brawl/final")));
    }, [players]);
    const changeMuted = useCallback(() => {
        setMuted(!muted);
    }, [muted]);
    useEffect(() => {
        audio.muted = muted;
        updateHost({ muted });
    }, [muted]);
    const blockUser = useCallback(() => {
        liveGameController.blockUser(userToBlock);
        setPlayers(players.filter(({ name }) => name != userToBlock));
        setUserToBlock("");
    }, [userToBlock, players]);
    const addAlert = useCallback((name, blook, msg, info) => {
        setAlerts(a => a.find(e => e.name + e.msg == name + msg) ? a : [...a, { name, blook, msg, info }])
    }, []);
    const { current: audio } = useRef(new Audio(holidays.halloween ? audios.spookyBrawl : audios.monsterBrawl));
    const timerInterval = useRef();
    useEffect(() => {
        import("./brawl.css");
        if (!host?.settings) return navigate("/sets");
        window.liveGameController = liveGameController;
        (async () => {
            audio.muted = muted;
            audio.volume = holidays.halloween ? 0.4 : 0.65;
            audio.play();
            audio.addEventListener("ended", () => {
                audio.currentTime = 0;
                audio.play();
            }, false);
            liveGameController.setStage({ stage: "brawl" });
            getClients();
            if (host.settings.mode == "Time") {
                let seconds = 60 * host.settings.amount;
                setTimer(`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`);
                timerInterval.current = setInterval(() => {
                    seconds--;
                    setTimer(`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`);
                    getClients();
                    if (seconds <= 0) {
                        clearInterval(timerInterval.current);
                        endGame.current = true;
                    }
                }, 1000);
            } else timerInterval.current = setInterval(getClients, 1000);
            dbRef.current = await liveGameController.getDatabaseRef("c");
            dbRef.current.on("value", function (snapshot) {
                const clients = snapshot.val() || {};
                lastClients.current = clients;
                let total = 0;
                for (const client in clients) {
                    total += parseInt("0" + clients[client].xp);
                    if (clients[client].up) {
                        let [ability, level] = clients[client].up.split(":");
                        if (level && abilities[ability]) addAlert(client, clients[client].b, `upgraded ${abilities[ability].title} to Level ${level}!`, ability);
                    }
                    if (host.settings.mode == "Amount" && clients[client].xp >= host.settings.amount) endGame.current = true;
                }
                setTotalXp(total);
            });
        })();
        return () => {
            clearInterval(timerInterval.current);
            audio.currentTime = 0;
            audio.pause();
            audio.removeEventListener("ended", () => {
                audio.currentTime = 0;
                audio.play();
            }, false);
        }
    }, []);
    useEffect(() => {
        if (endGame.current) goNext();
    }, [players])
    if (!host?.settings) return navigate("/sets");
    return <>
        <div className="body" style={{
            overflow: "hidden",
            backgroundImage: `url(${basic.snowTile})`,
            backgroundSize: 400,
            backgroundPosition: "-100px -100px"
        }}>
            <TopBar left="Blooket" center={host.settings.mode == "Time" ? timer : `Goal: ${formatNumber(host.settings.amount)}`} right={host.settings.lateJoin ? `ID: ${liveGameController.liveGameCode}` : ""} muted={muted} changeMuted={changeMuted} onRightClick={() => (endGame.current = true, getClients())} />
            <div className="hostRegularBody">
                <NodeGroup data={players} keyAccessor={({ name }) => name}
                    start={(_, place) => ({ x: -60, y: 12.5 * place })}
                    enter={(_, place) => ({ x: [0], y: [12.5 * place], timing: { duration: 1000, ease: e => +e } })}
                    update={(_, place) => ({ x: [0], y: [12.5 * place], timing: { duration: 500, ease: e => +e } })}
                    leave={() => ({ x: [-60], timing: 1000 })}>
                    {(standings) => <div className="brawlLeft invisibleScrollbar">
                        {standings.map(({ key, data, state: { x, y } }, i) => {
                            return <div key={key} style={{
                                opacity: userToBlock == data.name ? 0.4 : null,
                                transform: `translate(${x}vw, ${y}vh)`,
                            }} onClick={() => setUserToBlock(data.name)} className={`brawlStandingContainer`}>
                                {i % 3 == 0 && <img src={brawl.smallCracksLeft} alt="Cracks" className="leftCracks" style={{ zIndex: -1 }} />}
                                {i % 4 == 1 && <img src={brawl.smallCracksRight} alt="Cracks" className="rightCracks" style={{ zIndex: -1 }} />}
                                <div className="placeRow">
                                    <Textfit className="placeText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5vw")}>{i + 1}</Textfit>
                                    <div className="superPlaceText">{getOrdinal(i + 1)}</div>
                                    <Blook name={data.blook} className="blookBox"></Blook>
                                    <Textfit className="nameText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("4vw")}>{data.name}</Textfit>
                                    <div className="xpContainer">
                                        <Textfit className="xpText" mode="single" forceSingleModeWidth={false} min={1} max={getDimensions("5vw")}>{(data.xp < 1000 ? formatNumber(data.xp) : formatBigNumber(data.xp))}</Textfit>
                                        <img src={basic.xp} alt="Xp" className="xpIcon" draggable={false} />
                                    </div>
                                </div>
                            </div>
                        })}
                    </div>}
                </NodeGroup>
                <div className="brawlChatroom invisibleScrollbar">
                    <img src={brawl.bigCracksLeft} alt="Cracks" className="leftCracks" />
                    <img src={brawl.bigCracksRight} alt="Cracks" className="rightCracks" />
                    {alerts.length
                        ? alerts.map((alert, i) => <Alert key={`alert${i}`} name={alert.name} blook={alert.blook} message={alert.msg} glitchInfo={alert.info} night={true} />)
                        : <div className="noAlerts">
                            <i className="noAlertsIcon fas fa-hourglass-start" />
                            <div className="noAlertsText">Waiting To Brawl...</div>
                        </div>}
                </div>
                <div className="totalXpContainer">
                    <img src={brawl.smallCracksLeft} alt="Cracks" className="leftCracks" />
                    <img src={brawl.smallCracksRight} alt="Cracks" className="rightCracks" />
                    <div className="totalXpText">{formatNumber(totalXp)}</div>
                    <img src={basic.xp} alt="Xp" className="totalXpIcon" draggable={false} />
                </div>
            </div>
        </div>
        {userToBlock && <div className="blockModal">
            <div className="blockContainer">
                <div className="blockHeader">Remove {userToBlock} from the game?</div>
                <div className="blockButtonContainer">
                    <div className="blockYesButton" onClick={blockUser}>Yes</div>
                    <div className="blockNoButton" onClick={() => setUserToBlock("")}>No</div>
                </div>
            </div>
        </div>}
    </>
}

export function BrawlFinal() {
    const { standings: { current: standings }, liveGameController, deleteHost, host: { current: host }, hostId } = useGame();
    const { http: { post } } = useAuth();
    const [state, setState] = useState({
        standings,
        historyId: "",
        ready: false,
        muted: !!host && host.muted
    });
    const { current: hostCopy } = useRef(JSON.parse(JSON.stringify(host)));
    const navigate = useNavigate();
    const startTimeout = useRef();
    const waitTimeout = useRef();
    useEffect(() => {
        console.log(state, hostId);
        if (!state.standings?.[0]) return navigate("/sets");
        startTimeout.current = setTimeout(function () {
            let results = {};
            liveGameController.getDatabaseVal("c", val => {
                for (const client in (val || {})) {
                    let user = val[client];
                    results[client] = { corrects: {}, incorrects: {} };
                    if (user.i) if (Array.isArray(user.i)) for (let i = 0; i < user.i.length; i++) {
                        if (user.i[i]) results[client].incorrects[i] = user.i[i];
                    } else results[client].incorrects = user.i;

                    if (user.c) if (Array.isArray(user.c)) for (let i = 0; i < user.c.length; i++) {
                        if (user.c[i]) results[client].corrects[i] = user.c[i];
                    } else results[client].corrects = user.c;
                }
            });
            if (liveGameController.liveGameCode && liveGameController.isHost) {
                liveGameController.removeHostAndDeleteGame();
                deleteHost();
            }
            window.dispatchEvent(new Event('resize')); // Fix React-Textfit not sizing right
            waitTimeout.current = setTimeout(function () {
                if (!standings.length) return;
                post("https://play.blooket.com/api/history", {
                    t: hostId.current,
                    standings: standings.map(({ b: blook, n: name, p: place, xp }) => ({
                        blook, name, place,
                        dmg: isNaN(xp) ? 0 : Math.min(Math.round(Number(xp)), 9223372036854775000),
                        corrects: results[name]?.corrects || {},
                        incorrects: results[name]?.incorrects || {}
                    })),
                    settings: hostCopy.settings,
                    setId: hostCopy.setId
                }).then(({ data }) => setState(s => ({ ...s, historyId: data.id, ready: true }))).catch(console.error);
            }, 2000);
        }, 3500);
        return () => {
            clearTimeout(startTimeout.current);
            clearTimeout(waitTimeout.current);
            if (liveGameController.liveGameCode && liveGameController.isHost) {
                liveGameController.removeHostAndDeleteGame();
                deleteHost();
            }
        }
    }, []);
    if (host?.standings?.[0] || state.standings?.[0]) return <div className="body brawlBackground" style={{
        overflowY: state.ready ? "auto" : "hidden",
        backgroundImage: `url(${basic.snowTile})`,
        backgroundSize: 400,
        backgroundPosition: "-100px -100px"
    }}>
        {state.standings.length > 0 && <Standings
            standings={state.standings}
            stats={state.standings.map(e => formatNumber(e.xp) + " XP")}
            gameId={hostCopy.setId}
            historyId={state.historyId}
            muted={state.muted}
            theme="brawl"
            ready={state.ready}
        />}
    </div>;
}