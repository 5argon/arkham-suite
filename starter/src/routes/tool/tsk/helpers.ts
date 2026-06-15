import { catalog, getLocation, labelFor, optionsAt, preChoicesAt, reachableDestinations, stopOptions } from '@5argon/arkham-tsk-solver';
import type { CampaignState, Constraint, PlanStep, SimStep, StopOption } from '@5argon/arkham-tsk-solver';
import { type EncounterSet, getScenarioData, Scenario } from '@5argon/arkham-kohaku';

/** Fixed campaign endpoints — the plan always opens here and ends here. */
export const PROLOGUE_NODE = 'london';
export const FINALE_NODE = 'tunguska';

/** The seeded first step: Riddles and Rain at London (pinned). */
export function defaultPrologueStep(): PlanStep {
	const opt = stopOptions(PROLOGUE_NODE).find((o) => o.isPrologue);
	const pre = preChoicesAt(PROLOGUE_NODE)[0];
	return { node: PROLOGUE_NODE, optionId: opt?.optionId ?? 'R1', introChoiceIds: pre ? [pre.id] : [] };
}

/** The seeded last step: the winning Congress of the Keys at Tunguska (pinned). */
export function defaultFinaleStep(): PlanStep {
	const win = stopOptions(FINALE_NODE).find((o) => o.outcome === 'WIN_CAMPAIGN');
	return { node: FINALE_NODE, optionId: win?.optionId ?? 'R1' };
}

/** A sensible default for a newly-added middle step: the nearest reachable, unlocked non-endpoint node. */
export function defaultMiddleStep(fromState: CampaignState): PlanStep {
	const dest = reachableDestinations(fromState).find(
		(d) => !d.locked && d.travel != null && d.node !== PROLOGUE_NODE && d.node !== FINALE_NODE,
	);
	const node = dest?.node ?? '';
	const pre = node ? preChoicesAt(node)[0] : undefined;
	return {
		node,
		optionId: node ? (optionsAt(fromState, node)[0]?.option.optionId ?? '') : '',
		...(pre ? { introChoiceIds: [pre.id] } : {}),
	};
}

/** One scenario icon on a recipe card: the encounter-set id + an optional short level/version badge. */
export interface ScenarioIconItem {
	scenario: string;
	/** Short overview badge, e.g. "L3" (time-tier difficulty level) — shown under the icon. */
	badge?: string;
}

/**
 * The scenarios a plan plays, in order, each tagged with a short badge: the chosen VERSION (for
 * scenarios whose variants are versions, e.g. Dogs of War) or otherwise the time-based difficulty
 * LEVEL (for scenarios that only scale by time, e.g. Dealings in the Dark).
 */
export function scenarioIconItems(steps: SimStep[]): ScenarioIconItem[] {
	const versions = catalog().versions;
	return steps
		.filter((s) => s.option.kind === 'scenario' || s.option.kind === 'finale')
		.map((s) => {
			const scenario = getLocation(s.option.node).scenario_id ?? '';
			const hasVersions = (versions[scenario]?.length ?? 0) > 0;
			let badge: string | undefined;
			if (hasVersions) {
				badge = s.option.version ?? undefined; // e.g. "v2"; omit if not version-determined
			} else {
				const level = s.scenarioLevel?.params?.level;
				const total = s.scenarioLevel?.params?.total;
				badge = level != null ? `Lv.${level}/${total}` : undefined;
			}
			return { scenario, badge };
		});
}

// --- editable constraint rows ------------------------------------------------

export type CategoryId =
	| 'achievement'
	| 'get_key'
	| 'visit_scenario'
	| 'scenario_resolution'
	| 'scenario_version'
	| 'scenario_level'
	| 'campaign_log'
	| 'recruit_ally'
	| 'side_story'
	| 'special_delivery'
	| 'visit_node'
	| 'reach_ending'
	| 'chaos_mix'
	| 'chaos_overflow_xp'
	| 'chaos_balanced';

export const CATEGORY_LABELS: { value: CategoryId; label: string }[] = [
	{ value: 'achievement', label: 'Achievement' },
	{ value: 'get_key', label: 'Obtain a Key' },
	{ value: 'visit_scenario', label: 'Play a Scenario' },
	{ value: 'scenario_resolution', label: 'Scenario — Resolution' },
	{ value: 'scenario_version', label: 'Scenario — Version' },
	{ value: 'scenario_level', label: 'Scenario — Level (time tier)' },
	{ value: 'campaign_log', label: 'Campaign Log Entry' },
	{ value: 'recruit_ally', label: 'Recruit an Ally' },
	{ value: 'side_story', label: 'Side Story' },
	{ value: 'special_delivery', label: 'Special Delivery (deliver intel)' },
	{ value: 'visit_node', label: 'Visit a Location' },
	{ value: 'reach_ending', label: 'Finale Outcome (Trial)' },
	{ value: 'chaos_mix', label: 'Chaos Token Mix' },
	{ value: 'chaos_overflow_xp', label: 'Over-trust/deceive XP' },
	{ value: 'chaos_balanced', label: 'Balanced Chaos Bag' },
];

/** Categories that need no entity "target" dropdown. */
export const TARGETLESS: CategoryId[] = [
	'special_delivery',
	'reach_ending',
	'chaos_mix',
	'chaos_overflow_xp',
	'chaos_balanced',
];

/** Editable form representation of one constraint (decoupled from the discriminated union). */
export interface RowModel {
	category: CategoryId;
	target: string;
	resolution: string;
	version: string;
	level: number;
	negate: boolean;
	bearer: boolean;
	trial: string;
	tablet: number;
	elderThing: number;
	overflowMin: number;
	/** Campaign-log browse group filter (UI only, not serialized): 'all' | a campaignLogGroups id. */
	logGroup: string;
}

export function newRow(category: CategoryId = 'achievement', target = ''): RowModel {
	return { category, target, resolution: 'R1', version: 'v1', level: 1, negate: false, bearer: false, trial: 'trial_3', tablet: 4, elderThing: 0, overflowMin: 2, logGroup: 'all' };
}

/** Convert an editable row to a solver `Constraint` (null if incomplete). */
export function toConstraint(r: RowModel): Constraint | null {
	switch (r.category) {
		case 'reach_ending':
			return { kind: 'reach_ending', trial: r.trial };
		case 'chaos_mix':
			return { kind: 'chaos_mix', tablet: r.tablet, elderThing: r.elderThing };
		case 'chaos_overflow_xp':
			return { kind: 'chaos_overflow_xp', min: r.overflowMin };
		case 'chaos_balanced':
			return { kind: 'chaos_balanced' };
		case 'special_delivery':
			return { kind: 'special_delivery' };
	}
	if (!r.target) return null;
	const negate = r.negate;
	switch (r.category) {
		case 'achievement':
			return { kind: 'achievement', id: r.target, negate };
		case 'get_key':
			return { kind: 'get_key', key: r.target, ...(r.bearer ? { bearer: 'investigator' as const } : {}), negate };
		case 'visit_scenario':
			return { kind: 'visit_scenario', scenario: r.target, negate };
		case 'scenario_resolution':
			return { kind: 'scenario_resolution', scenario: r.target, resolution: r.resolution, negate };
		case 'scenario_version':
			return { kind: 'scenario_version', scenario: r.target, version: r.version, negate };
		case 'scenario_level':
			return { kind: 'scenario_level', scenario: r.target, level: r.level, negate };
		case 'campaign_log':
			return { kind: 'campaign_log', flag: r.target, negate };
		case 'recruit_ally':
			return { kind: 'recruit_ally', ally: r.target, negate };
		case 'side_story':
			return { kind: 'play_side_story', sideStory: r.target, negate };
		case 'visit_node':
			return { kind: 'visit_node', node: r.target, negate };
		default:
			return null;
	}
}

/** Reverse: build an editable row from a constraint (for decoding shared links). */
export function rowFromConstraint(c: Constraint): RowModel {
	const base = newRow();
	base.negate = c.negate === true;
	switch (c.kind) {
		case 'achievement':
			return { ...base, category: 'achievement', target: c.id };
		case 'get_key':
			return { ...base, category: 'get_key', target: c.key, bearer: c.bearer === 'investigator' };
		case 'visit_scenario':
		case 'avoid_scenario':
			return { ...base, category: 'visit_scenario', target: c.scenario };
		case 'scenario_resolution':
			return { ...base, category: 'scenario_resolution', target: c.scenario, resolution: c.resolution };
		case 'scenario_version':
			return { ...base, category: 'scenario_version', target: c.scenario, version: c.version };
		case 'scenario_level':
			return { ...base, category: 'scenario_level', target: c.scenario, level: c.level };
		case 'campaign_log':
			return { ...base, category: 'campaign_log', target: c.flag };
		case 'recruit_ally':
			return { ...base, category: 'recruit_ally', target: c.ally };
		case 'special_delivery':
			return { ...base, category: 'special_delivery' };
		case 'play_side_story':
			return { ...base, category: 'side_story', target: c.sideStory };
		case 'visit_node':
			return { ...base, category: 'visit_node', target: c.node };
		case 'reach_ending':
			return { ...base, category: 'reach_ending', trial: c.trial };
		case 'chaos_mix':
			return { ...base, category: 'chaos_mix', tablet: c.tablet ?? 4, elderThing: c.elderThing ?? 0 };
		case 'chaos_overflow_xp':
			return { ...base, category: 'chaos_overflow_xp', overflowMin: c.min };
		case 'chaos_balanced':
			return { ...base, category: 'chaos_balanced' };
		default:
			return base;
	}
}

const VALID_SCENARIOS = new Set<string>(Object.values(Scenario));

/** Map a solver scenario id (which equals the kohaku Scenario enum value) to its icon set. */
export function scenarioEncounterSet(scenarioId: string): EncounterSet | null {
	if (!VALID_SCENARIOS.has(scenarioId)) return null;
	return getScenarioData(scenarioId as Scenario).representativeSet;
}

export const MARKER_NAME: Record<string, string> = {
	alpha: 'Alpha (α)',
	beta: 'Beta (β)',
	gamma: 'Gamma (γ)',
	delta: 'Delta (δ)',
	epsilon: 'Epsilon (ε)',
	zeta: 'Zeta (ζ)',
	theta: 'Theta (Θ)',
	psi: 'Psi (ψ)',
	omega: 'Omega (ω)',
};

/** Human title for a plan step — scenario name + place, e.g. "Play Dogs of War at Alexandria". */
export function stepTitle(step: SimStep): string {
	const node = step.option.node;
	if (step.travelOnly) return `Travel to ${labelFor(node)} — do nothing`;
	const scenario = getLocation(node).scenario_id ?? '';
	switch (step.option.kind) {
		case 'finale':
			return `Finale — ${labelFor(scenario)} at ${labelFor(node)} (win the campaign)`;
		case 'scenario':
			return `Play ${labelFor(scenario)} at ${labelFor(node)}`;
		default:
			return `Stop at ${labelFor(node)}`;
	}
}

/** Font Awesome (solid) icon for a plan step (scenario/finale render the encounter-set icon instead). */
export function stepIcon(step: SimStep): string {
	if (step.travelOnly) return 'fa-solid fa-plane';
	switch (step.option.kind) {
		case 'finale':
			return 'fa-solid fa-trophy';
		case 'scenario':
			return 'fa-solid fa-skull';
		default:
			return 'fa-solid fa-location-dot';
	}
}

const titleize = (s: string): string => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** A readable name for a stop option: its description, else its most-descriptive recorded log, else the id. */
export function optionName(o: StopOption): string {
	if (o.desc) return o.desc;
	if (o.logs.length) return titleize(o.logs[0]!);
	return titleize(o.optionId);
}

/** A short description of a stop option for the picker (key/ally/outcome/time hints). */
export function describeOption(o: StopOption): string {
	const parts: string[] = [];
	if (o.outcome === 'WIN_CAMPAIGN') parts.push('win the campaign');
	if (o.outcome === 'LOSE_CAMPAIGN') parts.push('lose the campaign');
	if (o.grantsKey) parts.push(`gain ${labelFor(o.grantsKey)}`);
	else if (o.key) parts.push(`Key ${labelFor(o.key)}${o.bearer && o.bearer !== 'investigator' ? ` → ${o.bearer.replace(/_/g, ' ')}` : ''}`);
	for (const a of o.grantsAllies) parts.push(`ally ${labelFor(a)}`);
	if (o.grantsAsset) parts.push(labelFor(o.grantsAsset));
	if (o.xpBonus > 0) parts.push(`+${o.xpBonus} XP`);
	parts.push(`${o.baseTime} time`);
	return parts.join(' · ');
}

/** A short human summary of a constraint row. */
export function constraintLabel(c: Constraint): string {
	const not = c.negate ? 'NOT ' : '';
	switch (c.kind) {
		case 'finale_outcome':
			return 'Win the campaign';
		case 'visit_scenario':
			return `${not}Play ${labelFor(c.scenario)}`;
		case 'avoid_scenario':
			return `Avoid ${labelFor(c.scenario)}`;
		case 'scenario_resolution':
			return `${not}${labelFor(c.scenario)} — Resolution ${c.resolution}`;
		case 'scenario_version':
			return `${not}${labelFor(c.scenario)} — version ${c.version}`;
		case 'scenario_level':
			return `${not}${labelFor(c.scenario)} — Lv. ${c.level}`;
		case 'get_key':
			return `${not}Obtain ${labelFor(c.key)}${c.bearer === 'investigator' ? ' (held by you)' : ''}`;
		case 'recruit_ally':
			return `${not}Recruit ${labelFor(c.ally)}`;
		case 'achievement':
			return `${not}Achievement: ${labelFor(c.id)}`;
		case 'narrative_chain':
			return `${not}Chain: ${labelFor(c.id)}`;
		case 'campaign_log':
			return `${not}Campaign log: ${labelFor(c.flag)}`;
		case 'special_delivery':
			return 'Special Delivery (deliver intel)';
		case 'visit_node':
			return `${not}Visit ${labelFor(c.node)}`;
		case 'play_side_story':
			return `${not}Side story: ${c.sideStory}`;
		case 'reach_ending':
			return `Finale: ${catalog().trials.find((t) => t.id === c.trial)?.label ?? c.trial}`;
		case 'chaos_mix':
			return `Chaos: ${c.tablet ?? '?'} Tablet / ${c.elderThing ?? '?'} Elder Thing`;
		case 'chaos_overflow_xp':
			return `Over-trust/deceive XP ≥ ${c.min}`;
		case 'chaos_balanced':
			return 'Balanced chaos bag';
	}
}
