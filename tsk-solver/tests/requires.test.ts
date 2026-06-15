import { describe, expect, it } from 'vitest';
import { requiresSatisfied } from '../src/graph/model.js';
import type { CampaignState } from '../src/types.js';

// Minimal state stub — requiresSatisfied only reads flags / markers / assets / timePassed.
const state = (over: Partial<CampaignState> = {}): CampaignState =>
	({ timePassed: 0, flags: new Set(), markers: new Map(), assets: new Set(), ...over }) as CampaignState;
const withFlags = (...f: string[]) => state({ flags: new Set(f) });

describe('requiresSatisfied — audited condition gates', () => {
	it('enforces shorthand log tokens via their full flag id', () => {
		// "appreciated_the_architecture" records as "the_cell_appreciated_the_architecture".
		expect(requiresSatisfied('appreciated_the_architecture', state())).toBe(false);
		expect(requiresSatisfied('appreciated_the_architecture', withFlags('the_cell_appreciated_the_architecture'))).toBe(true);
		// The Safehouse passphrase shorthand.
		expect(requiresSatisfied('know_passphrase', withFlags('you_know_the_passphrase'))).toBe(true);
	});

	it('handles negated shorthand (quinn_trusts = NOT "does not trust")', () => {
		expect(requiresSatisfied('quinn_trusts', state())).toBe(true);
		expect(requiresSatisfied('quinn_trusts', withFlags('agent_quinn_does_not_trust_the_cell'))).toBe(false);
	});

	it('counts coalition flags (at_least / at_most N of [...])', () => {
		const im = 'at_least_3_of_[la_chica_roja_is_on_your_side,the_cell_aided_the_knight,aliki_is_on_your_side,desi_is_in_your_debt,the_cell_made_a_deal_with_thorne,ece_trusts_the_cell]';
		expect(requiresSatisfied(im, withFlags('aliki_is_on_your_side', 'desi_is_in_your_debt'))).toBe(false);
		expect(requiresSatisfied(im, withFlags('aliki_is_on_your_side', 'desi_is_in_your_debt', 'ece_trusts_the_cell'))).toBe(true);
		const gw = 'at_most_1_of_[ece_does_not_trust_the_cell,havent_seen_the_last_of_desi,havent_seen_the_last_of_thorne]';
		expect(requiresSatisfied(gw, state())).toBe(true);
		expect(requiresSatisfied(gw, withFlags('havent_seen_the_last_of_desi', 'havent_seen_the_last_of_thorne'))).toBe(false);
	});

	it('gates on a written-marker clock (at_or_after_MARKER)', () => {
		expect(requiresSatisfied('at_or_after_theta', state())).toBe(false); // theta not written yet
		expect(requiresSatisfied('at_or_after_theta', state({ timePassed: 12, markers: new Map([['theta', 10]]) }))).toBe(true);
		expect(requiresSatisfied('at_or_after_theta', state({ timePassed: 8, markers: new Map([['theta', 10]]) }))).toBe(false);
	});
});
