/**
 * Localized-string resolution (README §8).
 *
 * The package emits opaque `LocalizedString` descriptors (`{ id, params }`). This is the only
 * module that depends on the Paraglide-generated message functions; it resolves a descriptor for a
 * requested locale. The web app calls this — the package owns all copy.
 */

import * as messages from '../paraglide/messages.js';
import type { Locale, LocalizedString } from '../types.js';

type MessageFn = (inputs?: Record<string, unknown>, options?: { locale?: Locale }) => string;
const messageTable = messages as unknown as Record<string, MessageFn>;

/** Resolve a `LocalizedString` to a concrete string for `locale` (default `en`). */
export function resolveLocalized(ls: LocalizedString, locale: Locale = 'en'): string {
	const fn = messageTable[ls.id];
	if (typeof fn !== 'function') return ls.id;
	return String(fn(ls.params, { locale }));
}
