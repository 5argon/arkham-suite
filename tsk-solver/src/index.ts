/**
 * @5argon/arkham-tsk-solver — public API surface.
 *
 * Computes optimal campaign routes for Arkham Horror LCG: The Scarlet Keys (TSK)
 * under user constraints, or proves a constraint set unsatisfiable. Framework-agnostic,
 * deterministic, and spoiler-laden by design (it is the inverse of normal discovery).
 */

export * from './types.js';
export { solve } from './solver/solve.js';
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
export { resolveLocalized, resolveRecipe, type ResolvedRecipe, type ResolvedStep } from './i18n/recipe.js';
export { catalog, labelFor, type SolverCatalog, type CatalogEntry } from './catalog.js';
