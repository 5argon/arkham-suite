import type { Card } from './player-card.js';
import { CardType, Slot, WeaknessType, productOrdering, productRepackaged } from '../game/index.js';
import { isRandomBasicWeakness, getCommitPower } from '../../utility/card/index.js';
import * as cardClass from '../../utility/cardClass/index.js';

export type SortingType =
  | 'position'
  | 'name'
  | 'class'
  | 'level'
  | 'type'
  | 'slot'
  | 'set'
  | 'cost'
  | 'commitPower';

export function sorter(sortingType: SortingType, a: Card, b: Card): number {
  // Random Basic Weakness always last.
  if (isRandomBasicWeakness(a) && !isRandomBasicWeakness(b)) {
    return 1;
  }
  if (isRandomBasicWeakness(b) && !isRandomBasicWeakness(a)) {
    return -1;
  }
  switch (sortingType) {
    case 'position': {
      // Different products cannot be compared by position, fallback to same sorting as by set.
      if (a.product !== b.product) {
        const aIndex = productOrdering.indexOf(a.product);
        const bIndex = productOrdering.indexOf(b.product);
        return aIndex - bIndex;
      }

      // To make bonded sorting works, it need to assume the same sorting property
      // as the card it is bonded to, except when comparing with that card, then it should be sorted by position and come right behind it.
      const aBondedTo = a.bondedTo;
      const bBondedTo = b.bondedTo;

      const aBeforeBondedTo = a;
      const bBeforeBondedTo = b;

      // Overwrite incoming a and b with the bondedTo.
      a = aBondedTo ?? a;
      b = bBondedTo ?? b;

      // Position is not exactly sorting by collector's number.
      // If it is one of the repackaged products, sort according to how they came out of that box instead of by position.
      const isRepackaged = productRepackaged.includes(a.product);
      if (!isRepackaged) {
        return a.position - b.position;
      }
      // Repackaged product
      // Investigators and their restricted cards come first, grouped together by investigator.
      const aIsInvestigator = a.cardType === CardType.Investigator;
      const bIsInvestigator = b.cardType === CardType.Investigator;
      const aIsRestricted = a.restrictions !== undefined && a.restrictions.investigator.length > 0;
      const bIsRestricted = b.restrictions !== undefined && b.restrictions.investigator.length > 0;
      const aIsInvestigatorOrRestricted = aIsInvestigator || aIsRestricted;
      const bIsInvestigatorOrRestricted = bIsInvestigator || bIsRestricted;
      if (aIsInvestigatorOrRestricted && !bIsInvestigatorOrRestricted) {
        return -1;
      }
      if (!aIsInvestigatorOrRestricted && bIsInvestigatorOrRestricted) {
        return 1;
      }
      if (aIsInvestigatorOrRestricted && bIsInvestigatorOrRestricted) {
        const aInvestigatorCode = aIsInvestigator ? a.code : a.restrictions!.investigator[0].code;
        const bInvestigatorCode = bIsInvestigator ? b.code : b.restrictions!.investigator[0].code;
        if (aInvestigatorCode !== bInvestigatorCode) {
          return aInvestigatorCode.localeCompare(bInvestigatorCode);
        } else {
          return a.position - b.position;
        }
      }

      // Non-investigator and non-restricted cards are sorted by :
      // Non-weaknesses : class -> level -> type (asset, event, skill) -> position.
      // Bonded card should follow the main card no matter what.
      // Weaknesses : position.

      if (a.weakness !== undefined && b.weakness === undefined) {
        return 1;
      }
      if (a.weakness === undefined && b.weakness !== undefined) {
        return -1;
      }
      if (a.weakness !== undefined || b.weakness !== undefined) {
        return a.position - b.position;
      }
      const classSlots1 = a.cardClass;
      const classSlots2 = b.cardClass;
      const classComparison = cardClass.classSlotsSorter(classSlots1, classSlots2);
      if (classComparison !== 0) {
        return classComparison;
      }
      const levelComparison = (a.xp ?? -1) - (b.xp ?? -1);
      if (levelComparison !== 0) {
        return levelComparison;
      }
      const typePriority = [CardType.Asset, CardType.Event, CardType.Skill];
      const aTypeScore = typePriority.indexOf(a.cardType);
      const bTypeScore = typePriority.indexOf(b.cardType);
      if (aTypeScore !== bTypeScore) {
        return aTypeScore - bTypeScore;
      }
      return aBeforeBondedTo.position - bBeforeBondedTo.position;
    }
    case 'name':
      return a.name.localeCompare(b.name);
    case 'class': {
      const classSlots1 = a.cardClass;
      const classSlots2 = b.cardClass;
      return cardClass.classSlotsSorter(classSlots1, classSlots2);
    }
    case 'level':
      // Dashed XP (undefined) came before 0 XP.
      return (a.xp ?? -1) - (b.xp ?? -1);
    case 'type': {
      const priority = [CardType.Asset, CardType.Event, CardType.Skill];
      const aScore = priority.indexOf(a.cardType);
      const bScore = priority.indexOf(b.cardType);
      return aScore - bScore;
    }
    case 'slot': {
      const aSlots = a.slots;
      const bSlots = b.slots;
      if (aSlots && bSlots) {
        const priority = [
          Slot.Hand,
          Slot.HandX2,
          Slot.Arcane,
          Slot.ArcaneX2,
          Slot.Ally,
          Slot.Accessory,
          Slot.Body,
          Slot.Tarot,
        ];
        for (let i = 0; i < Math.min(aSlots.length, bSlots.length); i++) {
          const aScore = priority.indexOf(aSlots[i]);
          const bScore = priority.indexOf(bSlots[i]);
          if (aScore !== bScore) {
            return aScore - bScore;
          }
        }
        return aSlots.length - bSlots.length;
      } else {
        if (aSlots === undefined && bSlots === undefined) {
          return 0;
        }
        if (aSlots !== undefined && bSlots === undefined) {
          return -1;
        }
        if (aSlots === undefined && bSlots !== undefined) {
          return 1;
        }
        return 0;
      }
    }
    case 'set': {
      const aIndex = productOrdering.indexOf(a.product);
      const bIndex = productOrdering.indexOf(b.product);
      return aIndex - bIndex;
    }
    case 'cost': {
      // Undefined cost or X cost came last
      const aCost = a.cost === undefined || a.cost === null || a.cost === 'x' ? 999 : a.cost;
      const bCost = b.cost === undefined || b.cost === null || b.cost === 'x' ? 999 : b.cost;
      return aCost - bCost;
    }
    case 'commitPower':
      return getCommitPower(a) - getCommitPower(b);
  }
}
