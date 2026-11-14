import { parseTiming, timingDirectiveProblems } from '@5argon/arkham-life-ui/markdown';
import { describe, expect, it } from 'vitest';

import { allStarterDecks } from '$lib/starter-content';

import { allPrebuiltTeams } from './prebuilt-teams';
import { expandRuleDirectives, ruleDirectiveProblems } from './rules';

describe('rule directives', () => {
	it('quotes a whole entry, titled with a link to it', () => {
		const quote = expandRuleDirectives('{{rule 1.098}}');
		expect(quote).toContain(
			'<div class="rule-title"><a href="https://arkham.build/rules#grimoire-entry-1.098"'
		);
		expect(quote).toContain('>Move</a></div>');
		expect(quote.split('\n').every((line) => line.startsWith('>'))).toBe(true);
	});

	it('quotes only the lines saying a phrase', () => {
		const quote = expandRuleDirectives('{{rule 1.098 "enter the new location"}}');
		expect(quote).toContain('> - Any time an entity moves');
		expect(quote).not.toContain('connecting location');
	});

	it('quotes a numbered item with what is nested under it, nested deep enough for markdown', () => {
		const quote = expandRuleDirectives('{{rule 3.140 4}}');
		expect(quote).toContain('> 4. If the card is an enemy');
		expect(quote).toContain('>    - If the card is a treachery');
		expect(quote).not.toContain('5. ');
	});

	it('takes \\" as a double quote inside a phrase', () => {
		const directive = String.raw`{{rule 1.083 "uses the word \"would\" changes"}}`;
		expect(ruleDirectiveProblems(directive)).toEqual([]);
		expect(expandRuleDirectives(directive)).toContain('> - If a replacement effect');
	});

	it('links a card the Grimoire writes as /cards/ like any other card', () => {
		const quote = expandRuleDirectives('{{rule 1.097 "For example: Danny tests"}}');
		expect(quote).toContain('[Timely Intervention](/card/12081)');
		expect(quote).not.toContain('/cards/');
	});

	it('turns the Grimoire icons into icon spans', () => {
		expect(expandRuleDirectives('{{rule 4.004 "elder_sign] symbol"}}')).toContain(
			'<span class="icon-elder_sign"></span>'
		);
	});

	it('leaves a mistake as it is and says what is wrong', () => {
		expect(expandRuleDirectives('{{rule 1.098 "nowhere"}}')).toBe('{{rule 1.098 "nowhere"}}');
		expect(
			ruleDirectiveProblems('{{rule 9.999}}\n{{rule 1.098 "nowhere"}}\n{{rule 3.140 9}}')
		).toEqual([
			'{{rule 9.999}}: 9.999 is not in the Grimoire',
			'{{rule 1.098 "nowhere"}}: 1.098 doesn\'t say "nowhere"',
			'{{rule 3.140 9}}: 3.140 has no numbered item 9'
		]);
	});
});

describe('timing directives', () => {
	it('knows the diagram from the step', () => {
		expect(parseTiming('3.320')).toEqual({ diagram: 'enemy', highlighted: [1] });
		expect(parseTiming('4.003')).toEqual({ diagram: 'skill-test', highlighted: [4] });
	});

	it('highlights a player window by the step on either side of it', () => {
		expect(parseTiming('after 3.320')).toEqual({ diagram: 'enemy', highlighted: [2] });
		expect(parseTiming('before 3.330')).toEqual({ diagram: 'enemy', highlighted: [2] });
		expect(parseTiming('3.320 after 3.320')).toEqual({ diagram: 'enemy', highlighted: [1, 2] });
	});

	it('shows a whole phase with nothing highlighted', () => {
		expect(parseTiming('3.300')).toEqual({ diagram: 'enemy', highlighted: [] });
	});

	it('says what is wrong', () => {
		expect(timingDirectiveProblems('{{timing after 3.310}}\n{{timing 3.320 3.110}}')).toEqual([
			'{{timing after 3.310}}: there is no player window after 3.310',
			'{{timing 3.320 3.110}}: 3.110 is not in the same diagram as the rest'
		]);
	});
});

describe('directives in guides', () => {
	const problemsIn = (markdown: string | undefined) => [
		...ruleDirectiveProblems(markdown ?? ''),
		...timingDirectiveProblems(markdown ?? '')
	];

	it('all make sense in starter deck guides', () => {
		for (const entry of allStarterDecks()) {
			expect(problemsIn(entry.primary.description_md), entry.slug).toEqual([]);
			expect(problemsIn(entry.introMd), entry.slug).toEqual([]);
		}
	});

	it('all make sense in team guides', () => {
		for (const team of allPrebuiltTeams()) expect(problemsIn(team.guideMd), team.slug).toEqual([]);
	});
});
