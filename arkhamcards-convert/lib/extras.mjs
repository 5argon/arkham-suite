/**
 * The Extra tab's fields (life's reserved `__*` sections) from an ArkhamCards campaign: each
 * scenario's resolution, Victory Display (or Experience total), skipped scenarios, side stories
 * played inside the campaign, and the per-scenario choices campaign-data defines.
 *
 * A choice is matched to the ArkhamCards guide step that asks it: a choose-one step offering every
 * option the choice has (life's option ids are ArkhamCards' choice ids). `extras/<data code>.mjs`
 * can export `choices: { '<scenario>.<choiceId>': (ctx) => value | undefined }` to supply a choice
 * the matching misses, or to override it.
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { SIDE_MERGED_INTO, SIDE_NOT_A_PLAY, dataScenarioId } from './codes.mjs';

const extrasDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'extras');
const overrides = new Map();

/** The per-campaign override module, if there is one. */
async function overridesFor(dataCode) {
	if (!overrides.has(dataCode)) {
		const path = join(extrasDir, `${dataCode}.mjs`);
		overrides.set(dataCode, existsSync(path) ? await import(pathToFileURL(path).href) : {});
	}
	return overrides.get(dataCode);
}

/** A guide scenario's steps by id. */
function stepsOf(guideScenario) {
	return new Map((guideScenario?.steps ?? []).map((step) => [step.id, step]));
}

/** The Victory Display counter steps: a counter whose effect earns experience. */
function victoryDisplaySteps(steps) {
	const ids = new Set();
	for (const step of steps.values()) {
		const input = step.input;
		if (input?.type === 'counter' && (input.effects ?? []).some((e) => e.type === 'earn_xp')) {
			ids.add(step.id);
		}
	}
	return ids;
}

/** The choice id an answered choose-one step picked, or undefined. */
function pickedChoiceId(step, input) {
	const index = input?.payload?.choice;
	if (typeof index !== 'number' || index < 0) return undefined;
	return step.input?.choices?.[index]?.id;
}

/**
 * Everything the Extra tab records for one scenario play. `acId` is the ArkhamCards scenario id,
 * `meta` campaign-data's metadata for it, `inputs` the campaign's guide inputs.
 */
async function scenarioExtras({ acId, dataId, dataCode, meta, steps, inputs, replay, index, report }) {
	const own = inputs.filter((i) => i.scenario === acId);
	const out = { choices: {} };

	const resolution = replay.log.scenarioData?.[acId]?.resolution;
	if (resolution && meta?.resolutions) {
		if (meta.resolutions.includes(resolution)) out.resolution = resolution;
		else report({ kind: 'resolution', key: dataId, detail: `${resolution} is not one of ${meta.resolutions.join(', ')}` });
	}

	if (meta?.type === 'story') {
		if (meta.victoryDisplay !== false) {
			const vd = victoryDisplaySteps(steps);
			const answer = own.filter((i) => i.type === 'count' && vd.has(i.step)).at(-1);
			if (answer) out.xp = answer.payload?.count ?? 0;
		} else {
			// An Experience scenario: what each continuing investigator earned in it.
			const before = replay.scenarios[index - 1]?.xpAfter ?? {};
			const after = replay.scenarios[index].xpAfter ?? {};
			const earned = Object.keys(after)
				.filter((code) => code in before)
				.map((code) => after[code] - before[code]);
			if (earned.length) out.xp = Math.max(...earned);
		}
	}

	const mod = await overridesFor(dataCode);
	for (const choice of meta?.choices ?? []) {
		const key = `${dataId}.${choice.id}`;
		const override = mod.choices?.[key];
		let value;
		if (override) {
			value = override({ acId, dataId, steps, inputs: own, replay, pickedChoiceId });
		} else if (!choice.control || choice.control === 'dropdown' || choice.control === 'radio') {
			for (const step of steps.values()) {
				const ids = new Set((step.input?.choices ?? []).map((c) => c.id));
				if (!choice.options.length || !choice.options.every((o) => ids.has(o))) continue;
				const picked = pickedChoiceId(step, own.filter((i) => i.step === step.id).at(-1));
				if (picked && choice.options.includes(picked)) value = picked;
			}
		}
		if (value !== undefined && value !== '') {
			out.choices[choice.id] = String(value);
			report({ kind: 'answered', key, detail: choice.control ?? 'dropdown' });
		} else {
			report({ kind: 'unanswered', key, detail: choice.control ?? 'dropdown' });
		}
	}
	return out;
}

/**
 * The Extra tab's entries for a campaign. `guideCampaign` and `sideCampaign` are the ArkhamCards
 * guide data (`all_campaigns`), `db` / `sideDb` campaign-data's.
 */
export async function convertExtras({ record, replay, dataCode, db, sideDb, guideCampaign, sideCampaign, life, report }) {
	const inputs = record.guide?.guide_inputs ?? [];
	const ownScenarios = new Set(guideCampaign.scenarios.map((s) => s.id));
	const sideScenarios = new Set(sideCampaign.scenarios.map((s) => s.id));
	const metaOf = (list, id) => (list?.scenarioMeta ?? []).find((m) => m.id === id);
	/** Entries by section and key: a replayed scenario's later result replaces the earlier one. */
	const entries = new Map();
	const put = (section, key, args = []) => entries.set(`${section}|${key}`, life.makeEntry(section, key, args));
	const standalones = [];

	for (const [index, s] of replay.scenarios.entries()) {
		if (s.id.startsWith('$')) continue;
		// ArkhamCards marks a replay or a revisit of a scenario with `#<n>` (`eztli#1`).
		const baseId = s.id.replace(/#\d+$/, '');
		const isSide = !ownScenarios.has(baseId) && sideScenarios.has(baseId);
		if (isSide && SIDE_NOT_A_PLAY.has(baseId)) continue;
		const code = isSide ? 'side' : dataCode;
		const mergedInto = isSide ? SIDE_MERGED_INTO[baseId] : undefined;
		const dataId = dataScenarioId(code, mergedInto ?? baseId);
		if (s.type === 'skipped' && !isSide) {
			put(life.RESERVED.scenarioSkipped, dataId);
			continue;
		}
		if (s.type !== 'completed') continue;
		const guideScenario = (isSide ? sideCampaign : guideCampaign).scenarios.find((g) => g.id === baseId);
		const extras = await scenarioExtras({
			acId: s.id,
			dataId,
			dataCode: code,
			meta: metaOf(isSide ? sideDb : db, dataId),
			steps: stepsOf(guideScenario),
			inputs,
			replay,
			index,
			report
		});
		if (isSide) {
			const row = {
				standalone: dataId,
				resolution: extras.resolution,
				victoryDisplay: extras.xp,
				choices: Object.keys(extras.choices).length ? extras.choices : undefined
			};
			const earlier = mergedInto && standalones.findLast((r) => r.standalone === dataId);
			if (earlier) {
				earlier.resolution = row.resolution ?? earlier.resolution;
				earlier.victoryDisplay = row.victoryDisplay ?? earlier.victoryDisplay;
				earlier.choices = { ...earlier.choices, ...row.choices };
			} else {
				standalones.push(row);
			}
			continue;
		}
		const str = (value) => [{ type: 'string', value }];
		if (extras.resolution) put(life.RESERVED.scenarioResolution, dataId, str(extras.resolution));
		if (extras.xp !== undefined) {
			put(life.RESERVED.scenarioXp, dataId, [{ type: 'number', value: String(extras.xp) }]);
		}
		for (const [id, value] of Object.entries(extras.choices)) {
			put(life.RESERVED.scenarioChoice, `${dataId}.${id}`, str(value));
		}
	}
	const out = [...entries.values()];
	if (standalones.length) out.push(...life.standalonesToEntries(standalones));
	return life.toSavePayload(out);
}
