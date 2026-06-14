/**
 * Localized-string resolution (README §8).
 *
 * The solver core emits opaque `LocalizedString` descriptors (`{ id, params }`). This is
 * the only module that depends on the Paraglide-generated message functions; it resolves a
 * descriptor for a requested locale. The web app calls these — the package owns all copy.
 */

import * as messages from '../paraglide/messages.js';
import type {
	ConstraintRef,
	EarnedAchievement,
	LocalizedString,
	Locale,
	Recipe,
	Step,
} from '../types.js';

type MessageFn = (inputs?: Record<string, unknown>, options?: { locale?: Locale }) => string;
const messageTable = messages as unknown as Record<string, MessageFn>;

/** Resolve a `LocalizedString` to a concrete string for `locale` (default `en`). */
export function resolveLocalized(ls: LocalizedString, locale: Locale = 'en'): string {
	const fn = messageTable[ls.id];
	if (typeof fn !== 'function') return ls.id;
	return String(fn(ls.params, { locale }));
}

export interface ResolvedStep extends Omit<Step, 'reason' | 'scenarioLevel'> {
	reason?: string;
	scenarioLevel?: string;
}

export interface ResolvedConstraintRef extends Omit<ConstraintRef, 'label'> {
	label: string;
}

export interface ResolvedEarnedAchievement extends Omit<EarnedAchievement, 'label'> {
	label: string;
}

export interface ResolvedRecipe extends Omit<Recipe, 'steps' | 'warnings' | 'satisfies' | 'earnableAchievements' | 'freebies'> {
	steps: ResolvedStep[];
	warnings: string[];
	freebies: string[];
	satisfies: ResolvedConstraintRef[];
	earnableAchievements: ResolvedEarnedAchievement[];
}

/** Resolve every localized string in a recipe to concrete strings for `locale`. */
export function resolveRecipe(recipe: Recipe, locale: Locale = 'en'): ResolvedRecipe {
	return {
		...recipe,
		steps: recipe.steps.map((s) => ({
			...s,
			reason: s.reason ? resolveLocalized(s.reason, locale) : undefined,
			scenarioLevel: s.scenarioLevel ? resolveLocalized(s.scenarioLevel, locale) : undefined,
		})),
		warnings: recipe.warnings.map((w) => resolveLocalized(w, locale)),
		freebies: recipe.freebies.map((f) => resolveLocalized(f, locale)),
		satisfies: recipe.satisfies.map((c) => ({ ...c, label: resolveLocalized(c.label, locale) })),
		earnableAchievements: recipe.earnableAchievements.map((a) => ({ ...a, label: resolveLocalized(a.label, locale) })),
	};
}
