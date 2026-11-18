/**
 * Standalone Mode deckbuilding cost: a deck takes one tier of additional random basic weaknesses per
 * 10 experience of higher-level cards (0–9 → Tier 1 … 40–49 → Tier 5) and may not include 50+.
 *
 * The total sums the printed level × quantity of every card of level 1+, across `slots` and
 * `ignoreDeckLimitSlots`. Exceptional cards are not doubled (the rule counts the cards' experience,
 * not their deckbuilding cost); customization XP and taboo changes are not counted.
 */
import * as m from '$lib/paraglide/messages.js';

export interface XpTier {
	tier: number;
	/** Inclusive XP bounds. */
	min: number;
	max: number;
	/** Additional random basic weaknesses the tier requires. */
	weaknesses: number;
	/** "Tier 3: 20–29 XP". */
	label: string;
}

const xpTier = (tier: number): XpTier => ({
	tier,
	min: (tier - 1) * 10,
	max: tier * 10 - 1,
	weaknesses: tier - 1,
	get label() {
		return m.standalones_xp_tier({ tier, min: this.min, max: this.max });
	}
});

export const XP_TIERS: XpTier[] = [1, 2, 3, 4, 5].map(xpTier);

/** A deck may not include this much experience. */
export const STANDALONE_XP_CAP = 50;

/** The tier a total falls into; null at or over the cap. */
export function xpRangeTier(total: number): XpTier | null {
	if (total >= STANDALONE_XP_CAP) return null;
	return XP_TIERS.find((t) => total >= t.min && total <= t.max) ?? null;
}

interface AhdbSlots {
	slots?: Record<string, number>;
	ignoreDeckLimitSlots?: Record<string, number>;
}

/** The higher-level experience of an ArkhamDB deck JSON, given each code's printed level. */
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
