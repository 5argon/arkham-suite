/**
 * Replays an exported ArkhamCards campaign through the app's own campaign guide engine (bundled by
 * `engine/build.mjs`), producing the campaign log the app shows for it.
 */
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';

import {
	CampaignGuide,
	CampaignGuideStateRemote,
	CampaignStateHelper,
	LatestDeckRemote
} from '../engine/dist/engine.mjs';

const BODY_OF_A_YITHIAN = '04244';

/**
 * An investigator card with the fields and methods the engine reads, mirroring the app's `Card`
 * (`src/data/types/Card.ts`): health and sanity (7 with Body of a Yithian), killed / insane /
 * eliminated against trauma, traits, faction.
 */
class InvestigatorCard {
	constructor(row) {
		Object.assign(this, row);
	}
	isYithian(trauma) {
		return !!trauma?.storyAssets?.includes(BODY_OF_A_YITHIAN);
	}
	getHealth(trauma) {
		return this.isYithian(trauma) ? 7 : this.health || 0;
	}
	getSanity(trauma) {
		return this.isYithian(trauma) ? 7 : this.sanity || 0;
	}
	killed(trauma) {
		if (!trauma) return false;
		return !!trauma.killed || this.getHealth(trauma) <= (trauma.physical || 0);
	}
	insane(trauma) {
		if (!trauma) return false;
		return !!trauma.insane || this.getSanity(trauma) <= (trauma.mental || 0);
	}
	eliminated(trauma) {
		return this.killed(trauma) || this.insane(trauma);
	}
	isBasicWeakness() {
		return this.type_code !== 'scenario' && this.subtype_code === 'basicweakness';
	}
	factionCode() {
		return this.faction_code || 'neutral';
	}
}

/** Every investigator card in the app's bundled card database, by code. */
export function loadInvestigators(clone) {
	const db = new DatabaseSync(join(clone, 'assets/generated/arkham4.db'), { readOnly: true });
	const rows = db
		.prepare(
			`select code, real_name, health, sanity, real_traits_normalized, faction_code, faction2_code,
				faction3_code, type_code, subtype_code, alternate_of_code, duplicate_of_code
			from card
			where type_code = 'investigator' and (taboo_set_id is null or taboo_set_id = 0)`
		)
		.all();
	db.close();
	const cards = {};
	for (const row of rows) cards[row.code] ??= new InvestigatorCard({ ...row });
	return cards;
}

/** The app's bundled English guide data (`assets/generated`). */
export function loadGuideData(clone) {
	const read = (name) => JSON.parse(readFileSync(join(clone, 'assets/generated', name), 'utf8'));
	return {
		campaigns: read('all_campaigns.txt'),
		logs: read('campaign_logs.txt'),
		encounterSets: read('encounter_sets.txt'),
		errata: read('campaign_errata.txt')
	};
}

/** The app's `combineCampaignLog` (`src/data/scenario/index.ts`): side-story sections join in. */
function combineCampaignLog(campaignLog, sideLog) {
	const sections = [];
	const used = new Set();
	for (const section of campaignLog.sections) {
		const side = sideLog.sections.find((s) => s.section === section.section);
		if (side) {
			used.add(section.section);
			sections.push({ section: section.section, entries: [...section.entries, ...side.entries] });
		} else {
			sections.push(section);
		}
	}
	for (const side of sideLog.sections) if (!used.has(side.section)) sections.push(side);
	return { ...campaignLog, sections };
}

/** The app's `getCampaignGuide`: the campaign's guide with side stories mixed in. */
export function campaignGuide(data, cycleCode) {
	const campaign = data.campaigns.find((c) => c.campaign.id === cycleCode);
	const side = data.campaigns.find((c) => c.campaign.id === 'side');
	const log = data.logs.find((l) => l.campaignId === cycleCode);
	const sideLog = data.logs.find((l) => l.campaignId === 'side');
	if (!campaign || !side || !log || !sideLog) return undefined;
	return new CampaignGuide(campaign, combineCampaignLog(log, sideLog), data.encounterSets, side, data.errata);
}

/** Calls made only when a player acts in the guide; replaying never makes one. */
const NO_ACTIONS = new Proxy(
	{},
	{
		get: (_target, name) => () => {
			throw new Error(`The replay tried to change the campaign (${String(name)}).`);
		}
	}
);

/** The log's state as plain data. */
function logState(log) {
	return {
		sections: log.sections,
		countSections: log.countSections,
		investigatorSections: log.investigatorSections,
		scenarioData: log.scenarioData,
		campaignData: log.campaignData,
		chaosBag: log.chaosBag
	};
}

/**
 * The campaign log the app computes for an exported record. `records` maps every exported campaign
 * by server id, for The Dream-Eaters' linked campaign.
 */
export function replayCampaign(record, records, data, investigators) {
	const campaign = record.campaign;
	if (!campaign.guided || !record.guide) return { skipped: 'not a guided campaign' };
	const standalone = campaign.standaloneId ?? undefined;
	const guide = campaignGuide(data, standalone ? standalone.campaignId : campaign.cycleCode);
	if (!guide) return { skipped: `no ArkhamCards guide for ${campaign.cycleCode}` };

	const linked = campaign.linked_campaign ? records.get(campaign.linked_campaign.id) : undefined;
	const printings = {};
	for (const row of campaign.investigators ?? []) {
		if (row.printing) printings[row.investigator] = row.printing;
	}
	const state = new CampaignStateHelper(
		new CampaignGuideStateRemote(record.guide),
		campaign.tarot_reading ?? undefined,
		investigators,
		NO_ACTIONS,
		typeof campaign.guide_version === 'number' ? campaign.guide_version : -1,
		(campaign.latest_decks ?? []).flatMap((row) => (row.deck ? [new LatestDeckRemote(row.deck)] : [])),
		investigators,
		printings,
		linked?.guide ? new CampaignGuideStateRemote(linked.guide) : undefined
	);
	const [processed, error] = guide.processAllScenarios(
		state,
		standalone?.scenarioId,
		undefined,
		'en'
	);
	if (!processed) return { error: error ?? 'the engine returned nothing' };
	// Each log entry's key in the order it was first written: life reads the play order from it.
	const entryOrder = [];
	const seen = new Set();
	const noteOrder = (log) => {
		for (const [section, value] of Object.entries(log?.sections ?? {})) {
			for (const entry of value?.entries ?? []) {
				const key = `${section}.${entry.id}`;
				if (!seen.has(key)) {
					seen.add(key);
					entryOrder.push(key);
				}
			}
		}
	};
	const scenarios = processed.scenarios.map((s) => {
		const after = s.latestCampaignLog;
		noteOrder(after);
		const xp = {};
		const assets = {};
		for (const [code, data] of Object.entries(after?.campaignData?.investigatorData ?? {})) {
			xp[code] = data?.availableXp ?? 0;
			if (data?.storyAssets?.length) assets[code] = data.storyAssets;
		}
		return {
			id: s.scenarioGuide.id,
			type: s.type,
			name: s.scenarioGuide.scenarioName?.() ?? undefined,
			/** Each investigator's available XP once this scenario is done. */
			xpAfter: xp,
			/** Each investigator's and partner's story assets (and partner statuses) after it. */
			assetsAfter: assets
		};
	});
	noteOrder(processed.campaignLog);
	return { scenarios, entryOrder, log: logState(processed.campaignLog) };
}
