import { Card, DecodedMeta } from '../../type/index.js';

/**
 * If input card is Customizable, return its actual level when factored in the
 * customizable meta. Otherwise, return the card's level.
 */
export function resolveCustomizableLevel(card: Card, meta: DecodedMeta): Card['xp'] {
  const isCustomizable = card.customizationOptions !== undefined;
  if (!isCustomizable) {
    return card.xp;
  }
  const custMeta = meta.customizableMetas;
  const checkedEntries = custMeta?.filter(
    (x) => x.forCustomizableCard === card.code && x.checked > 0
  );
  if (checkedEntries === undefined || checkedEntries.length === 0) {
    return card.xp;
  }
  const totalChecked = checkedEntries.reduce((acc, x) => acc + x.checked, 0);
  return Math.ceil(totalChecked / 2);
}

export function resolveCustomizableTags(card: Card, meta: DecodedMeta): Card['tags'] {
  const options = card.customizationOptions;
  if (!options) {
    return card.tags;
  }
  const custMeta = meta.customizableMetas;
  const checkedEntries = custMeta?.filter(
    (x) => x.forCustomizableCard === card.code && x.checked > 0
  );
  if (checkedEntries === undefined || checkedEntries.length === 0) {
    return card.tags;
  }
  const newTags: Set<string> = new Set();
  if (card.tags) {
    card.tags.forEach((x) => newTags.add(x));
  }
  for (let i = 0; i < checkedEntries.length; i++) {
    const entry = checkedEntries[i];
    if (options.length <= entry.index) {
      throw new Error(`Customizable card ${card.code} has less options than checked entries.`);
    }
    const optionAtEntryIndex = options[entry.index];
    const completelyChecked = entry.checked >= optionAtEntryIndex.xp;
    if (completelyChecked && optionAtEntryIndex.tags) {
      optionAtEntryIndex.tags.forEach((x) => newTags.add(x));
    }
  }
  return Array.from(newTags);
}
