import { getContext, setContext } from 'svelte';
import type { ProfilePayload } from '$lib/profile/profile-types';

/** Shared by every page under a profile layout, which builds the payload once. */
export interface ProfileContext {
	readonly payload: ProfilePayload | null;
	/** URL prefix for links within this profile. */
	readonly base: string;
}

const KEY = Symbol('profile');

export const setProfileContext = (ctx: ProfileContext) => setContext(KEY, ctx);
export const getProfileContext = () => getContext<ProfileContext>(KEY);
