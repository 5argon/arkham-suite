import type { BuildQlToken } from './buildql';

/**
 * Splits a query into lines of a few clauses each, breaking after the `&` and `|` that join its
 * outermost clauses. The tokens stay in order and the space after each break is dropped, so the
 * lines read back as the same query.
 */
export function buildQlLines(tokens: BuildQlToken[], clausesPerLine = 2): BuildQlToken[][] {
	let depth = 0;
	const joinerDepths: number[] = [];
	for (const token of tokens) {
		if (token.text === '(') depth++;
		else if (token.text === ')') depth--;
		else if (token.kind === 'operator' && (token.text === '&' || token.text === '|')) {
			joinerDepths.push(depth);
		}
	}
	if (joinerDepths.length === 0) return [tokens];
	const outermost = Math.min(...joinerDepths);

	const lines: BuildQlToken[][] = [[]];
	let clauses = 1;
	let skipSpace = false;
	depth = 0;
	for (const token of tokens) {
		if (skipSpace && token.kind === 'space') {
			skipSpace = false;
			continue;
		}
		skipSpace = false;
		lines.at(-1)!.push(token);
		if (token.text === '(') depth++;
		else if (token.text === ')') depth--;
		else if (
			token.kind === 'operator' &&
			(token.text === '&' || token.text === '|') &&
			depth === outermost
		) {
			if (clauses % clausesPerLine === 0) {
				lines.push([]);
				skipSpace = true;
			}
			clauses++;
		}
	}
	return lines;
}
