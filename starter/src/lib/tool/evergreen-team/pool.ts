import {
	type Card,
	CardClass,
	type CardCode,
	type CardResolver,
	card as cardUtils,
	Product,
	productChapterOneInvestigatorExpansions,
	productCoreSetsNoOldCore,
	productInvestigatorDeck,
	productInvestigatorStarterDeck,
	productOrdering,
	productReturnTo,
	randomBasicWeakness
} from '@5argon/arkham-kohaku';

import { routeZone } from './rules';
import type { AccessLine, EvergreenCore, EvergreenSetup, EvergreenZone, PoolEntry } from './types';

/**
 * The 5 prebuilt deck products that belong to the chosen core's era.
 */
export function deckProductsForCore(core: EvergreenCore): Product[] {
	return core === Product.CoreSet2026 ? productInvestigatorDeck : productInvestigatorStarterDeck;
}

/**
 * Products whose investigators join the roster: the Evergreen products only.
 * Extra (advanced) products contribute cards, never investigators.
 */
export function rosterProducts(setup: EvergreenSetup): Product[] {
	return [setup.core, ...setup.deckProducts];
}

export function poolProducts(setup: EvergreenSetup): Product[] {
	return [...rosterProducts(setup), ...setup.extraProducts];
}

/**
 * The choices offered in the setup page's Advanced section: every product the
 * Limited Pool Explorer covers plus both eras' prebuilt decks, minus what the
 * main setup controls already include.
 */
export function extraProductOptions(core: EvergreenCore): Product[] {
	const covered = new Set<Product>([core, ...deckProductsForCore(core)]);
	return [
		...productCoreSetsNoOldCore,
		...productChapterOneInvestigatorExpansions,
		...productInvestigatorStarterDeck,
		...productInvestigatorDeck,
		...productReturnTo
	].filter((p) => !covered.has(p));
}

/**
 * Investigators the team can be picked from: those printed in a roster product.
 */
export function investigatorsForSetup(setup: EvergreenSetup, allCards: Card[]): Card[] {
	const products = rosterProducts(setup);
	return allCards
		.filter((c) => cardUtils.deckbuildingInvestigatorCardsFilter(c) && products.includes(c.product))
		.sort((a, b) => a.code.localeCompare(b.code));
}

/**
 * Build the shared collection: all draftable player cards of the selected
 * products, one entry per physical printing, exactly like the real cards.
 * Reprints of the same card in different products stay separate stacks; they
 * only share a title key so the per-deck copy limit counts across them
 * (Arkham's by-title rule, applied per level - subname distinguishes true
 * variants like Harvey's two Forbidden Tome (3)s).
 *
 * The returned map is keyed by card code and iterates in code order.
 */
export function buildPool(setup: EvergreenSetup, allCards: Card[]): Map<CardCode, PoolEntry> {
	const products = poolProducts(setup);
	const entries = allCards
		.filter((c) => cardUtils.deckbuildingPlayerCardsFilter(c) && products.includes(c.product))
		.map((card): PoolEntry => ({
			card,
			total: card.quantity,
			titleKey: `${card.name}|${card.subname ?? ''}|${card.xp ?? ''}|${card.cardType}`
		}))
		.sort((a, b) => a.card.code.localeCompare(b.card.code));
	return new Map(entries.map((e) => [e.card.code, e]));
}

export interface PoolSection {
	product: Product;
	entries: PoolEntry[];
}

/**
 * The collection panel's product sections, in setup order: core box first,
 * then each included prebuilt deck, then advanced extra products. Every
 * printing lives in its own product's section, like the real boxes.
 */
export function poolSections(setup: EvergreenSetup, pool: Map<CardCode, PoolEntry>): PoolSection[] {
	const order = [
		setup.core,
		...deckProductsForCore(setup.core).filter((p) => setup.deckProducts.includes(p)),
		...[...setup.extraProducts].sort(
			(a, b) => productOrdering.indexOf(a) - productOrdering.indexOf(b)
		)
	];
	const byProduct = new Map<Product, PoolEntry[]>();
	for (const entry of pool.values()) {
		const group = byProduct.get(entry.card.product);
		if (group === undefined) {
			byProduct.set(entry.card.product, [entry]);
		} else {
			group.push(entry);
		}
	}
	return order
		.map((product) => ({ product, entries: byProduct.get(product) ?? [] }))
		.filter((section) => section.entries.length > 0);
}

/**
 * The cards one class-mode pickup sweeps along: every pool card sharing the
 * grabbed card's class and level zone, within the grabbed card's product (or
 * across all products when mergeProducts is on). The grabbed card is always
 * included and listed first.
 */
export function classGroupFor(args: {
	pool: Map<CardCode, PoolEntry>;
	cardCode: CardCode;
	zone: EvergreenZone;
	mergeProducts: boolean;
}): CardCode[] {
	const target = args.pool.get(args.cardCode);
	if (target === undefined) return [args.cardCode];
	const targetClass = target.card.cardClass?.class1 ?? CardClass.Neutral;
	const neighbors = [...args.pool.values()]
		.filter(
			(e) =>
				e.card.code !== args.cardCode &&
				routeZone(e.card) === args.zone &&
				(e.card.cardClass?.class1 ?? CardClass.Neutral) === targetClass &&
				(args.mergeProducts || e.card.product === target.card.product)
		)
		.map((e) => e.card.code);
	return [args.cardCode, ...neighbors];
}

export interface AccessSummaryResult {
	lines: AccessLine[];
	/**
	 * True when the investigator has deckbuilding beyond simple class + level
	 * access (none in the Evergreen environment; defensive for future data).
	 */
	special: boolean;
}

/**
 * Beginner-friendly deckbuilding access, e.g. Daniela: Guardian 0-5,
 * Survivor 0-2, Neutral 0-5. Neutral is folded into the first option's
 * faction list in the data; it is pulled out and appended as the last line.
 */
export function accessSummary(investigator: Card): AccessSummaryResult {
	const lines: AccessLine[] = [];
	let neutralLine: AccessLine | null = null;
	let special = false;
	for (const option of investigator.deckOptions ?? []) {
		const simple =
			option.faction !== undefined &&
			option.level !== undefined &&
			option.factionSelect === undefined &&
			option.optionSelect === undefined &&
			option.trait === undefined &&
			option.tag === undefined &&
			option.type === undefined &&
			option.uses === undefined &&
			option.limit === undefined &&
			option.atLeast === undefined &&
			option.not !== true;
		if (!simple) {
			special = true;
			continue;
		}
		for (const faction of option.faction ?? []) {
			const line: AccessLine = {
				cardClass: faction,
				min: option.level?.min ?? 0,
				max: option.level?.max ?? 5
			};
			if (faction === CardClass.Neutral) {
				neutralLine = neutralLine ?? line;
			} else {
				lines.push(line);
			}
		}
	}
	if (neutralLine !== null) {
		lines.push(neutralLine);
	}
	return { lines, special };
}

/**
 * The pre-added fixed items of an investigator's deck, in display order:
 * signature cards and signature weaknesses as listed in deck requirements,
 * then one random basic weakness placeholder per required random weakness.
 */
export function fixedItemsFor(investigator: Card, resolver: CardResolver): Card[] {
	const requirements = investigator.deckRequirements;
	const items: Card[] = [...(requirements?.card ?? [])];
	const randomCount = requirements?.random?.filter((r) => r === 'basicweakness').length ?? 0;
	for (let i = 0; i < randomCount; i++) {
		items.push(resolver.resolve(randomBasicWeakness));
	}
	return items;
}
