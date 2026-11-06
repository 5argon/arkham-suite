import { describe, expect, it } from 'vitest';

import { tokenizeBuildQl } from './buildql';
import { buildQlLines } from './buildql-lines';

const text = (lines: ReturnType<typeof buildQlLines>) =>
	lines.map((line) => line.map((t) => t.text).join(''));

describe('BuildQL lines', () => {
	it('puts two outermost clauses on a line, breaking after the joiner', () => {
		const query = '(text = "a" | text = "b" | text = "c" | text = "d" | text = "e")';
		expect(text(buildQlLines(tokenizeBuildQl(query)))).toEqual([
			'(text = "a" | text = "b" |',
			'text = "c" | text = "d" |',
			'text = "e")'
		]);
	});

	it("doesn't break inside a nested group", () => {
		const query = '(tr = "a" & (tr = "b" | tr = "c") & tr = "d")';
		expect(text(buildQlLines(tokenizeBuildQl(query)))).toEqual([
			'(tr = "a" & (tr = "b" | tr = "c") &',
			'tr = "d")'
		]);
	});

	it('keeps a short query on one line', () => {
		expect(text(buildQlLines(tokenizeBuildQl('(tr = "weapon" & tr != "tool")')))).toEqual([
			'(tr = "weapon" & tr != "tool")'
		]);
	});
});
