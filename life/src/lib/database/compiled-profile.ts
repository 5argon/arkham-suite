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
		// Solo / true-solo clear grids: 1-player-filtered variants of clearGrid. NOT
		// re-derivable from the lean artifact (they need the source plays), so they must
		// be carried; only each row's re-derivable `name` is dropped (like clearGrid).
		soloClearGrid: p.soloClearGrid.map((r) => omit(r, ['name'])),
		trueSoloClearGrid: p.trueSoloClearGrid.map((r) => omit(r, ['name'])),
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
		// Unified per-scenario records (the single per-scenario source: plays / Succeed / Failed /
		// resolutions reached + verdicts / VP highscore / choices). Numbers, ids and win/loss
		// verdicts are the contract and stay; family + scenario `name` and choice `label` re-derive.
		scenarios: p.scenarios.map((c) => ({
			...omit(c, ['name']),
			scenarios: c.scenarios.map((sc) => ({
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
		// First-class Standalone Archive aggregates (per scenario): scenario id / source /
		// catalogue code / counts / verdicts / resolution tallies / XP-tier distribution are
		// the contract and stay; only the scenario `name` re-derives from its id.
		standalones: p.standalones.map((s) => omit(s, ['name'])),
		// Trauma tally: per-ending/-investigator death & insanity counts (user stats,
		// kept). Carries only ids/keys/numbers — the campaign name re-derives from `family`.
		traumaTally: p.traumaTally,
		// EotE bespoke tallies (crash / demons / survivors / supplies / camps): member &
		// item ids + counts (all keys/numbers — labels re-derive from the ids).
		eoe: p.eoe,
		// The Scarlet Keys aggregate: trust/deception act counts, Coterie outcomes, routes
		// — all keys/numbers/dates (user stats), nothing English to strip. Kept whole.
		tsk: p.tsk,
		// The Dunwich Legacy bespoke tallies (openers order / kidnapped scholars / sacrifices /
		// Necronomicon / broods / Ascending the Hill / finale): ids + counts only, labels re-derive.
		dwl: p.dwl,
		// The Path to Carcosa bespoke tallies (doubt/conviction, VIPs, per-scenario): ids + counts.
		ptc: p.ptc,
		// The Forgotten Age bespoke tallies (Yig's Fury, provisions, companions, per-scenario): ids + counts.
		tfa: p.tfa,
		// The Circle Undone bespoke tallies (allegiance, missing persons, mementos, endings): ids + counts.
		tcu: p.tcu,
		// The Dream-Eaters bespoke tallies (Evidence of Kadath / Steps of the Bridge / per-scenario +
		// the shared interconnected view: Black Cat, Silver Key, Randolph, epilogue matrix): ids + counts.
		tdea: p.tdea,
		tdeb: p.tdeb,
		// The Innsmouth Conspiracy bespoke tallies (memories, the seven-key finale gate, equipment,
		// Harper, per-scenario, finale): ids + counts only, labels re-derive.
		tic: p.tic,
		// The Feast of Hemlock Vale bespoke tallies (areas/schedule, villager relationships, Fate of
		// the Vale, the curse): ids + counts only, labels re-derive.
		fhv: p.fhv,
		// The Drowned City bespoke tallies (the Fold, glyphs by scenario, artifacts, side tasks,
		// the Sepulchre better ending, per-scenario forks, the Doom finale): ids + counts only.
		tdc: p.tdc,
		// The Night of the Zealot bespoke tallies (the 3 scenarios' notes + cultist counts):
		// ids + counts only, labels re-derive.
		notz: p.notz,
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
 *  corrected cantrip-diversity rows.
 *  9→10: added the `dwl` blob — The Dunwich Legacy bespoke per-scenario tallies.
 *  10→11: added the `ptc` blob — The Path to Carcosa bespoke per-scenario tallies.
 *  11→12: added the `tfa` blob — The Forgotten Age bespoke per-scenario tallies.
 *  12→13: added the `tcu` blob — The Circle Undone bespoke per-scenario tallies.
 *  13→14: added the `tdea` + `tdeb` blobs — The Dream-Eaters bespoke per-scenario tallies +
 *  the shared interconnected view (Black Cat, Silver Key, Randolph, epilogue matrix).
 *  14→15: added `soloClearGrid` + `trueSoloClearGrid` — the 1-player-filtered clear grids
 *  (previously dropped, so a loaded/compiled-profile viewer couldn't render the Solo / True
 *  Solo Campaign Clears widgets). Each row's `name` is still re-derivable → dropped.
 *  15→16: added the `tic` blob — The Innsmouth Conspiracy bespoke per-scenario tallies.
 *  16→17: added the `fhv` blob — The Feast of Hemlock Vale bespoke per-scenario tallies. */
/*  17→18: added the `tdc` blob — The Drowned City bespoke per-scenario tallies. */
/*  18→19: Return-to campaigns are now first-class families (own code, not folded into
 *  the base) — the artifact's `family` keys change for rt* plays. */
/*  19→20: added the `notz` blob — The Night of the Zealot bespoke per-scenario tallies. */
/*  20→21: PtC blob extended — Unspeakable Oath insane-investigators (subject-scoped),
 *  Echoes per-player-count resolution table, Last King slain-at-the-party VIPs; and Dim
 *  Carcosa `possessed` dropped as a win ending (epilogue trigger, not a win). */
/*  21→22: resolutionCoverage scenarios gained per-scenario `succeed`/`failed` tallies, derived
 *  generically from campaign-data `scenarioMeta.resolutionOutcomes` (the shared per-scenario
 *  Succeed/Failed source the scenario passport reads). */
/*  22→23: added the unified `scenarios` structure — one per-scenario record per campaign
 *  (plays / Succeed / Failed / resolutions reached + verdicts / VP highscore / choices), the
 *  single per-scenario source that supersedes `scenarioXp` + `resolutionCoverage`. */
/*  23→24: removed the now-redundant `scenarioXp` + `resolutionCoverage` structures — `scenarios`
 *  is the sole per-scenario source in the contract. */
/*  24→25: PtC `doubtConvictionRuns` gained per-play `tokenRoute` (chaos-token mix per scenario),
 *  `outcome` (win/loss/abandoned) + `difficulty`; plus new `dcSources` (per-change Conviction/
 *  Doubt/Neutral by difficulty) and `tokenScenarioMixes` (per-scenario token coverage). */
/*  25→26: PtC runs gained `outcomeKey` (the finale ending log key → shared outcome-face text) and
 *  `dcSources` rows gained `canNeutral` (sources that never go neutral show a dash). */
/*  27→28: PtC runs gained `phantomVersion` / `oathVersion` (serialized Act-version per play); the
 *  Phantom + Unspeakable Oath blobs gained per-version `versions` tallies; `vipSlainHome` replaced
 *  by richer `vipHelp` (per home scenario: VIP card pair + interview-bonus + slain-here counts). */
/*  28→29: `ScenarioStat` gained the unified `versions` per-version breakdown (plays / Succeed /
 *  Failed / resolutions / XP per version), the single source for the shared version table. */
/*  29→30: removed the now-redundant bespoke per-version blobs — the EotE `eoeCity` matrix, PtC
 *  `phantom`/`unspeakableOath` `versions`, and DWL `ascendingHill` — all superseded by
 *  `ScenarioStat.versions` (every versioned scenario reads the one structure). */
/*  30→31: PtC `vipHelp` bonus / slainHere widened from a plain count to `{ total, byTier }` so the
 *  VIP header's two numbers hover to a per-difficulty breakdown like every other count. */
/*  31→32: retired TSK's bespoke per-variant blobs (`scenarioVariant{Tallies,Plays,Outcomes}`) — its
 *  version + tier rows now live in `ScenarioStat.versions` via a MULTI-AXIS registry entry, so the
 *  whole per-version model is unified (every versioned scenario, TSK included, reads one structure). */
/*  32→33: PtC `pallidMask`/`blackStarsRise` `randomizedWeaknesses` changed from a `code→count` map to
 *  a `{ weakness, bearer, count }[]` grouped by (weakness, drawing investigator) — the new
 *  `randomized_weakness_investigator` Extra picker attributes each random weakness to its bearer. */
/*  33→34: PtC chaos-token route/coverage corrected — the route ends at the TERMINAL scenario (Carcosa
 *  merged ⇒ Black Stars Rise, not Dim Carcosa); only completed (win/loss) runs count; and the
 *  receiver "base" mix is dropped (a receiver always gets a mix; an empty one is unknown data). */
/*  34→35: PtC random-weakness draws (Pallid Mask / Black Stars Rise) are scoped to the viewed
 *  subject's investigators — a weakness attributed to a teammate's investigator no longer shows on a
 *  single-player profile (a play group still merges every member's). */
/*  35→36: PtC Echoes `byPlayerCount` entries hold resolution-derived `{ succeed, failed, tallies }`
 *  (per-player-count Succeed / Failed via the shared version breakdown) instead of `{ plays,
 *  resolutions }`; no_resolution counts as a Failed rather than vanishing into the play total. */
/*  36→37: PtC Doubt/Conviction runs dropped `consistent` / `recordedConviction` / `recordedDoubt` —
 *  the chain-vs-recorded-meter mismatch check is no longer surfaced in the profile UI. */
/*  37→38: added `standalones` — the first-class Standalone Archive aggregates (per scenario:
 *  plays / win-loss / resolution coverage / best score / deck XP-range tier distribution). Only
 *  each scenario's `name` is stripped (re-derived from its catalogue); everything else is the contract. */
/*  38→39: PtC Curtain Call's Stranger-defeat count is derived from the warn-police resolution (2 if you
 *  went to the police either way, else 1) instead of a manual Extra counter, which is no longer asked. */
/*  39→40: PtC investigator codes (insane / possessed / random-weakness bearer) are canonicalized to
 *  their base printing, so a parallel / promo investigator matches the roster + groups as one. */
/*  40→41: PtC chaos-token route carries the bag forward — a scenario whose transition adds no special
 *  tokens keeps the previous mix (the persisted bag) instead of an empty step, in the chain + coverage. */
/*  41→42: PtC Dim Carcosa blob gained `strangerArrivalDoom` — plays per agenda-1a doom tier set by the
 *  Chasing-the-Stranger tally at arrival (final tally minus the marks earned within Dim Carcosa). */
/*  42→43: PtC widget-table batch — Curtain Call's `strangerOnToYou` became `didntReachAct2b` (plays that
 *  ended Curtain Call before the theater turned); `strangerByScenario` now lists EVERY Stranger scenario
 *  (0-defeat ones included, shown as a dash); and Pallid Mask / Black Stars Rise `randomizedWeaknesses`
 *  are per-draw `{ weakness, bearer, finishDate }` (newest first, cap 7) instead of (weakness, bearer)-
 *  grouped counts — the lists are now a dated chronological log. */
/*  43→44: PtC Dim Carcosa `strangerArrivalDoom` is now per-doom-tier `{ succeed, failed, tallies }`
 *  (the shared per-version breakdown, doom tier as the axis — Succeed / Failed / Resolutions, no Plays)
 *  instead of a plain doom → play count; only plays that recorded a Dim Carcosa resolution. */
/*  44→45: PtC Dim Carcosa `possessedInvestigators` is now LOG-derived — read from the repeatable
 *  `possessed` campaign-note `#name#` picks (a new `possessedInvestigators` record field) instead of the
 *  dropped Extra picker — and reshaped to a subject-scoped, newest-first `{ code, finishDate }[]` list. */
/*  45→46: PtC VIP tallies (`vipsInterviewed`, `vipsSlain`, `lastKing.slainVips`) widened from plain
 *  counts to `TierCount` (per-difficulty split for the portrait hovers), and `lastKing` gained
 *  `mostSlainInRun` (the highest single-run party-slain count + the most-recent such run's guests). */
/*  46→47: PtC trimmed + corrected — dropped Curtain Call `didntReachAct2b` and Pallid Mask
 *  `knowSiteOfGate` (always-true / unreliable); Oath `insaneInvestigators` reshaped to dated
 *  `{ code, finishDate }[]` (newest first); Black Stars Rise `carcosaMerged` is discriminated from Dim
 *  Carcosa's R4 by explicit resolution (naive note → BSR); Dim Carcosa gained `carcosaMerged` (R4). */
/*  47→48: TCU blob rebuilt to PtC parity — the Lodge-vs-Coven allegiance spine (`allegianceRuns`
 *  per-play lean chains + `allegianceSources` per-decision Lodge/Coven/neutral by difficulty +
 *  `allegiance` lean summary/Josef), missing-persons Union survival, mementos coverage, Wages-of-Sin
 *  heretics distribution, the Inner Circle + Union faction states, the four-ending finale, and the
 *  Twist-of-Fate `pathWinds` → finale table; Union and Disillusion gained a derived Cosmos version
 *  axis in `ScenarioStat.versions`. Removed the phantom `covenVictory` (a non-existent log id). */
/*  48→49: The Dream-Eaters — precomputed `evidenceOfKadath.avg` (tdea) and `stepsOfTheBridge.avg`
 *  (tdeb) so the widgets read a serialized mean instead of computing it hot. Render-only otherwise. */
/*  49→50: The Forgotten Age `tfa` blob rebuilt to PtC parity — per-play `runs`, the Poisoned/Venom
 *  aggregate, the Harbinger per-appearance trajectory + `neverDamaged`, `suppliesEmptyRuns`, the
 *  Yithian aftermath, and re-sourced hidden-log facts (Ichtaca conversation, HotE consult, final
 *  depth) + fixed composite-keyed counts (harbinger_alive, paths_known) — so the blob recomputes. */
/*  50→51: The Innsmouth Conspiracy `tic` blob widened from flat counts to per-difficulty
 *  `ResolutionTally` on every field (memories/keys/equipment/harper + all per-scenario branches),
 *  powering the shared difficulty hovers; suspect/hideout/equipment gained card codes — recompute. */
/*  51→52: NotZ blob rebuilt to full parity — every count widened to a per-difficulty `ResolutionTally`;
 *  The Gathering gained `litaRecruited` + Ghoul Priest `slain` (crossed-off) vs `survived`; The Midnight
 *  Masks gained per-cultist caught/escaped tallies, `playsWithEscapes`, and a best-single-play `bestHaul`
 *  highscore; the finale endings are tallies; and a new `purist` blob counts Core-Set-only clears
 *  (deck-derived via `CampaignRecord.coreOnly`) + the investigators who achieved them — so it recomputes. */
/*  52→53: The Drowned City `tdc` blob rebuilt for per-scenario passports — the flat fork objects give
 *  way to a `scenarios` note-tally map; artifacts gained `kept` (carried into the finale), tasks gained
 *  `picked`/`obligations` + the per-investigator `assignments` (Extra one_last_job.task_assignment), and
 *  the doom gained `flooded` neighborhoods — so the blob recomputes. */
/*  53→54: The Feast of Hemlock Vale `fhv` blob rebuilt for the full widget suite — villager tallies
 *  gained the danced/stood/sacrificed arc; new `dance`, `hemlockHouse` (Argument + Little Sylvie),
 *  `longestNight` (captives + Rachel stance + captives-damage Extras), `finalEvening`, and `bertie`
 *  blobs; and `scenarios` re-keyed by full `section.id` — so the blob recomputes. */
/*  54→55: TCU Union and Disillusion — the missing-persons Union survival totals (alive/dead) are
 *  summed into a `union.survivors` field at precompute instead of hot in the widget — recompute. */
export const COMPILED_PROFILE_VERSION = 55;

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
