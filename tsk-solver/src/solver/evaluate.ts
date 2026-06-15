/**
 * Plan → goals checklist.
 *
 * `evaluatePlan` scores a finished plan against the player's constraints. With the search gone,
 * constraints are no longer a routing target — they are a checklist: for each one, did the plan the
 * player built actually satisfy it? Each constraint kind is checked directly against the trajectory's
 * steps + final state (reusing `optionMatches`, `predictTrial`, and `evaluateAchievements`). A negated
 * constraint is satisfied when the plan does NOT meet the base condition.
 */

import { getScenario, loadDatabase } from '../data/load.js';
import { bearerIsInvestigator } from '../graph/state.js';
import type { Constraint, LocalizedString, NodeId } from '../types.js';
import { evaluateAchievements } from './achievements.js';
import { optionMatches } from './constraint-match.js';
import type { PlanTrajectory, SimStep } from './simulate.js';
import { finaleBranchGroup, predictTrial } from './trial.js';

export interface ConstraintCheck {
	index: number;
	kind: Constraint['kind'];
	/** `met` — fully satisfied; `in_position` — the plan sets it up but the table feat is play-dependent
	 *  (achievements, finale versions, informational chaos goals); `unmet` — not satisfied. */
	status: 'met' | 'unmet' | 'in_position';
	/** Optional extra context (e.g. predicted ending, actual chaos mix). */
	detail?: LocalizedString;
}

const loc = (id: string, params: Record<string, string | number> = {}): LocalizedString => ({ id, params });

/** scenario id → its location node. */
function scenarioNode(scenario: string): NodeId | undefined {
	const s = getScenario(scenario);
	if (s) return s.location;
	for (const l of loadDatabase().locations) if (l.scenario_id === scenario) return l.id;
	return undefined;
}

/** 1-based time-tier index a scenario falls in when entered at `entryTime` (null if it has no tiers). */
function levelAt(scenario: string, entryTime: number): number | null {
	const tiers = getScenario(scenario)?.time_tiers;
	if (!tiers || tiers.length === 0) return null;
	const idx = tiers.findIndex((t) => t.maxTime === null || entryTime <= t.maxTime);
	return (idx >= 0 ? idx : tiers.length - 1) + 1;
}

type Raw = { status: ConstraintCheck['status']; detail?: LocalizedString };
const MET: Raw = { status: 'met' };
const UNMET: Raw = { status: 'unmet' };
const yes = (b: boolean): Raw => (b ? MET : UNMET);

export function evaluatePlan(trajectory: PlanTrajectory, constraints: Constraint[]): ConstraintCheck[] {
	const steps: SimStep[] = trajectory.steps;
	const fs = trajectory.finalState;
	const trial = predictTrial(fs.flags, fs.trust, fs.deception);
	const requested = new Set(
		constraints.filter((c): c is Extract<Constraint, { kind: 'achievement' }> => c.kind === 'achievement').map((c) => c.id),
	);
	// The planner is difficulty-agnostic (Expert achievement unsupported); evaluate against standard.
	const earned = evaluateAchievements(steps, fs, 'standard', trial, requested);

	const atScenario = (scenario: string, test: (s: SimStep) => boolean): boolean => {
		const node = scenarioNode(scenario);
		return node !== undefined && steps.some((s) => s.option.node === node && test(s));
	};

	const rawStatus = (c: Constraint): Raw => {
		switch (c.kind) {
			case 'visit_scenario':
				return yes(atScenario(c.scenario, () => true));
			case 'scenario_resolution':
				return yes(atScenario(c.scenario, (s) => optionMatches(s.option, { type: 'resolution', resolution: c.resolution })));
			case 'scenario_version': {
				const sc = loadDatabase().scenarios[c.scenario];
				if (sc?.role === 'finale') {
					const t = sc.versions?.[c.version]?.trial;
					const ok = t !== undefined && finaleBranchGroup(`trial_${t}`).includes(trial.branch);
					return { status: ok ? 'met' : 'unmet', detail: loc('check_finale_version', { branch: trial.branch }) };
				}
				return { status: atScenario(c.scenario, (s) => s.option.version === c.version) ? 'in_position' : 'unmet' };
			}
			case 'scenario_level':
				return yes(atScenario(c.scenario, (s) => levelAt(c.scenario, s.entryTime) === c.level));
			case 'get_key': {
				const bearer = fs.keys.get(c.key);
				const held = bearer !== undefined && (c.bearer === 'investigator' ? bearerIsInvestigator(bearer) : true);
				return yes(held);
			}
			case 'recruit_ally':
				return yes(fs.allies.has(c.ally));
			case 'achievement': {
				const e = earned.find((a) => a.id === c.id);
				if (!e) return UNMET;
				return { status: e.status === 'guaranteed' ? 'met' : 'in_position' };
			}
			case 'campaign_log':
				return yes(fs.flags.has(c.flag));
			case 'special_delivery':
				return yes(fs.flags.has('the_cell_is_delivering_intel'));
			case 'visit_node':
				return yes(steps.some((s) => s.option.node === c.node));
			case 'play_side_story':
				return yes(steps.some((s) => s.option.optionId === c.sideStory));
			case 'avoid_scenario': {
				const node = scenarioNode(c.scenario);
				return yes(node === undefined || !steps.some((s) => s.option.node === node));
			}
			case 'reach_ending':
				return { status: trial.branch === c.trial ? 'met' : 'unmet', detail: loc('check_ending', { branch: trial.branch }) };
			case 'finale_outcome':
				// Won iff the plan ends on a LEGAL winning Congress step.
				return yes(steps.some((s) => s.option.outcome === 'WIN_CAMPAIGN' && s.problems.length === 0));
			case 'chaos_mix': {
				const ok = (c.tablet === undefined || fs.tablet === c.tablet) && (c.elderThing === undefined || fs.elderThing === c.elderThing);
				return { status: ok ? 'met' : 'unmet', detail: loc('check_chaos_mix', { tablet: fs.tablet, elderThing: fs.elderThing }) };
			}
			case 'chaos_overflow_xp':
				// Overflow XP is folded into bonus XP and not separable here; report as informational.
				return { status: 'in_position', detail: loc('check_chaos_overflow', { min: c.min }) };
			case 'chaos_balanced':
				// The bag is fully determined by the route's choices, so an unbalanced bag is definitively unmet.
				return { status: fs.tablet === fs.elderThing ? 'met' : 'unmet', detail: loc('check_chaos_mix', { tablet: fs.tablet, elderThing: fs.elderThing }) };
			case 'narrative_chain':
				// Narrative-chain constraints were retired from the editor; not evaluable here.
				return UNMET;
		}
	};

	return constraints.map((c, index) => {
		const raw = rawStatus(c);
		// A negated goal is satisfied exactly when the base condition is NOT met (avoid_scenario already
		// expresses its own negative, so it is never additionally flipped).
		let status = raw.status;
		if (c.negate && c.kind !== 'avoid_scenario' && raw.status !== 'in_position') {
			status = raw.status === 'met' ? 'unmet' : 'met';
		}
		return { index, kind: c.kind, status, detail: raw.detail };
	});
}
