/** Projections of the database document shared by the archive pages. */
import {
	resolveParticipant,
	sortDecksByParticipants,
	sortParticipants,
	type CampaignRecord,
	type DatabaseDocument,
	type DeckRecord
} from './document';

export interface ResolvedPlayer {
	uid: string;
	name: string;
	iconCardCode: string;
	/** Not in this file's roster: a frozen label. */
	isGuest: boolean;
}

export interface ResolvedDeck extends DeckRecord {
	owner: ResolvedPlayer | null;
}

/** A record's participants resolved against the roster (you, then roster order, then guests) and
 *  its decks grouped by owner in that order. */
export function resolvedParticipants(
	doc: DatabaseDocument,
	record: CampaignRecord
): { players: ResolvedPlayer[]; decks: ResolvedDeck[] } {
	const sorted = sortParticipants(doc, record.participants);
	const players = sorted.map((p) => resolveParticipant(doc, p));
	const byUid = new Map(players.map((p) => [p.uid, p]));
	const decks = sortDecksByParticipants(sorted, record.decks).map((d) => ({
		...d,
		owner: (d.ownerUid && byUid.get(d.ownerUid)) || null
	}));
	return { players, decks };
}

/** Keep the items having any selected value; an empty selection keeps everything. */
export function filterIn<T, V>(
	items: T[],
	selected: readonly V[] | undefined,
	valuesOf: (item: T) => V | readonly V[] | null
): T[] {
	if (!selected?.length) return items;
	const set = new Set(selected);
	return items.filter((item) => {
		const v = valuesOf(item);
		if (v == null) return false;
		return Array.isArray(v) ? v.some((x) => set.has(x)) : set.has(v as V);
	});
}

/** One 1-based page of `items`. */
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
	const start = (page - 1) * pageSize;
	return items.slice(start, start + pageSize);
}
