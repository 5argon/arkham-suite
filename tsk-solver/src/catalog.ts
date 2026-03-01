/**
 * UI catalog: selectable options for building goals, plus friendly labels for raw ids.
 * Keeps consuming UIs thin — they never read the JSON directly. All text comes from en.json.
 */

import {
	achievementDescription,
	achievementName,
	achievements as achievementList,
	characterName,
	fileTitle,
	getEnFile,
	getFile,
	keyName,
	loadEn,
	loadLogic,
	locationName,
	logText,
	optionById,
} from './data/load.js';
import type { CampaignLogEntry, FileCode, LogId, OptionId } from './types.js';

export interface CatalogEntry {
	id: string;
	label: string;
	note?: string;
	/** For campaign logs: the browse groups this entry belongs to (scenario / trial / epilogue / other). */
	groups?: string[];
}

export interface SolverCatalog {
	achievements: CatalogEntry[];
	keys: CatalogEntry[];
	/** Files the player can target (scenarios/interludes), id = file code, label = title. */
	files: CatalogEntry[];
	/** fileCode -> selectable resolution options. */
	resolutions: Record<FileCode, CatalogEntry[]>;
	/** fileCode -> scenario-version branches (non-finale). */
	versions: Record<FileCode, CatalogEntry[]>;
	/** fileCode -> time-scaling levels. */
	levels: Record<FileCode, CatalogEntry[]>;
	versionedFiles: CatalogEntry[];
	levelFiles: CatalogEntry[];
	campaignLogs: CatalogEntry[];
	campaignLogGroups: { id: string; label: string }[];
	sideStories: CatalogEntry[];
	/** Finale Coterie judgments (the `reach_judgment` targets). */
	judgments: CatalogEntry[];
	/** Epilogue outcomes. */
	epilogues: CatalogEntry[];
}

/** Logs not offered as planning targets (internal / temporary / tally bookkeeping). */
const LOG_EXCLUDE = new Set<LogId>(['log.deliveringIntel']);

function recordedLogsByKind(): { scenario: Set<LogId>; all: Set<LogId> } {
	const scenario = new Set<LogId>();
	const all = new Set<LogId>();
	for (const f of loadLogic().files) {
		const scenicKind = f.kind === 'scenario' || f.kind === 'prologue';
		for (const d of f.decisions) for (const o of d.options) for (const e of o.effects) if (e.type === 'record') {
			all.add(e.entryId);
			if (scenicKind) scenario.add(e.entryId);
		}
	}
	return { scenario, all };
}

/** Logs referenced by the finale member-vote table conditions (the Trial group). */
function voteLogs(): Set<LogId> {
	const out = new Set<LogId>();
	const collect = (c: unknown): void => {
		if (!c || typeof c !== 'object') return;
		const o = c as Record<string, unknown>;
		if (typeof o.recorded === 'string') out.add(o.recorded);
		if (typeof o.notRecorded === 'string') out.add(o.notRecorded);
		for (const v of [o.all, o.any]) if (Array.isArray(v)) v.forEach(collect);
		if (o.not) collect(o.not);
	};
	const finale = getFile(loadLogic().files.find((f) => f.kind === 'finale')?.fileCode ?? '59-Z');
	for (const d of finale?.decisions ?? []) if (d.decisionId === 'COTK.memberVotes') for (const opt of d.options) for (const row of opt.voteTable ?? []) collect(row.when);
	return out;
}

let _catalog: SolverCatalog | null = null;

export function catalog(): SolverCatalog {
	if (_catalog) return _catalog;
	const L = loadLogic();

	const resolutions: Record<FileCode, CatalogEntry[]> = {};
	const versions: Record<FileCode, CatalogEntry[]> = {};
	const levels: Record<FileCode, CatalogEntry[]> = {};
	const files: CatalogEntry[] = [];
	const versionedFiles: CatalogEntry[] = [];
	const levelFiles: CatalogEntry[] = [];

	for (const f of L.files) {
		if (f.kind === 'epilogue' || f.kind === 'status_reports') continue;
		const title = fileTitle(f.fileCode);
		files.push({ id: f.fileCode, label: title });
		const ef = getEnFile(f.fileCode);
		const text = (decisionId: string, optionId: string) => ef?.decisions[decisionId]?.options[optionId]?.dropdownText ?? optionId;
		for (const d of f.decisions) {
			if (d.decisionType === 'resolution' && f.kind !== 'finale') {
				resolutions[f.fileCode] = d.options.filter((o) => o.selectable).map((o) => ({ id: o.id, label: text(d.decisionId, o.id) }));
			} else if (d.decisionType === 'scenario_version' && f.kind !== 'finale') {
				versions[f.fileCode] = d.options.map((o) => ({ id: o.id, label: text(d.decisionId, o.id) }));
				versionedFiles.push({ id: f.fileCode, label: title });
			} else if (d.decisionType === 'time_scaling') {
				levels[f.fileCode] = d.options.map((o) => ({ id: o.id, label: text(d.decisionId, o.id) }));
				levelFiles.push({ id: f.fileCode, label: title });
			}
		}
	}
	files.sort((a, b) => a.label.localeCompare(b.label));
	versionedFiles.sort((a, b) => a.label.localeCompare(b.label));
	levelFiles.sort((a, b) => a.label.localeCompare(b.label));

	// Campaign logs (targetable), with browse groups.
	const { scenario: scenarioFlags, all: allFlags } = recordedLogsByKind();
	const epilogueFlags = new Set<LogId>([...L.epilogueTally.foundationTrust, ...L.epilogueTally.cellDeception]);
	const voteFlags = voteLogs();
	const tallyIds = new Set((L.campaignLog as CampaignLogEntry[]).filter((c) => c.type === 'tally').map((c) => c.id));
	const groupsForLog = (f: LogId): string[] => {
		const g: string[] = [];
		if (voteFlags.has(f)) g.push('trial');
		if (epilogueFlags.has(f)) g.push('epilogue');
		if (scenarioFlags.has(f)) g.push('scenario');
		return g.length ? g : ['other'];
	};
	const campaignLogs: CatalogEntry[] = [...allFlags]
		.filter((f) => !tallyIds.has(f) && !LOG_EXCLUDE.has(f))
		.map((f) => ({ id: f, label: logText(f), groups: groupsForLog(f) }))
		.sort((a, b) => a.label.localeCompare(b.label));

	// Side-story products.
	const sideStories: CatalogEntry[] = [];
	for (const s of L.sideStories) {
		for (const p of s.products) {
			sideStories.push({ id: p.id, label: loadEn().sideStoryProducts[p.id] ?? p.id, note: `Played at ${locationName(s.locationId)} — costs ${p.timeCost} time${s.grantsKeyId ? '; awards a Key' : ''}` });
		}
	}
	sideStories.sort((a, b) => a.label.localeCompare(b.label));

	// Finale judgments + epilogues.
	const finale = getFile(L.files.find((f) => f.kind === 'finale')?.fileCode ?? '59-Z');
	const judgments: CatalogEntry[] = (finale?.decisions.find((d) => d.decisionId === 'COTK.judgment')?.options ?? []).map((o) => ({ id: o.id, label: optionById('59-Z', o.id)?.dropdownText ?? o.id }));
	const epilogues: CatalogEntry[] = (getFile('Epilogue')?.decisions[0]?.options ?? []).map((o) => ({ id: o.id, label: optionById('Epilogue', o.id)?.dropdownText ?? o.id }));

	_catalog = {
		achievements: achievementList()
			.filter((a) => a.planning !== false && a.detect.kind !== 'difficulty')
			.map((a) => ({ id: a.id, label: achievementName(a.id), note: achievementDescription(a.id) }))
			.sort((a, b) => a.label.localeCompare(b.label)),
		keys: Object.keys(loadEn().keys)
			.map((id) => ({ id, label: keyName(id) }))
			.sort((a, b) => a.label.localeCompare(b.label)),
		files,
		resolutions,
		versions,
		levels,
		versionedFiles,
		levelFiles,
		campaignLogs,
		campaignLogGroups: [
			{ id: 'scenario', label: 'Scenario resolutions' },
			{ id: 'trial', label: 'Final Trial (Coterie vote)' },
			{ id: 'epilogue', label: 'Epilogue (Trust / Deception)' },
			{ id: 'other', label: 'Other' },
		],
		sideStories,
		judgments,
		epilogues,
	};
	return _catalog;
}

/**
 * For a scenario whose `scenario_version` decision gates resolutions (only Dogs
 * of War in the base campaign), the selectable resolution option ids reachable in
 * each version, keyed by version option id — e.g. `{ 'DOW.v1': ['DOW.R8','DOW.R3'], … }`.
 * Returns `{}` when the file's versions don't gate resolutions (every resolution
 * is reachable in every version, so a caller needs no filtering). Mirrors the
 * gate `resolveFile`/`resolutionOffers` apply via `reachableInVersions`.
 */
export function resolutionGating(fileCode: FileCode): Record<OptionId, OptionId[]> {
	const f = getFile(fileCode);
	if (!f) return {};
	const versionDec = f.decisions.find((d) => d.decisionType === 'scenario_version');
	if (!versionDec?.gatesResolutions) return {};
	const resDec = f.decisions.find((d) => d.decisionType === 'resolution');
	if (!resDec) return {};
	const out: Record<OptionId, OptionId[]> = {};
	for (const v of versionDec.options) out[v.id] = [];
	for (const o of resDec.options) {
		if (!o.selectable || !o.reachableInVersions?.length) continue;
		for (const v of o.reachableInVersions) (out[v] ??= []).push(o.id);
	}
	return out;
}

/**
 * Every option in the campaign data that shifts the chaos-bag Tablet / Elder Thing balance — the
 * authoritative list apps (e.g. arkham.life) need to tally "how many times the player tipped the bag."
 *
 * `trust` adds a Tablet and removes an Elder Thing; `deception` the reverse. `records` / `crossesOff`
 * are the campaign-log entries the same option writes — when both are empty (`logDetectable` false) the
 * shift leaves NO log trace and cannot be inferred from the Campaign Log alone.
 *
 * NOTE: this is Tablet/Elder Thing only. Special Delivery's `chaosTokenAdjust` is deliberately excluded —
 * it replaces a NUMBER token with one a value higher (e.g. −3 → −2) and never touches Tablet/Elder Thing.
 */
export interface ChaosAdjustmentSource {
	fileCode: FileCode;
	fileTitle: string;
	decisionId: string;
	optionId: OptionId;
	label: string;
	kind: 'trust' | 'deception';
	tabletDelta: number;
	elderThingDelta: number;
	records: LogId[];
	crossesOff: LogId[];
	/** True when a recorded / crossed-off log lets a consumer detect this shift from the Campaign Log. */
	logDetectable: boolean;
}

let _chaosAdjustments: ChaosAdjustmentSource[] | null = null;
export function chaosAdjustments(): ChaosAdjustmentSource[] {
	if (_chaosAdjustments) return _chaosAdjustments;
	const out: ChaosAdjustmentSource[] = [];
	for (const f of loadLogic().files) {
		const ef = getEnFile(f.fileCode);
		for (const d of f.decisions) {
			for (const o of d.options) {
				const records = o.effects.filter((e) => e.type === 'record').map((e) => (e as { entryId: LogId }).entryId);
				const crossesOff = o.effects.filter((e) => e.type === 'crossOff').map((e) => (e as { entryId: LogId }).entryId);
				for (const e of o.effects) {
					if (e.type !== 'trust' && e.type !== 'deception') continue;
					out.push({
						fileCode: f.fileCode,
						fileTitle: fileTitle(f.fileCode),
						decisionId: d.decisionId,
						optionId: o.id,
						label: ef?.decisions[d.decisionId]?.options[o.id]?.dropdownText ?? o.id,
						kind: e.type,
						tabletDelta: e.type === 'trust' ? 1 : -1,
						elderThingDelta: e.type === 'trust' ? -1 : 1,
						records,
						crossesOff,
						logDetectable: records.length > 0 || crossesOff.length > 0,
					});
				}
			}
		}
	}
	_chaosAdjustments = out;
	return out;
}

/** Friendly display label for any raw id (location, key, character, file, log, achievement). */
export function labelFor(id: string): string {
	const en = loadEn();
	if (en.locations[id]) return locationName(id);
	if (en.keys[id]) return keyName(id);
	if (en.characters[id]) return characterName(id);
	if (en.files[id]) return fileTitle(id);
	if (en.campaignLog[id]) return logText(id);
	if (en.achievements[id]) return achievementName(id);
	return id;
}

/** Reset memoized catalog (test isolation only). */
export function _resetCatalog(): void {
	_catalog = null;
	_chaosAdjustments = null;
}
