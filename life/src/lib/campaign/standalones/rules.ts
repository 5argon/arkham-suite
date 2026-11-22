/**
 * The parts most standalone pages share, declared per scenario: how each play ended, and the cards a
 * play can earn. A page's builder tallies them with the rest of its numbers.
 */
import type { EndingKind } from '../outcomes/clear-status';
import type { Play } from '../records/play';
import { bumpTally, emptyTally, type Tally } from '../utils/tally';

export interface EndingRule {
	id: string;
	kind: EndingKind;
	/** The resolutions that are this ending; the first is the chip shown beside it. */
	resolutions: string[];
	/** Campaign Notes that mean this ending, for a play logged without its resolution. */
	notes?: string[];
	/** Anything else that means this ending, e.g. an Extra answer read after no resolution. */
	when?: (p: Play) => boolean;
	/** Card art beside it. */
	code?: string;
}

export interface EarnedCardRule {
	code: string;
	earned: (p: Play) => boolean;
	/** The card this one comes from, named in its hover (a mission, a prop). */
	from?: string;
}

export interface StandaloneRules {
	/** The scenario id within its catalogue. */
	scenario: string;
	/** Prefix of the page's strings: `standalone_<prefix>_ending_<id>`. */
	prefix: string;
	endings?: EndingRule[];
	cards?: EarnedCardRule[];
}

/** Each ending's plays; a play counts toward the first ending it matches. */
export function tallyEndings(
	plays: readonly Play[],
	rules: StandaloneRules
): Record<string, Tally> {
	const out: Record<string, Tally> = {};
	for (const r of rules.endings ?? []) out[r.id] = emptyTally();
	for (const p of plays) {
		const resolution = p.resolution(rules.scenario);
		const hit = (rules.endings ?? []).find(
			(r) =>
				(resolution != null && r.resolutions.includes(resolution)) ||
				(r.notes ?? []).some((n) => p.has(n)) ||
				r.when?.(p)
		);
		if (hit) bumpTally(out[hit.id], p.tier);
	}
	return out;
}

/** Each earnable card's plays that earned it. */
export function tallyCards(plays: readonly Play[], rules: StandaloneRules): Record<string, Tally> {
	const out: Record<string, Tally> = {};
	for (const r of rules.cards ?? []) {
		const t = emptyTally();
		for (const p of plays) if (r.earned(p)) bumpTally(t, p.tier);
		out[r.code] = t;
	}
	return out;
}

/** The cards an Extra card picker recorded, from its comma-joined answer. */
export function pickedCards(p: Play, scenario: string, choiceId: string): string[] {
	return (p.choice(scenario, choiceId) ?? '').split(',').filter(Boolean);
}
