import {
	characterName,
	defaultOptionId,
	fileTitle,
	getFile,
	locationName,
	playableFilesAt,
	reachableDestinations,
	resolutionOffers,
	selectableDecisions,
	sideStoryProductName,
	type CampaignState,
	type PlanStep,
	type SimStep,
} from '@5argon/arkham-tsk-solver';
import { type EncounterSet, getScenarioData, Scenario } from '@5argon/arkham-kohaku';

/** Fixed campaign endpoints — the plan always opens at the prologue and ends at the finale. */
export const PROLOGUE_LOCATION = 'london';
export const PROLOGUE_FILE = '5-A';
/** The Foundation interlude is pinned right after the prologue (Riddles and Rain → The Foundation). */
export const FOUNDATION_FILE = 'Foundation';
export const FINALE_LOCATION = 'tunguska';
export const FINALE_FILE = '59-Z';

/**
 * Files that are part of the fixed campaign opening — Riddles and Rain (the prologue) and the
 * Foundation interlude. They are pinned at the front of every plan and must never be offered as a
 * revisit choice (e.g. at a London revisit only Dead and Gone / 27-H is a real option).
 */
export function isOpeningFile(fileCode: string): boolean {
	return fileCode === FOUNDATION_FILE || getFile(fileCode)?.kind === 'prologue';
}

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

export function defaultFoundationStep(): PlanStep {
	return { location: PROLOGUE_LOCATION, fileCode: FOUNDATION_FILE, choices: defaultChoices(FOUNDATION_FILE, PROLOGUE_LOCATION) };
}

/** Ensure the plan opens with the fixed pair Riddles and Rain → The Foundation (idempotent). */
export function withOpening(steps: PlanStep[]): PlanStep[] {
	const out = [...steps];
	if (!out.length || out[0]!.fileCode !== PROLOGUE_FILE) out.unshift(defaultPrologueStep());
	if (out.length < 2 || out[1]!.fileCode !== FOUNDATION_FILE) out.splice(1, 0, defaultFoundationStep());
	return out;
}

export function defaultFinaleStep(): PlanStep {
	return { location: FINALE_LOCATION, fileCode: FINALE_FILE, choices: { 'COTK.resolution': 'COTK.R1' } };
}

/** A sensible new middle step: the nearest reachable, unlocked non-endpoint location's first non-opening file. */
export function defaultMiddleStep(fromState: CampaignState): PlanStep {
	const dest = reachableDestinations(fromState).find(
		(d) => !d.locked && d.travel != null && d.node !== PROLOGUE_LOCATION && d.node !== FINALE_LOCATION && d.files.some((f) => !isOpeningFile(f.fileCode)),
	);
	const location = dest?.node ?? '';
	const fileCode = dest?.files.find((f) => !isOpeningFile(f.fileCode))?.fileCode ?? '';
	const choices = fileCode ? validResolutionChoices(fileCode, location, fromState, (fromState.timePassed ?? 0) + (dest?.travel ?? 0)) : {};
	return { location, fileCode, choices };
}

/** defaultChoices, but with the resolution defaulted to one that's actually reachable for those upstream picks. */
export function validResolutionChoices(fileCode: string, location: string, fromState: CampaignState, entryTime: number): Record<string, string> {
	const choices = defaultChoices(fileCode, location);
	const resD = selectableDecisions(fileCode, location).find((d) => d.decisionType === 'resolution');
	if (!resD) return choices;
	const offers = resolutionOffers(fileCode, choices, fromState, entryTime, location).filter((r) => r.offerable);
	if (offers.length && !offers.some((r) => r.option.id === choices[resD.decisionId])) choices[resD.decisionId] = offers[0]!.option.id;
	return choices;
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

export { characterName };
