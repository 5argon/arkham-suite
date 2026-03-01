/**
 * special-interactions.ts — "Special Interactions": the roster-gated flavor
 * moments a campaign hides (a specific investigator, trait, or class triggers a
 * bonus paragraph / setup role). The catalogue + match logic ship in
 * `@5argon/arkham-campaign-data`; here we light up which ones a player has hit
 * across their plays of a campaign family.
 *
 * Detection is fully derived — no Extra input:
 *   • a moment that RECORDS a campaign-log entry carries an `infer` rule, so it is
 *     proven from the recorded log (roster-independent);
 *   • everything else fires when an eligible investigator was in the roster AND
 *     the gating scenario was reached.
 *
 * Choice-gated, unrecorded moments (`optional`, e.g. the Dream-Eaters' dreams)
 * can't be derived without interlude input the archive doesn't collect, so they
 * are SKIPPED here (they still exist in the campaign-data package for completeness).
 *
 * Like the EotE/TSK builders this is one builder → one payload blob. But the
 * roster lives in the cards segment, so — exactly like per-investigator trauma —
 * the logs segment emits a roster-free PARTIAL ({@link SpecialInteractionsPartial})
 * and {@link resolveSpecialInteractions} joins the per-campaign roster at assembly.
 */
import {
	getCampaignLog,
	evaluateInference,
	evaluateSpecialInteractionMatch,
	type CampaignLog,
	type SpecialInteractionDef,
	type RosterInvestigator,
} from '@5argon/arkham-campaign-data';
import type { CardCode } from '@5argon/arkham-kohaku';
import type { CampaignRecord } from './achievement-aggregate';

/**
 * One special interaction's lifetime state for the subject — KEYS + USER STATE ONLY.
 * The display strings (the "why" text, scenario name) and the gating condition
 * (`match`/`scope`/`role`) are ALL re-derivable from `(family, id)` via the
 * campaign-data package, so they are NOT stored here — the widget resolves them at
 * render time (the same lean/localizable contract as the EotE/achievement blobs).
 * This keeps a compiled/shared profile small without a bespoke strip step.
 */
export interface SpecialInteractionState {
	id: string;
	/** Triggered in at least one of the subject's plays of this family. */
	triggered: boolean;
	/** Investigator codes that satisfied a roster-gated match (most-recent first, capped);
	 *  empty for log-proven moments. */
	triggeredBy: CardCode[];
}

/** A campaign family's special interactions (keys + state; family re-derives the name). */
export interface CampaignSpecialInteractions {
	/** Base family code (e.g. 'ptc'). */
	family: string;
	interactions: SpecialInteractionState[];
}

// ── Roster-free partial (logs segment) ───────────────────────────────────────

interface PartialInteraction {
	def: SpecialInteractionDef;
	/** OR of the def's `infer` rule across plays (null when the def has no `infer`). */
	inferTriggered: boolean | null;
	/** Plays that reached the gating scenario, MOST-RECENT FIRST (roster join at
	 *  assembly). Recency lets the "via" credit show the latest investigators. */
	rosterPlays: { campaignId: string; finishDate: number | null }[];
}

/** Max investigators shown as the "via" credit for a triggered interaction. */
const VIA_CAP = 5;

export interface SpecialInteractionsPartial {
	family: string;
	interactions: PartialInteraction[];
}

/** The family a record aggregates under (base code; Return-to folds into its base). */
function familyOf(rec: CampaignRecord): string | null {
	const log = getCampaignLog(rec.campaignCode);
	if (!log) return null;
	return log.db.originalId ?? log.db.code;
}

/**
 * Scenarios a play reached: every scenario with a recorded entry/resolution, plus
 * — since you can't skip earlier scenarios — all scenarios up to the furthest one
 * reached in campaign order (so a no-log prologue counts once the play got past it).
 */
function reachedScenarios(rec: CampaignRecord, log: CampaignLog): Set<string> {
	const order = (log.db.scenarioMeta ?? []).map((m) => m.id);
	const idx = new Map(order.map((id, i) => [id, i]));
	const reached = new Set<string>(rec.route ?? []);
	for (const s of Object.keys(rec.scenarioResolutions ?? {})) reached.add(s);
	let maxIdx = -1;
	for (const s of reached) {
		const i = idx.get(s);
		if (i !== undefined && i > maxIdx) maxIdx = i;
	}
	if (maxIdx < 0 && (rec.recorded.recordedLogs?.size ?? 0) > 0) maxIdx = 0; // played, only a prologue logged
	for (let i = 0; i <= maxIdx; i++) reached.add(order[i]);
	return reached;
}

/**
 * Build the roster-free partial, one entry per campaign family that has special
 * interactions. `optional` (choice-gated, unrecorded) interactions are skipped.
 */
export function buildSpecialInteractions(records: CampaignRecord[]): SpecialInteractionsPartial[] {
	// Group plays by family.
	const playsByFamily = new Map<string, CampaignRecord[]>();
	for (const rec of records) {
		const fam = familyOf(rec);
		if (!fam) continue;
		(playsByFamily.get(fam) ?? playsByFamily.set(fam, []).get(fam)!).push(rec);
	}

	const out: SpecialInteractionsPartial[] = [];
	for (const [family, plays] of playsByFamily) {
		const log = getCampaignLog(family);
		const defs = log?.db.specialInteractions;
		if (!log || !defs || !defs.length) continue;
		const enSi = log.en.specialInteractions ?? {};

		// Precompute each play's reached-scenario set once.
		const reachedByPlay = plays.map((rec) => ({ rec, reached: reachedScenarios(rec, log) }));

		const interactions: PartialInteraction[] = [];
		for (const def of defs) {
			if (def.optional) continue; // not derivable → the widget ignores these
			// Require a curated "why" so the widget never renders a blank moment; the
			// text itself is resolved from the package at render time, not stored here.
			if (!enSi[def.id]?.text) continue;
			let inferTriggered: boolean | null = null;
			if (def.infer) {
				inferTriggered = reachedByPlay.some((p) => evaluateInference(def.infer!, p.rec.recorded) === true);
			}
			const rosterPlays = def.infer
				? []
				: reachedByPlay
						.filter((p) => p.reached.has(def.scenario) && p.rec.campaignId)
						.map((p) => ({ campaignId: p.rec.campaignId!, finishDate: p.rec.finishDate ?? null }))
						// Most-recent first (no finish date sorts last) so the "via" credit favours recent runs.
						.sort((a, b) => (b.finishDate ?? -Infinity) - (a.finishDate ?? -Infinity));
			interactions.push({ def, inferTriggered, rosterPlays });
		}
		if (interactions.length) out.push({ family, interactions });
	}
	return out;
}

// ── Roster join (assembly) ───────────────────────────────────────────────────

/** Resolve one investigator code to the fields a match needs (class + traits). */
export type CardLookup = (code: string) => { factions: string[]; traits: string[] } | undefined;

/**
 * Finalize the partials with the per-campaign roster: a roster-gated interaction
 * triggers if any reaching play had an eligible investigator; a log-proven one
 * uses its precomputed `inferTriggered`.
 */
export function resolveSpecialInteractions(
	partials: SpecialInteractionsPartial[] | undefined,
	investigatorsByCampaign: Record<string, CardCode[]>,
	cardLookup: CardLookup,
): CampaignSpecialInteractions[] {
	if (!partials) return []; // pre-v24 cached/compiled logs segment lacks this field
	const roster = (campaignId: string): RosterInvestigator[] =>
		(investigatorsByCampaign[campaignId] ?? []).map((code) => {
			const c = cardLookup(code);
			return { code, factions: c?.factions ?? [], traits: c?.traits ?? [] };
		});

	return partials.map((p) => ({
		family: p.family,
		interactions: p.interactions.map((it): SpecialInteractionState => {
			let triggered: boolean;
			// "via" credit: the distinct investigators who satisfied the gate, most-recent
			// first, capped — so a long history shows the latest few, not a wall of codes.
			const via: CardCode[] = [];
			if (it.def.infer) {
				triggered = it.inferTriggered === true; // log-proven, roster-independent
			} else {
				triggered = false;
				const seen = new Set<string>();
				for (const rp of it.rosterPlays ?? []) {
					const { matched, investigators } = evaluateSpecialInteractionMatch(it.def, roster(rp.campaignId));
					if (!matched) continue;
					triggered = true;
					for (const code of investigators) {
						if (!seen.has(code)) {
							seen.add(code);
							via.push(code as CardCode);
						}
					}
					if (via.length >= VIA_CAP) break;
				}
			}
			return { id: it.def.id, triggered, triggeredBy: via.slice(0, VIA_CAP) };
		}),
	}));
}
