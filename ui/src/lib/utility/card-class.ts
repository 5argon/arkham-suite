import { CardClass } from "@5argon/arkham-kohaku";

export function cardClassToColor950(cardClass: CardClass): string {
    switch (cardClass) {
        case CardClass.Guardian:
            return '#14283d';
        case CardClass.Seeker:
            return '#381e12';
        case CardClass.Rogue:
            return '#0f290a';
        case CardClass.Mystic:
            return '#370566';
        case CardClass.Survivor:
            return '#3c1313';
        case CardClass.Neutral:
            return '#282422';
    }
}   