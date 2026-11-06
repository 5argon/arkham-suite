import {
	CardResolver,
	deck as deckUtility,
	environment,
	linkedAhdbDeckToDeck,
	Product,
	productEvergreen
} from '@5argon/arkham-kohaku';
import { describe, expect, it } from 'vitest';

import { getAllCards, loadAllTabooLists } from '../card-data';
import { allStarterDecks, type StarterDeckEntry } from '.';

/**
 * The rules a starter deck must meet, written out for readers in lib/md/starter-deck.md. Holding up
 * on Standard difficulty with 2~4 players is the one left to judgment.
 */
const MAX_ROTATING_EXPANSIONS = 2;
const MAX_REQUIRED_XP = 19;

const resolver = new CardResolver(getAllCards());
const tabooLists = loadAllTabooLists();
const entries = allStarterDecks();

/**
 * Every product its cards come from, across all its builds and their side decks.
 */
function productsOf(entry: StarterDeckEntry): Product[] {
	const codes = entry.versions.flatMap(({ deck }) =>
		Object.keys({ ...deck.slots, ...deck.sideSlots })
	);
	const products = codes
		.map((code) => resolver.resolve(code).product)
		.filter((product) => product !== Product.RandomBasicWeakness);
	return [...new Set(products)];
}

const levelOf = (code: string) => resolver.resolve(code).xp ?? 0;
const nameOf = (entry: StarterDeckEntry) => `${entry.series.slug}/${entry.slug}`;

describe('starter deck rules', () => {
	it('has decks to check', () => {
		expect(entries.length).toBeGreaterThan(0);
	});

	it('can be built within a single Current Environment at some point in time', () => {
		for (const entry of entries) {
			const fitting = environment.currentEnvironmentVersionsWith(productsOf(entry), '9999-12-31');
			expect(fitting.length, nameOf(entry)).toBeGreaterThan(0);
		}
	});

	it(`uses no more than ${MAX_ROTATING_EXPANSIONS} Rotating expansions`, () => {
		for (const entry of entries) {
			const rotating = productsOf(entry).filter((product) => !productEvergreen.includes(product));
			expect(rotating.length, nameOf(entry)).toBeLessThanOrEqual(MAX_ROTATING_EXPANSIONS);
		}
	});

	it('starts with a 0 XP main deck', () => {
		for (const entry of entries) {
			const upgrades = Object.keys(entry.primary.slots ?? {}).filter((code) => levelOf(code) > 0);
			expect(upgrades, nameOf(entry)).toEqual([]);
		}
	});

	it('has every upgrade waiting in the side deck of its 0 XP build', () => {
		for (const entry of entries) {
			const waiting = entry.primary.sideSlots ?? {};
			for (const { deck } of entry.versions.slice(1)) {
				for (const [code, quantity] of Object.entries(deck.slots ?? {})) {
					const extra = quantity - (entry.primary.slots?.[code] ?? 0);
					if (extra <= 0) continue;
					expect(waiting[code] ?? 0, `${nameOf(entry)} ${code}`).toBeGreaterThanOrEqual(extra);
				}
			}
		}
	});

	it(`executes its main idea within ${MAX_REQUIRED_XP} XP`, () => {
		for (const entry of entries) {
			// A deck shared with no upgrades has no main idea left to reach.
			if (entry.versions.length === 1) continue;
			// Builds past this point are allowed, for nice-to-have cards.
			const upgraded = entry.versions.filter(
				({ breakpoint }) => breakpoint > 0 && breakpoint <= MAX_REQUIRED_XP
			);
			expect(upgraded.length, nameOf(entry)).toBeGreaterThan(0);
		}
	});

	it('spends no more XP than each build says', () => {
		for (const entry of entries) {
			for (const { breakpoint, deck } of entry.versions) {
				const xp = deckUtility.calculateDeckXp(
					linkedAhdbDeckToDeck({ deck }, resolver, tabooLists)
				);
				expect(xp, `${nameOf(entry)} at ${breakpoint}`).toBeLessThanOrEqual(breakpoint);
			}
		}
	});
});
