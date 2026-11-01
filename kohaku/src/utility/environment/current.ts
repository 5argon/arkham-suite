import {
  Product,
  productChapterTwo,
  productChapterTwoInvestigatorExpansions,
  productDeckbuildingExpansions,
  productEvergreen,
  productReleaseDate,
} from '../../type/game/product.js';

const MOST_RECENT_COUNT = 2;

/**
 * What the Current environment rule is evaluated over. The default is the official product
 * line, tests supply their own since it has not saturated the most recent slots yet.
 */
export interface CurrentEnvironmentCatalog {
  chapterTwo: readonly Product[];
  evergreen: readonly Product[];
  deckbuildingExpansions: readonly Product[];
  investigatorExpansions: readonly Product[];
  releaseDates: Partial<Record<Product, string>>;
}

export const officialCurrentEnvironmentCatalog: CurrentEnvironmentCatalog = {
  chapterTwo: productChapterTwo,
  evergreen: productEvergreen,
  deckbuildingExpansions: productDeckbuildingExpansions,
  investigatorExpansions: productChapterTwoInvestigatorExpansions,
  releaseDates: productReleaseDate,
};

export const currentEnvironmentEvergreenId = 'evergreen';

/**
 * One permanent point of the Current environment.
 */
export interface CurrentEnvironmentVersion {
  /**
   * Permanent address of this point for URLs and pinned content: the code of the product that began
   * it, or `currentEnvironmentEvergreenId` for the first one. When expansions release on the same
   * day it is the first one in `rotatedIn`, deckbuilding before investigator. Only points already
   * released exist, so a product's code is final by the time it is used here.
   */
  id: string;
  /**
   * `YYYY-MM-DD` release date of the most recent product in `products`.
   */
  date: string;
  /**
   * Evergreen products first, then the most recent deckbuilding and investigator expansions.
   */
  products: Product[];
  /**
   * Compared to the previous version in the list.
   */
  rotatedIn: Product[];
  /**
   * Compared to the previous version in the list. Empty while not saturating 2 + 2 yet.
   */
  rotatedOut: Product[];
}

function toCalendarDay(date: Date | string): string {
  if (typeof date === 'string') {
    return date.slice(0, 10);
  }
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function releaseDateOf(product: Product, catalog: CurrentEnvironmentCatalog): string {
  const releaseDate = catalog.releaseDates[product];
  if (releaseDate === undefined) {
    throw new Error(`No release date for product: ${product}`);
  }
  return releaseDate;
}

/**
 * The Current environment only applies to Chapter Two products.
 */
export function isChapterTwoProduct(
  product: Product,
  catalog: CurrentEnvironmentCatalog = officialCurrentEnvironmentCatalog,
): boolean {
  return catalog.chapterTwo.includes(product);
}

function releasedChapterTwo(
  products: readonly Product[],
  day: string,
  catalog: CurrentEnvironmentCatalog,
): Product[] {
  return products.filter(
    (product) => isChapterTwoProduct(product, catalog) && releaseDateOf(product, catalog) <= day,
  );
}

/**
 * Products released on the same day are kept in the order the catalog lists them.
 */
function mostRecent(
  products: readonly Product[],
  day: string,
  catalog: CurrentEnvironmentCatalog,
): Product[] {
  return releasedChapterTwo(products, day, catalog)
    .sort((a, b) => releaseDateOf(b, catalog).localeCompare(releaseDateOf(a, catalog)))
    .slice(0, MOST_RECENT_COUNT);
}

/**
 * Products usable for deckbuilding in the Current environment on a given date, as defined by
 * the Arkham Grimoire : Evergreen products, plus the two most recently released deckbuilding
 * expansions, plus the two most recently released investigator expansions after the core set.
 *
 * Campaign expansions and scenario packs are rotating expansions too, but are not in this list.
 * Evergreen products not released yet on that date are left out, so it is empty before Core Set 2026.
 *
 * @param date A `Date` is read as that day on the local calendar. A string must start with `YYYY-MM-DD`.
 */
export function currentEnvironmentProducts(
  date: Date | string,
  catalog: CurrentEnvironmentCatalog = officialCurrentEnvironmentCatalog,
): Product[] {
  const day = toCalendarDay(date);
  return [
    ...releasedChapterTwo(catalog.evergreen, day, catalog),
    ...mostRecent(catalog.deckbuildingExpansions, day, catalog),
    ...mostRecent(catalog.investigatorExpansions, day, catalog),
  ];
}

/**
 * Every point of the Current environment released as of `asOf`, in chronological order. The first
 * one is when the last Evergreen product released, then each deckbuilding or investigator expansion
 * begins another. Older points are permanent and stay in the list after a newer one is released, so
 * the last one is the Current environment on `asOf`. Expansions released on the same day make one
 * point. Empty until all Evergreen products are released.
 *
 * @param asOf A `Date` is read as that day on the local calendar. A string must start with `YYYY-MM-DD`.
 */
export function currentEnvironmentVersions(
  asOf: Date | string,
  catalog: CurrentEnvironmentCatalog = officialCurrentEnvironmentCatalog,
): CurrentEnvironmentVersion[] {
  const day = toCalendarDay(asOf);
  const chapterTwoDates = (products: readonly Product[]) =>
    products
      .filter((product) => isChapterTwoProduct(product, catalog))
      .map((product) => releaseDateOf(product, catalog));
  const firstDate = chapterTwoDates(catalog.evergreen).sort().at(-1);
  if (firstDate === undefined || firstDate > day) {
    return [];
  }
  const expansionDates = chapterTwoDates([
    ...catalog.deckbuildingExpansions,
    ...catalog.investigatorExpansions,
  ]).filter((date) => date > firstDate && date <= day);
  const dates = [...new Set([firstDate, ...expansionDates])].sort();

  let previous: Product[] = [];
  return dates.map((date) => {
    const products = currentEnvironmentProducts(date, catalog);
    const rotatedIn = products.filter((product) => !previous.includes(product));
    const version: CurrentEnvironmentVersion = {
      id: date === firstDate ? currentEnvironmentEvergreenId : rotatedIn[0].replace(/_/g, '-'),
      date,
      products,
      rotatedIn,
      rotatedOut: previous.filter((product) => !products.includes(product)),
    };
    previous = products;
    return version;
  });
}

/**
 * True when only Evergreen products are used, which stays buildable in every version of the
 * Current environment including all the future ones.
 */
export function isEvergreen(
  products: Iterable<Product>,
  catalog: CurrentEnvironmentCatalog = officialCurrentEnvironmentCatalog,
): boolean {
  return [...products].every((product) => catalog.evergreen.includes(product));
}

/**
 * Points of the Current environment released as of `asOf` that have all the given products, for
 * example the ones a deck can be built in. An Evergreen deck gets all of them, while `isEvergreen`
 * also covers the versions that are not known yet.
 */
export function currentEnvironmentVersionsWith(
  products: Iterable<Product>,
  asOf: Date | string,
  catalog: CurrentEnvironmentCatalog = officialCurrentEnvironmentCatalog,
): CurrentEnvironmentVersion[] {
  const required = [...products];
  return currentEnvironmentVersions(asOf, catalog).filter((version) =>
    required.every((product) => version.products.includes(product)),
  );
}
