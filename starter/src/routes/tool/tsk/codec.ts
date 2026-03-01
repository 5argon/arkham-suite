import { deflate, inflate } from 'pako';
import type { PlanStep } from '@5argon/arkham-tsk-solver';

/**
 * Compact, URL-safe encoding of a handcrafted plan.
 * The simulator is deterministic, so encoding the plan (the player's step list + asserted board
 * outcomes) and re-simulating on load reproduces the exact same trajectory. We DEFLATE the JSON
 * (pako) and base64url it, which keeps even long plans inside a shareable URL.
 */

export interface PlanShareState {
	plan: PlanStep[];
	/** Board outcomes the plan can't derive but the player asserts (e.g. `desiReal`, `finaleAttempt:join`). */
	assertions?: string[];
	/** A title the author gives the route, shown to anyone who opens the share link. */
	name?: string;
	/** A longer description of the route's purpose, shown alongside the name. */
	description?: string;
}

function bytesToBase64Url(bytes: Uint8Array): string {
	let binary = '';
	for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
	const b64 = typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(bytes).toString('base64');
	return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(s: string): Uint8Array {
	const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
	const binary = typeof atob !== 'undefined' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

export function encodeState(state: PlanShareState): string {
	const json = JSON.stringify(state);
	return bytesToBase64Url(deflate(json));
}

export function decodeState(encoded: string): PlanShareState | null {
	try {
		const json = inflate(base64UrlToBytes(encoded), { to: 'string' });
		const parsed = JSON.parse(json);
		if (!parsed || !Array.isArray(parsed.plan)) return null;
		return {
			plan: parsed.plan,
			assertions: Array.isArray(parsed.assertions) ? parsed.assertions : [],
			name: typeof parsed.name === 'string' ? parsed.name : undefined,
			description: typeof parsed.description === 'string' ? parsed.description : undefined,
		};
	} catch {
		return null;
	}
}
