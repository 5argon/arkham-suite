/**
 * row-layout.ts — editor-side helpers for the row-based widget layout.
 *
 * The editor works on `EditorRow[]` — a `ProfileRow` plus a transient `_uid` used
 * ONLY as a stable `{#each}` key (so moving/deleting rows doesn't mis-associate
 * config inputs). Uids never persist: `toStoredRows` strips them (and drops
 * fully-empty rows) back to the `ProfileRow[]` the settings document stores.
 *
 * All mutations are PURE: they return a new array, leaving the input untouched,
 * so the owning component can drive `$state` by reassignment.
 */
import type { ProfileRow, SplitSide, WidgetSlot } from '$lib/campaign/profile-settings';

export type SlotSide = 'full' | SplitSide;

/** A row carrying a transient editor-only key. */
export type EditorRow = ProfileRow & { _uid: string };

let seq = 0;
const newUid = (): string => `row${seq++}`;

/** Attach transient uids to stored rows (on snapshot / reset). */
export function toEditorRows(rows: ProfileRow[]): EditorRow[] {
	return rows.map((r) => ({ ...r, _uid: newUid() }) as EditorRow);
}

/** Strip transient uids and drop fully-empty rows, for persistence. */
export function toStoredRows(rows: EditorRow[]): ProfileRow[] {
	const out: ProfileRow[] = [];
	for (const r of rows) {
		if (r.kind === 'full') {
			if (r.slot) out.push({ kind: 'full', slot: r.slot });
		} else if (r.left || r.right) {
			out.push({ kind: 'split', left: r.left, right: r.right });
		}
	}
	return out;
}

/**
 * Insert a fresh empty row of `kind` at a GAP index (0 = before the first row,
 * `rows.length` = after the last). Gaps are the slots between/around rows, so the
 * "+" buttons rendered at every gap map straight onto this.
 */
export function insertRowAt(rows: EditorRow[], gap: number, kind: 'full' | 'split'): EditorRow[] {
	const row: EditorRow =
		kind === 'full'
			? { _uid: newUid(), kind: 'full', slot: null }
			: { _uid: newUid(), kind: 'split', left: null, right: null };
	const clamped = Math.max(0, Math.min(gap, rows.length));
	const next = [...rows];
	next.splice(clamped, 0, row);
	return next;
}

/**
 * Move the row at index `from` to a GAP index (same gap convention as
 * {@link insertRowAt}). Moving to the gap just before or just after the row is a
 * no-op. Gap indices are in the ORIGINAL coordinate space (before removal), so a
 * destination past the moved row is shifted down by one after it's lifted out.
 */
export function moveRowTo(rows: EditorRow[], from: number, gap: number): EditorRow[] {
	if (from < 0 || from >= rows.length) return rows;
	if (gap === from || gap === from + 1) return rows; // dropped back where it was
	const next = [...rows];
	const [moved] = next.splice(from, 1);
	next.splice(gap > from ? gap - 1 : gap, 0, moved);
	return next;
}

export function deleteRow(rows: EditorRow[], i: number): EditorRow[] {
	return rows.filter((_, k) => k !== i);
}

/** Swap the two sides of a split row (no-op on a full row). */
export function swapSplit(rows: EditorRow[], i: number): EditorRow[] {
	return rows.map((r, k) =>
		k === i && r.kind === 'split' ? { ...r, left: r.right, right: r.left } : r
	);
}

/** Set (or clear, with `null`) a row's slot at the given side. */
export function setSlot(
	rows: EditorRow[],
	i: number,
	side: SlotSide,
	slot: WidgetSlot | null
): EditorRow[] {
	return rows.map((r, k) => {
		if (k !== i) return r;
		if (r.kind === 'full' && side === 'full') return { ...r, slot };
		if (r.kind === 'split' && (side === 'left' || side === 'right')) return { ...r, [side]: slot };
		return r;
	});
}

/** Merge a config patch into the slot at the given side (no-op if the slot is empty). */
export function patchConfig(
	rows: EditorRow[],
	i: number,
	side: SlotSide,
	patch: Record<string, unknown>
): EditorRow[] {
	const apply = (slot: WidgetSlot | null): WidgetSlot | null =>
		slot ? { ...slot, config: { ...(slot.config ?? {}), ...patch } } : slot;
	return rows.map((r, k) => {
		if (k !== i) return r;
		if (r.kind === 'full' && side === 'full') return { ...r, slot: apply(r.slot) };
		if (r.kind === 'split' && (side === 'left' || side === 'right'))
			return { ...r, [side]: apply(r[side]) };
		return r;
	});
}

/** Every widget id currently placed across the rows (for de-duping the picker). */
export function placedIds(rows: EditorRow[]): string[] {
	const ids: string[] = [];
	for (const r of rows) {
		if (r.kind === 'full') {
			if (r.slot) ids.push(r.slot.id);
		} else {
			if (r.left) ids.push(r.left.id);
			if (r.right) ids.push(r.right.id);
		}
	}
	return ids;
}
