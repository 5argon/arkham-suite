import { describe, expect, it } from 'vitest';

import {
  Product,
  productChapterOneCampaignExpansions,
  productChapterOneInvestigatorExpansions,
  productChapterTwo,
  productChapterTwoCampaignExpansions,
  productEvergreen,
  productReleaseDate,
} from '../src/type/game/product.js';
import {
  currentEnvironmentProducts,
  currentEnvironmentVersions,
  currentEnvironmentVersionsWith,
  isChapterTwoProduct,
  currentEnvironmentEvergreenId,
  isEvergreen,
  officialCurrentEnvironmentCatalog,
  type CurrentEnvironmentCatalog,
} from '../src/utility/environment/index.js';

const farFuture = '2099-01-01';

/**
 * Pool pages and pinned content address these forever, so a released point's products must never
 * change. Append each point here once it is released, and never edit the ones already here.
 */
const frozenPoints: { id: string; products: Product[] }[] = [
  {
    id: currentEnvironmentEvergreenId,
    products: [
      Product.CoreSet2026,
      Product.TommyMuldoon,
      Product.CarolynFern,
      Product.AndrePatel,
      Product.MarieLambeau,
      Product.MiguelDeLaCruz,
    ],
  },
];

describe('official catalog', () => {
  it('classifies every product released since Core Set 2026 as Chapter Two, and nothing older', () => {
    const coreDate = productReleaseDate[Product.CoreSet2026];
    const dated = Object.entries(productReleaseDate) as [Product, string][];
    const expected = dated.filter(([, date]) => date >= coreDate).map(([product]) => product);
    expect([...productChapterTwo].sort()).toEqual(expected.sort());
  });

  it('answers the Chapter Two lookup', () => {
    expect(isChapterTwoProduct(Product.CoreSet2026)).toBe(true);
    expect(isChapterTwoProduct(Product.PowerOfTheDreamlands)).toBe(true);
    expect(isChapterTwoProduct(Product.RevisedCoreSet)).toBe(false);
    expect(isChapterTwoProduct(Product.TheDrownedCityInvestigatorExpansion)).toBe(false);
    expect(isChapterTwoProduct(Product.FilmFatale)).toBe(false);
  });

  it('ignores a Chapter One product even when listed as a rotating expansion', () => {
    const misfiled: CurrentEnvironmentCatalog = {
      ...officialCurrentEnvironmentCatalog,
      investigatorExpansions: [Product.TheDrownedCityInvestigatorExpansion],
    };
    expect(currentEnvironmentProducts('2026-11-01', misfiled)).toEqual(productEvergreen);
    expect(currentEnvironmentVersions(farFuture, misfiled)).toEqual(
      currentEnvironmentVersions(farFuture),
    );
  });

  it('has only the Evergreen products today', () => {
    expect(currentEnvironmentProducts('2026-11-01')).toEqual(productEvergreen);
  });

  it('adds Power of the Dreamlands exactly on its release date', () => {
    expect(currentEnvironmentProducts('2027-02-18')).toEqual(productEvergreen);
    expect(currentEnvironmentProducts('2027-02-19')).toEqual([
      ...productEvergreen,
      Product.PowerOfTheDreamlands,
    ]);
  });

  it('leaves out Evergreen products not released yet', () => {
    expect(currentEnvironmentProducts('2026-03-19')).toEqual([]);
    expect(currentEnvironmentProducts('2026-03-20')).toEqual([Product.CoreSet2026]);
    expect(currentEnvironmentProducts('2026-04-17')).toEqual(productEvergreen);
  });

  it('reads a Date on the local calendar', () => {
    expect(currentEnvironmentProducts(new Date(2027, 1, 18, 23, 59))).toEqual(productEvergreen);
    expect(currentEnvironmentProducts(new Date(2027, 1, 19, 0, 0))).toContain(
      Product.PowerOfTheDreamlands,
    );
  });

  it('never has Chapter One investigator expansions or any campaign expansion', () => {
    const everProducts = currentEnvironmentVersions(farFuture).flatMap(
      (version) => version.products,
    );
    for (const product of [
      ...productChapterOneInvestigatorExpansions,
      ...productChapterOneCampaignExpansions,
      ...productChapterTwoCampaignExpansions,
      Product.TracesToNowhere,
    ]) {
      expect(everProducts).not.toContain(product);
    }
  });

  it('has no version until all Evergreen products are released', () => {
    expect(currentEnvironmentVersions('2026-04-16')).toEqual([]);
  });

  it('has only the Evergreen point today, without the announced product', () => {
    expect(currentEnvironmentVersions('2026-11-01')).toEqual([
      {
        id: currentEnvironmentEvergreenId,
        date: '2026-04-17',
        products: productEvergreen,
        rotatedIn: productEvergreen,
        rotatedOut: [],
      },
    ]);
  });

  it('keeps the Evergreen point and adds another one on a release', () => {
    expect(currentEnvironmentVersions('2027-02-19').map((version) => version.id)).toEqual([
      currentEnvironmentEvergreenId,
      'potd',
    ]);
    expect(currentEnvironmentVersions('2027-02-19').at(-1)).toEqual({
      id: 'potd',
      date: '2027-02-19',
      products: [...productEvergreen, Product.PowerOfTheDreamlands],
      rotatedIn: [Product.PowerOfTheDreamlands],
      rotatedOut: [],
    });
  });

  it('never changes a released point', () => {
    const versions = currentEnvironmentVersions(farFuture);
    for (const frozen of frozenPoints) {
      expect(versions.find((version) => version.id === frozen.id)?.products).toEqual(
        frozen.products,
      );
    }
  });

  it('has every released point frozen', () => {
    const released = currentEnvironmentVersions(new Date()).map((version) => version.id);
    expect(frozenPoints.map((point) => point.id)).toEqual(expect.arrayContaining(released));
  });
});

describe('saturated catalog', () => {
  // Existing products standing in for expansions that do not exist yet.
  const evergreen = Product.CoreSet2026;
  const [deckbuildingA, deckbuildingB, deckbuildingC, deckbuildingD] = [
    Product.CurseOfTheRougarou,
    Product.CarnevaleOfHorrors,
    Product.TheLabyrinthsOfLunacy,
    Product.GuardiansOfTheAbyss,
  ];
  const [investigatorA, investigatorB, investigatorC] = [
    Product.TheDunwichLegacyInvestigatorExpansion,
    Product.ThePathToCarcosaInvestigatorExpansion,
    Product.TheForgottenAgeInvestigatorExpansion,
  ];
  const catalog: CurrentEnvironmentCatalog = {
    chapterTwo: [
      evergreen,
      deckbuildingA,
      deckbuildingB,
      deckbuildingC,
      deckbuildingD,
      investigatorA,
      investigatorB,
      investigatorC,
    ],
    evergreen: [evergreen],
    deckbuildingExpansions: [deckbuildingA, deckbuildingB, deckbuildingC, deckbuildingD],
    investigatorExpansions: [investigatorA, investigatorB, investigatorC],
    releaseDates: {
      [evergreen]: '2026-03-20',
      [deckbuildingA]: '2027-02-19',
      [investigatorA]: '2027-06-01',
      [deckbuildingB]: '2027-10-01',
      [investigatorB]: '2028-02-01',
      // Pushes out of both kinds on the same day.
      [deckbuildingC]: '2028-06-01',
      [investigatorC]: '2028-06-01',
      // Moves again in the same year.
      [deckbuildingD]: '2028-11-01',
    },
  };

  const datesAsOf = (asOf: string, from = catalog) =>
    currentEnvironmentVersions(asOf, from).map((version) => version.date);

  it('keeps only the two most recent of each kind', () => {
    expect(currentEnvironmentProducts('2028-05-31', catalog)).toEqual([
      evergreen,
      deckbuildingB,
      deckbuildingA,
      investigatorB,
      investigatorA,
    ]);
    expect(currentEnvironmentProducts('2028-06-01', catalog)).toEqual([
      evergreen,
      deckbuildingC,
      deckbuildingB,
      investigatorC,
      investigatorB,
    ]);
  });

  it('adds a point for every release, keeping the older ones', () => {
    expect(datesAsOf('2027-02-19')).toEqual(['2026-03-20', '2027-02-19']);
    expect(datesAsOf(farFuture)).toEqual([
      '2026-03-20',
      '2027-02-19',
      '2027-06-01',
      '2027-10-01',
      '2028-02-01',
      '2028-06-01',
      '2028-11-01',
    ]);
  });

  it('gives an older point a smaller pool than a newer one until saturating', () => {
    const versions = currentEnvironmentVersions(farFuture, catalog);
    expect(versions[1]?.products).toEqual([evergreen, deckbuildingA]);
    expect(versions[2]?.products).toEqual([evergreen, deckbuildingA, investigatorA]);
  });

  it('only pushes out once saturated, and then on every release', () => {
    const versions = currentEnvironmentVersions(farFuture, catalog);
    expect(versions.slice(0, 5).map((version) => version.rotatedOut)).toEqual([
      [],
      [],
      [],
      [],
      [],
    ]);
    expect(versions[5]?.rotatedIn).toEqual([deckbuildingC, investigatorC]);
    expect(versions[5]?.rotatedOut).toEqual([deckbuildingA, investigatorA]);
    expect(versions[6]?.rotatedIn).toEqual([deckbuildingD]);
    expect(versions[6]?.rotatedOut).toEqual([deckbuildingB]);
  });

  it('addresses a point by the product that began it, deckbuilding first on the same day', () => {
    expect(currentEnvironmentVersions(farFuture, catalog).map((version) => version.id)).toEqual([
      currentEnvironmentEvergreenId,
      'cotr',
      'dwlp',
      'coh',
      'ptcp',
      'lol',
      'guardians',
    ]);
  });

  it('turns underscores of a product code into dashes for the id', () => {
    const withUnderscore: CurrentEnvironmentCatalog = {
      ...catalog,
      chapterTwo: [evergreen, Product.FilmFatale],
      deckbuildingExpansions: [Product.FilmFatale],
      investigatorExpansions: [],
      releaseDates: { [evergreen]: '2026-03-20', [Product.FilmFatale]: '2027-01-01' },
    };
    expect(currentEnvironmentVersions(farFuture, withUnderscore).at(-1)?.id).toBe('film-fatale');
  });

  it('agrees with the products on each version date, and on the asOf date for the last one', () => {
    for (const asOf of ['2027-08-15', '2028-03-01', '2028-07-01', farFuture]) {
      const versions = currentEnvironmentVersions(asOf, catalog);
      for (const version of versions) {
        expect(version.products).toEqual(currentEnvironmentProducts(version.date, catalog));
      }
      expect(versions.at(-1)?.products).toEqual(currentEnvironmentProducts(asOf, catalog));
    }
  });

  it('finds the versions a rotating product is usable in', () => {
    const dates = currentEnvironmentVersionsWith(
      [deckbuildingA, investigatorB],
      farFuture,
      catalog,
    ).map((version) => version.date);
    expect(dates).toEqual(['2028-02-01']);
  });

  it('finds no version for a product outside of the catalog', () => {
    expect(currentEnvironmentVersionsWith([Product.CoreSet], farFuture, catalog)).toEqual([]);
  });

  it('gives an Evergreen deck every version', () => {
    expect(isEvergreen([evergreen], catalog)).toBe(true);
    expect(isEvergreen([evergreen, deckbuildingA], catalog)).toBe(false);
    expect(currentEnvironmentVersionsWith([evergreen], farFuture, catalog)).toEqual(
      currentEnvironmentVersions(farFuture, catalog),
    );
  });
});
