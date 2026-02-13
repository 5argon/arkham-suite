export enum Boon {
  /** Campaign Mode only. Each investigator begins the campaign with 5 additional experience. */
  Ancients = 'boon_of_the_ancients',
  /** The first time each game you draw the autofail token, you may cancel that token, return it to the chaos bag, and draw another in its place. */
  Athena = 'boon_of_athena',
  /** Before drawing your opening hand, you may search your deck for 1 copy of a card and add it to your hand (this does not change the number of cards in your opening hand). */
  Destiny = 'boon_of_destiny',
  /** Each investigator begins the game with 2 additional resources in their resource pool. */
  Hades = 'boon_of_hades',
  /** Each investigator may take an additional action during their turn, which may only be used to move. */
  Hermes = 'boon_of_hermes',
  /** The first time each investigator would be defeated in a scenario, after suffering trauma, heal all damage and horror from that investigator. That investigator cannot be damaged until the beginning of their next turn. */
  Osiris = 'boon_of_osiris',
  /** Each investigator begins the game with 1 additional card in their opening hand. */
  Thoth = 'boon_of_thoth',
}

/**
 * Boons that only apply in Campaign Mode
 */
export const boonCampaignModeOnly: Boon[] = [Boon.Ancients];
