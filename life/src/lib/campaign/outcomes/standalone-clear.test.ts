import { describe, expect, it } from 'vitest';
import { standaloneVerdict } from './standalone-clear';

describe('standaloneVerdict', () => {
	it('wins on a numbered resolution and loses without one, by default', () => {
		expect(standaloneVerdict('R1')).toBe('won');
		expect(standaloneVerdict('no_resolution')).toBe('lost');
		expect(standaloneVerdict(null)).toBeNull();
	});

	it('follows curated outcomes, a neutral one being neither', () => {
		const outcomes = { R1: 'loss', R4: 'neutral', no_resolution: 'win' } as const;
		expect(standaloneVerdict('R1', outcomes)).toBe('lost');
		expect(standaloneVerdict('R4', outcomes)).toBeNull();
		expect(standaloneVerdict('no_resolution', outcomes)).toBe('won');
		expect(standaloneVerdict('R2', outcomes)).toBe('won');
	});
});
