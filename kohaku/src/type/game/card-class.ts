import { Product } from "./product.js";

/**
 * Includes Neutral despite not an actual class of AHLCG.
 */
export enum CardClass {
  Guardian = 'guardian',
  Seeker = 'seeker',
  Rogue = 'rogue',
  Mystic = 'mystic',
  Survivor = 'survivor',
  Neutral = 'neutral',
}

/**
 * Possible amount of classes that could be on a single card.
 */
export interface ClassSlots {
  /**
   * Required, use Neutral if the card has no class.
   */
  class1: CardClass;
  class2?: CardClass;
  class3?: CardClass;
}

export function amountOfClasses(classSlots: ClassSlots | undefined): number {
  if (classSlots === undefined) {
    return 0;
  }
  let count = 1; // class1 is always present
  if (classSlots.class2 !== undefined) {
    count++;
  }
  if (classSlots.class3 !== undefined) {
    count++;
  }
  return count;
}