/**
 * Display helpers for campaign-data log entry text. The English entries are lowercase so they
 * splice into a sentence; standalone display capitalizes them at render time.
 */

/** A no-op when the text starts with markup (`[skull]…`) rather than a letter. */
export function capitalizeFirst(text: string): string {
	return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

/** Plain text of a log entry: drops HTML emphasis and `[token]` glyphs, unwraps `[[card]]` links. */
export function cleanEntryText(t: string): string {
	return t
		.replace(/<\/?[ib]>/g, '')
		.replace(/\[\[([^\]]+)\]\]/g, '$1')
		.replace(/\[[a-z_]+\]/g, '')
		.replace(/#name#/g, 'them')
		.replace(/\s+/g, ' ')
		.trim();
}
