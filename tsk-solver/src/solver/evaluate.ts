/**
 * Plan → goals checklist.
 *
 * `evaluatePlan` scores a finished plan against the player's constraints. Constraints are a
 * checklist (not a routing target): for each one, did the plan the player built satisfy it?
 * Each kind is checked directly against the trajectory's steps + final state + finale prediction.
 * A negated constraint is satisfied when the plan does NOT meet the base condition.
 */

import { metadata, optionById } from '../data/load.js';
import { bearerIsInvestigator } from '../graph/state.js';
import type { Constraint, LocalizedString } from '../types.js';
import { evaluateAchievements } from './achievements.js';
import type { PlanTrajectory, SimStep } from './simulate.js';

export interface ConstraintCheck {
	index: number;
	kind: Constraint['kind'];
	/** `met` — fully satisfied; `in_position` — set up but play-dependent; `unmet` — not satisfied. */
	status: 'met' | 'unmet' | 'in_position';
	detail?: LocalizedString;
}

const loc = (id: string, params: Record<string, string | number> = {}): LocalizedString => ({ id, params });

type Raw = { status: ConstraintCheck['status']; detail?: LocalizedString };
const MET: Raw = { status: 'met' };
const UNMET: Raw = { status: 'unmet' };
const yes = (b: boolean): Raw => (b ? MET : UNMET);

export function evaluatePlan(trajectory: PlanTrajectory, constraints: Constraint[]): ConstraintCheck[] {
	const steps: SimStep[] = trajectory.steps.filter((s) => !s.travelOnly);
	const fs = trajectory.finalState;
	const finale = trajectory.finale;
	const requested = new Set(constraints.filter((c): c is Extract<Constraint, { kind: 'achievement' }> => c.kind === 'achievement').map((c) => c.id));
	const earned = evaluateAchievements(steps, fs, finale, requested);

	/** Did any step at `fileCode` choose option `optionId`? */
	const chose = (fileCode: string, optionId: string) => steps.some((s) => s.fileCode === fileCode && s.chosen.some((c) => c.option.id === optionId));

	const rawStatus = (c: Constraint): Raw => {
		switch (c.kind) {
			case 'visit_file':
				return yes(steps.some((s) => s.fileCode === c.fileCode));
			case 'resolution':
				return yes(chose(c.fileCode, c.optionId));
			case 'scenario_version':
				return yes(chose(c.fileCode, c.optionId));
			case 'scenario_level':
				return yes(chose(c.fileCode, c.optionId));
			case 'get_key': {
				const bearer = fs.keys.get(c.key);
				return yes(bearer !== undefined && (c.bearer === 'investigator' ? bearerIsInvestigator(bearer) : true));
			}
			case 'achievement': {
				const e = earned.find((a) => a.id === c.id);
				if (!e) return UNMET;
				return { status: e.status === 'guaranteed' ? 'met' : 'in_position' };
			}
			case 'campaign_log':
				return yes(fs.recorded.has(c.entryId));
			case 'play_side_story':
				return yes(steps.some((s) => s.fileCode === c.product));
			case 'reach_judgment':
				return { status: finale.judgment === c.judgment ? 'met' : 'unmet', detail: loc('check_ending', { branch: finaleTitle(finale.judgment) }) };
			case 'epilogue':
				return { status: finale.epilogue === c.optionId ? 'met' : 'unmet', detail: loc('check_ending', { branch: epilogueTitle(finale.epilogue) }) };
			case 'finale_outcome':
				return yes(steps.some((s) => s.campaignResult === 'win' && s.problems.length === 0));
			case 'chaos_mix': {
				const ok = (c.tablet === undefined || fs.tablet === c.tablet) && (c.elderThing === undefined || fs.elderThing === c.elderThing);
				return { status: ok ? 'met' : 'unmet', detail: loc('check_chaos_mix', { tablet: fs.tablet, elderThing: fs.elderThing }) };
			}
			case 'chaos_balanced':
				return { status: fs.tablet === fs.elderThing ? 'met' : 'unmet', detail: loc('check_chaos_mix', { tablet: fs.tablet, elderThing: fs.elderThing }) };
		}
	};

	return constraints.map((c, index) => {
		const raw = rawStatus(c);
		let status = raw.status;
		if (c.negate && raw.status !== 'in_position') status = raw.status === 'met' ? 'unmet' : 'met';
		return { index, kind: c.kind, status, detail: raw.detail };
	});
}

/** Display label for a finale judgment option (its en dropdown text). */
function finaleTitle(optionId: string): string {
	return optionById(metadata().finaleFile, optionId)?.dropdownText ?? optionId;
}
/** Display label for an epilogue option. */
function epilogueTitle(optionId: string): string {
	return optionById('Epilogue', optionId)?.dropdownText ?? optionId;
}
