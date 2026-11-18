/** ArkhamCards campaign and scenario ids ⇄ arkham.life's (kohaku) and campaign-data's. */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const curationDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'campaign-data', 'curation');

/** ArkhamCards cycle codes whose kohaku `Campaign` value differs. */
const KOHAKU_CAMPAIGN = { core: 'notz', eoe: 'eote', tskc: 'tsk' };
/** ArkhamCards cycle codes whose campaign-data code differs. */
const DATA_CODE = { core: 'notz' };
/** Cycles with no record of their own: The Dream-Eaters' parent only links its two halves. */
const NO_RECORD = new Set(['tde']);

/**
 * The record's campaign code (kohaku `Campaign` value) and campaign-data code for an ArkhamCards
 * cycle, or null when life has no campaign for it (fan-made campaigns, The Dream-Eaters' parent).
 */
export function campaignCodes(cycleCode, getCampaignLog) {
	if (NO_RECORD.has(cycleCode)) return null;
	const campaignCode = KOHAKU_CAMPAIGN[cycleCode] ?? cycleCode;
	const dataCode = DATA_CODE[cycleCode] ?? cycleCode;
	if (!getCampaignLog(dataCode)) return null;
	return { campaignCode, dataCode };
}

const remaps = new Map();

/**
 * campaign-data's id for an ArkhamCards scenario id: curation renames a few (`torch` →
 * `the_gathering`) in its `scenarios` map; the rest are the same.
 */
export function dataScenarioId(dataCode, acScenarioId) {
	if (!remaps.has(dataCode)) {
		let map = {};
		try {
			map = JSON.parse(readFileSync(join(curationDir, `${dataCode}.json`), 'utf8')).scenarios ?? {};
		} catch {
			// A campaign without a curation file renames nothing.
		}
		remaps.set(dataCode, map);
	}
	return remaps.get(dataCode)[acScenarioId] ?? acScenarioId;
}

/**
 * ArkhamCards side-story scenarios campaign-data records as part of another: Fortune and Folly is
 * one catalogue entry (`fortune_and_folly_part_1`) holding Part II's outcome, so Part II merges into
 * it and the checkpoint between the parts is not a play of its own.
 */
export const SIDE_MERGED_INTO = { fortune_and_folly_part_2: 'fortune_and_folly_part_1' };
export const SIDE_NOT_A_PLAY = new Set(['fortune_and_folly_checkpoint']);
