import { Card, CardClass, DeckOption, DecodedMeta } from '../../type/index.js';
import * as cardClass from '../cardClass/index.js';
import { resolveCustomizableLevel } from './customizable.js';

export function canUse(investigator: Card, withThisMeta: DecodedMeta, canUseCard: Card): boolean {
  if (investigator.deckOptions === undefined) {
    return false;
  }
  const results = investigator.deckOptions.map((x) =>
    doesCardQualifiedDeckOption(investigator, canUseCard, x, withThisMeta)
  );
  return (
    results.includes('pass') &&
    !results.includes('fail')
  );
}

export function doesCardQualifiedDeckOption(
  investigator: Card,
  card: Card,
  opt: DeckOption,
  withThisMeta: DecodedMeta
): 'pass' | 'fail' | 'next' {
  const cardRestrictions = card.restrictions;
  if (cardRestrictions !== undefined) {
    let hasTraitRestriction = false;
    let passedTraitRestriction = false;
    let hasInvestigatorRestriction = false;
    let passedInvestigatorRestriction = false;
    const investigatorTraits: string[] = investigator.traits?.map((x) => x.toLowerCase()) ?? [];

    if (cardRestrictions.investigator !== undefined) {
      hasInvestigatorRestriction = true;
      cardRestrictions.investigatorCardCodes.forEach((k) => {
        if (k === investigator.code || k === investigator.alternateOfCardCode) {
          passedInvestigatorRestriction = true;
        }
      });
    } else if (cardRestrictions.trait !== undefined) {
      hasTraitRestriction = true;
      cardRestrictions.trait.forEach((k) => {
        if (investigatorTraits?.includes(k.toLowerCase())) {
          passedTraitRestriction = true;
        }
      });
    }
    if (hasTraitRestriction && !passedTraitRestriction) {
      return 'fail';
    }
    if (hasInvestigatorRestriction && !passedInvestigatorRestriction) {
      return 'fail';
    }
    if (hasInvestigatorRestriction && passedInvestigatorRestriction) {
      return 'pass';
    }
  }

  if (opt.trait !== undefined) {
    const optTraits = opt.trait;
    const smallTraits = card.traits?.map((x) => {
      return x.toLowerCase();
    });
    if (smallTraits === undefined) {
      return 'next';
    }
    const traitQualify = smallTraits.find((x) => {
      const found = optTraits.includes(x);
      const parallelRexCode = '90078';
      if (investigator.code === parallelRexCode && found) {
        // Turn into not found if card is also Cursed.
        if (smallTraits.includes('cursed')) {
          return !found;
        }
      } else {
        return found;
      }
    });
    if (!traitQualify) {
      return 'next';
    }
  }

  if (opt.faction !== undefined) {
    // Go next if not matching any of the option's factions.
    const foundQualify = opt.faction.find((x) => {
      return cardClass.classSlotsContains(card.cardClass, { class1: x });
    });
    if (!foundQualify) {
      return 'next';
    }
  }

  if (opt.factionSelect !== undefined) {
    let selectedClass: CardClass;
    if (opt.id === 'faction_1') {
      if (withThisMeta.faction1) {
        selectedClass = withThisMeta.faction1;
      } else {
        return 'next';
      }
    } else if (opt.id === 'faction_2') {
      if (withThisMeta.faction2) {
        selectedClass = withThisMeta.faction2;
      } else {
        return 'next';
      }
    } else if (opt.id === undefined) {
      if (withThisMeta.factionSelected) {
        selectedClass = withThisMeta.factionSelected;
      } else {
        return 'next';
      }
    } else {
      throw new Error('Unknown faction select');
    }
    if (!cardClass.classSlotsContains({ class1: selectedClass }, card.cardClass)) {
      return 'next';
    }
  }

  if (opt.level !== undefined) {
    const min = opt.baseLevel !== undefined ? opt.baseLevel.min : opt.level.min;
    const max = opt.baseLevel !== undefined ? opt.baseLevel.max : opt.level.max;
    const cardXp = resolveCustomizableLevel(card, withThisMeta);
    if (cardXp === undefined) {
      return 'next';
    }
    if (cardXp < min) {
      return 'next';
    }
    if (cardXp > max) {
      return 'next';
    }
  }

  if (opt.tag !== undefined) {
    const optTag = opt.tag;
    if (card.tags === undefined) {
      return 'next';
    }
    const tagQualify = card.tags.find((x) => {
      return optTag.includes(x);
    });
    if (!tagQualify) {
      return 'next';
    }
  }

  if (opt.type !== undefined) {
    const found = opt.type.find((x) => {
      if (card.cardType === x) {
        return true;
      }
    });
    if (!found) {
      return 'next';
    }
  }

  if (opt.uses !== undefined) {
    const found = opt.uses.find((x) => {
      const pattern = `Uses (.* ${x})`;
      const match = card.text?.match(new RegExp(pattern)) ?? null;
      return match !== null;
    });
    if (!found) {
      return 'next';
    }
  }

  if (opt.optionSelect !== undefined) {
    if (withThisMeta.optionSelected !== undefined) {
      const selectedOption = opt.optionSelect.find((x) => x.id === withThisMeta.optionSelected);
      if (selectedOption) {
        const result = doesCardQualifiedDeckOption(investigator, card, selectedOption, withThisMeta);
        if (result === 'next' || result === 'fail') {
          return 'next';
        }
      } else {
        return 'next';
      }
    } else {
      return 'next';
    }
  }

  if (opt.permanent !== undefined && opt.permanent === true) {
    if (!card.permanent) {
      return 'next';
    }
  }

  if (opt.not !== undefined && opt.not === true) {
    return 'fail';
  }
  return 'pass';
}
