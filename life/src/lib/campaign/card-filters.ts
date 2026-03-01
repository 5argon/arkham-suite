/**
 * card-filters.ts — predicates + helpers for the player-card "filter" profile widgets
 * (Permanent / Exceptional / Specialist / Level 5 / Skill) and the Specialist widget's
 * investigator + trait dimensions. Pure card-data queries (no profile state).
 */
import {
	card as cardUtils,
	CardType,
	Product,
	Slot,
	type Card,
	type CardCode,
} from '@5argon/arkham-kohaku';
import type { CardItem } from '@5argon/arkham-life-ui';
import { getAllCards } from '$lib/card-data';
import { isCardOwned } from '$lib/campaign/ownership';
import type { InsightDeck } from '$lib/profile/profile-types';

export const isPermanent = (c: Card): boolean => c.permanent === true;
export const isExceptional = (c: Card): boolean => c.exceptional === true;
/** Specialist (trait-restricted) cards — their deckbuilding restriction is a list of
 *  allowed investigator traits (e.g. On Their Heels → detective/hunter/police/reporter),
 *  which is what distinguishes them from signature cards (investigator-restricted). */
export const isSpecialist = (c: Card): boolean => (c.restrictions?.trait?.length ?? 0) > 0;
export const isLevel5 = (c: Card): boolean => c.xp === 5;
export const isSkillCard = (c: Card): boolean => c.cardType === CardType.Skill;
/** "Researched" cards (a kohaku tag) — all Seeker. */
export const isResearched = (c: Card): boolean => c.researched === true;
/** Customizable cards (carry the box-ticking customization mechanic). */
export const isCustomizable = (c: Card): boolean => c.customizationOptions !== undefined;

/** A specialist card's allowed traits, lowercased (the deckbuilding restriction). */
export const specialistTraitsOf = (c: Card): string[] =>
	(c.restrictions?.trait ?? []).map((t) => t.toLowerCase());

/** A card's own traits, lowercased (e.g. an investigator's "Agency. Detective."). */
export const traitsOf = (c: Card): string[] => (c.traits ?? []).map((t) => t.toLowerCase());

/** A card's (multi)class slots, lowercased — empty for mythos / no-class cards. */
export const cardClassesOf = (c: Card): string[] => {
	const cc = c.cardClass;
	if (!cc) return [];
	return [cc.class1, cc.class2, cc.class3]
		.filter((x): x is NonNullable<typeof x> => Boolean(x))
		.map((x) => String(x).toLowerCase());
};
export const inCardClass = (c: Card, cls: string): boolean =>
	cardClassesOf(c).includes(cls.toLowerCase());

/** Fold lifetime usage onto canonical codes (old Core Set → Revised Core Set twin). */
export function foldCanonUsage(cardUsage: Record<string, number>): Record<string, number> {
	const m: Record<string, number> = {};
	for (const [code, n] of Object.entries(cardUsage)) {
		const key = cardUtils.coreToRcore(code);
		m[key] = (m[key] ?? 0) + n;
	}
	return m;
}

let _specialistCodes: Set<CardCode> | null = null;
/** Every specialist player-card code in the game (cached). */
export function specialistCodeSet(): Set<CardCode> {
	if (!_specialistCodes) {
		_specialistCodes = new Set(
			getAllCards()
				.filter((c) => cardUtils.deckbuildingPlayerCardsFilter(c) && isSpecialist(c))
				.map((c) => c.code),
		);
	}
	return _specialistCodes;
}

/** Build the icon-grid items + played tally for a "filter" widget: every owned player
 *  card matching `predicate` (optionally narrowed to one class), lit by lifetime use.
 *  The original Core Set printing is dropped (its twins fold into Revised Core Set). */
export function utilizationItems(
	predicate: (c: Card) => boolean,
	cardUsage: Record<CardCode, number>,
	ownedProducts: Product[] | null,
	classFilter: string | null,
): { items: CardItem[]; played: number } {
	const canon = foldCanonUsage(cardUsage);
	const items: CardItem[] = [];
	let played = 0;
	for (const c of getAllCards()) {
		if (!cardUtils.deckbuildingPlayerCardsFilter(c)) continue;
		if (c.product === Product.CoreSet) continue; // old Core folds into its Revised twin
		if (!isCardOwned(c.product, ownedProducts)) continue;
		if (classFilter && !inCardClass(c, classFilter)) continue;
		if (!predicate(c)) continue;
		const count = canon[c.code] ?? 0;
		if (count > 0) played++;
		items.push({
			card: c,
			quantity: c.quantity,
			id: c.code,
			greyedOutQuantity: count > 0 ? 0 : c.quantity,
			iconCount: count,
		});
	}
	return { items, played };
}

// ─── Spotlight neutral cards (the bespoke per-deck "insight" widgets) ──────────
// A handful of neutral core cards we present as scans + per-deck insight rows. Each
// logical card spans its printings across the three core products (so usage merges).

const CORE_PRODUCTS: Product[] = [Product.CoreSet, Product.RevisedCoreSet, Product.CoreSet2026];

/** Level-0 neutral Core Set cards, in display order (two rows of five). */
const CORE_NEUTRAL_L0_NAMES = [
	'Knife',
	'Broken Bottle',
	'Flashlight',
	'Hand-Crank Flashlight',
	'Emergency Cache',
	'Guts',
	'Perception',
	'Overpower',
	'Manual Dexterity',
	'Unexpected Courage',
];
/** The Level-0 cantrip skills (Unexpected Courage deliberately excluded). */
export const CORE_NEUTRAL_CANTRIP_NAMES = ['Guts', 'Perception', 'Overpower', 'Manual Dexterity'];
/** Permanent neutral deck-slot cards (Revised Core + Core 2026 printings merge). */
const CHARISMA_RELIC_NAMES = ['Charisma', 'Relic Hunter'];

/** A spotlight card: a logical card and all its core-product printing codes. */
export interface SpotlightCard {
	name: string;
	/** Every printing code across the core products (usage sums over these). */
	codes: CardCode[];
	/** The code whose scan we render (prefer Revised Core, then Core 2026). */
	displayCode: CardCode;
}

function spotlightByNames(names: string[], xp: number): SpotlightCard[] {
	const want = new Set(names.map((n) => n.toLowerCase()));
	const byName = new Map<string, Card[]>();
	for (const c of getAllCards()) {
		if (!CORE_PRODUCTS.includes(c.product)) continue;
		if (!want.has(c.name.toLowerCase())) continue;
		// Discriminate same-name leveled reprints (e.g. Emergency Cache (2)) — the L0
		// spotlights are xp 0, Charisma / Relic Hunter are xp 3.
		if ((c.xp ?? 0) !== xp) continue;
		const arr = byName.get(c.name) ?? [];
		arr.push(c);
		byName.set(c.name, arr);
	}
	const out: SpotlightCard[] = [];
	for (const name of names) {
		const cards = byName.get(name);
		if (!cards?.length) continue;
		const display =
			cards.find((c) => c.product === Product.RevisedCoreSet) ??
			cards.find((c) => c.product === Product.CoreSet2026) ??
			cards[0];
		out.push({ name, codes: cards.map((c) => c.code), displayCode: display.code });
	}
	return out;
}

let _coreNeutralL0: SpotlightCard[] | null = null;
export function coreNeutralL0Cards(): SpotlightCard[] {
	return (_coreNeutralL0 ??= spotlightByNames(CORE_NEUTRAL_L0_NAMES, 0));
}
let _charismaRelic: SpotlightCard[] | null = null;
export function charismaRelicCards(): SpotlightCard[] {
	return (_charismaRelic ??= spotlightByNames(CHARISMA_RELIC_NAMES, 3));
}

/** Skill cards of one trait from a single product, each rendered as its own spotlight
 *  (single product → no cross-printing merge), sorted by card code. */
function traitSkillSpotlights(product: Product, trait: string): SpotlightCard[] {
	return getAllCards()
		.filter(
			(c) =>
				c.product === product &&
				c.cardType === CardType.Skill &&
				cardUtils.deckbuildingPlayerCardsFilter(c) &&
				traitsOf(c).includes(trait),
		)
		.sort((a, b) => a.code.localeCompare(b.code))
		.map((c) => ({ name: c.name, codes: [c.code], displayCode: c.code }));
}

let _desperate: SpotlightCard[] | null = null;
/** The four Path to Carcosa Desperate skill cards. */
export function desperateCards(): SpotlightCard[] {
	return (_desperate ??= traitSkillSpotlights(
		Product.ThePathToCarcosaInvestigatorExpansion,
		'desperate',
	));
}

let _innate: SpotlightCard[] | null = null;
/** The four Circle Undone Innate skill cards. */
export function innateCards(): SpotlightCard[] {
	return (_innate ??= traitSkillSpotlights(
		Product.TheCircleUndoneInvestigatorExpansion,
		'innate',
	));
}

/** Spotlights from an explicit code list, in the given order (each its own card). Codes
 *  not present in the data are skipped. */
function spotlightByCodes(codes: CardCode[]): SpotlightCard[] {
	const byCode = new Map(getAllCards().map((c) => [c.code, c] as const));
	return codes
		.map((code) => byCode.get(code))
		.filter((c): c is NonNullable<typeof c> => !!c)
		.map((c) => ({ name: c.name, codes: [c.code], displayCode: c.code }));
}

let _coreNeutralSkillUpgrades: SpotlightCard[] | null = null;
/** The five starter-deck Level-2 upgrades of the core neutral cantrip skills (one per
 *  class): Overpower / Perception / Manual Dexterity / Guts / Unexpected Courage. */
export function coreNeutralSkillUpgradeCards(): SpotlightCard[] {
	return (_coreNeutralSkillUpgrades ??= spotlightByCodes([
		'60126', // Overpower (Guardian — Nathaniel Cho)
		'60228', // Perception (Seeker — Harvey Walters)
		'60325', // Manual Dexterity (Rogue — Winifred Habbamock)
		'60424', // Guts (Mystic — Jacqueline Fine)
		'60526', // Unexpected Courage (Survivor — Stella Clark)
	]));
}

/** Spotlights that merge every reprint of a logical card (same name + level) across ALL
 *  products — usage sums over the printings. Display printing prefers Revised Core, then
 *  Core 2026, else the lowest code. Specs are emitted in the given order; a level > 0 is
 *  appended to the name (e.g. "Vicious Blow (2)") so leveled reprints stay distinct. */
function reprintSpotlights(specs: { name: string; xp: number }[]): SpotlightCard[] {
	const out: SpotlightCard[] = [];
	for (const { name, xp } of specs) {
		const cards = getAllCards()
			.filter(
				(c) =>
					c.name === name &&
					(c.xp ?? 0) === xp &&
					cardUtils.deckbuildingPlayerCardsFilter(c),
			)
			.sort((a, b) => a.code.localeCompare(b.code));
		if (!cards.length) continue;
		const display =
			cards.find((c) => c.product === Product.RevisedCoreSet) ??
			cards.find((c) => c.product === Product.CoreSet2026) ??
			cards[0];
		out.push({
			name: xp > 0 ? `${name} (${xp})` : name,
			codes: cards.map((c) => c.code),
			displayCode: display.code,
		});
	}
	return out;
}

let _viciousBlowDeduction: SpotlightCard[] | null = null;
/** Vicious Blow & Deduction at Level 0 and Level 2 (each merging all reprints). */
export function viciousBlowDeductionCards(): SpotlightCard[] {
	return (_viciousBlowDeduction ??= reprintSpotlights([
		{ name: 'Vicious Blow', xp: 0 },
		{ name: 'Vicious Blow', xp: 2 },
		{ name: 'Deduction', xp: 0 },
		{ name: 'Deduction', xp: 2 },
	]));
}

/** A card whose "deckbuilding-eligible but unused" rate an insight reports. The precompute
 *  runs every deck through two questions per target — "can this investigator+meta include the
 *  card?" (any of `eligibilityCodes`, via kohaku `card.canUse`) and "did the deck ever run it?"
 *  (any of `usedCodes`) — so the UI only renders the tallied result. */
export interface EligibilityTarget {
	id: string;
	eligibilityCodes: CardCode[];
	usedCodes: CardCode[];
}

/** The Vicious Blow & Deduction eligibility targets (one per logical card), merging each
 *  card's L0 + L2 printings. */
export function viciousBlowDeductionEligibility(): EligibilityTarget[] {
	const sp = viciousBlowDeductionCards();
	const sl = (name: string): SpotlightCard | undefined => sp.find((s) => s.name === name);
	const target = (id: string, l0: string, l2: string): EligibilityTarget => {
		const a = sl(l0);
		const b = sl(l2);
		return {
			id,
			eligibilityCodes: [a?.displayCode, b?.displayCode].filter((c): c is CardCode => !!c),
			usedCodes: [...(a?.codes ?? []), ...(b?.codes ?? [])],
		};
	};
	return [
		target('viciousBlow', 'Vicious Blow', 'Vicious Blow (2)'),
		target('deduction', 'Deduction', 'Deduction (2)'),
	];
}

let _coreCantrips: SpotlightCard[] | null = null;
/** The four Level-0 Core Set cantrip skills (all three core printings merged). */
export function coreCantripCards(): SpotlightCard[] {
	return (_coreCantrips ??= spotlightByNames(CORE_NEUTRAL_CANTRIP_NAMES, 0));
}

let _insightCodes: Set<CardCode> | null = null;
/** Every code the per-deck "insight" widgets track (so the builder records their
 *  per-deck quantities). Union of the spotlight cards' printings. */
export function insightTrackedCodeSet(): Set<CardCode> {
	if (!_insightCodes) {
		_insightCodes = new Set<CardCode>();
		for (const sc of [
			...coreNeutralL0Cards(),
			...charismaRelicCards(),
			...desperateCards(),
			...innateCards(),
			...coreNeutralSkillUpgradeCards(),
			...viciousBlowDeductionCards(),
			...coreCantripCards(),
		])
			for (const code of sc.codes) _insightCodes.add(code);
	}
	return _insightCodes;
}

let _allyCodes: Set<CardCode> | null = null;
let _accessoryCodes: Set<CardCode> | null = null;
const slotCodeSet = (slot: Slot): Set<CardCode> =>
	new Set(getAllCards().filter((c) => c.slots?.includes(slot)).map((c) => c.code));
/** Every card code that occupies an Ally slot (Charisma adds these slots). */
export const allySlotCodeSet = (): Set<CardCode> => (_allyCodes ??= slotCodeSet(Slot.Ally));
/** Every card code that occupies an Accessory slot (Relic Hunter adds these slots). */
export const accessorySlotCodeSet = (): Set<CardCode> =>
	(_accessoryCodes ??= slotCodeSet(Slot.Accessory));

let _custOptXp: Record<CardCode, number[]> | null = null;
/** Customizable card code → the box-count threshold (`xp`) of each option, by index.
 *  An option is "used" when its ticked boxes ≥ this threshold. */
export function customizableOptionXp(): Record<CardCode, number[]> {
	if (!_custOptXp) {
		_custOptXp = {};
		for (const c of getAllCards())
			if (c.customizationOptions) _custOptXp[c.code] = c.customizationOptions.map((o) => o.xp);
	}
	return _custOptXp;
}

let _byCode: Map<string, Card> | null = null;
const byCodeMap = (): Map<string, Card> => (_byCode ??= new Map(getAllCards().map((c) => [c.code, c])));
/** Collapse an alternate / promo investigator printing onto its base code. */
export const canonInvestigatorCode = (code: CardCode): CardCode =>
	byCodeMap().get(code)?.alternateOfCardCode ?? code;

/** From per-deck footprints, the decks matching `predicate` — their count plus up to
 *  `cap` distinct (canonical) qualifying investigators, for an insight row. The predicate
 *  gets the whole {@link InsightDeck} so it can read the union `slots` ("ever used X") OR a
 *  per-version field like `cantripMax` ("had N at once"). */
export function qualifyingInvestigators(
	decks: InsightDeck[],
	predicate: (deck: InsightDeck) => boolean,
	cap = 3,
): { count: number; investigators: CardCode[] } {
	let count = 0;
	const seen = new Set<string>();
	const investigators: CardCode[] = [];
	for (const d of decks) {
		if (!predicate(d)) continue;
		count++;
		const inv = canonInvestigatorCode(d.inv);
		if (!seen.has(inv) && investigators.length < cap) {
			seen.add(inv);
			investigators.push(inv);
		}
	}
	return { count, investigators };
}
