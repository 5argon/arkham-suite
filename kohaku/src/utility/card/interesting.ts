import {
  Deck,
  Card,
  CardClass,
  CardCode,
  DecodedMeta,
  CardQuantity,
} from '../../type/index.js';
import * as cardClass from '../cardClass/index.js';
import { resolveCustomizableLevel } from './customizable.js';

export const boringPermanentCards = [
  '01694', // Charisma
  '01695', // Relic Hunter
  '02157', // Relic Hunter
  '02158', // Charisma
  '02185', // Keen Eye
  '02187', // Higher Education
  '02189', // Streetwise
  '02193', // Scrapper
  '03264', // Stick to the Plan
  '03308', // Charon's Obol: The Ferryman's Pay
  '04106', // Shrewd Analysis
  '04109', // Arcane Research
  '05276', // Studious
  '05278', // Another Day, Another Dollar
  '08059', // Down the Rabbit Hole
  '08125', // In the Thick of It
  '10132', // Occult Reliquary
  '54013', // Observed
];

export const interestingPermanentCards = [
  '02110', // Adaptable
  '02191', // Blood Pact
  '03010', // On Your Own
  '06167', // Versatile
  '07110', // Sacred Covenant
  '07113', // Blasphemous Covenant
  '07116', // False Covenant
  '07120', // Paradoxical Covenant
  '07122', // Ancient Covenant
  '07303', // Ancestral Knowledge
  '08019', // Geared Up
  '08031', // Forced Learning
  '08046', // Underworld Support
  '08071', // Short Supply
  '09077', // Underworld Market
  '09094', // Sin-Eater
  '09123', // Soul Sanctification
  '10079', // Bewitching
  '10127', // Dark Horse
  '53010', // On Your Own
  '60232', // Miskatonic Archaeology Funding
  '60530', // Quick Learner
  '60531', // Déjà Vu
];

const overlySimpleCards = [
  '01025', // Vicious Blow
  '01039', // Deduction
  '01059', // Holy Rosary
  '01063', // Arcane Initiate
  '01065', // Ward of Protection
  '01072', // Leather Coat
  '01080', // Lucky!
  '01094', // Bulletproof Vest
  '01095', // Elder Sign Amulet
  '01525', // Vicious Blow
  '01539', // Deduction
  '01559', // Holy Rosary
  '01563', // Arcane Initiate
  '01565', // Ward of Protection
  '01572', // Leather Coat
  '01580', // Lucky!
  '01594', // Bulletproof Vest
  '01595', // Elder Sign Amulet
  '60119', // Vicious Blow
  '60219', // Deduction
  '02227', // Inquiring Mind
  '03114', // Cherished Keepsake
];

export function interestingSorter(deck: Deck, a: Card, b: Card): number {
  // Neutral cards with low level are less interesting.
  function isNeutralLowLevel(c: Card): boolean {
    return c.cardClass?.class1 === CardClass.Neutral && (c.xp ?? 0) <= 2;
  }

  if (isNeutralLowLevel(a) && !isNeutralLowLevel(b)) {
    return 1;
  }
  if (!isNeutralLowLevel(a) && isNeutralLowLevel(b)) {
    return -1;
  }

  const meta = deck.meta;
  const aXp = meta ? resolveCustomizableLevel(a, meta) : a.xp;
  const bXp = meta ? resolveCustomizableLevel(b, meta) : b.xp;
  // Sort by XP first.
  if (aXp !== bXp) {
    return (bXp ?? 0) - (aXp ?? 0);
  }
  const investigator = deck.meta.alternateBack ? deck.meta.alternateBack : deck.investigator;
  // Less interesting when card has the same class as the investigator.
  if (
    cardClass.classSlotsContains(a.cardClass, investigator.cardClass) &&
    !cardClass.classSlotsContains(b.cardClass, investigator.cardClass)
  ) {
    return 1;
  }
  if (
    !cardClass.classSlotsContains(a.cardClass, investigator.cardClass) &&
    cardClass.classSlotsContains(b.cardClass, investigator.cardClass)
  ) {
    return -1;
  }
  // Neutral is not as interesting as other classes.
  if (a.cardClass?.class1 === CardClass.Neutral && b.cardClass?.class1 !== CardClass.Neutral) {
    return 1;
  }
  if (a.cardClass?.class1 !== CardClass.Neutral && b.cardClass?.class1 === CardClass.Neutral) {
    return -1;
  }
  return 0;
}

/**
 * All interesting cards are ranked in order, but in the limited amount, maybe
 * we should also pick less interesting ones for the sake of representing that investigator's
 * deckbuilding options. For example, Agnes Baker can use 0-5 Mystic and 0-2 Survivor cards.
 * Even if deck is full of interesting Survivor cards, if user requested 5 representative cards,
 * it should be a mix of Mystic and Survivor cards inside that amount.
 */
function curateAccordingToInvestigator(
  deck: Deck,
  allInterestingCards: Card[],
  amount: number
): Card[] {
  // TODO: Take investigator's deckbuilding option into account.
  // TODO: Splash cards are more interesting than any other cards of the same level as them.
  return allInterestingCards.slice(0, amount);
}

export function isWeaknessRestrictionPermanent(card: Card): boolean {
  return card.weakness !== undefined || card.restrictions !== undefined || card.permanent;
}

/**
 * Get some interesting cards from the deck. Namely higher leveled cards,
 * but in the case of ties there are algorithm that choose the most interesting one
 * depending on investigator used. This never choose permanent cards.
 * You can allow side deck for 0 XP deck with interesting cards planned in the Side Deck.
 */
export function getInterestingCards(
  deck: Deck,
  amount: number,
  allowSideDeck?: boolean,
  excludeCardCodes?: CardCode[]
): Card[] {
  const cardQuantities : CardQuantity[] = allowSideDeck ? deck.mainDeck.concat(deck.sideDeck) : deck.mainDeck;
  const cardsNoDuplicate: Card[] = []
  const seenCodes = new Set<CardCode>();
  for (const cq of cardQuantities) {
    if (!seenCodes.has(cq.card.code)) {
      cardsNoDuplicate.push(cq.card);
      seenCodes.add(cq.card.code);
    }
  }
  const allInterestingCards = cardsNoDuplicate
    .filter(
      (c) =>
        !boringPermanentCards.includes(c.code) &&
        !interestingPermanentCards.includes(c.code) &&
        !overlySimpleCards.includes(c.code) &&
        !isWeaknessRestrictionPermanent(c) &&
        !excludeCardCodes?.includes(c.code)
    );
  const sorted = allInterestingCards.sort((a, b) => interestingSorter(deck, a, b));
  const curated = curateAccordingToInvestigator(deck, sorted, amount);
  return curated;
}

export function getInterestingPermanentCards(
  deck: Deck,
  amount: number,
  allowSideDeck?: boolean,
  excludeCardCodes?: CardCode[]
): Card[] {
  const cardQuantities = allowSideDeck ? deck.mainDeck.concat(deck.sideDeck) : deck.mainDeck;
  const cardsNoDuplicate: Card[] = []
  const seenCodes = new Set<CardCode>();
  for (const cq of cardQuantities) {
    if (!seenCodes.has(cq.card.code)) {
      cardsNoDuplicate.push(cq.card);
      seenCodes.add(cq.card.code);
    }
  }
  const allInterestingCards = cardsNoDuplicate
    .filter(
      (c) => interestingPermanentCards.includes(c.code) && !excludeCardCodes?.includes(c.code)
    );
  const candidates = allInterestingCards.slice(0, amount);
  return candidates;
}
