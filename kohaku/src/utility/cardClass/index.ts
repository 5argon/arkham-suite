import { CardClass, type ClassSlots } from '../../type/game/card-class.js';

/**
 * Check if the required class slots are contained within the card's class slots.
 */
export function classSlotsContains(
  cardClass: ClassSlots | undefined,
  requiredClass: ClassSlots | undefined
): boolean {
  if (cardClass === undefined || requiredClass === undefined) {
    return false;
  }

  const cardClasses = [cardClass.class1, cardClass.class2, cardClass.class3].filter(
    (c) => c !== undefined
  );
  const requiredClasses = [requiredClass.class1, requiredClass.class2, requiredClass.class3].filter(
    (c) => c !== undefined
  );

  return requiredClasses.every((rc) => cardClasses.includes(rc));
}

/**
 * Check if a card has multiple classes.
 */
export function isMulticlass(classSlots: ClassSlots | undefined): boolean {
  if (classSlots === undefined) {
    return false;
  }
  return classSlots.class2 !== undefined || classSlots.class3 !== undefined;
}

/**
 * Compare function for sorting ClassSlots.
 * Used for consistent ordering of card classes in the UI.
 */
export function classSlotsSorter(
  a: ClassSlots | undefined,
  b: ClassSlots | undefined
): number {
  if (a === undefined && b === undefined) {
    return 0;
  }
  if (a === undefined) {
    return 1;
  }
  if (b === undefined) {
    return -1;
  }

  const classOrder = [
    CardClass.Guardian,
    CardClass.Seeker,
    CardClass.Rogue,
    CardClass.Mystic,
    CardClass.Survivor,
    CardClass.Neutral,
  ];

  const aIndex = classOrder.indexOf(a.class1);
  const bIndex = classOrder.indexOf(b.class1);

  if (aIndex !== bIndex) {
    return aIndex - bIndex;
  }

  // If class1 is the same, compare class2
  const aIndex2 = a.class2 !== undefined ? classOrder.indexOf(a.class2) : 999;
  const bIndex2 = b.class2 !== undefined ? classOrder.indexOf(b.class2) : 999;

  if (aIndex2 !== bIndex2) {
    return aIndex2 - bIndex2;
  }

  // If class2 is also the same, compare class3
  const aIndex3 = a.class3 !== undefined ? classOrder.indexOf(a.class3) : 999;
  const bIndex3 = b.class3 !== undefined ? classOrder.indexOf(b.class3) : 999;

  return aIndex3 - bIndex3;
}
