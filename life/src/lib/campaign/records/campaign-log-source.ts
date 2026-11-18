/** Accessors over the campaign-log definitions in `@5argon/arkham-campaign-data`. A kohaku campaign
 *  value (`eote`) and a data code (`eoe`) are both accepted. */
import { getCampaignLog, playableScenarios } from '@5argon/arkham-campaign-data';
import type { CampaignLog, LogSectionDef } from '@5argon/arkham-campaign-data';

export type { CampaignLog, LogSectionDef };

export function loadCampaignLog(campaignCode: string | null | undefined): CampaignLog | undefined {
	if (!campaignCode) return undefined;
	return getCampaignLog(campaignCode);
}

/** Player-facing sections in sheet order. */
export function visibleSections(log: CampaignLog): LogSectionDef[] {
	return log.db.sections.filter((s) => !s.hidden && s.id !== 'hidden');
}

/** The section title as printed on the campaign log sheet. */
export function sectionTitle(log: CampaignLog, sectionId: string): string {
	return log.en.sections[sectionId] ?? sectionId;
}

/** A partner / key / supply / glyph item's label. */
export function itemLabel(log: CampaignLog, itemId: string): string {
	return log.en.items?.[itemId] ?? itemId;
}

/** A log entry's text as printed, by its `"section.id"` key. */
export function entryLabel(log: CampaignLog, key: string): string {
	return log.en.entries?.[key]?.text ?? key;
}

/** Story scenarios in campaign order (no interludes or epilogues). */
export function campaignScenarios(log: CampaignLog): string[] {
	return playableScenarios(log);
}

/** A roster member's portrait cropped from the campaign log sheet; not every campaign has them. */
export function portraitUrl(campaignCode: string, id: string): string {
	return `/image/campaign/portrait/${campaignCode}/${id}.png`;
}

/** A scenario's display name from campaign-data; unknown ids pass through. */
export function scenarioName(campaignCode: string, scenarioId: string): string {
	return getCampaignLog(campaignCode)?.en.scenarioNames?.[scenarioId] ?? scenarioId;
}

/** A log entry's printed text by its `"section.id"` key (a bare id means `campaign_notes`),
 *  with ArkhamCards markup removed and the first letter capitalized. */
export function logText(campaignCode: string, key: string): string {
	const full = key.includes('.') ? key : `campaign_notes.${key}`;
	const text = getCampaignLog(campaignCode)?.en.entries?.[full]?.text ?? key;
	const clean = text.replace(/<\/?[a-z]+>/g, '').replace(/\[\[([^\]]+)\]\]/g, '$1').trim();
	return clean.charAt(0).toUpperCase() + clean.slice(1);
}
