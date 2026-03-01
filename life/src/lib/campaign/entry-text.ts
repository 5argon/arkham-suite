/**
 * entry-text.ts — display helpers for campaign-data log entry text.
 *
 * The English (`-en`) campaign-log text is deliberately written lowercase
 * ("the nameless madness is contained safely within its host… for now.") so each
 * entry reads naturally when spliced inline into a larger sentence. For STANDALONE
 * UI display — the Endings widget, the campaign-log input/picker, branch coverage —
 * we capitalize the first letter so it reads as its own sentence.
 *
 * This is English-only: the lowercase convention is a property of the `-en` data.
 * It is applied at render time (never baked into stored/compiled data), so the
 * underlying text stays faithful to campaign-data.
 */

/** Capitalize the first character for display (no-op when it is not a letter, so
 *  markup-leading text like `[skull]…` or `**bold**` is left untouched). */
export function capitalizeFirst(text: string): string {
	return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}
