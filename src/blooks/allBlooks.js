import aquatic from "./packs/aquatic";
import arctic from "./packs/arctic";
import blizzard from "./packs/blizzard";
import bot from "./packs/bot";
import breakfast from "./packs/breakfast";
import color from "./packs/color";
import dino from "./packs/dino";
import farm from "./packs/farm";
import forest from "./packs/forest";
import hidden from "./packs/hidden";
import iceMonster from "./packs/iceMonster";
import medieval from "./packs/medieval";
import outback from "./packs/outback";
import pet from "./packs/pet";
import safari from "./packs/safari";
import space from "./packs/space";
import spooky from "./packs/spooky";
import tropical from "./packs/tropical";
import wonderland from "./packs/wonderland";

let allBlooks

export default allBlooks = {
    ...farm,
    ...pet,
    ...forest,
    ...tropical,
    ...arctic,
    ...medieval,
    ...wonderland,
    ...breakfast,
    ...space,
    ...bot,
    ...aquatic,
    ...safari,
    ...dino,
    ...iceMonster,
    ...outback,
    ...blizzard,
    ...spooky,
    ...hidden,
    ...color,
}

export function price(blook) {
    switch (blook) {
        case "Lucky Hamster":
        case "Chocolate Rabbit":
        case "Agent Owl":
        case "Frost Wreath":
        case "Tropical Globe":
        case "New York Snow Globe":
        case "London Snow Globe":
        case "Japan Snow Globe":
        case "Egypt Snow Globe":
        case "Paris Snow Globe":
        case "Haunted Pumpkin":
        case "Pumpkin Cookie":
        case "Ghost Cookie":
        case "Chick Chicken":
        case "Chicken Chick":
        case "Raccoon Bandit":
        case "Owl Sheriff":
        case "Vampire Frog":
        case "Pumpkin King":
        case "Anaconda Wizard":
        case "Spooky Pumpkin":
        case "Red Astronaut":
        case "Blue Astronaut":
        case "Green Astronaut":
        case "Pink Astronaut":
        case "Orange Astronaut":
        case "Yellow Astronaut":
        case "Black Astronaut":
        case "Purple Astronaut":
        case "Brown Astronaut":
        case "Cyan Astronaut":
        case "Lime Astronaut":
        case "Lovely Planet":
        case "Rainbow Jellyfish":
        case "Blizzard Clownfish":
        case "Lovely Frog":
        case "Lucky Frog":
        case "Spring Frog":
        case "Poison Dart Frog":
        case "Lemon Crab":
        case "Pirate Pufferfish":
        case "Donut Blobfish":
        case "Crimson Octopus":
        case "Rainbow Narwhal":
        case "Rainbow Panda":
        case "White Peacock":
        case "Tiger Zebra":
        case "Ice Slime":
        case "Frozen Fossil":
        case "Ice Crab":
        case "Teal Platypus":
            return 300;
        case "Wise Owl":
            return 500;
        case "Elf":
        case "Witch":
        case "Wizard":
        case "Fairy":
        case "Slime Monster":
        case "Snow Globe":
        case "Holiday Gift":
        case "Hot Chocolate":
        case "Holiday Wreath":
        case "Stocking":
        case "Two of Spades":
        case "Eat Me":
        case "Drink Me":
        case "Alice":
        case "Queen of Hearts":
        case "Toast":
        case "Cereal":
        case "Yogurt":
        case "Breakfast Combo":
        case "Orange Juice":
        case "Milk":
        case "Pumpkin":
        case "Swamp Monster":
        case "Frankenstein":
        case "Vampire":
        case "Earth":
        case "Meteor":
        case "Stars":
        case "Alien":
        case "Lil Bot":
        case "Lovely Bot":
        case "Angry Bot":
        case "Happy Bot":
        case "Old Boot":
        case "Jellyfish":
        case "Clownfish":
        case "Frog":
        case "Crab":
        case "Panda":
        case "Sloth":
        case "Tenrec":
        case "Flamingo":
        case "Zebra":
        case "Amber":
        case "Dino Egg":
        case "Dino Fossil":
        case "Stegosaurus":
        case "Ice Bat":
        case "Ice Bug":
        case "Ice Elemental":
        case "Rock Monster":
        case "Dingo":
        case "Echidna":
        case "Koala":
        case "Kookaburra":
            return 5;
        case "Jester":
        case "Dragon":
        case "Queen":
        case "Gingerbread Man":
        case "Gingerbread House":
        case "Reindeer":
        case "Dormouse":
        case "White Rabbit":
        case "Cheshire Cat":
        case "Waffle":
        case "Pancakes":
        case "Zombie":
        case "Mummy":
        case "Caramel Apple":
        case "Planet":
        case "UFO":
        case "Watson":
        case "Buddy Bot":
        case "Pufferfish":
        case "Blobfish":
        case "Octopus":
        case "Elephant":
        case "Lemur":
        case "Peacock":
        case "Velociraptor":
        case "Brontosaurus":
        case "Dink":
        case "Donk":
        case "Platypus":
        case "Joey":
        case "Kangaroo":
            return 20;
        case "Unicorn":
        case "Snowman":
        case "Caterpillar":
        case "Mad Hatter":
        case "French Toast":
        case "Pizza":
        case "Sandwich":
        case "Werewolf":
        case "Spaceship":
        case "Brainy Bot":
        case "Narwhal":
        case "Dolphin":
        case "Chameleon":
        case "Triceratops":
        case "Bush Monster":
        case "Crocodile":
            return 75;
        case "King":
        case "Santa Claus":
        case "King of Hearts":
        case "Ghost":
        case "Astronaut":
        case "Mega Bot":
        case "Baby Shark":
        case "Lion":
        case "Tyrannosaurus Rex":
        case "Yeti":
        case "Sugar Glider":
            return 200;
        case "Party Pig":
        case "Master Elf":
        case "Spooky Mummy":
            return 350;
        case "Phantom King":
        case "Spooky Ghost":
        case "Tim the Alien":
        case "Rainbow Astronaut":
            return 1e3;
        case "Megalodon":
            return 250;
        default:
            return 0
    }
}

export const rarityColors = {
    Common: "#ffffff",
    Uncommon: "#4bc22e",
    Rare: "#0a14fa",
    Epic: "#be0000",
    Legendary: "#ff910f",
    Chroma: "#00ccff",
    Unique: "#008080",
    Mystical: "#a335ee"
}

export const freeBlooks = ["Chick", "Chicken", "Cow", "Goat", "Horse", "Pig", "Sheep", "Duck", "Alpaca", "Dog", "Cat", "Rabbit", "Goldfish", "Hamster", "Turtle", "Kitten", "Puppy", "Bear", "Moose", "Fox", "Raccoon", "Squirrel", "Owl", "Hedgehog", "Deer", "Wolf", "Beaver", "Tiger", "Orangutan", "Cockatoo", "Parrot", "Anaconda", "Jaguar", "Macaw", "Toucan", "Panther", "Capuchin", "Gorilla", "Hippo", "Rhino", "Giraffe", "Snowy Owl", "Polar Bear", "Arctic Fox", "Baby Penguin", "Penguin", "Arctic Hare", "Seal", "Walrus"];
export const colorBlooks = ["Light Blue", "Black", "Red", "Purple", "Pink", "Orange", "Lime", "Green", "Teal", "Tan", "Maroon", "Gray", "Mint", "Salmon", "Burgandy", "Baby Blue", "Dust", "Brown", "Dull Blue", "Yellow", "Blue"];

export function blookColor(blook) {
    return blook.includes("#") ? "#0bc2cf" : allBlooks[blook].color;
}