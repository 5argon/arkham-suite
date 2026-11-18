import { describe, expect, it } from 'vitest';
import { PROFILE_SCOPES, isProfileScope, isReservedHandle } from './profile-scope';

describe('profile-scope reservation', () => {
	it('recognizes the two reserved scope words', () => {
		expect(PROFILE_SCOPES).toEqual(['private', 'loaded']);
		expect(isProfileScope('private')).toBe(true);
		expect(isProfileScope('loaded')).toBe(true);
		expect(isProfileScope('my-name')).toBe(false);
		expect(isProfileScope('Private')).toBe(false); // case-sensitive
	});

	it('forbids the scope words as vanity handles (and allows real names)', () => {
		// The reason a vanity can never be named `private` / `loaded`.
		expect(isReservedHandle('private')).toBe(true);
		expect(isReservedHandle('loaded')).toBe(true);
		expect(isReservedHandle('5argon')).toBe(false);
		expect(isReservedHandle('the-keeper')).toBe(false);
	});
});
