import type { Card } from '@5argon/arkham-kohaku';

/** campaign-data's card-picker restriction (on a `cards` section, a `#name#` entry, or an Extra
 *  `cards` choice). */
export interface CardFilter {
	types?: string[];
	subtypes?: string[];
	traits?: string[];
	codes?: string[];
}

/**
 * The cards a filtered picker offers: type listed (when `types` given) AND subtype listed (when
 * `subtypes` given) AND (a trait in `traits` OR the code in `codes`, when either is given). An
 * investigator-only picker offers just the campaign's own investigators when a roster is recorded.
 */
export function cardPoolFor(
	filter: CardFilter | undefined,
	cards: Card[],
	rosterCodes: ReadonlySet<string>,
): Card[] {
	if (!filter) return cards;
	const { types, subtypes, codes } = filter;
	const traits = filter.traits?.map((t) => t.toLowerCase());
	const investigatorsOnly = types?.length === 1 && types[0] === 'investigator' && rosterCodes.size > 0;
	return cards.filter(
		(c) =>
			(!types?.length || types.includes(c.cardType)) &&
			(!investigatorsOnly || rosterCodes.has(c.code)) &&
			(!subtypes?.length || (!!c.subtypeCode && subtypes.includes(c.subtypeCode))) &&
			((!traits?.length && !codes?.length) ||
				!!codes?.includes(c.code) ||
				!!c.traits?.some((t) => traits?.includes(t.toLowerCase()))),
	);
}
