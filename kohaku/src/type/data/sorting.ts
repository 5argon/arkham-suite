import type { Card } from './player-card.js';
import { CardType, Slot, WeaknessType, productOrdering } from '../game/index.js';
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
  // Then basic weakness, then signature weakness.
  const aWeakness = a.weakness;
  const bWeakness = b.weakness;
  if (aWeakness && !bWeakness) {
    return 1;
  }
  if (!aWeakness && bWeakness) {
    return -1;
  }
  if (aWeakness && bWeakness) {
    const priority = [WeaknessType.BasicWeakness, WeaknessType.Weakness];
    return priority.indexOf(aWeakness) - priority.indexOf(bWeakness);
  }
  switch (sortingType) {
    case 'position':
      return a.position - b.position;
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
