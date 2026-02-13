export enum Ultimatum {
  /** When assigning damage or horror, investigators must assign as much damage or horror as possible to a single card before any excess may be assigned to a different card. */
  Agony = 'ultimatum_of_agony',
  /** Remove the Elder Sign token from the chaos bag during setup of a campaign or standalone scenario. */
  BrokenPromises = 'ultimatum_of_broken_promises',
  /** Anytime 1 or more weakness cards are discarded from the top of an investigator’s deck, shuffle those cards back into that investigator’s deck. */
  BrokenVeil = 'ultimatum_of_the_broken_veil',
  /** Each investigator’s starting deck of non-signature, non-weakness cards must be selected at random from among all eligible options in that player’s collection. */
  Chaos = 'ultimatum_of_chaos',
  /** Each investigator’s deckbuilding requirements gain “1 additional random basic weakness.” */
  Disaster = 'ultimatum_of_disaster',
  /** Do not skip the mythos phase during the first round of each game. */
  Dread = 'ultimatum_of_dread',
  /** Add an additional autofail token to the chaos bag during setup of a campaign (or standalone scenario). */
  Failure = 'ultimatum_of_failure',
  /** Campaign Mode only. If an investigator is defeated by damage, they are killed. If an investigator is defeated by horror, they are driven insane. */
  Finality = 'ultimatum_of_finality',
  /** Each investigator begins the game with 1 fewer card in their opening hand. */
  ForbiddenKnowledge = 'ultimatum_of_forbidden_knowledge',
  /** Each investigator begins the game with 2 fewer resources in their resource pool. */
  Hardship = 'ultimatum_of_hardship',
  /** Each investigator’s deck can only include 1 copy of each non-weakness card, by title (unless multiple copies of that card are required by that investigator’s deckbuilding requirements). */
  Highlander = 'ultimatum_of_the_highlander',
  /** Campaign Mode only. Investigator decks can only contain level 0 cards. Investigators cannot earn or spend experience. */
  Induction = 'ultimatum_of_induction',
  /** Play the game using the Taboo List. */
  Orthodoxy = 'ultimatum_of_orthodoxy',
  /** Campaign Mode only. When a unique non-story and non-weakness ally asset you control is defeated, remove it from the game. You cannot play that card for the rest of the campaign. After the scenario ends, remove that ally and all copies of it from each player’s deck. */
  TheScream = 'ultimatum_of_the_scream',
  /** Campaign Mode only. If an investigator is killed or driven insane, their player is eliminated from the campaign and cannot continue playing as a new investigator. */
  Survival = 'ultimatum_of_survival',
  /** Campaign Mode only. Before each game in the campaign, choose 1 ultimatum/boon at random and begin the game with that boon or ultimatum active. (This does not apply to ultimatums or boons that affect deckbuilding or chaos bag construction.) */
  Ultimatums = 'ultimatum_of_ultimatums',
}

/**
 * Ultimatums that only apply in Campaign Mode
 */
export const ultimatumCampaignModeOnly: Ultimatum[] = [
  Ultimatum.Finality,
  Ultimatum.Induction,
  Ultimatum.TheScream,
  Ultimatum.Survival,
  Ultimatum.Ultimatums,
];
