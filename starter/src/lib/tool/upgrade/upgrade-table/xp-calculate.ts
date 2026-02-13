import type { CardResolver } from '@5argon/arkham-kohaku';
import type { GlobalSettings } from '$lib/proto/generated/global_settings';

import { placeholderCard, type Row } from '../interface';

export interface CalculatedXp {
	costs: number[];
	cumulatives: number[];
}

export function calculateXps(
	resolver: CardResolver,
	rows: Row[],
	gs: GlobalSettings
): CalculatedXp {
	let cumulative = 0;
	const costs: number[] = [];
	const cumulatives: number[] = [];
	for (let i = 0; i < rows.length; i++) {
		const r = rows[i];
		if (r.divider) {
			if (r.dividerXpCumulativeUnlock) {
				cumulative = r.carryoverXp;
			}
			costs.push(r.xp);
			cumulatives.push(cumulative);
		} else {
			if (r.xpUnlock) {
				cumulative += r.xp;
				costs.push(r.xp);
				cumulatives.push(cumulative);
			} else {
				const customizing: number | false = r.custom ? r.customizationChoice : false;
				const xp = findXpDifference(r.left, r.right, resolver, customizing);
				costs.push(xp);
				cumulative += xp;
				cumulatives.push(cumulative);
			}
		}
	}
	return {
		costs: costs,
		cumulatives: cumulatives
	};
}

/**
 * Returns 0 XP if card not found or not a card.
 */
function findXpDifference(
	cardLeft: string | null,
	cardRight: string | null,
	resolver: CardResolver,
	customizing: number | false
): number {
	if (cardLeft === null && cardRight === null) {
		return 0;
	}
	if (cardRight === placeholderCard) {
		return 0;
	}
	let leftXp = 0;
	let rightXp = 0;
	let cn1: string | null = null;
	let cn2: string | null = null;
	if (cardLeft !== null) {
		leftXp = findXp(cardLeft, resolver, customizing);
		cn1 = findCardName(cardLeft, resolver);
	}
	if (cardRight !== null) {
		rightXp = findXp(cardRight, resolver, customizing);
		cn2 = findCardName(cardRight, resolver);
	}
	if (cardRight !== null && cardLeft === null) {
		return Math.max(1, rightXp);
	} else if (cardRight === null && cardLeft !== null) {
		return 0;
	} else {
		if (cn1 !== null && cn2 !== null && cn1 === cn2) {
			return Math.max(1, rightXp - leftXp);
		} else {
			return Math.max(1, rightXp);
		}
	}
}

function findXp(cardCode: string, resolver: CardResolver, customizing: number | false): number {
	let card;
	try {
		card = resolver.resolve(cardCode);
	} catch (e) {
		return 0;
	}

	// Handle customization
	if (customizing !== false && card.customizationOptions) {
		const noZeroCus = card.customizationOptions.filter((x) => x.xp > 0);
		if (customizing < noZeroCus.length) {
			const choice = noZeroCus[customizing];
			return choice.xp;
		}
	}

	// Base XP + chained adjustment (taboo is already applied in the resolver)
	const baseXp = (card.xp ?? 0) + (card.chained ?? 0);

	// Exceptional multiplier
	const multiplier = card.exceptional ? 2 : 1;

	return baseXp * multiplier;
}

function findCardName(cardCode: string, resolver: CardResolver): string | null {
	try {
		const card = resolver.resolve(cardCode);
		return card.name;
	} catch (e) {
		return null;
	}
}

/**
 * Returns `null` if not a card.
 */
function extractCard(s: string): string | null {
	const captureCardId = new RegExp(/\(\/card\/([^)]*)\)/gm);
	const result = captureCardId.exec(s);
	if (result === null) {
		return null;
	}
	return result[1];
}
