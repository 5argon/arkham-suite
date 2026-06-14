/**
 * Achievement earnability per recipe (README §"Achievements").
 *
 * For every planning achievement, decide whether a finished route *earns* it
 * (`guaranteed` — routing fully satisfies it) or merely *enables* it (`in_session` —
 * the route puts you in the right scenario/version/window, but the table feat is yours).
 * Surfacing these lets a player discover achievements they didn't explicitly ask for.
 */

import { getScenario, loadDatabase } from '../data/load.js';
import type { CampaignState, Difficulty, EarnedAchievement, NodeId } from '../types.js';
import type { RouteStep } from './search.js';
import type { TrialPrediction } from './trial.js';

function achievementLabel(id: string): { id: string; params: Record<string, string | number> } {
	const ach = loadDatabase().achievements.find((a) => a.id === id);
	return { id: 'achievement_name', params: { name: ach?.label ?? id } };
}

function scenarioNode(scenario: string): NodeId | undefined {
	const s = getScenario(scenario);
	if (s) return s.location;
	for (const loc of loadDatabase().locations) if (loc.scenario_id === scenario) return loc.id;
	return undefined;
}

export function evaluateAchievements(
	steps: RouteStep[],
	finalState: CampaignState,
	difficulty: Difficulty,
	trial: TrialPrediction,
	requested: ReadonlySet<string>,
): EarnedAchievement[] {
	const visitedNodes = new Set(steps.map((s) => s.option.node));
	const nodeResolution = new Set(steps.map((s) => `${s.option.node}:${s.option.optionId}`));
	const nodeVersion = new Set(steps.filter((s) => s.option.version).map((s) => `${s.option.node}:${s.option.version}`));
	// Record each node's ENTRY time (cumulative time after travel, before playing it), so an
	// "enter at <= N time" window (e.g. Take That, Ghulat) checks arrival, not the post-play clock.
	const stepTimeAt = new Map<NodeId, number>();
	let t = 0;
	for (const s of steps) {
		t += s.travelCost;
		if (!stepTimeAt.has(s.option.node)) stepTimeAt.set(s.option.node, t);
		t += s.option.baseTime;
	}

	const out: EarnedAchievement[] = [];
	for (const ach of loadDatabase().achievements) {
		if (ach.planning === false) continue;
		const c = ach.constraint;
		if (!c) continue;
		const isRequested = requested.has(ach.id);
		const inSession = (kind: { feat?: 'in_session' }) => kind.feat === 'in_session';
		const push = (status: 'guaranteed' | 'in_session') =>
			out.push({ id: ach.id, label: achievementLabel(ach.id), status, requested: isRequested });

		switch (c.kind) {
			case 'time_cap':
				if (finalState.timePassed <= c.max_time) push('guaranteed');
				break;
			case 'difficulty':
				if (difficulty === (c.difficulty as Difficulty)) push('guaranteed');
				break;
			case 'scenario_resolution': {
				const node = scenarioNode(c.scenario);
				if (node && nodeResolution.has(`${node}:${c.resolution}`)) push(inSession(c) ? 'in_session' : 'guaranteed');
				break;
			}
			case 'scenario_version': {
				const node = scenarioNode(c.scenario);
				if (node && nodeVersion.has(`${node}:${c.version}`)) push('in_session');
				break;
			}
			case 'visit_scenario': {
				const node = scenarioNode(c.scenario);
				if (!node || !visitedNodes.has(node)) break;
				if (c.max_time !== undefined && (stepTimeAt.get(node) ?? Infinity) > c.max_time) break;
				push(inSession(c) ? 'in_session' : 'guaranteed');
				break;
			}
			case 'visit_nodes':
				if (c.nodes.every((n) => visitedNodes.has(n))) push('guaranteed');
				break;
			case 'finale_trial':
				if (trial.trial === c.trial) push('guaranteed');
				break;
			case 'epilogue':
				if (trial.epilogue === c.epilogue) push('guaranteed');
				break;
			case 'chaos': {
				const have = c.token === 'tablet' ? finalState.tablet : finalState.elderThing;
				if (have >= c.count) push('in_session');
				break;
			}
			case 'none':
				if (isRequested) push('in_session');
				break;
			case 'all_keys':
				break;
		}
	}
	// Deterministic order: requested first, then guaranteed, then by id.
	return out.sort(
		(a, b) =>
			Number(b.requested) - Number(a.requested) ||
			(a.status === b.status ? 0 : a.status === 'guaranteed' ? -1 : 1) ||
			(a.id < b.id ? -1 : 1),
	);
}
