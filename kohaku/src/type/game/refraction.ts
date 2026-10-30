import { Campaign } from './campaign.js';
import { EncounterSet } from './encounter-set.js';
import { Scenario } from './scenario.js';

export enum Refraction {
  /**
   * **Undimensioned and Unseen (The Dunwich Legacy Campaign)**
   *
   * Each Brood of Yog-Sothoth ( 255) gains the Elite trait and is immune to all player card effects except for the effects of Esoteric Formula ( 254).
   */
  UltimatumOfInvisibility = 'ultimatum_of_invisibility',

  /**
   * **Undimensioned and Unseen (The Dunwich Legacy Campaign)**
   *
   * Instead of the standard setup instructions, begin the game with all five Brood of Yog-Sothoth cards in play: one in each of the five locations besides Dunwich Village ( 242).
   * During this scenario, whenever an effect would cause you to spawn a set-aside Brood of Yog-Sothoth, you must instead place one doom on the current agenda.
   */
  UltimatumOfMultiplication = 'ultimatum_of_multiplication',

  /**
   * **The Pallid Mask (The Path to Carcosa Campaign)**
   *
   * After setup, immediately advance Agenda 1a to Specter of Death ( 241b) and spawn it at your starting location, exhausted.
   * Agenda 2a ( 242) gains +6 doom threshold.
   * 
   * Specter of Death gains the following text: “Forced – When Specter of Death is defeated: Instead of adding it to the victory display, heal all damage from it and exhaust it. It does not ready during the next upkeep phase.”
   */
  UltimatumOfDeath = 'ultimatum_of_death',

  /**
   * **The Pallid Mask (The Path to Carcosa Campaign)**
   *
   * For the purposes of Corpse Dweller ‘s ( 259) spawn ability, The Man in the Pallid Mask does not count as a Humanoid enemy.
   * While it is Act 2, The Man in the Pallid Mask cannot leave the Tomb of Shadows ( 257).
   */
  UltimatumOfTheMan = 'ultimatum_of_the_man',

  /**
   * **The Path to Carcosa Campaign**
   *
   * If you heeded Daniel’s warning is recorded in your Campaign Log, each time you speak the name of HASTUR aloud during setup or play of a scenario, in addition to taking 1 horror, suffer 1 mental trauma.
   */
  UltimatumOfTheUnspeakableName = 'ultimatum_of_the_unspeakable_name',

  /**
   * **The Forgotten Age Campaign**
   *
   * Each copy of Poisoned ( 102) gains “Forced – When the game ends, if you have not been eliminated: Suffer 1 physical trauma.”
   */
  UltimatumOfVenom = 'ultimatum_of_venom',

  /**
   * **Into the Maelstrom (The Innsmouth Conspiracy Campaign)**
   *
   * Each agenda gets –1 doom threshold.
   * 
   * The Forced effect on Dagon’s ( 330b) (Awakened and Enraged) side instead reads: “Forced – After Dagon is evaded or dealt damage: Do the same to a copy of Dagon’s Brood in play, as well. Ready Dagon.”
   * 
   * The Forced effect on Hydra’s ( 331b) (Awakened and Enraged) side instead reads: “Forced – After Hydra is evaded or dealt damage: Do the same to a copy of Hydra’s Brood in play, as well. Ready Hydra.”
   */
  UltimatumOfTheDrowned = 'ultimatum_of_the_drowned',

  /**
   * **Edge of the Earth Campaign**
   *
   * When the campaign begins, shuffle 3 random cards from the Tekeli-li encounter set into each investigator’s deck.
   */
  UltimatumOfAnnoyance = 'ultimatum_of_annoyance',

  /**
   * **Where the Gods Dwell (The Dream Eaters Campaign)**
   *
   * After advancing to Act 5, advance to agenda 3a and remove all doom from it. This agenda gets +2 doom threshold.
   */
  BoonOfTheDreamer = 'boon_of_the_dreamer',

  /**
   * **Shades of Suffering (The Scarlet Keys Campaign)**
   *
   * Each agenda gets +1 doom threshold.
   */
  BoonOfAtonement = 'boon_of_atonement',

  /**
   * **The Feast of Hemlock Vale Campaign**
   *
   * When choosing residents to share a dance with during Prelude: The Second Evening, players may check the Relationship Level requirements of a codex entry before resolving it.
   */
  BoonOfTheDance = 'boon_of_the_dance',

  /**
   * **Fate of the Vale (The Feast of Hemlock Vale Campaign)**
   *
   * Each agenda gets +2 doom threshold.
   */
  BoonOfBliss = 'boon_of_bliss',

  /**
   * **Fate of the Vale (The Feast of Hemlock Vale Campaign)**
   *
   * Fate of the Vale (v.III) ( 159)’s first ability should read “: Spend X clues: Place X resources on your location, as kindling...” and its second ability should instead read “ If your location has 1 kindling on it, remove all kindling from it: Draw 1 set-aside Fire! treachery. (Group limit once per location.)”
   */
  BoonOfTheMiners = 'boon_of_the_miners',
  /**
   * **The Path to Carcosa Campaign**
   *
   * If you heeded Daniel's warning is recorded in your Campaign Log, at the beginning of each scenario, take 1 horror for each time you spoke, wrote, or typed the name of HASTUR since the end of the previous scenario.
   */
  UltimatumOfTheBrassCrown = 'ultimatum_of_the_brass_crown',

  /**
   * **The Forgotten Age Campaign**
   *
   * After each successful exploration, the performing investigator reveals the top card of the encounter deck. If the revealed card is an enemy, they draw it. Otherwise, they discard it.
   */
  UltimatumOfAmbuscade = 'ultimatum_of_ambuscade',

  /**
   * **The Drowned City Campaign**
   *
   * Investigators cannot trigger abilities on or assign damage to Artifact assets. If an Item asset from the Expedition encounter set is ever defeated or discarded, it cannot be chosen during setup for the remainder of the campaign.
   */
  UltimatumOfSpoilage = 'ultimatum_of_spoilage',

  /**
   * **Horror in High Gear (The Innsmouth Conspiracy Campaign)**
   *
   * During scenario setup, if you are playing with exactly 2 investigators, each investigator must choose to board the same vehicle.
   */
  UltimatumOfTheFaultyCarburetor = 'ultimatum_of_the_faulty_carburetor',

  /**
   * **The Doom of Arkham Pt II (The Drowned City Campaign)**
   *
   * The health value of each Cthulhu enemy’s Enraged side ( 202b, 203b, 204b) now reads “X .”
   */
  UltimatumOfTheSleeper = 'ultimatum_of_the_sleeper',

  /**
   * **Spreading Flames (Brethren of Ash Campaign)**
   *
   * The Servant of Flame enemy gains elusive and “Forced — When 1 or more damage is dealt via a Fire! treachery: Heal that much damage from Servant of Flame.”
   */
  UltimatumOfScorchedEarth = 'ultimatum_of_scorched_earth',
}

export interface RefractionDetails {
  refraction: Refraction;
  refractionType: RefractionType;
  campaign: Campaign;

  /**
   * The specific scenario this refraction applies to.
   * If `undefined`, applies to an entire campaign.
   */
  scenario?: Scenario;

  /**
   * The encounter set that identifies the part of `scenario` this refraction applies to,
   * when it isn't the scenario's representative set. (e.g. Part II of The Doom of Arkham.)
   */
  encounterSet?: EncounterSet;
}

export type RefractionType = 'boon' | 'ultimatum';

export const refractions: RefractionDetails[] = [
  {
    refraction: Refraction.UltimatumOfInvisibility,
    refractionType: 'ultimatum',
    campaign: Campaign.TheDunwichLegacy,
    scenario: Scenario.UndimensionedAndUnseen,
  },
  {
    refraction:Refraction.BoonOfAtonement,
    refractionType: 'boon',
    campaign: Campaign.TheScarletKeys,
    scenario: Scenario.ShadesOfSuffering,
  },
  {
    refraction: Refraction.UltimatumOfMultiplication,
    refractionType: 'ultimatum',
    campaign: Campaign.TheDunwichLegacy,
    scenario: Scenario.UndimensionedAndUnseen,
  },
  {
    refraction: Refraction.UltimatumOfDeath,
    refractionType: 'ultimatum',
    campaign: Campaign.ThePathToCarcosa,
    scenario: Scenario.ThePallidMask,
  },
  {
    refraction: Refraction.UltimatumOfVenom,
    refractionType: 'ultimatum',
    campaign: Campaign.TheForgottenAge,
    scenario: undefined,
  },
  {
    refraction: Refraction.UltimatumOfTheDrowned,
    refractionType: 'ultimatum',
    campaign: Campaign.TheInnsmouthConspiracy,
    scenario: Scenario.IntoTheMaelstrom,
  },
  {
    refraction: Refraction.BoonOfTheDreamer,
    refractionType: 'boon',
    campaign: Campaign.TheDreamQuest,
    scenario: Scenario.WhereTheGodsDwell,
  },
  {
    refraction: Refraction.UltimatumOfTheMan,
    refractionType: 'ultimatum',
    campaign: Campaign.ThePathToCarcosa,
    scenario: Scenario.ThePallidMask,
  },
  {
    refraction: Refraction.UltimatumOfTheUnspeakableName,
    refractionType: 'ultimatum',
    campaign: Campaign.ThePathToCarcosa,
    scenario: undefined,
  },
  {
    refraction: Refraction.UltimatumOfAnnoyance,
    refractionType: 'ultimatum',
    campaign: Campaign.EdgeOfTheEarth,
    scenario: undefined,
  },
  {
    refraction: Refraction.BoonOfTheDance,
    refractionType: 'boon',
    campaign: Campaign.TheFeastOfHemlockVale,
    scenario: undefined,
  },
  {
    refraction: Refraction.BoonOfBliss,
    refractionType: 'boon',
    campaign: Campaign.TheFeastOfHemlockVale,
    scenario: Scenario.FateOfTheVale,
  },
  {
    refraction: Refraction.BoonOfTheMiners,
    refractionType: 'boon',
    campaign: Campaign.TheFeastOfHemlockVale,
    scenario: Scenario.FateOfTheVale,
  },
  {
    refraction: Refraction.UltimatumOfTheBrassCrown,
    refractionType: 'ultimatum',
    campaign: Campaign.ThePathToCarcosa,
    scenario: undefined,
  },
  {
    refraction: Refraction.UltimatumOfAmbuscade,
    refractionType: 'ultimatum',
    campaign: Campaign.TheForgottenAge,
    scenario: undefined,
  },
  {
    refraction: Refraction.UltimatumOfSpoilage,
    refractionType: 'ultimatum',
    campaign: Campaign.TheDrownedCity,
    scenario: undefined,
  },
  {
    refraction: Refraction.UltimatumOfTheFaultyCarburetor,
    refractionType: 'ultimatum',
    campaign: Campaign.TheInnsmouthConspiracy,
    scenario: Scenario.HorrorInHighGear,
  },
  {
    refraction: Refraction.UltimatumOfTheSleeper,
    refractionType: 'ultimatum',
    campaign: Campaign.TheDrownedCity,
    scenario: Scenario.TheDoomOfArkham,
    encounterSet: EncounterSet.TheDoomOfArkhamPart2,
  },
  {
    refraction: Refraction.UltimatumOfScorchedEarth,
    refractionType: 'ultimatum',
    campaign: Campaign.BrethrenOfAsh,
    scenario: Scenario.SpreadingFlames,
  },
];

/**
 * Refractions listed in the Chapter One FAQ, in display order:
 * by campaign release, campaign-wide ones before scenario-specific ones, then by scenario.
 */
export const chapterOneRefractions: Refraction[] = [
  Refraction.UltimatumOfInvisibility,
  Refraction.UltimatumOfMultiplication,
  Refraction.UltimatumOfTheUnspeakableName,
  Refraction.UltimatumOfTheBrassCrown,
  Refraction.UltimatumOfDeath,
  Refraction.UltimatumOfTheMan,
  Refraction.UltimatumOfVenom,
  Refraction.UltimatumOfAmbuscade,
  Refraction.BoonOfTheDreamer,
  Refraction.UltimatumOfTheFaultyCarburetor,
  Refraction.UltimatumOfTheDrowned,
  Refraction.UltimatumOfAnnoyance,
  Refraction.BoonOfAtonement,
  Refraction.BoonOfTheDance,
  Refraction.BoonOfBliss,
  Refraction.BoonOfTheMiners,
  Refraction.UltimatumOfSpoilage,
  Refraction.UltimatumOfTheSleeper,
];

/**
 * Refractions listed in the Chapter Two rules, in display order.
 */
export const chapterTwoRefractions: Refraction[] = [Refraction.UltimatumOfScorchedEarth];
