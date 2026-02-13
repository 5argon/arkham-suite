import { CardQuantity, Deck, DeckOption } from '../../type/index.js';
import { doesCardQualifiedDeckOption } from '../card/who.js';

export interface FindSplashResult {
  option: DeckOption;
  splashes: CardQuantity[];
}

/**
 * Every cards in the deck checks against every deck options of that investigator.
 * If card only match one option which is limited, that is a splash card.
 */
export function findSplashCards(deck: Deck): FindSplashResult[] {
  const backInvestigator = deck.meta.alternateBack ?? deck.investigator;
  const options = backInvestigator.deckOptions;
  if (!options) {
    return [];
  }
  const limitedOptions = options.filter((option) => option.limit !== undefined);
  if (!limitedOptions) {
    return [];
  }
  const splashes: FindSplashResult[] = [];
  for (const card of deck.mainDeck) {
    let rememberLimitedOption: DeckOption | undefined = undefined;
    let mightBeSplash = true;
    for (const option of options) {
      const isLimitedOption = option.limit !== undefined;
      const result = doesCardQualifiedDeckOption(backInvestigator, card.card, option, deck.meta);
      if (result === 'pass') {
        if (isLimitedOption) {
          // Might be splash card, if it only matches one limited option.
          if (!rememberLimitedOption) {
            rememberLimitedOption = option;
            break;
          } else {
            throw new Error('Card matches multiple limited options?');
          }
        } else {
          mightBeSplash = false;
          break;
        }
      }
    }
    if (rememberLimitedOption && mightBeSplash) {
      const findResult = splashes.find((x) => x.option === rememberLimitedOption);
      if (findResult) {
        findResult.splashes.push(card);
      } else {
        splashes.push({ option: rememberLimitedOption, splashes: [card] });
      }
    }
  }
  return splashes;
}
