import { Campaign } from './campaign.js';

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
}

export interface RefractionDetails {
  refraction: Refraction;
  refractionType: RefractionType;
  campaign: Campaign;

  /**
   * String representation of the `enum` of that campaign's scenario.
   * If `undefined`, applies to an entire campaign.
   */
  scenario?: string;
}

export type RefractionType = 'boon' | 'ultimatum';

/**
 * TODO: Use satisfies to make scenario strings safe with the enum type?
 */
export const refractions: RefractionDetails[] = [
  {
    refraction: Refraction.UltimatumOfInvisibility,
    refractionType: 'ultimatum',
    campaign: Campaign.TheDunwichLegacy,
    scenario: 'undimensioned_and_unseen',
  },
  {
    refraction:Refraction.BoonOfAtonement,
    refractionType: 'boon',
    campaign: Campaign.TheScarletKeys,
    scenario: 'shades_of_suffering',
  },
  {
    refraction: Refraction.UltimatumOfMultiplication,
    refractionType: 'ultimatum',
    campaign: Campaign.TheDunwichLegacy,
    scenario: 'undimensioned_and_unseen',
  },
  {
    refraction: Refraction.UltimatumOfDeath,
    refractionType: 'ultimatum',
    campaign: Campaign.ThePathToCarcosa,
    scenario: 'the_pallid_mask',
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
    scenario: 'into_the_maelstrom',
  },
  {
    refraction: Refraction.BoonOfTheDreamer,
    refractionType: 'boon',
    campaign: Campaign.TheDreamQuest,
    scenario: 'where_the_gods_dwell',
  },
  {
    refraction: Refraction.UltimatumOfTheMan,
    refractionType: 'ultimatum',
    campaign: Campaign.ThePathToCarcosa,
    scenario: 'the_pallid_mask',
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
    scenario: 'the_second_evening',
  },
  {
    refraction: Refraction.BoonOfBliss,
    refractionType: 'boon',
    campaign: Campaign.TheFeastOfHemlockVale,
    scenario: 'fate_of_the_vale',
  },
  {
    refraction: Refraction.BoonOfTheMiners,
    refractionType: 'boon',
    campaign: Campaign.TheFeastOfHemlockVale,
    scenario: 'fate_of_the_vale',
  },
];
