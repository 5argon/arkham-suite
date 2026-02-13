import { CardClass } from "../../type/game/card-class.js";

export function factionCodeToClass(c: string): CardClass {
    switch (c) {
        case 'guardian':
            return CardClass.Guardian
        case 'seeker':
            return CardClass.Seeker
        case 'rogue':
            return CardClass.Rogue
        case 'mystic':
            return CardClass.Mystic
        case 'survivor':
            return CardClass.Survivor
        case 'neutral':
            return CardClass.Neutral
        default:
            return CardClass.Neutral
    }
}