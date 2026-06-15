/**
 * @5argon/arkham-tsk-solver — public API surface.
 *
 * Powers a *manual* campaign planner for Arkham Horror LCG: The Scarlet Keys (TSK). The player
 * authors a plan (where to go, what to play); this package simulates the full campaign state at
 * every step, costs travel by shortest path, flags illegal steps, and scores the plan against the
 * player's goals. Framework-agnostic, deterministic, and spoiler-laden by design.
 */

export * from './types.js';
export {
	loadDatabase,
	validateIntegrity,
	DatabaseIntegrityError,
	getLocation,
	keysById,
	alliesById,
	getScenario,
	getInterlude,
} from './data/load.js';
export { resolveLocalized } from './i18n/recipe.js';
export { catalog, labelFor, type SolverCatalog, type CatalogEntry } from './catalog.js';

// --- engine + manual plan simulator (the search layer was replaced by player-authored plans) ---
export { initialState, applyStop, keysHeldByInvestigator, bearerIsInvestigator } from './graph/state.js';
export { distance, isNodeUnlocked, reachableFrom } from './graph/graph.js';
export { stopOptions, preChoicesAt, isAutoInterlude, isCombatScenarioNode, type StopOption } from './graph/model.js';
export {
	simulatePlan,
	optionsAt,
	reachableDestinations,
	type Plan,
	type PlanStep,
	type SimStep,
	type PlanTrajectory,
	type StepProblem,
	type Destination,
	type OptionChoice,
} from './solver/simulate.js';
export { evaluatePlan, type ConstraintCheck } from './solver/evaluate.js';
export { predictTrial, finaleBranchGroup, ALL_FINALE_BRANCHES, type TrialPrediction } from './solver/trial.js';
export { evaluateAchievements } from './solver/achievements.js';
export { optionMatches, type RequirementMatch } from './solver/constraint-match.js';
export type { RawRoute, RouteStep } from './solver/route-types.js';
