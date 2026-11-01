import { describe, expect, it } from 'vitest';

import type { Card } from '../src/type/data/player-card.js';
import { sorter } from '../src/type/data/sorting.js';
import { CardClass } from '../src/type/game/card-class.js';
import { CardType, WeaknessType } from '../src/type/game/card-type.js';
import { Product } from '../src/type/game/product.js';

function card(code: string, overrides: Partial<Card>): Card {
  return {
    code,
    name: code,
    cardType: CardType.Asset,
    cardClass: { class1: CardClass.Neutral },
    product: Product.CoreSet2026,
    position: 1,
    xp: 0,
    ...overrides,
  } as Card;
}

const sorted = (cards: Card[], type: 'box-order' | 'position' = 'box-order') =>
  [...cards].sort((a, b) => sorter(type, a, b)).map((c) => c.code);

const investigator = (code: string, product: Product, position: number) =>
  card(code, { cardType: CardType.Investigator, product, position, xp: undefined });
const signature = (code: string, of: Card, position: number, weakness?: WeaknessType) =>
  card(code, {
    product: of.product,
    position,
    weakness,
    restrictions: { investigator: [of], investigatorCardCodes: [of.code], trait: [] },
  });
const basicWeakness = (code: string, product: Product, position: number) =>
  card(code, {
    cardType: CardType.Treachery,
    product,
    position,
    weakness: WeaknessType.BasicWeakness,
    xp: undefined,
  });

describe('box-order with several products', () => {
  it('puts investigators and signatures first, then regular cards, then basic weaknesses', () => {
    const tommy = investigator('tommy', Product.TommyMuldoon, 1);
    expect(
      sorted([
        basicWeakness('basic', Product.CoreSet2026, 97),
        card('regular', { position: 50 }),
        signature('signature', tommy, 2),
        tommy,
      ]),
    ).toEqual(['tommy', 'signature', 'regular', 'basic']);
  });

  it('sorts investigators and signatures by set, then collector number', () => {
    const daniela = investigator('daniela', Product.CoreSet2026, 1);
    const tommy = investigator('tommy', Product.TommyMuldoon, 1);
    expect(
      sorted([
        signature('tommy-weakness', tommy, 3, WeaknessType.Weakness),
        signature('tommy-signature', tommy, 2),
        tommy,
        signature('daniela-weakness', daniela, 3, WeaknessType.Weakness),
        signature('daniela-signature', daniela, 2),
        daniela,
      ]),
    ).toEqual([
      'daniela',
      'daniela-signature',
      'daniela-weakness',
      'tommy',
      'tommy-signature',
      'tommy-weakness',
    ]);
  });

  it('sorts basic weaknesses by set, then collector number', () => {
    expect(
      sorted([
        basicWeakness('deck-1', Product.TommyMuldoon, 1),
        basicWeakness('core-2', Product.CoreSet2026, 2),
        basicWeakness('core-1', Product.CoreSet2026, 1),
      ]),
    ).toEqual(['core-1', 'core-2', 'deck-1']);
  });

  it('sorts regular cards by class, level, type, set, then collector number', () => {
    const guardian = { class1: CardClass.Guardian } as Card['cardClass'];
    const seeker = { class1: CardClass.Seeker } as Card['cardClass'];
    expect(
      sorted([
        card('seeker', { cardClass: seeker, position: 1 }),
        card('level-2', { cardClass: guardian, xp: 2, position: 1 }),
        card('skill', { cardClass: guardian, cardType: CardType.Skill, position: 1 }),
        card('event', { cardClass: guardian, cardType: CardType.Event, position: 1 }),
        card('asset-deck', { cardClass: guardian, product: Product.TommyMuldoon, position: 1 }),
        card('asset-core-2', { cardClass: guardian, position: 2 }),
        card('asset-core-1', { cardClass: guardian, position: 1 }),
      ]),
    ).toEqual([
      'asset-core-1',
      'asset-core-2',
      'asset-deck',
      'event',
      'skill',
      'level-2',
      'seeker',
    ]);
  });

  it('keeps a bonded card right behind its main card', () => {
    const guardian = { class1: CardClass.Guardian } as Card['cardClass'];
    const main = card('main', { cardClass: guardian, position: 5, xp: 3 });
    const bonded = card('bonded', { position: 90, xp: undefined, bondedTo: main });
    expect(
      sorted([
        card('after', { cardClass: guardian, position: 6, xp: 3 }),
        bonded,
        main,
        card('before', { cardClass: guardian, position: 4, xp: 3 }),
      ]),
    ).toEqual(['before', 'main', 'bonded', 'after']);
  });
});

describe('position', () => {
  it('still sorts a repackaged product by how it comes out of the box', () => {
    const product = Product.TheDunwichLegacyInvestigatorExpansion;
    const zoey = investigator('zoey', product, 1);
    expect(
      sorted(
        [
          basicWeakness('basic', product, 2),
          card('regular', { product, position: 3 }),
          signature('signature', zoey, 50),
          zoey,
        ],
        'position',
      ),
    ).toEqual(['zoey', 'signature', 'regular', 'basic']);
  });

  it('still sorts other products by plain position and different products by set', () => {
    expect(
      sorted(
        [
          card('deck', { product: Product.TommyMuldoon, position: 1 }),
          card('core-2', { position: 2 }),
          basicWeakness('core-1', Product.CoreSet2026, 1),
        ],
        'position',
      ),
    ).toEqual(['core-1', 'core-2', 'deck']);
  });
});
