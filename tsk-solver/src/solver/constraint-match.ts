/**
 * Pure stop-option matcher.
 *
 * `optionMatches` answers "does this stop option satisfy this match target?" — the single
 * predicate behind both constraint satisfaction and negated-constraint exclusion. Extracted
 * from the old waypoint-expansion layer (the heavy producer/coalition machinery is gone with
 * the search; this small, side-effect-free matcher is all the plan evaluator needs).
 */

import type { StopOption } from '../graph/model.js';
import type { AchievementId, AllyId, FlagId, KeyId, ResId } from '../types.js';

export type RequirementMatch =
	| { type: 'visit_node' }
	| { type: 'prologue' }
	| { type: 'finale' }
	| { type: 'key_investigator'; key: KeyId }
	| { type: 'key_any'; key: KeyId }
	| { type: 'resolution'; resolution: ResId }
	| { type: 'version'; version: string }
	| { type: 'ally'; ally: AllyId }
	| { type: 'flag'; flag: FlagId }
	| { type: 'asset'; asset: string }
	| { type: 'achievement'; achievement: AchievementId };

/** Does a stop option satisfy a requirement match? */
export function optionMatches(option: StopOption, match: RequirementMatch): boolean {
	switch (match.type) {
		case 'visit_node':
			return true;
		case 'prologue':
			return option.isPrologue === true && !option.noResolution;
		case 'finale':
			return option.outcome === 'WIN_CAMPAIGN';
		case 'key_investigator':
			return (
				option.grantsKey === match.key ||
				(option.key === match.key && (option.bearer === 'investigator' || option.bearer === 'conditional') && !option.noResolution)
			);
		case 'key_any':
			return option.grantsKey === match.key || (option.key === match.key && !option.noResolution);
		case 'resolution':
			return option.optionId === match.resolution;
		case 'version':
			return option.version === match.version;
		case 'ally':
			return option.grantsAllies.includes(match.ally);
		case 'flag':
			// A "flag" requirement is also satisfied by an option that grants the matching
			// asset (e.g. mysterious_whistle), since unlock prerequisites can resolve to assets.
			return option.logs.includes(match.flag) || option.unlocks === match.flag || option.grantsAsset === match.flag;
		case 'asset':
			return option.grantsAsset === match.asset;
		case 'achievement':
			return option.achievement === match.achievement;
	}
}
