import { type Card, card as cardUtils, environment, Product } from '@5argon/arkham-kohaku';
import type { EnvironmentDetail, EnvironmentProduct } from '@5argon/arkham-life-ui';
import { u as stringUtils } from '@5argon/arkham-string';

import * as m from '$lib/paraglide/messages.js';
import { productToExploreRoute } from '$lib/utility/product';

const {
	currentEnvironmentEvergreenId,
	currentEnvironmentVersions,
	officialCurrentEnvironmentCatalog
} = environment;
type Catalog = environment.CurrentEnvironmentCatalog;
type Point = environment.CurrentEnvironmentVersion;
type CardsWithProduct = readonly Pick<Card, 'product'>[];

/**
 * Later than any release, to get every announced point.
 */
const anyRelease = '9999-12-31';

/**
 * One preset of the environment selector. `products` are what it adds to Core Set 2026, which is
 * in every choice and is not listed.
 */
export interface EnvironmentChoice {
	kind: 'core' | 'evergreen' | 'current' | 'chapter-two';
	/**
	 * Permanent id of the Current environment point of a choice other than `core`.
	 */
	id?: string;
	/**
	 * The product that began a `current` choice, which names it.
	 */
	product?: Product;
	products: Product[];
}

function withoutCore(products: readonly Product[]): Product[] {
	return products.filter((product) => product !== Product.CoreSet2026);
}

/**
 * Points of the Current environment usable as of `asOf`: released, and with cards of all their
 * products in the data. A release waits here until the card data is updated, so nothing can offer
 * or link to a pool with cards missing.
 */
export function publishedEnvironmentPoints(
	asOf: Date | string,
	cards: CardsWithProduct,
	catalog: Catalog = officialCurrentEnvironmentCatalog
): Point[] {
	const available = new Set(cards.map((card) => card.product));
	return currentEnvironmentVersions(asOf, catalog).filter((point) =>
		point.products.every((product) => available.has(product))
	);
}

/**
 * Points that get a page on this build, which only needs their card data. A page can be built ahead
 * of its release date so it is already there when a viewer's clock reaches that date, and from then
 * on every later build keeps it.
 */
export function environmentPointPages(
	cards: CardsWithProduct,
	catalog: Catalog = officialCurrentEnvironmentCatalog
): Point[] {
	return publishedEnvironmentPoints(anyRelease, cards, catalog);
}

/**
 * The ones in a list of points that are released as of `asOf`.
 */
export function releasedPoints(
	points: Point[],
	asOf: Date | string,
	catalog: Catalog = officialCurrentEnvironmentCatalog
): Point[] {
	const released = new Set(currentEnvironmentVersions(asOf, catalog).map((point) => point.id));
	return points.filter((point) => released.has(point.id));
}

/**
 * What can be talked about from a point in time: what it has, and what was pushed out before it,
 * which someone looking back from there still has something to say about. What only came out later
 * is not included. Undefined for a point that doesn't exist.
 */
export function environmentTalkingPool(
	id: string,
	catalog: Catalog = officialCurrentEnvironmentCatalog
): Product[] | undefined {
	const points = currentEnvironmentVersions(anyRelease, catalog);
	const index = points.findIndex((point) => point.id === id);
	if (index < 0) return undefined;
	return [...new Set(points.slice(0, index + 1).flatMap((point) => point.products))];
}

/**
 * What's in a point in time, to explain its slots.
 *
 * @param cards Where its investigators come from.
 * @param hrefOf Where the cards of a product can be seen, when they can.
 */
export function environmentPointDetail(
	point: Point,
	cards: readonly Card[],
	hrefOf: (product: Product) => string | undefined,
	catalog: Catalog = officialCurrentEnvironmentCatalog
): EnvironmentDetail {
	const entry = (product: Product): EnvironmentProduct => ({ product, href: hrefOf(product) });
	return {
		slots: environment
			.rotatingExpansionSlots(point.products, catalog)
			.map((product) => product && entry(product)),
		defining: point.id === currentEnvironmentEvergreenId ? [] : point.rotatedIn,
		pushedOut: point.rotatedOut.map(entry),
		evergreen: point.products.filter((p) => catalog.evergreen.includes(p)).map(entry),
		roster: point.products.flatMap((product) =>
			cards
				.filter((card) => card.product === product)
				.filter(cardUtils.deckbuildingInvestigatorCardsFilter)
		)
	};
}

export function environmentPointTitle(point: Point): string {
	return point.id === currentEnvironmentEvergreenId
		? m.common_evergreen_products()
		: m.common_environment_current({ name: stringUtils.productName(point.rotatedIn[0]) });
}

export function environmentPointPath(id: string): string {
	return `/player/env/${id}`;
}

/**
 * Core Set only, Evergreen products, then each published point of the Current environment, oldest
 * first. One that has nothing beyond Evergreen products is the same as that choice and is not
 * repeated, so the Current choices begin with the first rotating product released.
 */
export function environmentChoices(
	asOf: Date | string,
	cards: CardsWithProduct,
	catalog: Catalog = officialCurrentEnvironmentCatalog
): EnvironmentChoice[] {
	return [
		{ kind: 'core', products: [] },
		{
			kind: 'evergreen',
			id: currentEnvironmentEvergreenId,
			products: withoutCore(catalog.evergreen)
		},
		...publishedEnvironmentPoints(asOf, cards, catalog)
			.filter((point) => point.products.some((p) => !catalog.evergreen.includes(p)))
			.map((point): EnvironmentChoice => ({
				kind: 'current',
				id: point.id,
				product: point.rotatedIn[0],
				products: withoutCore(point.products)
			}))
	];
}

/**
 * Everything from every point of the Current environment so far, for showing what was made for any
 * of them. Not one environment, since products that rotated out are in it too, so it has no page.
 */
export function chapterTwoChoice(
	asOf: Date | string,
	cards: CardsWithProduct,
	catalog: Catalog = officialCurrentEnvironmentCatalog
): EnvironmentChoice {
	return {
		kind: 'chapter-two',
		products: [...withoutCore(catalog.evergreen), ...rotatingProducts(asOf, cards, catalog)]
	};
}

/**
 * Where the cards of a choice can be seen all together.
 */
export function environmentChoicePath(choice: EnvironmentChoice): string {
	return choice.id === undefined
		? `/player/${productToExploreRoute(Product.CoreSet2026)}`
		: environmentPointPath(choice.id);
}

/**
 * Every rotating product any published point has had as of `asOf`, oldest first, so ones that
 * rotated out can still be picked for the older choices.
 */
export function rotatingProducts(
	asOf: Date | string,
	cards: CardsWithProduct,
	catalog: Catalog = officialCurrentEnvironmentCatalog
): Product[] {
	const everProducts = publishedEnvironmentPoints(asOf, cards, catalog).flatMap((p) => p.products);
	return [...new Set(everProducts)]
		.filter((product) => !catalog.evergreen.includes(product))
		.sort((a, b) => (catalog.releaseDates[a] ?? '').localeCompare(catalog.releaseDates[b] ?? ''));
}

/**
 * The choice with exactly these products. Undefined after toggling products into a combination
 * that is not one of the choices.
 */
export function matchingChoice(
	choices: EnvironmentChoice[],
	products: readonly Product[]
): EnvironmentChoice | undefined {
	const selected = new Set(products);
	return choices.find(
		(choice) =>
			choice.products.length === selected.size && choice.products.every((p) => selected.has(p))
	);
}
