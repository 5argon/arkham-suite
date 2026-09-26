/** Player and play-group identifiers: `XXX-XXX-XXX`, short enough to read aloud. */
import type { DatabaseDocument } from './document';

/** Alphanumerics without the confusable O, 0, I, 1. */
const UID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const UID_PATTERN = /^[A-Z2-9]{3}-[A-Z2-9]{3}-[A-Z2-9]{3}$/;

function randomChar(): string {
	return UID_CHARS[Math.floor(Math.random() * UID_CHARS.length)];
}

export function generateUid(): string {
	const seg = () => randomChar() + randomChar() + randomChar();
	return `${seg()}-${seg()}-${seg()}`;
}

/** Every uid claimed in this database; roster members and play groups share one namespace. */
export function collectUids(doc: DatabaseDocument): Set<string> {
	return new Set([
		doc.owner.uid,
		...doc.players.map((p) => p.uid),
		...doc.playGroups.map((g) => g.uid)
	]);
}

export function generateUniqueUid(doc: DatabaseDocument): string {
	const taken = collectUids(doc);
	let uid = generateUid();
	while (taken.has(uid)) uid = generateUid();
	return uid;
}

/** Uppercase + trim typed input; `null` when it is not a valid uid. */
export function normalizeUid(raw: string): string | null {
	const cleaned = raw.trim().toUpperCase();
	return UID_PATTERN.test(cleaned) ? cleaned : null;
}
