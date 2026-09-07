import {
  TagTypeTimingSkill,
  TagTypeChaosReveal,
  TagTypeDeckDraw,
  TagTypeDeckMisc,
  TagTypeHeal,
  TagTypeStatsModBoostPassive,
  TagTypeTimingDuring,
  TagTypeTimingGame,
} from "../tags/index.js";
import { TaggedCard, TimingQualifier } from "../type.js";

const taggedCards: TaggedCard[] = [
  {
    code: "89001",
    name: "Subject 5U-21",
    text: "You begin the game with Ravenous <i>(Controlled Hunger)</i> in play.\nDuring each upkeep phase, draw 1 additional card and devour a non-weakness player card in your hand.\n[fast]: Devour a non-story card controlled by an investigator at your location. (Limit once per round.)\n[elder_sign] effect: +2. After this test ends, you may add a devoured card to its owner's hand.",
    cardType: "investigator",
    icons: ["willpower", "intellect", "combat", "agility"],
    tags: [
      { type: TagTypeTimingGame.TimingGameBegins },
      { type: TagTypeDeckDraw.DeckDrawYou, value: 1 },
      { type: TagTypeTimingSkill.TimingSkillSt8TestEnds, timing: TimingQualifier.After },
    ],
  },
  {
    code: "89002",
    name: "Ravenous",
    text: "Subject 5U-21 deck only. Permanent.\nEach time you devour a card, place it facedown beneath Ravenous. You get +1 to each of your skills for each card beneath Ravenous (max +5).\n<b>Forced</b> - If there are 5 or more cards beneath Ravenous: Flip it over.",
    cardType: "asset",
    icons: [],
    tags: [
      { type: TagTypeDeckMisc.DeckRestriction },
      { type: TagTypeStatsModBoostPassive.StatsModBoostPassiveAny, value: "dynamic" },
    ],
  },
  {
    code: "89003",
    name: "Regurgitation",
    text: "Subject 5U-21 deck only.\nFast. Play only during your turn.\nIf Ravenous <i>(Uncontrolled Hunger)</i> is face up, flip it over. Choose and return up to 3 cards you devoured <i>(beneath Ravenous or set-aside)</i> to their owners' hands. For each card returned in this way, heal 1 damage or 1 horror.",
    cardType: "event",
    icons: ["wild"],
    tags: [
      { type: TagTypeDeckMisc.DeckRestriction },
      { type: TagTypeTimingDuring.TimingDuringYourTurn },
      { type: TagTypeHeal.HealDamageYou, value: "dynamic" },
      { type: TagTypeHeal.HealHorrorYou, value: "dynamic" },
    ],
  },
  {
    code: "89004",
    name: "Reality Acid",
    text: "<b>Revelation</b> - If Ravenous <i>(Controlled Hunger)</i> is face up, flip it over. You devour a random aspect of reality. Reveal a random chaos token from the chaos bag and consult Reality Acid reference card to determine what you devoured.",
    cardType: "treachery",
    icons: [],
    tags: [
      { type: TagTypeChaosReveal.ChaosRevealManual },
    ],
  },
];
export default taggedCards;
