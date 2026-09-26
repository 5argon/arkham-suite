/**
 * Roster-gated moments (an investigator, trait or class unlocks a bonus paragraph or setup role).
 * The roster lives in the cards segment, so the logs segment emits a roster-free partial that
 * {@link resolveSpecialInteractions} joins at assembly.
 */
import {
	evaluateInference,
	evaluateSpecialInteractionMatch,
	type CampaignLog,
	type SpecialInteractionDef,
	type RosterInvestigator
} from '@5argon/arkham-campaign-data';
import type { CardCode } from '@5argon/arkham-kohaku';
import type { CampaignRecord } from '../records/campaign-record';
import { recordsByFamily } from '../records/campaign-family';

/** State only: the text and gating condition re-derive from `(family, id)` via campaign-data. */
export interface SpecialInteractionState {
	id: string;
	triggered: boolean;
	/** Investigators that satisfied a roster gate, most recent first, capped; empty for
	 *  log-proven moments. */
	triggeredBy: CardCode[];
}

export interface CampaignSpecialInteractions {
	family: string;
	interactions: SpecialInteractionState[];
}

interface PartialInteraction {
	def: SpecialInteractionDef;
	/** Null when the def has no `infer` rule. */
	inferTriggered: boolean | null;
	/** Plays that reached the gating scenario, most recent first. */
	rosterPlays: { campaignId: string; finishDate: number | null }[];
}

/** Investigators credited on a triggered interaction. */
const VIA_CAP = 5;

export interface SpecialInteractionsPartial {
	family: string;
	interactions: PartialInteraction[];
}

/** Every scenario up to the furthest one the play recorded, since earlier scenarios can't be
 *  skipped (a prologue that logs nothing still counts). */
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

/** A moment that records a log entry is proven by its `infer` rule; any other waits for the roster
 *  join. `optional` moments (choice-gated and never recorded, e.g. Dream-Eaters dreams) are skipped. */
export function buildSpecialInteractions(
	records: CampaignRecord[],
	mergeReturnTo = true
): SpecialInteractionsPartial[] {
	const out: SpecialInteractionsPartial[] = [];
	for (const [family, { log, recs }] of recordsByFamily(records, mergeReturnTo)) {
		const defs = log.db.specialInteractions;
		if (!defs?.length) continue;
		const enSi = log.en.specialInteractions ?? {};
		const reachedByPlay = recs.map((rec) => ({ rec, reached: reachedScenarios(rec, log) }));

		const interactions: PartialInteraction[] = [];
		for (const def of defs) {
			// A moment without curated text would render blank.
			if (def.optional || !enSi[def.id]?.text) continue;
			let inferTriggered: boolean | null = null;
			if (def.infer) {
				inferTriggered = reachedByPlay.some(
					(p) => evaluateInference(def.infer!, p.rec.recorded) === true
				);
			}
			const rosterPlays = def.infer
				? []
				: reachedByPlay
						.filter((p) => p.reached.has(def.scenario) && p.rec.campaignId)
						.map((p) => ({ campaignId: p.rec.campaignId!, finishDate: p.rec.finishDate ?? null }))
						.sort((a, b) => (b.finishDate ?? -Infinity) - (a.finishDate ?? -Infinity));
			interactions.push({ def, inferTriggered, rosterPlays });
		}
		if (interactions.length) out.push({ family, interactions });
	}
	return out;
}

/** The class and traits of an investigator code. */
export type CardLookup = (code: string) => { factions: string[]; traits: string[] } | undefined;

/** Joins the partials with each play's roster: a roster-gated interaction triggers when any play
 *  that reached its scenario had an eligible investigator. */
export function resolveSpecialInteractions(
	partials: SpecialInteractionsPartial[] | undefined,
	investigatorsByCampaign: Record<string, CardCode[]>,
	cardLookup: CardLookup
): CampaignSpecialInteractions[] {
	if (!partials) return []; // logs segments cached before this field existed
	const roster = (campaignId: string): RosterInvestigator[] =>
		(investigatorsByCampaign[campaignId] ?? []).map((code) => {
			const c = cardLookup(code);
			return { code, factions: c?.factions ?? [], traits: c?.traits ?? [] };
		});

	return partials.map((p) => ({
		family: p.family,
		interactions: p.interactions.map((it): SpecialInteractionState => {
			let triggered: boolean;
			const via: CardCode[] = [];
			if (it.def.infer) {
				triggered = it.inferTriggered === true;
			} else {
				triggered = false;
				const seen = new Set<string>();
				for (const rp of it.rosterPlays ?? []) {
					const { matched, investigators } = evaluateSpecialInteractionMatch(
						it.def,
						roster(rp.campaignId)
					);
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
		})
	}));
}
