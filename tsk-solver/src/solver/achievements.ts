/**
 * Achievement earnability per plan.
 *
 * Each achievement carries a structured `detect` rule in logic.json. For every planning
 * achievement, decide whether the plan *earns* it (`guaranteed`) or merely *positions* the cell
 * (`in_session` — the table feat is up to play). Surfacing these lets a player discover
 * achievements they didn't explicitly target.
 */

import { achievements as achievementList, achievementName } from '../data/load.js';
import type { AchievementDetect, CampaignState, EarnedAchievement } from '../types.js';
import type { SimStep } from './simulate.js';
import type { FinalePrediction } from './trial.js';

function label(id: string): { id: string; params: Record<string, string | number> } {
	return { id: 'achievement_name', params: { name: achievementName(id) } };
}

/** Did any non-travel step play this file (optionally on/before `maxEntryTime`)? */
function playedFile(steps: SimStep[], fileCode: string, maxEntryTime?: number): boolean {
	return steps.some((s) => !s.travelOnly && s.fileCode === fileCode && (maxEntryTime === undefined || s.entryTime <= maxEntryTime));
}

/** Did any step at `fileCode` resolve the given option (resolution / version branch)? */
function choseOption(steps: SimStep[], fileCode: string, optionId: string): boolean {
	return steps.some((s) => s.fileCode === fileCode && s.chosen.some((c) => c.option.id === optionId));
}

export function evaluateAchievements(steps: SimStep[], finalState: CampaignState, finale: FinalePrediction, requested: ReadonlySet<string>): EarnedAchievement[] {
	const playStops = steps.filter((s) => !s.travelOnly);
	const visitedLocations = new Set(playStops.map((s) => s.location));
	const out: EarnedAchievement[] = [];

	for (const ach of achievementList()) {
		if (ach.planning === false) continue;
		const d: AchievementDetect = ach.detect;
		const isRequested = requested.has(ach.id);
		const push = (status: 'guaranteed' | 'in_session') => out.push({ id: ach.id, label: label(ach.id), status, requested: isRequested });
		const sessioned = (cond: boolean, inSession?: boolean) => {
			if (cond) push(inSession ? 'in_session' : 'guaranteed');
		};

		switch (d.kind) {
			case 'visitFile':
				sessioned(playedFile(playStops, d.fileCode, d.maxEntryTime), d.inSession);
				break;
			case 'resolution':
				sessioned(choseOption(playStops, d.fileCode, d.optionId), d.inSession);
				break;
			case 'version':
				if (choseOption(playStops, d.fileCode, d.optionId)) push('in_session');
				break;
			case 'finaleJudgment':
				if (finale.judgment === d.judgmentId) push(d.inSession ? 'in_session' : 'guaranteed');
				break;
			case 'timeCap':
				if (finalState.timePassed <= d.maxTime) push('guaranteed');
				break;
			case 'chaos': {
				const have = d.token === 'tablet' ? finalState.tablet : finalState.elderThing;
				if (have >= d.count) push('in_session');
				break;
			}
			case 'epilogue':
				if (finale.epilogue === d.optionId) push('guaranteed');
				break;
			case 'visitLocations':
				if (d.locationIds.every((l) => visitedLocations.has(l))) push('guaranteed');
				break;
			case 'tableFeat':
				if (isRequested) push('in_session');
				break;
			case 'allKeys':
			case 'difficulty':
				break;
		}
	}

	// Deterministic order: requested first, then guaranteed, then by id.
	return out.sort((a, b) => Number(b.requested) - Number(a.requested) || (a.status === b.status ? 0 : a.status === 'guaranteed' ? -1 : 1) || (a.id < b.id ? -1 : 1));
}
