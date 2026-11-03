import type { AhdbDeck, CardCode } from '@5argon/arkham-kohaku';

/**
 * How a pre-built team's deck differs from the hosted deck it comes from.
 * `remove` and `add` together replace copies, either alone only takes away or
 * only adds. Applies to the main deck unless `side`.
 */
export interface DeckChange {
	remove?: CardCode;
	add?: CardCode;
	copies: number;
	side?: boolean;
}

/**
 * The source deck's cards after the changes. Throws when the source no longer
 * has what a change removes, so a source update can't quietly change a team's
 * meaning.
 */
export function applyDeckChanges(
	source: Pick<AhdbDeck, 'slots' | 'sideSlots'>,
	changes: readonly DeckChange[],
	owner: string
): { slots: Record<string, number>; sideSlots: Record<string, number> } {
	const slots = { ...source.slots };
	const sideSlots = { ...source.sideSlots };
	for (const change of changes) {
		const zone = change.side ? sideSlots : slots;
		if (change.remove !== undefined) {
			const left = (zone[change.remove] ?? 0) - change.copies;
			if (left < 0) {
				throw new Error(`Pre-built team removes ${change.remove} its source lacks: ${owner}`);
			}
			if (left === 0) delete zone[change.remove];
			else zone[change.remove] = left;
		}
		if (change.add !== undefined) zone[change.add] = (zone[change.add] ?? 0) + change.copies;
	}
	return { slots, sideSlots };
}
