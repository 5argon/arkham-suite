/**
 * signature-runs.ts — the three "signature" plays of a two-sided campaign spine (PtC Doubt vs
 * Conviction, TCU Lodge vs Coven): the run that leaned furthest to each side and the least
 * committed one. A run can hold more than one title.
 */
export interface SignatureRuns<T> {
	mostA: T | null;
	mostB: T | null;
	leastCombined: T | null;
}

export function signatureRuns<T>(
	runs: readonly T[],
	a: (run: T) => number,
	b: (run: T) => number
): SignatureRuns<T> {
	const pick = (better: (x: T, y: T) => T): T | null => (runs.length ? runs.reduce(better) : null);
	return {
		mostA: pick((x, y) => (a(y) > a(x) ? y : x)),
		mostB: pick((x, y) => (b(y) > b(x) ? y : x)),
		leastCombined: pick((x, y) => (a(y) + b(y) < a(x) + b(x) ? y : x))
	};
}

export interface SignatureRow<T> {
	topic: string;
	run: T;
}

/** Table rows for the titles that have a run, in the order given. */
export function signatureRows<T>(topics: [string, T | null][]): SignatureRow<T>[] {
	return topics.flatMap(([topic, run]) => (run ? [{ topic, run }] : []));
}
