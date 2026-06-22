/**
 * Typed loader for the two-file campaign data (`logic.json` + `en.json`), bridged by IDs.
 *
 * `logic.json` is language-independent behaviour; `en.json` is the matching display strings.
 * On first load we run a light integrity pass and throw `DatabaseIntegrityError` (fail-fast)
 * on malformed data. All accessors are memoized immutable views.
 */

import rawLogic from './new/logic.json' with { type: 'json' };
import rawEn from './new/en.json' with { type: 'json' };
import type {
	AchievementEntry,
	CampaignLogEntry,
	EnFile,
	EnLocale,
	EnOption,
	FileCode,
	LogicDatabase,
	LogicFile,
	LogicLocation,
	LogicOption,
	NodeId,
	SideStory,
	TimeMarker,
} from '../types.js';

const logic = rawLogic as unknown as LogicDatabase;
const en = rawEn as unknown as EnLocale;

export class DatabaseIntegrityError extends Error {
	readonly problems: string[];
	constructor(problems: string[]) {
		super(`TSK data failed integrity validation:\n - ${problems.join('\n - ')}`);
		this.name = 'DatabaseIntegrityError';
		this.problems = problems;
	}
}

/** Light structural integrity pass (pure; returns problems). */
export function validateIntegrity(L: LogicDatabase, E: EnLocale): string[] {
	const problems: string[] = [];
	const locIds = new Set(Object.keys(L.locations));
	const fileCodes = new Set(L.files.map((f) => f.fileCode));

	// 1. Connections: targets exist + symmetric.
	for (const [id, loc] of Object.entries(L.locations)) {
		for (const t of loc.connections) {
			if (!locIds.has(t)) problems.push(`location "${id}" connects to unknown node "${t}"`);
			else if (!L.locations[t]!.connections.includes(id)) problems.push(`asymmetric edge: "${id}" -> "${t}"`);
		}
	}
	// 2. Every file's locationIds exist (epilogue / status-reports legitimately have none).
	for (const f of L.files) for (const lid of f.locationIds ?? []) if (!locIds.has(lid)) problems.push(`file "${f.fileCode}" references unknown location "${lid}"`);
	// 3. Location fileCodes exist.
	for (const [id, loc] of Object.entries(L.locations)) for (const fc of loc.fileCodes) if (!fileCodes.has(fc)) problems.push(`location "${id}" references unknown file "${fc}"`);
	// 4. unlock effects target real locations.
	for (const f of L.files) for (const d of f.decisions) for (const o of d.options) for (const e of o.effects) if (e.type === 'unlock') for (const lid of e.locationIds) if (!locIds.has(lid)) problems.push(`file "${f.fileCode}" option "${o.id}" unlocks unknown location "${lid}"`);
	// 5. Every file/decision/option has matching en text.
	for (const f of L.files) {
		const ef = E.files[f.fileCode];
		if (!ef) {
			problems.push(`en.files missing "${f.fileCode}"`);
			continue;
		}
		for (const d of f.decisions) {
			const ed = ef.decisions[d.decisionId];
			if (!ed) {
				problems.push(`en missing decision "${f.fileCode}/${d.decisionId}"`);
				continue;
			}
			for (const o of d.options) if (!ed.options[o.id]) problems.push(`en missing option "${f.fileCode}/${d.decisionId}/${o.id}"`);
		}
	}
	// 6. A prologue and a finale file exist.
	if (!L.files.some((f) => f.kind === 'prologue')) problems.push('no prologue file');
	if (!L.files.some((f) => f.kind === 'finale')) problems.push('no finale file');
	return problems;
}

let _validated = false;
function ensureValid(): void {
	if (_validated) return;
	const problems = validateIntegrity(logic, en);
	if (problems.length > 0) throw new DatabaseIntegrityError(problems);
	_validated = true;
}

export function loadLogic(): LogicDatabase {
	ensureValid();
	return logic;
}
export function loadEn(): EnLocale {
	ensureValid();
	return en;
}

// --- memoized indexes -------------------------------------------------------

let _fileByCode: Map<FileCode, LogicFile> | null = null;
export function fileByCode(): ReadonlyMap<FileCode, LogicFile> {
	if (!_fileByCode) _fileByCode = new Map(loadLogic().files.map((f) => [f.fileCode, f]));
	return _fileByCode;
}
export function getFile(code: FileCode): LogicFile | undefined {
	return fileByCode().get(code);
}
export function getEnFile(code: FileCode): EnFile | undefined {
	return loadEn().files[code];
}

export function getLocation(id: NodeId): LogicLocation {
	const loc = loadLogic().locations[id];
	if (!loc) throw new Error(`Unknown location: ${id}`);
	return loc;
}
export function hasLocation(id: NodeId): boolean {
	return loadLogic().locations[id] !== undefined;
}
export function locationIds(): NodeId[] {
	return Object.keys(loadLogic().locations);
}

let _markerBySymbol: Map<string, TimeMarker> | null = null;
export function markerBySymbol(): ReadonlyMap<string, TimeMarker> {
	if (!_markerBySymbol) _markerBySymbol = new Map(loadLogic().timeMarkers.map((m) => [m.symbol, m]));
	return _markerBySymbol;
}
export function getMarker(symbol: string): TimeMarker | undefined {
	return markerBySymbol().get(symbol);
}

/** The shared `StatusReports` file (its `SR.*` options fire when a marker's box is crossed). */
export function statusReportsFile(): LogicFile | undefined {
	return loadLogic().files.find((f) => f.kind === 'status_reports');
}
let _srOptions: Map<string, LogicOption> | null = null;
export function statusReportOption(optionId: string): LogicOption | undefined {
	if (!_srOptions) {
		_srOptions = new Map();
		const sr = statusReportsFile();
		if (sr) for (const d of sr.decisions) for (const o of d.options) _srOptions.set(o.id, o);
	}
	return _srOptions.get(optionId);
}

let _sideByLocation: Map<NodeId, SideStory> | null = null;
export function sideStoryForLocation(id: NodeId): SideStory | undefined {
	if (!_sideByLocation) _sideByLocation = new Map(loadLogic().sideStories.map((s) => [s.locationId, s]));
	return _sideByLocation.get(id);
}

export function campaignLog(): CampaignLogEntry[] {
	return loadLogic().campaignLog;
}
let _tallyEntries: Set<string> | null = null;
export function isTallyEntry(id: string): boolean {
	if (!_tallyEntries) _tallyEntries = new Set(loadLogic().campaignLog.filter((c) => c.type === 'tally').map((c) => c.id));
	return _tallyEntries.has(id);
}
export function achievements(): AchievementEntry[] {
	return loadLogic().achievements;
}

// --- campaign metadata (derived) -------------------------------------------

export interface Metadata {
	startLocation: NodeId;
	finaleFile: FileCode;
	finaleLocation: NodeId;
	timeTrackBoxes: number;
}
let _meta: Metadata | null = null;
export function metadata(): Metadata {
	if (_meta) return _meta;
	const L = loadLogic();
	const prologue = L.files.find((f) => f.kind === 'prologue');
	const finale = L.files.find((f) => f.kind === 'finale');
	_meta = {
		startLocation: prologue?.locationIds[0] ?? 'london',
		finaleFile: finale?.fileCode ?? '59-Z',
		finaleLocation: finale?.locationIds[0] ?? 'tunguska',
		timeTrackBoxes: L.timeTrack?.boxes ?? 35,
	};
	return _meta;
}

// --- display accessors (en.json) -------------------------------------------

const titleize = (id: string) => id.replace(/^[a-z]+\./, '').replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().replace(/^./, (c) => c.toUpperCase());

export function optionText(fileCode: FileCode, decisionId: string, optionId: string): EnOption | undefined {
	return getEnFile(fileCode)?.decisions[decisionId]?.options[optionId];
}
export function decisionText(fileCode: FileCode, decisionId: string): { label: string; prompt: string } | undefined {
	const d = getEnFile(fileCode)?.decisions[decisionId];
	return d ? { label: d.label, prompt: d.prompt } : undefined;
}
/** Find an option's display text anywhere in a file (across decisions), by option id. */
export function optionById(fileCode: FileCode, optionId: string): EnOption | undefined {
	const ef = getEnFile(fileCode);
	if (!ef) return undefined;
	for (const d of Object.values(ef.decisions)) {
		const o = d.options[optionId];
		if (o) return o;
	}
	return undefined;
}
export function fileTitle(fileCode: FileCode): string {
	return getEnFile(fileCode)?.title ?? fileCode;
}
export function keyName(id: string): string {
	return loadEn().keys[id] ?? titleize(id);
}
export function characterName(id: string): string {
	if (id === 'investigator') return 'an investigator';
	return loadEn().characters[id] ?? titleize(id);
}
export function locationName(id: string): string {
	return loadEn().locations[id] ?? titleize(id);
}
export function logText(id: string): string {
	return loadEn().campaignLog[id] ?? titleize(id);
}
export function markerLabel(markerId: string): string {
	return loadEn().timeMarkers[markerId] ?? markerId;
}
export function effectText(ref: string): string {
	return loadEn().effectText[ref] ?? ref;
}
export function sideStoryProductName(id: string): string {
	return loadEn().sideStoryProducts[id] ?? titleize(id);
}
export function achievementName(id: string): string {
	return loadEn().achievements[id]?.name ?? titleize(id);
}
export function achievementDescription(id: string): string {
	return loadEn().achievements[id]?.description ?? '';
}

/** Reset memoized indexes (test isolation only). */
export function _resetLoadCaches(): void {
	_fileByCode = null;
	_markerBySymbol = null;
	_srOptions = null;
	_sideByLocation = null;
	_tallyEntries = null;
	_meta = null;
}
