/** Card-data queries behind the player-card and investigator widgets: filter predicates, the
 *  spotlight card sets, and the derivations those widgets render. */
import {
	card as cardUtils,
	CardType,
	Product,
	productCoreSets,
	Slot,
	type Card,
	type CardCode,
} from '@5argon/arkham-kohaku';
import type { CardItem } from '@5argon/arkham-life-ui';
import { cardByCode, getAllCards } from '$lib/card-data';
import { isCardOwned } from '$lib/campaign/utils/ownership';
import type { CustomizableUsage, InsightDeck } from '$lib/profile/profile-types';

export const isPermanent = (c: Card): boolean => c.permanent === true;
export const isExceptional = (c: Card): boolean => c.exceptional === true;
/** Restricted by investigator trait (On Their Heels → Detective / Hunter / Police / Reporter), unlike
 *  signature cards, which are restricted by investigator. */
export const isSpecialist = (c: Card): boolean => (c.restrictions?.trait?.length ?? 0) > 0;
export const isLevel5 = (c: Card): boolean => c.xp === 5;
export const isSkillCard = (c: Card): boolean => c.cardType === CardType.Skill;
export const isResearched = (c: Card): boolean => c.researched === true;
export const isCustomizable = (c: Card): boolean => c.customizationOptions !== undefined;

/** The investigator traits a specialist card allows, lowercased. */
export const specialistTraitsOf = (c: Card): string[] =>
	(c.restrictions?.trait ?? []).map((t) => t.toLowerCase());

/** A card's own traits, lowercased. */
export const traitsOf = (c: Card): string[] => (c.traits ?? []).map((t) => t.toLowerCase());

/** A card's classes, lowercased; empty for cards without a class. */
export const cardClassesOf = (c: Card): string[] => {
	const cc = c.cardClass;
	if (!cc) return [];
	return [cc.class1, cc.class2, cc.class3]
		.filter((x): x is NonNullable<typeof x> => Boolean(x))
		.map((x) => String(x).toLowerCase());
};
export const inCardClass = (c: Card, cls: string): boolean =>
	cardClassesOf(c).includes(cls.toLowerCase());

/** The cards behind `codes` that the bundled database knows, in order. */
export function resolveCards(
	codes: readonly string[],
	{ dedupeByName = false, cap = Infinity }: { dedupeByName?: boolean; cap?: number } = {},
): Card[] {
	const out: Card[] = [];
	const names = new Set<string>();
	for (const code of codes) {
		if (out.length >= cap) break;
		const card = cardByCode(code);
		if (!card || (dedupeByName && names.has(card.name))) continue;
		names.add(card.name);
		out.push(card);
	}
	return out;
}

/** `items` paired with their card; codes the bundled database doesn't know are dropped. */
export function withCards<T extends { code: string }>(items: readonly T[]): (T & { card: Card })[] {
	return items.flatMap((item) => {
		const card = cardByCode(item.code);
		return card ? [{ ...item, card }] : [];
	});
}

/** Lifetime usage keyed by canonical code (an old Core Set printing counts as its Revised Core Set
 *  twin). */
export function foldCanonUsage(cardUsage: Record<string, number>): Record<string, number> {
	const m: Record<string, number> = {};
	for (const [code, n] of Object.entries(cardUsage)) {
		const key = cardUtils.coreToRcore(code);
		m[key] = (m[key] ?? 0) + n;
	}
	return m;
}

/** Every owned player card, optionally of one class. The old Core Set printings are left out; their
 *  usage folds into the Revised Core Set twins ({@link foldCanonUsage}). */
export function ownedPlayerCards(ownedProducts: Product[] | null, classFilter: string | null): Card[] {
	return getAllCards().filter(
		(c) =>
			cardUtils.deckbuildingPlayerCardsFilter(c) &&
			c.product !== Product.CoreSet &&
			isCardOwned(c.product, ownedProducts) &&
			(!classFilter || inCardClass(c, classFilter)),
	);
}

let _specialists: Card[] | null = null;
/** Every specialist player card, by card number. */
export function specialistCards(): Card[] {
	return (_specialists ??= getAllCards()
		.filter((c) => cardUtils.deckbuildingPlayerCardsFilter(c) && isSpecialist(c))
		.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
}

let _specialistCodes: Set<CardCode> | null = null;
export function specialistCodeSet(): Set<CardCode> {
	return (_specialistCodes ??= new Set(specialistCards().map((c) => c.code)));
}

/** The icon-grid items for a card-filter widget: every owned player card matching `predicate`, lit by
 *  lifetime use. */
export function utilizationItems(
	predicate: (c: Card) => boolean,
	cardUsage: Record<CardCode, number>,
	ownedProducts: Product[] | null,
	classFilter: string | null,
): { items: CardItem[]; played: number } {
	const canon = foldCanonUsage(cardUsage);
	const items: CardItem[] = ownedPlayerCards(ownedProducts, classFilter)
		.filter(predicate)
		.map((c) => {
			const count = canon[c.code] ?? 0;
			return {
				card: c,
				quantity: c.quantity,
				id: c.code,
				greyedOutQuantity: count > 0 ? 0 : c.quantity,
				iconCount: count,
			};
		});
	return { items, played: items.filter((i) => (i.iconCount ?? 0) > 0).length };
}

export interface UsageShare {
	played: number;
	total: number;
}

export interface CardInsights extends UsageShare {
	byClass: (UsageShare & { cls: string })[];
	byLevel: (UsageShare & { level: number })[];
}

/** How many owned player cards were ever put in a deck: overall, per class and per level. A
 *  multiclass card counts under each of its classes, matching the class pages. */
export function cardInsights(
	cardUsage: Record<CardCode, number>,
	ownedProducts: Product[] | null,
	classFilter: string | null,
): CardInsights {
	const canon = foldCanonUsage(cardUsage);
	const all: UsageShare = { played: 0, total: 0 };
	const byClass = new Map<string, UsageShare>();
	const byLevel = new Map<number, UsageShare>();
	const bump = (share: UsageShare, used: boolean) => {
		share.total++;
		if (used) share.played++;
	};
	const entry = <K>(map: Map<K, UsageShare>, key: K): UsageShare => {
		let e = map.get(key);
		if (!e) map.set(key, (e = { played: 0, total: 0 }));
		return e;
	};
	for (const c of ownedPlayerCards(ownedProducts, classFilter)) {
		const used = (canon[c.code] ?? 0) > 0;
		bump(all, used);
		const classes = classFilter ? [classFilter] : cardClassesOf(c);
		for (const cls of classes.length ? classes : ['neutral']) bump(entry(byClass, cls), used);
		bump(entry(byLevel, c.xp ?? 0), used);
	}
	return {
		...all,
		byClass: [...byClass].map(([cls, s]) => ({ cls, ...s })).sort((a, b) => b.total - a.total),
		byLevel: [...byLevel].map(([level, s]) => ({ level, ...s })).sort((a, b) => a.level - b.level),
	};
}

/** The most-used owned player cards outside the core sets, most used first. */
export function topCards(
	cardUsage: Record<CardCode, number>,
	ownedProducts: Product[] | null,
	classFilter: string | null,
	count: number,
): { card: Card; count: number }[] {
	return ownedPlayerCards(ownedProducts, classFilter)
		.filter((c) => !productCoreSets.includes(c.product) && (cardUsage[c.code] ?? 0) > 0)
		.map((c) => ({ card: c, count: cardUsage[c.code] }))
		.sort((a, b) => b.count - a.count || a.card.name.localeCompare(b.card.name))
		.slice(0, count);
}

// ─── Spotlight cards ─────────────────────────────────────────────────────────────
// A handful of cards shown as scans with per-deck insight rows. A spotlight can span several
// printings (the three core products, or every reprint), whose usage sums.

export const CORE_PRODUCTS: ReadonlySet<Product> = new Set([
	Product.CoreSet,
	Product.RevisedCoreSet,
	Product.CoreSet2026,
]);

/** Two rows of five. */
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
/** Unexpected Courage is not one of them. */
export const CORE_NEUTRAL_CANTRIP_NAMES = ['Guts', 'Perception', 'Overpower', 'Manual Dexterity'];
const CHARISMA_RELIC_NAMES = ['Charisma', 'Relic Hunter'];

/** A logical card and every printing whose usage it sums. */
export interface SpotlightCard {
	name: string;
	codes: CardCode[];
	/** The printing whose scan is shown. */
	displayCode: CardCode;
}

const displayPrinting = (cards: Card[]): Card =>
	cards.find((c) => c.product === Product.RevisedCoreSet) ??
	cards.find((c) => c.product === Product.CoreSet2026) ??
	cards[0];

function spotlightByNames(names: string[], xp: number): SpotlightCard[] {
	const want = new Set(names.map((n) => n.toLowerCase()));
	const byName = new Map<string, Card[]>();
	for (const c of getAllCards()) {
		if (!CORE_PRODUCTS.has(c.product)) continue;
		if (!want.has(c.name.toLowerCase())) continue;
		// Same-name leveled reprints (Emergency Cache (2)) are other cards.
		if ((c.xp ?? 0) !== xp) continue;
		const arr = byName.get(c.name) ?? [];
		arr.push(c);
		byName.set(c.name, arr);
	}
	return names.flatMap((name) => {
		const cards = byName.get(name);
		return cards?.length
			? [{ name, codes: cards.map((c) => c.code), displayCode: displayPrinting(cards).code }]
			: [];
	});
}

let _coreNeutralL0: SpotlightCard[] | null = null;
export function coreNeutralL0Cards(): SpotlightCard[] {
	return (_coreNeutralL0 ??= spotlightByNames(CORE_NEUTRAL_L0_NAMES, 0));
}
let _charismaRelic: SpotlightCard[] | null = null;
export function charismaRelicCards(): SpotlightCard[] {
	return (_charismaRelic ??= spotlightByNames(CHARISMA_RELIC_NAMES, 3));
}

/** Skill cards of one trait from one product, each its own spotlight, by card code. */
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
export function desperateCards(): SpotlightCard[] {
	return (_desperate ??= traitSkillSpotlights(
		Product.ThePathToCarcosaInvestigatorExpansion,
		'desperate',
	));
}

let _innate: SpotlightCard[] | null = null;
export function innateCards(): SpotlightCard[] {
	return (_innate ??= traitSkillSpotlights(Product.TheCircleUndoneInvestigatorExpansion, 'innate'));
}

let _coreNeutralSkillUpgrades: SpotlightCard[] | null = null;
/** The starter-deck Level-2 upgrades of the core neutral cantrip skills, one per class. */
export function coreNeutralSkillUpgradeCards(): SpotlightCard[] {
	return (_coreNeutralSkillUpgrades ??= resolveCards([
		'60126', // Overpower (Nathaniel Cho)
		'60228', // Perception (Harvey Walters)
		'60325', // Manual Dexterity (Winifred Habbamock)
		'60424', // Guts (Jacqueline Fine)
		'60526', // Unexpected Courage (Stella Clark)
	]).map((c) => ({ name: c.name, codes: [c.code], displayCode: c.code })));
}

/** One spotlight per (name, level), merging every reprint across all products; a level above 0 is
 *  appended to the name so "Vicious Blow (2)" stays distinct. */
function reprintSpotlights(specs: { name: string; xp: number }[]): SpotlightCard[] {
	return specs.flatMap(({ name, xp }) => {
		const cards = getAllCards()
			.filter(
				(c) => c.name === name && (c.xp ?? 0) === xp && cardUtils.deckbuildingPlayerCardsFilter(c),
			)
			.sort((a, b) => a.code.localeCompare(b.code));
		return cards.length
			? [
					{
						name: xp > 0 ? `${name} (${xp})` : name,
						codes: cards.map((c) => c.code),
						displayCode: displayPrinting(cards).code,
					},
				]
			: [];
	});
}

let _viciousBlowDeduction: SpotlightCard[] | null = null;
export function viciousBlowDeductionCards(): SpotlightCard[] {
	return (_viciousBlowDeduction ??= reprintSpotlights([
		{ name: 'Vicious Blow', xp: 0 },
		{ name: 'Vicious Blow', xp: 2 },
		{ name: 'Deduction', xp: 0 },
		{ name: 'Deduction', xp: 2 },
	]));
}

/** A card whose "could include it but didn't" rate the precompute tallies over every deck: a deck is
 *  eligible when its investigator and meta can take any of `eligibilityCodes` (kohaku `card.canUse`),
 *  and used it when any version ran one of `usedCodes`. */
export interface EligibilityTarget {
	id: string;
	eligibilityCodes: CardCode[];
	usedCodes: CardCode[];
}

/** Vicious Blow and Deduction, each merging its Level 0 and Level 2 printings. */
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
export function coreCantripCards(): SpotlightCard[] {
	return (_coreCantrips ??= spotlightByNames(CORE_NEUTRAL_CANTRIP_NAMES, 0));
}

let _insightCodes: Set<CardCode> | null = null;
/** Every printing a spotlight widget reads from the per-deck footprints. */
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

/** A spotlight's display card with its lifetime use count summed over its printings. */
export function spotlightTiles(
	spotlights: SpotlightCard[],
	cardUsage: Record<CardCode, number>,
): { card: Card; count: number }[] {
	return spotlights.flatMap((s) => {
		const card = cardByCode(s.displayCode);
		return card ? [{ card, count: s.codes.reduce((n, c) => n + (cardUsage[c] ?? 0), 0) }] : [];
	});
}

/** Copies of a spotlight card a deck ran: the most of any one printing. */
export const spotlightCopies = (deck: InsightDeck, s: SpotlightCard | undefined): number =>
	Math.max(0, ...(s?.codes ?? []).map((c) => deck.slots[c] ?? 0));

/** An insight-table row: how many decks meet a condition, with up to three of their investigators. */
export interface InsightRow {
	label: string;
	count: number;
	investigators: CardCode[];
	/** The denominator of the row's percentage, shown on hover. */
	total?: number;
	/** Print the denominator inline instead. */
	showTotal?: boolean;
}

export interface InsightRowDef {
	label: () => string;
	pred: (deck: InsightDeck) => boolean;
}

/** Insight rows over the decks' footprints, each a share of `total` decks. */
export function insightRows(defs: InsightRowDef[], decks: InsightDeck[], total: number): InsightRow[] {
	return defs.map((d) => ({ label: d.label(), total, ...qualifyingInvestigators(decks, d.pred) }));
}

let _allyCodes: Set<CardCode> | null = null;
let _accessoryCodes: Set<CardCode> | null = null;
const slotCodeSet = (slot: Slot): Set<CardCode> =>
	new Set(getAllCards().filter((c) => c.slots?.includes(slot)).map((c) => c.code));
/** Every card that takes an Ally slot (Charisma adds one). */
export const allySlotCodeSet = (): Set<CardCode> => (_allyCodes ??= slotCodeSet(Slot.Ally));
/** Every card that takes an Accessory slot (Relic Hunter adds one). */
export const accessorySlotCodeSet = (): Set<CardCode> =>
	(_accessoryCodes ??= slotCodeSet(Slot.Accessory));

let _custOptXp: Record<CardCode, number[]> | null = null;
/** Customizable card → the boxes each option needs ticked, by option index. */
export function customizableOptionXp(): Record<CardCode, number[]> {
	if (!_custOptXp) {
		_custOptXp = {};
		for (const c of getAllCards())
			if (c.customizationOptions) _custOptXp[c.code] = c.customizationOptions.map((o) => o.xp);
	}
	return _custOptXp;
}

export interface CustomizableOptionRow {
	title: string;
	description: string;
	/** Boxes to tick before the option applies. */
	boxes: number;
	count: number;
	/** The most recent investigator who used it. */
	recent: Card | null;
}

export interface CustomizableRow {
	card: Card;
	/** Decks that ran the card. */
	total: number;
	options: CustomizableOptionRow[];
	/** Level → decks that reached it. */
	levels: Record<string, number>;
	maxLevel: number;
}

/** Every customizable card (optionally of one class), by set then number, with how its decks
 *  customized it. The untitled options are the xp-0 "choose …" starters and are left out. */
export function customizableRows(
	usage: CustomizableUsage,
	classFilter: string | null,
): CustomizableRow[] {
	return getAllCards()
		.filter((c) => isCustomizable(c) && (!classFilter || inCardClass(c, classFilter)))
		.sort((a, b) => a.code.localeCompare(b.code))
		.map((card) => {
			const u = usage[card.code];
			const opts = card.customizationOptions ?? [];
			const options = opts.flatMap((opt, i): CustomizableOptionRow[] => {
				if (!opt.text?.title) return [];
				const o = u?.options[String(i)];
				return [
					{
						title: opt.text.title,
						description: opt.text.description ?? '',
						boxes: opt.xp ?? 0,
						count: o?.count ?? 0,
						recent: o?.recent[0] ? (cardByCode(o.recent[0]) ?? null) : null,
					},
				];
			});
			const totalBoxes = opts.reduce((n, o) => n + (o.xp ?? 0), 0);
			return {
				card,
				total: Object.values(u?.levels ?? {}).reduce((n, x) => n + x, 0),
				options,
				levels: u?.levels ?? {},
				// Ticking stops at 10 boxes, so the level tops out at 5.
				maxLevel: Math.ceil(Math.min(totalBoxes, 10) / 2),
			};
		});
}

/** An alternate or promo investigator printing's base code. */
export const canonInvestigatorCode = (code: CardCode): CardCode =>
	cardByCode(code)?.alternateOfCardCode ?? code;

let _roster: Card[] | null = null;
/** One card per investigator (the base printing over alternates), by set then number. */
export function investigatorRoster(): Card[] {
	if (!_roster) {
		const byKey = new Map<string, Card>();
		for (const c of getAllCards()) {
			if (!cardUtils.deckbuildingInvestigatorCardsFilter(c)) continue;
			const key = c.alternateOfCardCode ?? c.code;
			const prev = byKey.get(key);
			if (!prev || (!c.alternateOfCardCode && prev.alternateOfCardCode)) byKey.set(key, c);
		}
		_roster = [...byKey.values()].sort((a, b) => a.code.localeCompare(b.code));
	}
	return _roster;
}

export interface SpecialistMatrix {
	/** Lit when any of the investigator's decks ran a specialist card. */
	roster: { card: Card; lit: boolean }[];
	used: number;
	/** Per allowed trait, the specialist cards allowing it, lit only when an investigator WITH that
	 *  trait ran it: Roland (Agency, Detective) doesn't light a card on the Police row. */
	traits: { trait: string; cards: { card: Card; lit: boolean; triggers: Card[] }[] }[];
}

/** Which specialist cards were fielded, by investigator and by allowed trait. */
export function specialistMatrix(specialistUsage: Record<CardCode, CardCode[]>): SpecialistMatrix {
	const users = new Set(Object.values(specialistUsage).flat().map(canonInvestigatorCode));
	const roster = investigatorRoster().map((card) => ({ card, lit: users.has(card.code) }));
	const hasTrait = (code: string, t: string) => {
		const c = cardByCode(code);
		return c ? traitsOf(c).includes(t) : false;
	};
	const traits = [...new Set(specialistCards().flatMap(specialistTraitsOf))].sort().map((trait) => ({
		trait,
		cards: specialistCards()
			.filter((c) => specialistTraitsOf(c).includes(trait))
			.map((card) => {
				const triggers = [
					...new Set((specialistUsage[card.code] ?? []).map(canonInvestigatorCode)),
				].filter((inv) => hasTrait(inv, trait));
				return { card, lit: triggers.length > 0, triggers: resolveCards(triggers, { cap: 3 }) };
			}),
	}));
	return { roster, used: roster.filter((r) => r.lit).length, traits };
}

/** The decks meeting `predicate`, with up to `cap` distinct (canonical) investigators among them. */
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
