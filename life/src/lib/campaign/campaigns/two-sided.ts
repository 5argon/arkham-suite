/**
 * The two-sided campaign spines (PtC Doubt/Conviction, TCU Lodge/Coven): each play is a chain of
 * decisions that lean one of two ways.
 */
import type { EndingKind } from '../outcomes/clear-status';
import type { Play } from '../records/play';
import { signatureRuns, type SignatureRuns } from '../utils/signature-runs';
import { bumpTally, emptyTally, type Tally } from '../utils/tally';

/** One decision a play leaned on. */
export interface SideBead<S extends string = string> {
	scenario: string;
	side: S;
	amount: number;
}

/** One play's chain of decisions with its campaign ending. */
export interface SideRun<S extends string = string, B extends SideBead<S> = SideBead<S>> {
	beads: B[];
	totals: Record<S, number>;
	/** The ending's log key; null when the play did not finish. */
	outcomeKey: string | null;
	outcome: EndingKind | null;
}

/** One decision point across plays. */
export interface SourceTally<S extends string = string> {
	scenario: string;
	sides: Record<S, Tally>;
	/** Plays that passed the decision without leaning; null when it always takes a side. */
	neutral: Tally | null;
}

/** Plays that reached the decision point either way. */
export function sourcePlays(s: SourceTally): number {
	return Object.values(s.sides).reduce((n, t) => n + t.total, s.neutral?.total ?? 0);
}

export function sideTotals<S extends string>(
	sides: readonly S[],
	beads: readonly SideBead<S>[]
): Record<S, number> {
	const totals = Object.fromEntries(sides.map((s) => [s, 0])) as Record<S, number>;
	for (const b of beads) totals[b.side] += b.amount;
	return totals;
}

/** Per decision point, in `sources` order. `passed` lists the decisions that can go neutral, each
 *  with whether a play got past it. */
export function tallySources<S extends string>(
	sides: readonly S[],
	sources: readonly string[],
	runs: readonly { play: Play; beads: readonly SideBead<S>[] }[],
	passed: Partial<Record<string, (p: Play) => boolean>>
): SourceTally<S>[] {
	return sources.map((scenario) => {
		const passedIt = passed[scenario];
		const t: SourceTally<S> = {
			scenario,
			sides: Object.fromEntries(sides.map((s) => [s, emptyTally()])) as Record<S, Tally>,
			neutral: passedIt ? emptyTally() : null
		};
		for (const { play, beads } of runs) {
			const bead = beads.find((b) => b.scenario === scenario);
			if (bead) bumpTally(t.sides[bead.side], play.tier);
			else if (t.neutral && passedIt?.(play)) bumpTally(t.neutral, play.tier);
		}
		return t;
	});
}

/** The runs that leaned furthest to each side and the least committed one. */
export function signatureSideRuns<S extends string, R extends SideRun<S>>(
	runs: readonly R[],
	[a, b]: readonly [S, S]
): SignatureRuns<R> {
	return signatureRuns(
		runs,
		(r) => r.totals[a],
		(r) => r.totals[b]
	);
}
