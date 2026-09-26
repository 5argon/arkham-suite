/** Profile URL slugs: a campaign's slug is its kohaku `Campaign` value (`tsk`), not its campaign-data
 *  code (`tskc`); a class slug is its `CardClass` value. */
import { getCampaignLog } from '@5argon/arkham-campaign-data';
import { Campaign, CardClass } from '@5argon/arkham-kohaku';
import { u as stringUtils } from '@5argon/arkham-string';

const FAMILY_TO_SLUG = new Map<string, string>();
for (const c of Object.values(Campaign)) {
	const log = getCampaignLog(c);
	if (!log) continue;
	FAMILY_TO_SLUG.set(log.db.code, c as string);
}

/** A kohaku campaign code's display name; unknown codes pass through. */
export function campaignDisplayName(code: string): string {
	return (Object.values(Campaign) as string[]).includes(code)
		? stringUtils.campaignName(code as Campaign)
		: code;
}

/** A card class slug's display name; unknown slugs pass through. */
export function classDisplayName(slug: string): string {
	return (Object.values(CardClass) as string[]).includes(slug)
		? stringUtils.cardClass(slug as CardClass)
		: slug;
}

export function slugForFamily(family: string): string {
	return FAMILY_TO_SLUG.get(family) ?? family;
}

export interface ResolvedCampaign {
	slug: string;
	family: string;
	name: string;
}

/** Resolve a campaign URL slug to its family, gated on the player having played
 *  it. Returns null (→ 404) for unknown or unplayed campaigns. */
export function resolveCampaignSlug(
	slug: string,
	playedFamilies: ReadonlySet<string>,
): ResolvedCampaign | null {
	const log = getCampaignLog(slug);
	if (!log) return null;
	// Each campaign is its own family (Return-to included).
	const family = log.db.code;
	if (!playedFamilies.has(family)) return null;
	return { slug, family, name: log.db.name };
}

/** Validate a card-class URL slug against the `CardClass` enum. */
export function resolveClassSlug(slug: string): CardClass | null {
	return (Object.values(CardClass) as string[]).includes(slug) ? (slug as CardClass) : null;
}

/** Families the player has actually played, from their win/loss records. */
export function playedFamiliesFrom(records: { family: string; plays: number }[]): Set<string> {
	return new Set(records.filter((r) => r.plays > 0).map((r) => r.family));
}

export interface PlayedCampaign {
	slug: string;
	family: string;
	name: string;
	plays: number;
}

/** Played campaigns as a slug list for the campaigns-home nav, most-played first. */
export function playedCampaignList(
	records: { family: string; name: string; plays: number }[],
): PlayedCampaign[] {
	return records
		.filter((r) => r.plays > 0)
		.sort((a, b) => b.plays - a.plays)
		.map((r) => ({ slug: slugForFamily(r.family), family: r.family, name: r.name, plays: r.plays }));
}
