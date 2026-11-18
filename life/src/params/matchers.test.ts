import { describe, expect, it } from 'vitest';
import { match as profileScope } from './profileScope';
import { match as playerClass } from './playerClass';
import { match as cardSection } from './cardSection';
import { match as campaignSlug } from './campaignSlug';

// The route matchers are the server-side URL validity gates for the profile tree.
describe('profile route matchers', () => {
	it('profileScope matches only the reserved scope words', () => {
		expect(profileScope('private')).toBe(true);
		expect(profileScope('loaded')).toBe(true);
		expect(profileScope('my-vanity')).toBe(false); // left for [handle] to consume
	});

	it('playerClass matches CardClass slugs only', () => {
		expect(playerClass('guardian')).toBe(true);
		expect(playerClass('seeker')).toBe(true);
		expect(playerClass('neutral')).toBe(true);
		expect(playerClass('bogus')).toBe(false);
		expect(playerClass('asset')).toBe(false); // a card type, not a class
	});

	it('cardSection matches a card-type sub-page OR a class', () => {
		// sub-page slugs from the CARD_SUBPAGES registry
		for (const s of ['core', 'asset', 'event', 'skill', 'keywords', 'levels']) {
			expect(cardSection(s)).toBe(true);
		}
		// classes also live under cards/
		expect(cardSection('guardian')).toBe(true);
		// anything else 404s
		expect(cardSection('bogus')).toBe(false);
		expect(cardSection('customize')).toBe(false); // reserved literal child, not a section
	});

	it('campaignSlug matches known campaign slugs only', () => {
		expect(campaignSlug('tsk')).toBe(true);
		expect(campaignSlug('eote')).toBe(true);
		expect(campaignSlug('notacampaign')).toBe(false);
	});
});
