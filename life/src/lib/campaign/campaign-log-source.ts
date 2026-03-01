/**
 * campaign-log-source.ts — the single accessor for campaign-log *definitions*,
 * replacing the retired home-grown `campaign-log-loader`. All structure/text now
 * comes from `@5argon/arkham-campaign-data` (authoritative, spoiler-aware, covers
 * every official campaign incl. fof/gob/side).
 *
 * `getCampaignLog` accepts a kohaku `Campaign` enum value (or raw data code) and
 * internally aliases `eote→eoe` / `tsk→tskc`, so the stored `campaign_code`
 * passes straight through.
 */
import { getCampaignLog, playableScenarios } from '@5argon/arkham-campaign-data';
import type { CampaignLog, LogSectionDef } from '@5argon/arkham-campaign-data';

export type { CampaignLog, LogSectionDef };

/** Resolve a campaign's full log definition, or undefined for an unknown code. */
export function loadCampaignLog(campaignCode: string | null | undefined): CampaignLog | undefined {
	if (!campaignCode) return undefined;
	return getCampaignLog(campaignCode);
}

/**
 * Player-facing sections in sheet order, excluding internal/hidden ones. The
 * physical-sheet wording lives in `en.sections[id]`, so the UI heading matches
 * the paper sheet one-to-one.
 */
export function visibleSections(log: CampaignLog): LogSectionDef[] {
	return log.db.sections.filter((s) => !s.hidden && s.id !== 'hidden');
}

/** Verbatim physical-sheet section title (falls back to the id). */
export function sectionTitle(log: CampaignLog, sectionId: string): string {
	return log.en.sections[sectionId] ?? sectionId;
}

/** Label for a special-section item (partner / key / supply / glyph), id fallback. */
export function itemLabel(log: CampaignLog, itemId: string): string {
	return log.en.items?.[itemId] ?? itemId;
}

/** Verbatim physical-sheet text for a log ENTRY (composite `"section.id"` key) —
 *  e.g. a camp location or a recovered supply. Falls back to the key. */
export function entryLabel(log: CampaignLog, key: string): string {
	return log.en.entries?.[key]?.text ?? key;
}

/**
 * The campaign's PLAYABLE scenarios (ArkhamCards type `'story'`) in campaign
 * order — for the per-scenario "Extra" tab (XP). Interludes, prologues and
 * epilogues are excluded (you don't earn an XP highscore for an interlude, and
 * the old derive-from-entries approach surfaced placeholders like "Eoe Prologue"
 * and "Endless Night"). Backed by campaign-data's `scenarioMeta`.
 */
export function campaignScenarios(log: CampaignLog): string[] {
	return playableScenarios(log);
}

/**
 * Static portrait path for a roster member (EoE Expedition Team, FHV NPCs),
 * cropped from the official campaign-log sheet into `static/image/campaign/portrait/`.
 * Not every campaign has portraits — the consuming `<img>` falls back on error.
 */
export function portraitUrl(campaignCode: string, id: string): string {
	return `/image/campaign/portrait/${campaignCode}/${id}.png`;
}
