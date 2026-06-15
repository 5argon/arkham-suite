import { deflate, inflate } from 'pako';
import type { Constraint, PlanStep } from '@5argon/arkham-tsk-solver';

/**
 * Compact, URL-safe encoding of a handcrafted plan + its goals.
 * The simulator is deterministic, so encoding the plan (the player's step list) and re-simulating on
 * load reproduces the exact same trajectory and goals checklist. We DEFLATE the JSON (pako) and
 * base64url it, which keeps even long plans inside a shareable URL.
 */

export interface PlanShareState {
	plan: PlanStep[];
	constraints: Constraint[];
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
		return { plan: parsed.plan, constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [] };
	} catch {
		return null;
	}
}
