/**
 * profile-slugs.ts — URL slug ⇆ campaign-family / card-class resolution for the
 * hierarchical profile routes (client-safe). A campaign's public slug is its
 * kohaku `Campaign` value (e.g. `tsk`, `eote`) — NOT the campaign-data code
 * (`tskc`, `eoe`); `getCampaignLog` bridges the two. Card-class slugs are the
 * `CardClass` enum values verbatim.
 */

import { getCampaignLog } from '@5argon/arkham-campaign-data';
import { Campaign, CardClass } from '@5argon/arkham-kohaku';

// family (the ProfileData array key) → canonical base slug (URL).
const FAMILY_TO_SLUG = new Map<string, string>();
for (const c of Object.values(Campaign)) {
	const log = getCampaignLog(c);
	if (!log) continue;
	// A base campaign has no `originalId`; its family === its own code. Return-to
	// variants fold onto that same family, so the base slug already covers them.
	if (!log.db.originalId) FAMILY_TO_SLUG.set(log.db.code, c as string);
}

/** Canonical URL slug for a folded family code (falls back to the family). */
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
	const family = log.db.originalId ?? log.db.code;
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
