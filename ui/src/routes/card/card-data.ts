import type { AhdbCard, AhdbTaboo } from '@5argon/arkham-kohaku';
import allCardsJson from './cards.json' with { type: 'json' };
import allTaboosJson from './taboos.json' with { type: 'json' };

export const allCards: AhdbCard[] = allCardsJson as AhdbCard[];
export const allAhdbTaboos: AhdbTaboo[] = allTaboosJson as AhdbTaboo[];
