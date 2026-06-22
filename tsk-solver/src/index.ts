/**
 * @5argon/arkham-tsk-solver — public API surface.
 *
 * Powers a *manual* campaign planner for Arkham Horror LCG: The Scarlet Keys (TSK). The player
 * authors a plan (where to go, what to play, what to choose); this package simulates the full
 * campaign state at every step, costs travel by shortest path, flags illegal steps, predicts the
 * finale, and scores the plan against the player's goals. Data is split into language-independent
 * `logic.json` and translatable `en.json`, bridged by ids. Deterministic and spoiler-laden.
 */

export * from './types.js';

// data: loaders, integrity, accessors, and en.json display strings
export {
	loadLogic,
	loadEn,
	validateIntegrity,
	DatabaseIntegrityError,
	metadata,
	getFile,
	getEnFile,
	getLocation,
	hasLocation,
	locationIds,
	getMarker,
	sideStoryForLocation,
	isTallyEntry,
	achievements,
	campaignLog,
	// display accessors
	optionText,
	optionById,
	decisionText,
	fileTitle,
	keyName,
	characterName,
	locationName,
	logText,
	markerLabel,
	effectText,
	sideStoryProductName,
	achievementName,
	achievementDescription,
} from './data/load.js';

export { resolveLocalized } from './i18n/recipe.js';
export { catalog, labelFor, type SolverCatalog, type CatalogEntry } from './catalog.js';

// engine
export { initialState, applyFile, travelTo, computeTrust, computeDeception, keysHeldByInvestigator, bearerIsInvestigator } from './graph/state.js';
export { distance, shortestPath, isNodeUnlocked, isPassable, reachableFrom, lockableNodes } from './graph/graph.js';
export { applyEffect, sumTime, type Draft } from './graph/effects.js';
export { evalCondition, type FinaleContext } from './graph/conditions.js';
export {
	playableFilesAt,
	allPlayableFiles,
	applicableDecisions,
	selectableDecisions,
	decisionAppliesAt,
	optionsForDecision,
	defaultOptionId,
	isAutoFile,
	resolveFile,
	resolutionOffers,
	type PlayableFile,
	type ChosenOption,
	type GateViolation,
	type FileResolution,
	type ResolutionOffer,
} from './graph/model.js';

// manual plan simulator
export {
	simulatePlan,
	reachableDestinations,
	type Plan,
	type PlanStep,
	type SimStep,
	type PlanTrajectory,
	type StepProblem,
	type StepProblemKind,
	type Destination,
} from './solver/simulate.js';
export { evaluatePlan, type ConstraintCheck } from './solver/evaluate.js';
export { predictFinale, type FinalePrediction, type MemberVote } from './solver/trial.js';
export { evaluateAchievements } from './solver/achievements.js';
