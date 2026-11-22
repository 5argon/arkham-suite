/** A standalone page's strings by key, for labels named after rule ids (`standalone_<prefix>_ending_<id>`). */
import * as m from '$lib/paraglide/messages.js';

const table = m as unknown as Record<
	string,
	((inputs?: Record<string, unknown>) => string) | undefined
>;

export function standaloneText(key: string, inputs?: Record<string, unknown>): string {
	return table[key]?.(inputs) ?? key;
}

export function hasStandaloneText(key: string): boolean {
	return typeof table[key] === 'function';
}
