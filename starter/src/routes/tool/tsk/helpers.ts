import {
	catalog,
	characterName,
	defaultOptionId,
	fileTitle,
	getFile,
	keyName,
	locationName,
	logText,
	playableFilesAt,
	reachableDestinations,
	selectableDecisions,
	sideStoryProductName,
	type CampaignState,
	type Constraint,
	type PlanStep,
	type SimStep,
} from '@5argon/arkham-tsk-solver';
import { type EncounterSet, getScenarioData, Scenario } from '@5argon/arkham-kohaku';

/** Fixed campaign endpoints — the plan always opens at the prologue and ends at the finale. */
export const PROLOGUE_LOCATION = 'london';
export const PROLOGUE_FILE = '5-A';
export const FINALE_LOCATION = 'tunguska';
export const FINALE_FILE = '59-Z';

/** Default choices for a file at a location: the first selectable option per applicable decision. */
export function defaultChoices(fileCode: string, location?: string): Record<string, string> {
	const out: Record<string, string> = {};
	for (const d of selectableDecisions(fileCode, location)) {
		const def = defaultOptionId(fileCode, d.decisionId);
		if (def) out[d.decisionId] = def;
	}
	return out;
}

export function defaultPrologueStep(): PlanStep {
	return { location: PROLOGUE_LOCATION, fileCode: PROLOGUE_FILE, choices: defaultChoices(PROLOGUE_FILE, PROLOGUE_LOCATION) };
}

export function defaultFinaleStep(): PlanStep {
	return { location: FINALE_LOCATION, fileCode: FINALE_FILE, choices: { 'COTK.resolution': 'COTK.R1' } };
}

/** A sensible new middle step: the nearest reachable, unlocked non-endpoint location's first file. */
export function defaultMiddleStep(fromState: CampaignState): PlanStep {
	const dest = reachableDestinations(fromState).find((d) => !d.locked && d.travel != null && d.node !== PROLOGUE_LOCATION && d.node !== FINALE_LOCATION && d.files.length > 0);
	const location = dest?.node ?? '';
	const fileCode = dest?.files[0]?.fileCode ?? '';
	return { location, fileCode, choices: fileCode ? defaultChoices(fileCode, location) : {} };
}

// --- scenario icons ---------------------------------------------------------

/** The ten combat scenarios + finale map to a kohaku Scenario for their encounter-set icon. */
const FILE_SCENARIO: Record<string, Scenario> = {
	'5-A': Scenario.RiddlesAndRain,
	'11-B': Scenario.DeadHeat,
	'16-D': Scenario.SanguineShadows,
	'21-F': Scenario.DealingsInTheDark,
	'28-I': Scenario.DancingMad,
	'33-K': Scenario.OnThinIce,
	'38-N': Scenario.DogsOfWar,
	'46-Q': Scenario.ShadesOfSuffering,
	'56-Y': Scenario.WithoutATrace,
	'59-Z': Scenario.CongressOfTheKeys,
};

/** The encounter-set icon for a file (combat scenarios + finale only); null otherwise. */
export function fileEncounterSet(fileCode: string): EncounterSet | null {
	const sc = FILE_SCENARIO[fileCode];
	return sc ? getScenarioData(sc).representativeSet : null;
}

export interface ScenarioIconItem {
	fileCode: string;
	badge?: string;
}

/** Scenario-icon row for the plan: each combat scenario + finale, with a short version/level badge. */
export function scenarioIconItems(steps: SimStep[]): ScenarioIconItem[] {
	return steps.filter((s) => !s.travelOnly && FILE_SCENARIO[s.fileCode]).map((s) => ({ fileCode: s.fileCode, badge: scenarioBadge(s) }));
}
/** Short badge under a scenario icon: its chosen version (`v2`), or its time tier as `Lv n/N`. */
function scenarioBadge(s: SimStep): string | undefined {
	const version = s.chosen.find((c) => c.decisionType === 'scenario_version');
	if (version) return version.option.id.split('.').pop(); // e.g. "DM.v2" → "v2"
	const scaling = s.chosen.find((c) => c.decisionType === 'time_scaling');
	if (!scaling) return undefined;
	const options = getFile(s.fileCode)?.decisions.find((d) => d.decisionId === scaling.decisionId)?.options ?? [];
	const idx = options.findIndex((o) => o.id === scaling.option.id);
	return idx >= 0 ? `L${idx + 1}/${options.length}` : undefined; // tier index / total tiers, e.g. "L2/4"
}

// --- editable goal rows -----------------------------------------------------

export type CategoryId =
	| 'achievement'
	| 'get_key'
	| 'visit_file'
	| 'resolution'
	| 'scenario_version'
	| 'scenario_level'
	| 'campaign_log'
	| 'side_story'
	| 'reach_judgment'
	| 'epilogue'
	| 'chaos_mix'
	| 'chaos_balanced';

export const CATEGORY_LABELS: { value: CategoryId; label: string }[] = [
	{ value: 'achievement', label: 'Achievement' },
	{ value: 'get_key', label: 'Obtain a Key' },
	{ value: 'visit_file', label: 'Play a Scenario / Interlude' },
	{ value: 'resolution', label: 'Scenario — Resolution' },
	{ value: 'scenario_version', label: 'Scenario — Version' },
	{ value: 'scenario_level', label: 'Scenario — Time tier' },
	{ value: 'campaign_log', label: 'Campaign Log Entry' },
	{ value: 'side_story', label: 'Side Story' },
	{ value: 'reach_judgment', label: 'Finale — Coterie judgment' },
	{ value: 'epilogue', label: 'Finale — Epilogue' },
	{ value: 'chaos_mix', label: 'Chaos Token Mix' },
	{ value: 'chaos_balanced', label: 'Balanced Chaos Bag' },
];

/** Categories that need no entity "target" dropdown. */
export const TARGETLESS: CategoryId[] = ['reach_judgment', 'epilogue', 'chaos_mix', 'chaos_balanced'];

export interface RowModel {
	category: CategoryId;
	target: string;
	optionId: string;
	negate: boolean;
	bearer: boolean;
	judgment: string;
	epilogue: string;
	tablet: number;
	elderThing: number;
	logGroup: string;
}

export function newRow(category: CategoryId = 'achievement', target = ''): RowModel {
	return { category, target, optionId: '', negate: false, bearer: false, judgment: 'COTK.judgment.overthrow', epilogue: 'EP.permanent', tablet: 4, elderThing: 0, logGroup: 'all' };
}

export function toConstraint(r: RowModel): Constraint | null {
	const negate = r.negate;
	switch (r.category) {
		case 'reach_judgment':
			return { kind: 'reach_judgment', judgment: r.judgment, negate };
		case 'epilogue':
			return { kind: 'epilogue', optionId: r.epilogue, negate };
		case 'chaos_mix':
			return { kind: 'chaos_mix', tablet: r.tablet, elderThing: r.elderThing, negate };
		case 'chaos_balanced':
			return { kind: 'chaos_balanced', negate };
	}
	if (!r.target) return null;
	switch (r.category) {
		case 'achievement':
			return { kind: 'achievement', id: r.target, negate };
		case 'get_key':
			return { kind: 'get_key', key: r.target, ...(r.bearer ? { bearer: 'investigator' as const } : {}), negate };
		case 'visit_file':
			return { kind: 'visit_file', fileCode: r.target, negate };
		case 'resolution':
			return r.optionId ? { kind: 'resolution', fileCode: r.target, optionId: r.optionId, negate } : null;
		case 'scenario_version':
			return r.optionId ? { kind: 'scenario_version', fileCode: r.target, optionId: r.optionId, negate } : null;
		case 'scenario_level':
			return r.optionId ? { kind: 'scenario_level', fileCode: r.target, optionId: r.optionId, negate } : null;
		case 'campaign_log':
			return { kind: 'campaign_log', entryId: r.target, negate };
		case 'side_story':
			return { kind: 'play_side_story', product: r.target, negate };
		default:
			return null;
	}
}

export function rowFromConstraint(c: Constraint): RowModel {
	const base = newRow();
	base.negate = c.negate === true;
	switch (c.kind) {
		case 'achievement':
			return { ...base, category: 'achievement', target: c.id };
		case 'get_key':
			return { ...base, category: 'get_key', target: c.key, bearer: c.bearer === 'investigator' };
		case 'visit_file':
			return { ...base, category: 'visit_file', target: c.fileCode };
		case 'resolution':
			return { ...base, category: 'resolution', target: c.fileCode, optionId: c.optionId };
		case 'scenario_version':
			return { ...base, category: 'scenario_version', target: c.fileCode, optionId: c.optionId };
		case 'scenario_level':
			return { ...base, category: 'scenario_level', target: c.fileCode, optionId: c.optionId };
		case 'campaign_log':
			return { ...base, category: 'campaign_log', target: c.entryId };
		case 'play_side_story':
			return { ...base, category: 'side_story', target: c.product };
		case 'reach_judgment':
			return { ...base, category: 'reach_judgment', judgment: c.judgment };
		case 'epilogue':
			return { ...base, category: 'epilogue', epilogue: c.optionId };
		case 'chaos_mix':
			return { ...base, category: 'chaos_mix', tablet: c.tablet ?? 4, elderThing: c.elderThing ?? 0 };
		case 'chaos_balanced':
			return { ...base, category: 'chaos_balanced' };
		default:
			return base;
	}
}

// --- step display -----------------------------------------------------------

export function stepTitle(step: SimStep): string {
	const place = locationName(step.location);
	if (step.travelOnly) return `Travel to ${place} — do nothing`;
	if (step.kind === 'sideStory') return `Side story — ${sideStoryProductName(step.fileCode)} at ${place}`;
	const title = fileTitle(step.fileCode);
	if (step.kind === 'finale') return `Finale — ${title} at ${place}`;
	if (step.kind === 'prologue') return `Prologue — ${title} at ${place}`;
	if (step.kind === 'scenario') return `Play ${title} at ${place}`;
	return `${title} at ${place}`;
}

/** Display label for a playable file at a location: page code + scenario/event name, or side-story name. */
export function fileLabel(fileCode: string, isSideStory: boolean): string {
	return isSideStory ? sideStoryProductName(fileCode) : `${fileCode} ${fileTitle(fileCode)}`;
}

export function stepIcon(step: SimStep): string {
	if (step.travelOnly) return 'fa-solid fa-plane';
	if (step.kind === 'finale') return 'fa-solid fa-trophy';
	if (step.kind === 'scenario' || step.kind === 'prologue') return 'fa-solid fa-skull';
	if (step.kind === 'sideStory') return 'fa-solid fa-dice';
	return 'fa-solid fa-location-dot';
}

/** A short human summary of a goal row (for the goals checklist). */
export function constraintLabel(c: Constraint): string {
	const not = c.negate ? 'NOT ' : '';
	const cat = catalog();
	const optLabel = (fileCode: string, optionId: string, table: Record<string, { id: string; label: string }[]>) => table[fileCode]?.find((o) => o.id === optionId)?.label ?? optionId;
	switch (c.kind) {
		case 'finale_outcome':
			return 'Win the campaign';
		case 'visit_file':
			return `${not}Play ${fileTitle(c.fileCode)}`;
		case 'resolution':
			return `${not}${fileTitle(c.fileCode)} — ${optLabel(c.fileCode, c.optionId, cat.resolutions)}`;
		case 'scenario_version':
			return `${not}${fileTitle(c.fileCode)} — ${optLabel(c.fileCode, c.optionId, cat.versions)}`;
		case 'scenario_level':
			return `${not}${fileTitle(c.fileCode)} — ${optLabel(c.fileCode, c.optionId, cat.levels)}`;
		case 'get_key':
			return `${not}Obtain ${keyName(c.key)}${c.bearer === 'investigator' ? ' (held by you)' : ''}`;
		case 'achievement':
			return `${not}Achievement: ${cat.achievements.find((a) => a.id === c.id)?.label ?? c.id}`;
		case 'campaign_log':
			return `${not}Campaign log: ${logText(c.entryId)}`;
		case 'play_side_story':
			return `${not}Side story: ${cat.sideStories.find((s) => s.id === c.product)?.label ?? c.product}`;
		case 'reach_judgment':
			return `${not}Finale: ${cat.judgments.find((j) => j.id === c.judgment)?.label ?? c.judgment}`;
		case 'epilogue':
			return `${not}Epilogue: ${cat.epilogues.find((e) => e.id === c.optionId)?.label ?? c.optionId}`;
		case 'chaos_mix':
			return `Chaos: ${c.tablet ?? '?'} Tablet / ${c.elderThing ?? '?'} Elder Thing`;
		case 'chaos_balanced':
			return 'Balanced chaos bag';
	}
}

export { characterName };
