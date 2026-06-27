/**
 * deck-experience.ts — Standalone Mode deckbuilding cost.
 *
 * Standalone Mode lets an investigator include higher-level cards by counting the
 * "total experience of all the higher level cards used in the deck" and taking that
 * many tiers of additional random basic weaknesses (0–9→T1 … 40–49→T5); a deck may
 * not include 50+ XP worth of cards. We compute that total and band it.
 *
 * Interpretation (documented so it's reviewable):
 *  - Sum the PRINTED level (`card.xp`) × quantity over every card with `xp >= 1`,
 *    across both `slots` and `ignoreDeckLimitSlots`. Story/weakness/level-0 cards
 *    (xp 0 or undefined) contribute nothing.
 *  - Exceptional cards are NOT doubled (the rule counts the cards' experience, i.e.
 *    printed level, not the deckbuilding cost).
 *  - Customization XP and Taboo mutations are NOT counted (v1) — only printed `card.xp`.
 */

export interface XpTier {
	/** 1–5. */
	tier: number;
	/** Inclusive XP bounds for the tier. */
	min: number;
	max: number;
	/** Additional random basic weaknesses this tier requires (== tier - 1). */
	weaknesses: number;
	/** Display label, e.g. "Tier 3: 20–29 XP". */
	label: string;
}

export const XP_TIERS: XpTier[] = [
	{ tier: 1, min: 0, max: 9, weaknesses: 0, label: 'Tier 1: 0–9 XP' },
	{ tier: 2, min: 10, max: 19, weaknesses: 1, label: 'Tier 2: 10–19 XP' },
	{ tier: 3, min: 20, max: 29, weaknesses: 2, label: 'Tier 3: 20–29 XP' },
	{ tier: 4, min: 30, max: 39, weaknesses: 3, label: 'Tier 4: 30–39 XP' },
	{ tier: 5, min: 40, max: 49, weaknesses: 4, label: 'Tier 5: 40–49 XP' }
];

/** The maximum legal standalone-deck experience (a deck may not include 50+ XP). */
export const STANDALONE_XP_CAP = 50;

/** The XP tier a total falls into, or `null` when it is at/over the 50-XP cap (illegal). */
export function xpRangeTier(total: number): XpTier | null {
	if (total >= STANDALONE_XP_CAP) return null;
	return XP_TIERS.find((t) => total >= t.min && total <= t.max) ?? null;
}

interface AhdbSlots {
	slots?: Record<string, number>;
	ignoreDeckLimitSlots?: Record<string, number>;
}

/**
 * Total higher-level experience of a single deck (an ArkhamDB deck JSON string),
 * given a code→printed-XP lookup. Sums `xp × qty` over cards with `xp >= 1`.
 */
export function deckExperience(ahdbJson: string, xpByCode: Map<string, number>): number {
	let json: AhdbSlots;
	try {
		json = JSON.parse(ahdbJson) as AhdbSlots;
	} catch {
		return 0;
	}
	let total = 0;
	for (const slots of [json.slots, json.ignoreDeckLimitSlots]) {
		for (const [code, qty] of Object.entries(slots ?? {})) {
			const xp = xpByCode.get(code) ?? 0;
			if (xp >= 1) total += xp * qty;
		}
	}
	return total;
}
