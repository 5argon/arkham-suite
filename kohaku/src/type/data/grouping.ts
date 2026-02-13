import type { Card } from './player-card.js';
import { CardType, CardClass, Product, Slot, productOrdering } from '../game/index.js';
import { getCommitPower } from '../../utility/card/index.js';

/**
 * What UI allows you to select for grouping.
 */
export type GroupingType = 'default' | 'set' | 'cost' | 'slot' | 'level' | 'levelGrouped' | 'class' | 'commitPower' | 'none';

/**
 * All possible grouping keys - both static and dynamic.
 * Static keys map directly to fixed labels.
 * Dynamic keys require inspecting the first item's card to determine the label.
 */
export enum GroupingKey {
  // Default grouping keys
  Asset = 'asset',
  Event = 'event',
  Skill = 'skill',
  PermanentWeakness = 'permanent-weakness',
  
  // Slot grouping keys
  SlotAlly = 'slot-ally',
  SlotAccessory = 'slot-accessory',
  SlotArcane = 'slot-arcane',
  SlotArcaneX2 = 'slot-arcane-x2',
  SlotBody = 'slot-body',
  SlotHand = 'slot-hand',
  SlotHandX2 = 'slot-hand-x2',
  SlotTarot = 'slot-tarot',
  SlotNone = 'slot-none',
  SlotMultiple = 'slot-multiple',
  
  // Cost grouping keys
  Cost0 = 'cost-0',
  Cost1 = 'cost-1',
  Cost2 = 'cost-2',
  Cost3 = 'cost-3',
  Cost4 = 'cost-4',
  Cost5 = 'cost-5',
  Cost6Plus = 'cost-6-plus',
  CostX = 'cost-x',
  CostNone = 'cost-none',
  
  // Level grouping keys
  LevelNone = 'level-none',
  Level0 = 'level-0',
  Level1 = 'level-1',
  Level2 = 'level-2',
  Level3 = 'level-3',
  Level4 = 'level-4',
  Level5 = 'level-5',
  Level1To5 = 'level-1-to-5',
  
  // Commit power grouping keys
  CommitPower0 = 'commit-power-0',
  CommitPower1 = 'commit-power-1',
  CommitPower2 = 'commit-power-2',
  CommitPower3 = 'commit-power-3',
  CommitPower4Plus = 'commit-power-4-plus',
  
  // Dynamic grouping keys (require reading card data)
  Set = 'set',
  Class = 'class',
}

/**
 * Result of grouping operation.
 */
export interface GroupedResult<T> {
  groupingKey: GroupingKey;
  /**
   * If true, the groupingKey alone is not enough to determine the label.
   * The caller should inspect the first item's card to get additional data
   * (e.g., product for Set grouping, cardClass for Class grouping).
   */
  dynamicGrouping: boolean;
  items: T[];
  /**
   * For dynamic grouping, this contains the value that differentiates groups.
   * For Set: Product enum value
   * For Class: CardClass enum value
   */
  dynamicValue?: Product | CardClass;
  preferSide?: 'left' | 'right';
}

/**
 * Item wrapper that associates data with a card.
 */
export interface CardItemWrapper<T> {
  item: T;
  card: Card;
}

/**
 * Group items by the specified grouping type.
 * Returns an array of grouped results with grouping keys.
 */
export function groupByType<T>(
  items: CardItemWrapper<T>[],
  groupingType: GroupingType
): GroupedResult<T>[] {
  switch (groupingType) {
    case 'default':
      return [
        ...groupAssets(items),
        ...groupPermanentWeakness(items),
        ...groupEvents(items),
        ...groupSkills(items),
      ];
    case 'set':
      return groupBySet(items);
    case 'cost':
      return groupByCost(items);
    case 'slot':
      return groupBySlot(items);
    case 'level':
      return groupByLevel(items);
    case 'levelGrouped':
      return groupByLevelGrouped(items);
    case 'class':
      return groupByClass(items);
    case 'commitPower':
      return groupByCommitPower(items);
    case 'none':
      return [];
  }
}

function groupAssets<T>(items: CardItemWrapper<T>[]): GroupedResult<T>[] {
  const filtered = items.filter((wrapper) => {
    const card = wrapper.card;
    return (
      card.cardType === CardType.Asset &&
      card.weakness === undefined &&
      card.permanent !== true
    );
  });
  return filtered.length > 0
    ? [{
        groupingKey: GroupingKey.Asset,
        dynamicGrouping: false,
        items: filtered.map(w => w.item),
        preferSide: 'left',
      }]
    : [];
}

function groupEvents<T>(items: CardItemWrapper<T>[]): GroupedResult<T>[] {
  const filtered = items.filter((wrapper) => {
    const card = wrapper.card;
    return card.cardType === CardType.Event && card.weakness === undefined;
  });
  return filtered.length > 0
    ? [{
        groupingKey: GroupingKey.Event,
        dynamicGrouping: false,
        items: filtered.map(w => w.item),
        preferSide: 'right',
      }]
    : [];
}

function groupSkills<T>(items: CardItemWrapper<T>[]): GroupedResult<T>[] {
  const filtered = items.filter((wrapper) => {
    const card = wrapper.card;
    return card.cardType === CardType.Skill && card.weakness === undefined;
  });
  return filtered.length > 0
    ? [{
        groupingKey: GroupingKey.Skill,
        dynamicGrouping: false,
        items: filtered.map(w => w.item),
        preferSide: 'right',
      }]
    : [];
}

function groupPermanentWeakness<T>(items: CardItemWrapper<T>[]): GroupedResult<T>[] {
  const filtered = items.filter((wrapper) => {
    const card = wrapper.card;
    return (
      (card.cardType === CardType.Asset &&
        card.weakness === undefined &&
        card.permanent === true) ||
      card.weakness !== undefined
    );
  });
  return filtered.length > 0
    ? [{
        groupingKey: GroupingKey.PermanentWeakness,
        dynamicGrouping: false,
        items: filtered.map(w => w.item),
        preferSide: 'left',
      }]
    : [];
}

function groupBySlot<T>(items: CardItemWrapper<T>[]): GroupedResult<T>[] {
  const groups: GroupedResult<T>[] = [];
  
  const allySlot = items.filter(w => w.card.slots?.length === 1 && w.card.slots[0] === Slot.Ally);
  if (allySlot.length > 0) groups.push({ groupingKey: GroupingKey.SlotAlly, dynamicGrouping: false, items: allySlot.map(w => w.item) });
  
  const accessorySlot = items.filter(w => w.card.slots?.length === 1 && w.card.slots[0] === Slot.Accessory);
  if (accessorySlot.length > 0) groups.push({ groupingKey: GroupingKey.SlotAccessory, dynamicGrouping: false, items: accessorySlot.map(w => w.item) });
  
  const arcaneslot = items.filter(w => w.card.slots?.length === 1 && w.card.slots[0] === Slot.Arcane);
  if (arcaneslot.length > 0) groups.push({ groupingKey: GroupingKey.SlotArcane, dynamicGrouping: false, items: arcaneslot.map(w => w.item) });
  
  const twoArcaneslot = items.filter(w => w.card.slots?.length === 1 && w.card.slots[0] === Slot.ArcaneX2);
  if (twoArcaneslot.length > 0) groups.push({ groupingKey: GroupingKey.SlotArcaneX2, dynamicGrouping: false, items: twoArcaneslot.map(w => w.item) });
  
  const bodyslot = items.filter(w => w.card.slots?.length === 1 && w.card.slots[0] === Slot.Body);
  if (bodyslot.length > 0) groups.push({ groupingKey: GroupingKey.SlotBody, dynamicGrouping: false, items: bodyslot.map(w => w.item) });
  
  const handslot = items.filter(w => w.card.slots?.length === 1 && w.card.slots[0] === Slot.Hand);
  if (handslot.length > 0) groups.push({ groupingKey: GroupingKey.SlotHand, dynamicGrouping: false, items: handslot.map(w => w.item) });
  
  const twoHandslot = items.filter(w => w.card.slots?.length === 1 && w.card.slots[0] === Slot.HandX2);
  if (twoHandslot.length > 0) groups.push({ groupingKey: GroupingKey.SlotHandX2, dynamicGrouping: false, items: twoHandslot.map(w => w.item) });
  
  const tarotslot = items.filter(w => w.card.slots?.length === 1 && w.card.slots[0] === Slot.Tarot);
  if (tarotslot.length > 0) groups.push({ groupingKey: GroupingKey.SlotTarot, dynamicGrouping: false, items: tarotslot.map(w => w.item) });
  
  const noSlot = items.filter(w => w.card.slots === undefined || w.card.slots.length === 0);
  if (noSlot.length > 0) groups.push({ groupingKey: GroupingKey.SlotNone, dynamicGrouping: false, items: noSlot.map(w => w.item) });
  
  const multipleSlots = items.filter(w => w.card.slots !== undefined && w.card.slots.length > 1);
  if (multipleSlots.length > 0) groups.push({ groupingKey: GroupingKey.SlotMultiple, dynamicGrouping: false, items: multipleSlots.map(w => w.item) });
  
  return groups;
}

function groupByCost<T>(items: CardItemWrapper<T>[]): GroupedResult<T>[] {
  const groups: GroupedResult<T>[] = [];
  
  const cost0 = items.filter(w => w.card.cost === 0);
  if (cost0.length > 0) groups.push({ groupingKey: GroupingKey.Cost0, dynamicGrouping: false, items: cost0.map(w => w.item) });
  
  const cost1 = items.filter(w => w.card.cost === 1);
  if (cost1.length > 0) groups.push({ groupingKey: GroupingKey.Cost1, dynamicGrouping: false, items: cost1.map(w => w.item) });
  
  const cost2 = items.filter(w => w.card.cost === 2);
  if (cost2.length > 0) groups.push({ groupingKey: GroupingKey.Cost2, dynamicGrouping: false, items: cost2.map(w => w.item) });
  
  const cost3 = items.filter(w => w.card.cost === 3);
  if (cost3.length > 0) groups.push({ groupingKey: GroupingKey.Cost3, dynamicGrouping: false, items: cost3.map(w => w.item) });
  
  const cost4 = items.filter(w => w.card.cost === 4);
  if (cost4.length > 0) groups.push({ groupingKey: GroupingKey.Cost4, dynamicGrouping: false, items: cost4.map(w => w.item) });
  
  const cost5 = items.filter(w => w.card.cost === 5);
  if (cost5.length > 0) groups.push({ groupingKey: GroupingKey.Cost5, dynamicGrouping: false, items: cost5.map(w => w.item) });
  
  const cost6Plus = items.filter(w => typeof w.card.cost === 'number' && w.card.cost >= 6);
  if (cost6Plus.length > 0) groups.push({ groupingKey: GroupingKey.Cost6Plus, dynamicGrouping: false, items: cost6Plus.map(w => w.item) });
  
  const costX = items.filter(w => w.card.cost === 'x');
  if (costX.length > 0) groups.push({ groupingKey: GroupingKey.CostX, dynamicGrouping: false, items: costX.map(w => w.item) });
  
  const noCost = items.filter(w => w.card.cost === undefined);
  if (noCost.length > 0) groups.push({ groupingKey: GroupingKey.CostNone, dynamicGrouping: false, items: noCost.map(w => w.item) });
  
  return groups;
}

function groupByLevel<T>(items: CardItemWrapper<T>[]): GroupedResult<T>[] {
  const groups: GroupedResult<T>[] = [];
  
  const noLevel = items.filter(w => w.card.xp === undefined);
  if (noLevel.length > 0) groups.push({ groupingKey: GroupingKey.LevelNone, dynamicGrouping: false, items: noLevel.map(w => w.item) });
  
  const level0 = items.filter(w => w.card.xp === 0);
  if (level0.length > 0) groups.push({ groupingKey: GroupingKey.Level0, dynamicGrouping: false, items: level0.map(w => w.item) });
  
  const level1 = items.filter(w => w.card.xp === 1);
  if (level1.length > 0) groups.push({ groupingKey: GroupingKey.Level1, dynamicGrouping: false, items: level1.map(w => w.item) });
  
  const level2 = items.filter(w => w.card.xp === 2);
  if (level2.length > 0) groups.push({ groupingKey: GroupingKey.Level2, dynamicGrouping: false, items: level2.map(w => w.item) });
  
  const level3 = items.filter(w => w.card.xp === 3);
  if (level3.length > 0) groups.push({ groupingKey: GroupingKey.Level3, dynamicGrouping: false, items: level3.map(w => w.item) });
  
  const level4 = items.filter(w => w.card.xp === 4);
  if (level4.length > 0) groups.push({ groupingKey: GroupingKey.Level4, dynamicGrouping: false, items: level4.map(w => w.item) });
  
  const level5 = items.filter(w => w.card.xp === 5);
  if (level5.length > 0) groups.push({ groupingKey: GroupingKey.Level5, dynamicGrouping: false, items: level5.map(w => w.item) });
  
  return groups;
}

function groupByLevelGrouped<T>(items: CardItemWrapper<T>[]): GroupedResult<T>[] {
  const groups: GroupedResult<T>[] = [];
  
  const noLevel = items.filter(w => w.card.xp === undefined);
  if (noLevel.length > 0) groups.push({ groupingKey: GroupingKey.LevelNone, dynamicGrouping: false, items: noLevel.map(w => w.item) });
  
  const level0 = items.filter(w => w.card.xp === 0);
  if (level0.length > 0) groups.push({ groupingKey: GroupingKey.Level0, dynamicGrouping: false, items: level0.map(w => w.item) });
  
  const level1to5 = items.filter(w => typeof w.card.xp === 'number' && w.card.xp >= 1 && w.card.xp <= 5);
  if (level1to5.length > 0) groups.push({ groupingKey: GroupingKey.Level1To5, dynamicGrouping: false, items: level1to5.map(w => w.item) });
  
  return groups;
}

function groupByClass<T>(items: CardItemWrapper<T>[]): GroupedResult<T>[] {
  const classMap = new Map<CardClass, CardItemWrapper<T>[]>();
  
  for (const wrapper of items) {
    const primaryClass = wrapper.card.cardClass?.class1 ?? CardClass.Neutral;
    if (!classMap.has(primaryClass)) {
      classMap.set(primaryClass, []);
    }
    classMap.get(primaryClass)!.push(wrapper);
  }
  
  const classOrder = [CardClass.Guardian, CardClass.Seeker, CardClass.Rogue, CardClass.Mystic, CardClass.Survivor, CardClass.Neutral];
  const sortedClasses = Array.from(classMap.keys()).sort((a, b) => classOrder.indexOf(a) - classOrder.indexOf(b));
  
  return sortedClasses.map((cardClass) => ({
    groupingKey: GroupingKey.Class,
    dynamicGrouping: true,
    dynamicValue: cardClass,
    items: classMap.get(cardClass)!.map(w => w.item),
  }));
}

function groupBySet<T>(items: CardItemWrapper<T>[]): GroupedResult<T>[] {
  const productMap = new Map<Product, CardItemWrapper<T>[]>();
  
  for (const wrapper of items) {
    const product = wrapper.card.product;
    if (!productMap.has(product)) {
      productMap.set(product, []);
    }
    productMap.get(product)!.push(wrapper);
  }
  
  const sortedProducts = Array.from(productMap.keys()).sort((a, b) => {
    const aIndex = productOrdering.indexOf(a);
    const bIndex = productOrdering.indexOf(b);
    return aIndex - bIndex;
  });
  
  return sortedProducts.map((product) => ({
    groupingKey: GroupingKey.Set,
    dynamicGrouping: true,
    dynamicValue: product,
    items: productMap.get(product)!.map(w => w.item),
  }));
}

function groupByCommitPower<T>(items: CardItemWrapper<T>[]): GroupedResult<T>[] {
  const groups: GroupedResult<T>[] = [];
  
  const power0 = items.filter(w => getCommitPower(w.card) === 0);
  if (power0.length > 0) groups.push({ groupingKey: GroupingKey.CommitPower0, dynamicGrouping: false, items: power0.map(w => w.item) });
  
  const power1 = items.filter(w => getCommitPower(w.card) === 1);
  if (power1.length > 0) groups.push({ groupingKey: GroupingKey.CommitPower1, dynamicGrouping: false, items: power1.map(w => w.item) });
  
  const power2 = items.filter(w => getCommitPower(w.card) === 2);
  if (power2.length > 0) groups.push({ groupingKey: GroupingKey.CommitPower2, dynamicGrouping: false, items: power2.map(w => w.item) });
  
  const power3 = items.filter(w => getCommitPower(w.card) === 3);
  if (power3.length > 0) groups.push({ groupingKey: GroupingKey.CommitPower3, dynamicGrouping: false, items: power3.map(w => w.item) });
  
  const power4Plus = items.filter(w => getCommitPower(w.card) >= 4);
  if (power4Plus.length > 0) groups.push({ groupingKey: GroupingKey.CommitPower4Plus, dynamicGrouping: false, items: power4Plus.map(w => w.item) });
  
  return groups;
}
