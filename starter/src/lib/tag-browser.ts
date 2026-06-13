import { card as cardUtil, sorter, type Card, type Product } from '@5argon/arkham-kohaku';
import { u as stringUtils } from '@5argon/arkham-string';
import type { CardItem, TagChipArg } from '@5argon/arkham-life-ui';
import { createRepository, hydrate, type Tag, type HydratedCard } from '@5argon/arkham-tags';
import rawCards from '@5argon/arkham-tags/cards.json';
import { getAllCards } from '$lib/card-data';
import { productToExploreRoute } from '$lib/utility/product';

/**
 * The single tag data source: the package ships no TS-tagged cards — we import the public
 * `cards.json`, hydrate it into typed cards (splitting base tags from `c-`-prefixed compound
 * archetypes), and build one repository to query. Shared by the page and its child panels.
 */
export const tagRepo = createRepository(hydrate(rawCards));

/**
 * Build a new URL from the current location with the given search-param updates
 * applied (null/empty deletes the key). Lives here (a .ts file) because Svelte's
 * `prefer-svelte-reactivity` lint rule forbids `new URL()` inside .svelte files.
 */
export function withParams(
	current: { pathname: string; search: string; hash: string; origin: string },
	updates: Record<string, string | null>
): URL {
	const sp = new URLSearchParams(current.search);
	for (const [key, value] of Object.entries(updates)) {
		if (value === null || value === '') sp.delete(key);
		else sp.set(key, value);
	}
	const qs = sp.toString();
	return new URL(`${current.pathname}${qs ? `?${qs}` : ''}${current.hash}`, current.origin);
}

/** The argument fields of a tag (everything except `type`), e.g. { restrictedToTrait: "Tome" }. */
export function tagArguments(tag: Tag): Record<string, unknown> {
	const { type: _type, ...args } = tag as unknown as Record<string, unknown>;
	return args;
}

/** Serialize a partial-argument `where` object for the URL. */
export function serializeWhere(where: Record<string, unknown>): string {
	return JSON.stringify(where);
}

/** Parse the `where` URL param into a partial-argument object, or undefined. */
export function parseWhere(raw: string | null): Record<string, unknown> | undefined {
	if (!raw) return undefined;
	try {
		const o = JSON.parse(raw);
		return o && typeof o === 'object' && !Array.isArray(o) ? o : undefined;
	} catch {
		return undefined;
	}
}

/** Whether a tag's arguments satisfy a partial `where` (every where key equals). */
export function tagMatchesWhere(tag: Tag, where: Record<string, unknown>): boolean {
	const args = tagArguments(tag);
	return Object.entries(where).every(([k, v]) => JSON.stringify(args[k]) === JSON.stringify(v));
}

/** Format a single argument value for display (flattens nested arg objects like `range`). */
export function formatArgValue(v: unknown): string {
	if (v !== null && typeof v === 'object') {
		const o = v as Record<string, unknown>;
		if ('type' in o && 'cards' in o) return `${o.type} ${o.cards}`;
		return Object.entries(o)
			.map(([k, x]) => `${k} ${x}`)
			.join(' ');
	}
	return String(v);
}

/**
 * A tag's arguments as {key, value} pairs for a rich tag chip. When the tag is `dynamic`
 * (the amount is computed at play time), the numeric `value` is a placeholder, so we hide
 * it and the `dynamic` flag and show a single `value: dynamic` instead (e.g. "I've had
 * worse…" gains resources equal to damage/horror cancelled, not the literal -1).
 */
export function tagArgPairs(tag: Tag): TagChipArg[] {
	const args = tagArguments(tag);
	const dynamic = args.dynamic === true;
	const pairs = Object.entries(args)
		.filter(([key]) => !(dynamic && (key === 'value' || key === 'dynamic')))
		.map(([key, v]) => ({ key, value: formatArgValue(v) }));
	if (dynamic) pairs.push({ key: 'value', value: 'dynamic' });
	return pairs;
}

/** A compound member's `where` condition as {key, value} pairs for a rich tag chip. */
export function whereArgPairs(where: Record<string, unknown> | undefined): TagChipArg[] {
	if (!where) return [];
	return Object.entries(where).map(([key, v]) => ({ key, value: formatArgValue(v) }));
}

let cardMapCache: Map<string, Card> | null = null;

function getCardMap(): Map<string, Card> {
	if (!cardMapCache) {
		cardMapCache = new Map(getAllCards().map((c) => [c.code, c]));
	}
	return cardMapCache;
}

/**
 * Join tagged-card codes to resolved kohaku Card objects for the card display
 * components. Tagged codes that don't resolve (alternates/promos) are dropped.
 */
export function toCardItems(tagged: HydratedCard[]): CardItem[] {
	const map = getCardMap();
	return tagged
		.map((t) => map.get(t.code))
		.filter((c): c is Card => c !== undefined)
		.map((card) => ({ card, quantity: 1 }));
}

export interface PackInfo {
	product: Product;
	/** URL-friendly pack code (e.g. "dwl"), shared with the /player routes. */
	code: string;
	name: string;
	/** How many of this pack's cards carry tags. */
	count: number;
}

/**
 * The packs that have at least one tagged card — the universe browsable for auditing.
 * Sorted by display name. Grows automatically as more packs are tagged.
 */
export function taggedPacks(): PackInfo[] {
	const map = getCardMap();
	const counts = new Map<Product, number>();
	for (const t of tagRepo.cards) {
		const c = map.get(t.code);
		if (!c) continue;
		counts.set(c.product, (counts.get(c.product) ?? 0) + 1);
	}
	return Array.from(counts.entries())
		.map(([product, count]) => ({
			product,
			code: productToExploreRoute(product),
			name: stringUtils.productName(product),
			count
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
}

/** Resolve a pack URL code (e.g. "dwl") back to its PackInfo, or undefined. */
export function packByCode(code: string | null): PackInfo | undefined {
	if (!code) return undefined;
	return taggedPacks().find((p) => p.code === code);
}

/**
 * All player (non-campaign) cards belonging to a pack, in printed position order —
 * the sequence the audit page walks with prev/next. Includes untagged cards so gaps
 * in coverage are visible.
 */
export function packCards(product: Product): Card[] {
	return getAllCards()
		.filter((c) => cardUtil.playerCardsNonCampaignFilter(c) && c.product === product)
		.sort((a, b) => sorter('position', a, b));
}

/** Resolved kohaku Cards → CardItem[] for the card display components. */
export function cardsToItems(cards: Card[]): CardItem[] {
	return cards.map((card) => ({ card, quantity: card.quantity }));
}
