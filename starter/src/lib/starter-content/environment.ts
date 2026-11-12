import { environment, type Product } from '@5argon/arkham-kohaku';
import type { EnvironmentDisplay } from '@5argon/arkham-life-ui';

import { getAllCards } from '../card-data';
import { reviewProductHref } from '../review/paths';
import { environmentPointDetail, environmentPointDisplay } from '../tool/environment-choices';
import { productToExploreRoute } from '../utility/product';

const points = environment.currentEnvironmentVersions('9999-12-31');
const displays = new Map<string, EnvironmentDisplay>();

/**
 * Whether a starter deck can say it is based on this point.
 */
export function isEnvironmentPoint(id: string): boolean {
	return points.some((point) => point.id === id);
}

/**
 * The products a deck based on this point may draw from.
 */
export function environmentPointProducts(id: string): readonly Product[] {
	const point = points.find((p) => p.id === id);
	if (point === undefined) throw new Error(`Unknown environment: ${id}`);
	return point.products;
}

/**
 * The point in time a starter deck is based on, as its banner shows it.
 */
export function deckEnvironmentDisplay(id: string): EnvironmentDisplay {
	const known = displays.get(id);
	if (known !== undefined) return known;
	const point = points.find((p) => p.id === id);
	if (point === undefined) throw new Error(`Unknown environment: ${id}`);
	const cards = getAllCards();
	const hrefOf = (product: Product) =>
		cards.some((card) => card.product === product)
			? reviewProductHref(productToExploreRoute(product))
			: undefined;
	const display = environmentPointDisplay(point, environmentPointDetail(point, cards, hrefOf));
	displays.set(id, display);
	return display;
}
