import { deflate, inflate } from 'pako';
import type { Constraint, SolvePreferences } from '@5argon/arkham-tsk-solver';

/**
 * Compact, URL-safe encoding of the solver *input* (constraints + preferences).
 * Because `solve()` is deterministic, encoding the input — not the bulky recipe — and
 * re-solving on load reproduces the exact same recipes. We DEFLATE the JSON (pako) and
 * base64url it, which keeps even large constraint sets inside a shareable URL.
 * (Protobuf could shave a few more bytes, but the input is small and JSON keeps it legible.)
 */

export interface SolverShareState {
	constraints: Constraint[];
	preferences?: SolvePreferences;
	/** Selected recipe index (deterministic), present only in `?r=` (single-recipe) links. */
	index?: number;
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

export function encodeState(state: SolverShareState): string {
	const json = JSON.stringify(state);
	return bytesToBase64Url(deflate(json));
}

export function decodeState(encoded: string): SolverShareState | null {
	try {
		const json = inflate(base64UrlToBytes(encoded), { to: 'string' });
		const parsed = JSON.parse(json);
		if (!parsed || !Array.isArray(parsed.constraints)) return null;
		return parsed as SolverShareState;
	} catch {
		return null;
	}
}
