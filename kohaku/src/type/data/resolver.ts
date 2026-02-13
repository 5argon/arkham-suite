import { applyTabooToCard } from '../../utility/card/taboo.js';
import { AhdbCard } from './ahdb-card.js';
import { ahdbCardToCard, CardCode, Card } from './player-card.js';
import { Taboo } from './taboo.js';

/**
 * Construct this object with a database of all cards in the game.
 * It can turn any card code into `Card`.
 * Used to follow linked cards or bonded card, etc.
 * Optionally accepts a taboo list to apply modifications to resolved cards.
 *
 * Can be constructed from:
 * - AhdbCard[]: Raw database cards that will be converted to Card[]
 * - Card[]: Already-converted cards (useful for client-side reconstruction)
 */
export class CardResolver {
  private cards: Map<string, Card>;
  private taboo: Taboo | null;

  // Constructor overloads
  constructor(cards: AhdbCard[], taboo?: Taboo | null);
  constructor(cards: Card[], taboo?: Taboo | null);
  constructor(cards: AhdbCard[] | Card[], taboo?: Taboo | null) {
    this.taboo = taboo ?? null;

    // Use type guard to determine which type of array we received
    if (this.isAhdbCardArray(cards)) {
      // Convert AhdbCard[] to Card[]
      // First pass: convert all cards
      this.cards = new Map<string, Card>(cards.map((x) => [x.code, ahdbCardToCard(x)]));

      // Second pass: populate bondedCards and duplicates arrays
      const bondedToMap = new Map<string, string[]>(); // Maps parent code to array of bonded codes
      const duplicatesMap = new Map<string, string[]>(); // Maps original code to array of duplicate codes

      // Collect bonded_to and duplicate_of relationships
      for (const ahdbCard of cards) {
        if (ahdbCard.bonded_to) {
          const parentCode = ahdbCard.bonded_to;
          if (!bondedToMap.has(parentCode)) {
            bondedToMap.set(parentCode, []);
          }
          bondedToMap.get(parentCode)!.push(ahdbCard.code);
        }

        if (ahdbCard.duplicate_of_code) {
          const originalCode = ahdbCard.duplicate_of_code;
          if (!duplicatesMap.has(originalCode)) {
            duplicatesMap.set(originalCode, []);
          }
          duplicatesMap.get(originalCode)!.push(ahdbCard.code);
        }
      }

      // Update cards with collected relationships
      for (const [code, card] of this.cards.entries()) {
        if (bondedToMap.has(code)) {
          card.bondedCards = bondedToMap.get(code);
        }
        if (duplicatesMap.has(code)) {
          card.duplicates = duplicatesMap.get(code);
        }
      }
    } else {
      // Already converted Card[]
      this.cards = new Map<string, Card>(cards.map((x) => [x.code, x]));
    }
  }

  /**
   * Type guard to determine if the array contains AhdbCard objects.
   * AhdbCard has properties like 'pack_code' that Card doesn't have.
   */
  private isAhdbCardArray(cards: AhdbCard[] | Card[]): cards is AhdbCard[] {
    return cards.length > 0 && 'pack_code' in cards[0];
  }

  /**
   * Get a `PlayerCard` by its code. Throw on not found.
   * Applies taboo modifications if a taboo list was provided.
   */
  public resolve(code: CardCode): Card {
    const card = this.cards.get(code);
    if (!card) {
      throw new Error(`Card not found: ${code}`);
    }
    const result = applyTabooToCard(card, this.taboo);
    return result.card;
  }

  /**
   * Get all resolved cards as an array.
   * Useful for sending card data to client-side without requiring CardResolver serialization.
   * Note: This returns cards WITHOUT taboo modifications applied.
   * Use resolve() to get individual cards with taboo applied.
   */
  public allResolvedCards(): Card[] {
    return Array.from(this.cards.values());
  }

  /**
   * Get the current taboo being applied, if any.
   */
  public getTaboo(): Taboo | null {
    return this.taboo;
  }
}

const defaultLanguage = 'en';

export interface LocalizedCardFields {
  name: string;
  subname?: string;
  text?: string;
  traits?: string[];
}

/**
 * An object that could convert `Card` with some of its `string` translated.
 * You can take this object into a UI component without current language if you set
 * the language into it beforehand.
 */
export class LocalizationResolver {
  /**
   * Maps from card code to a map of language code to translated string.
   */
  private localization: Map<string, Map<string, LocalizedCardFields>>;
  constructor(localization: Map<string, Map<string, LocalizedCardFields>>) {
    this.localization = localization;
  }

  public getLocalizedCard(card: Card, languageCode: string | undefined): Card {
    const localizedFields = this.localization.get(card.code);
    if (!localizedFields) {
      return card;
    }
    const localized = localizedFields.get(languageCode ?? defaultLanguage);
    if (!localized) {
      return card;
    }
    return {
      ...card,
      name: localized.name,
      subname: localized.subname,
      text: localized.text,
      traitsDisplay: localized.traits,
    };
  }
}
