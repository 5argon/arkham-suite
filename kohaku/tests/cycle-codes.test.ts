import { describe, expect, it } from 'vitest';
import { Product } from '../src/type/game/product.js';
import { cycleCodeToProducts } from '../src/utility/convert/ahdb.js';

describe('cycleCodeToProducts', () => {
  it('reads the Chapter 2 investigator decks under both of their card pool codes', () => {
    const ch2 = [
      Product.TommyMuldoon,
      Product.CarolynFern,
      Product.AndrePatel,
      Product.MarieLambeau,
      Product.MiguelDeLaCruz,
    ];
    expect(cycleCodeToProducts('investigator_decks_ch2')).toEqual(ch2);
    expect(cycleCodeToProducts('investigator_ch2')).toEqual(ch2);
  });

  it('reads the Chapter 2 scenario packs', () => {
    expect(cycleCodeToProducts('scenario_packs_ch2')).toEqual([Product.TracesToNowhere]);
  });
});
