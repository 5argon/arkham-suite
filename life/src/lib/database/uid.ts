/**
 * uid.ts — stable player identifiers for the local build.
 *
 * A UID is the cross-file join key: it lets the same person be recognized when a
 * campaign file moves between two people's databases (see `campaign-share.ts`). The
 * format (`XXX-XXX-XXX`, confusable-free alphabet) is short enough to read aloud /
 * type when adding a guest.
 */
import type { DatabaseDocument } from './document';

/** Alphanumeric chars excluding the confusable O, 0, I, 1. */
const UID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Matches a normalized UID, e.g. `ABC-2DE-FGH`. */
export const UID_PATTERN = /^[A-Z2-9]{3}-[A-Z2-9]{3}-[A-Z2-9]{3}$/;

function randomUidChar(): string {
	return UID_CHARS[Math.floor(Math.random() * UID_CHARS.length)];
}

/** Generate a candidate UID in `XXX-XXX-XXX` format. */
export function generateUid(): string {
	const seg = () => Array.from({ length: 3 }, randomUidChar).join('');
	return `${seg()}-${seg()}-${seg()}`;
}

/** Every uid already claimed in this database: owner, sub-players, and play groups. */
export function collectUids(doc: DatabaseDocument): Set<string> {
	return new Set<string>([
		doc.owner.uid,
		...doc.players.map((p) => p.uid),
		...(doc.playGroups ?? []).map((g) => g.uid),
	]);
}

/**
 * Generate a UID not already used by anyone in this database (roster members AND
 * play groups share one uid namespace). Collisions are astronomically unlikely
 * (32^9 ≈ 3.5e13), but the guard is cheap.
 */
export function generateUniqueUid(doc: DatabaseDocument): string {
	const taken = collectUids(doc);
	for (let i = 0; i < 50; i++) {
		const uid = generateUid();
		if (!taken.has(uid)) return uid;
	}
	// Practically unreachable; fall back to a definitely-unique value.
	return generateUid();
}

/**
 * Normalize user-typed input (uppercase, trim) and validate the format. Returns
 * the canonical UID, or `null` if it doesn't match `XXX-XXX-XXX`. Used when an
 * owner types a guest's UID read out to them.
 */
export function normalizeUid(raw: string): string | null {
	const cleaned = raw.trim().toUpperCase();
	return UID_PATTERN.test(cleaned) ? cleaned : null;
}
