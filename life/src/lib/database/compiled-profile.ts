/**
 * compiled-profile.ts — the codec for the "compiled profile" artifact (the lean,
 * deployable/exportable form of a profile payload).
 *
 * The in-app `LocalProfilePayload` carries fully-resolved English (achievement
 * titles/texts, family/campaign names, branch & ending texts, collection labels)
 * so the live pages render without extra lookups. But that text is all
 * RE-DERIVABLE from keys the payload already carries — `family` → campaign name,
 * achievement `id` → title/text, branch/ending `key` → text, `sectionId`/item
 * `id` → labels — via `@5argon/arkham-campaign-data` + `@5argon/arkham-kohaku`,
 * which the renderer always has. So the artifact stores ONLY keys/ids/numbers/
 * states + genuine user data (names, campaign titles), and a consumer resolves
 * the display strings at render time (the same way card codes resolve against the
 * ambient card database). This keeps the deployed/exported file small and makes
 * it localizable for free.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * PRINCIPLE: serialize computed NUMBERS, don't re-derive them near the UI.
 * ──────────────────────────────────────────────────────────────────────────────
 * The compiled profile is a STABLE PUBLIC DATA CONTRACT — `.ahlifepro` is meant to
 * be hosted and read by third parties (e.g. someone wiring their own achievement
 * engine that triggers when a stat crosses a threshold). So any MEANINGFUL derived
 * number — a count / sum / total / max / min / streak / ratio / coverage a consumer
 * might read or threshold on — should be COMPUTED AT THE COMPILE (precompute) STEP
 * and live here as an explicit, named field, NOT recomputed in a Svelte component on
 * every render. A number a widget derives hot is invisible to `.ahlifepro` consumers
 * and forces every one of them to re-implement it; a named field is obvious and
 * reusable. Prefer this even when the inputs are already serialized and the new value
 * is "just a sum" — the sum is the thing a consumer reads.
 *
 * Where a new number goes:
 *   • a per-family / per-campaign fact → that family's blob builder, next to the data
 *     it sums (e.g. `tsk` in tsk-profile.ts, `eoe` in eoe.ts, coverage in
 *     custom-achievements.ts);
 *   • a cross-family lifetime headline → {@link ProfileSummary}, assembled once in
 *     `assemblePayload` (profile-local.ts).
 * Numbers are never stripped below (only re-derivable English is), so the field is
 * carried whole into the artifact automatically.
 *
 * THE EXCEPTION — bloat. Keep a value HOT in the component only when serializing it
 * would add a LARGE amount of data: per-card / per-deck / per-investigator / per-cell
 * expansions (a number for every card × every context), or anything gated by a live
 * UI setting (selected class tab, hide-flags, the owned-products filter). Those stay
 * as primitives + hot filtering — serialize the bounded headline, not the whole matrix.
 *
 * `stripCompiledProfile` is the encoder. A future viewer's `hydrateCompiledProfile`
 * (re-resolving the dropped strings from the ambient packages) is its inverse.
 */

import type { LocalProfilePayload } from './profile-local';
import type { ProfileSubject } from '$lib/profile/profile-types';

/** Return a shallow copy of `obj` without `keys`. (Avoids unused-var lint from
 *  destructuring-omit; the dropped values are genuinely discarded.) */
function omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
	const out = { ...obj };
	for (const k of keys) delete out[k];
	return out;
}

/**
 * Strip every re-derivable English string from a profile payload, yielding the
 * key-only compiled-profile artifact. User data (subject/member names, campaign
 * titles) and non-re-derivable derived data (investigator `options`, recorded
 * choice values) are kept.
 */
export function stripCompiledProfile(p: LocalProfilePayload) {
	return {
		subject: p.subject, // name/members are user data — kept
		summary: p.summary, // cross-family headline totals — pure numbers, kept whole
		campaigns: p.campaigns, // title is user data; everything else is keys/dates
		calendar: p.calendar, // title (user data) + family/code keys
		achievements: {
			families: p.achievements.families.map((f) => ({
				...omit(f, ['name']),
				achievements: f.achievements.map((a) => ({
					// `items` carries the list achievement's per-item earned states (kept);
					// each item's English `label` is re-derivable from the ids, so drop it.
					...omit(a, ['title', 'text']),
					items: a.items?.map((it) => omit(it, ['label'])),
				})),
			})),
			custom: p.achievements.custom.map((c) => omit(c, ['title', 'description'])),
			coverage: p.achievements.coverage.map((cov) => ({
				...omit(cov, ['campaignName']),
				groups: cov.groups.map((g) => ({
					...g,
					branches: g.branches.map((b) => omit(b, ['text'])),
				})),
			})),
		},
		clearGrid: p.clearGrid.map((r) => omit(r, ['name'])),
		winLossRecord: p.winLossRecord.map((r) => omit(r, ['name'])),
		endings: p.endings.map((e) => ({
			...omit(e, ['name']),
			endings: e.endings.map((x) => omit(x, ['text'])),
		})),
		collections: p.collections.map((c) => ({
			...omit(c, ['name']),
			collections: c.collections.map((col) => ({
				...omit(col, ['title']),
				items: col.items.map((i) => omit(i, ['label'])),
			})),
		})),
		scenarioXp: p.scenarioXp.map((s) => ({
			...omit(s, ['name']),
			scenarios: s.scenarios.map((sc) => ({
				// scenario `name` is re-derivable from its id (campaign-data scenarioNames).
				...omit(sc, ['name']),
				choices: sc.choices?.map((ch) => omit(ch, ['label'])),
			})),
		})),
		// Standalone usage: per-family standalone scenario play tallies. Both the family
		// `name` and each row's scenario `name` re-derive from their ids (campaign-data
		// `standaloneScenarios()`); the scenario id / counts / resolution ids stay.
		standaloneUsage: p.standaloneUsage.map((s) => ({
			...omit(s, ['name']),
			standalones: s.standalones.map((sa) => omit(sa, ['name'])),
		})),
		// Resolution coverage: per-scenario endings reached + per-difficulty tally
		// counts (user stats, kept). Only the family `name` is re-derivable → dropped.
		resolutionCoverage: p.resolutionCoverage.map((rc) => omit(rc, ['name'])),
		// Trauma tally: per-ending/-investigator death & insanity counts (user stats,
		// kept). Carries only ids/keys/numbers — the campaign name re-derives from `family`.
		traumaTally: p.traumaTally,
		// EotE City of the Elder Things matrix: version + resolution ids + per-difficulty
		// counts (user stats, all keys/numbers — nothing re-derivable to strip).
		eoeCity: p.eoeCity,
		// EotE bespoke tallies (crash / demons / survivors / supplies / camps): member &
		// item ids + counts (all keys/numbers — labels re-derive from the ids).
		eoe: p.eoe,
		// The Scarlet Keys aggregate: trust/deception act counts, Coterie outcomes, routes
		// — all keys/numbers/dates (user stats), nothing English to strip. Kept whole.
		tsk: p.tsk,
		// Special interactions: interaction id + triggered state + the investigators who
		// triggered it (codes). The "why"/scenario/condition all re-derive from
		// `(family, id)` via campaign-data, so nothing English to strip — kept whole.
		specialInteractions: p.specialInteractions,
		investigators: p.investigators, // code + count + options (deck-derived, not re-derivable here)
		cardUsage: p.cardUsage, // code → count
		// Used-once context: canon card code → { investigator, campaign keys, difficulty, finish
		// date }. All keys/dates (deck-derived stats), nothing English to strip — kept whole.
		usedOnce: p.usedOnce,
		// Specialist usage: card code → investigator codes (deck-derived). Card / investigator
		// details re-derive from card data at render, so kept whole.
		specialistUsage: p.specialistUsage,
		// Per-deck spotlight-card footprints (investigator code + tracked code→copies) for the
		// neutral-card insight widgets. Keys/counts only — kept whole.
		insightDecks: p.insightDecks,
		// Precomputed "eligible but unused" tallies (Vicious Blow & Deduction) — final
		// counts + ≤3 investigator codes per target, nothing to recompute at render.
		eligibilityInsights: p.eligibilityInsights,
		totalDecks: p.totalDecks, // the "% of decks" denominator (a count)

		// Charisma/Relic Top-3 deck entries + per-customizable-card tallies (deck-derived
		// keys/counts; card/investigator details re-derive from card data) — kept whole.
		charismaTopDecks: p.charismaTopDecks,
		relicTopDecks: p.relicTopDecks,
		customizableUsage: p.customizableUsage,
		playedCardCodes: p.playedCardCodes,
		settings: p.settings,
	};
}

/** The lean, key-only artifact shape (display strings resolved at render time). */
export type CompiledProfile = ReturnType<typeof stripCompiledProfile>;

/** Bumped only on a breaking change to the compiled-profile file's shape.
 *  1→2: added the cross-family `summary` block + precomputed headline aggregates on the
 *  `tsk`/`eoe` blobs and coverage entries (the serialize-numbers principle above).
 *  2→3: added TSK epilogue-tally (`foundationTrustTally`/`cellDeceptionTally`) + exhaustive
 *  chaos-bag act counts (`bagActCounts`) on the `tsk` blob.
 *  3→4: added `eligibilityInsights` — precomputed "eligible but unused" tallies per card
 *  (Vicious Blow & Deduction), the denominator spanning every deck.
 *  4→5: added `totalDecks` — the all-decks count used as the "% of decks" denominator for the
 *  Charisma & Relic Hunter / Core Neutral insight percentages.
 *  5→6: `eligibilityInsights` entries now carry used / removed-not-upgraded counts (+ their
 *  investigators) instead of the single not-used count.
 *  6→7: `eligibilityInsights` entries also carry the not-used count + investigators alongside
 *  used / removed.
 *  7→8: `eligibilityInsights` entries also carry the never-removed investigators (complement of
 *  removed among the used decks).
 *  8→9: each `insightDecks` entry carries `cantripMax` (per-version distinct-cantrip max) for the
 *  corrected cantrip-diversity rows. */
export const COMPILED_PROFILE_VERSION = 9;

/**
 * The on-disk/over-the-wire compiled-profile file (`.ahlifepro`, or its plain
 * `.json` debug twin). A small envelope around {@link CompiledProfile} so a viewer
 * can sniff the file (`kind`) and reject a newer format (`v`). `subject` is hoisted
 * to the top level (it also lives in `profile.subject`) so a viewer can render the
 * header — avatar, name, group members — without parsing the whole profile.
 */
export interface CompiledProfileFile {
	kind: 'arkham-life-compiled-profile';
	v: number;
	/** ISO-8601 timestamp of when this file was produced. */
	exportedAt: string;
	subject: ProfileSubject;
	profile: CompiledProfile;
}

export class CompiledProfileError extends Error {}

/** Wrap a profile payload into the versioned compiled-profile file. */
export function makeCompiledProfileFile(
	subject: ProfileSubject,
	payload: LocalProfilePayload,
	exportedAt: string,
): CompiledProfileFile {
	return {
		kind: 'arkham-life-compiled-profile',
		v: COMPILED_PROFILE_VERSION,
		exportedAt,
		subject,
		profile: stripCompiledProfile(payload),
	};
}

/**
 * Validate a parsed value as a compiled-profile file (for a future viewer's load
 * path). Throws {@link CompiledProfileError} on an unrecognizable or newer file.
 * The inverse `hydrateCompiledProfile` (re-resolving dropped strings) is a separate
 * task; this only confirms shape + version.
 */
export function parseCompiledProfileFile(value: unknown): CompiledProfileFile {
	if (typeof value !== 'object' || value === null) {
		throw new CompiledProfileError('This file is not a recognizable compiled profile.');
	}
	const v = value as Record<string, unknown>;
	if (v.kind !== 'arkham-life-compiled-profile' || typeof v.v !== 'number' || typeof v.profile !== 'object' || v.profile === null) {
		throw new CompiledProfileError('This file is not a recognizable compiled profile.');
	}
	if (v.v > COMPILED_PROFILE_VERSION) {
		throw new CompiledProfileError(
			`This compiled profile was made by a newer version (format ${v.v}). Please update first.`,
		);
	}
	return value as CompiledProfileFile;
}
