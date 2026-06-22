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
import type { CampaignLogEntry, FileCode, LogId } from './types.js';

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
}
