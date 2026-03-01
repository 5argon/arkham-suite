import type { ArkhamInlineIcon } from '@5argon/arkham-kohaku';

/**
 * Maps each inline icon token (as authored in scenario / campaign / log text)
 * to its icon-font CSS class from `icons-icon.css`, which is loaded globally in
 * each app's `app.html`. Keep this aligned with the `ArkhamInlineIcon` union so
 * every icon the data layer can emit is renderable here.
 */
const inlineIconClass: Record<ArkhamInlineIcon, string> = {
	'[reaction]': 'icon-reaction',
	'[action]': 'icon-action',
	'[fast]': 'icon-free',
	'[elder_sign]': 'icon-elder_sign',
	'[skull]': 'icon-skull',
	'[cultist]': 'icon-cultist',
	'[tablet]': 'icon-tablet',
	'[elder_thing]': 'icon-elder_thing',
	'[auto_fail]': 'icon-auto_fail',
	'[curse]': 'icon-curse',
	'[bless]': 'icon-bless',
	'[willpower]': 'icon-willpower',
	'[intellect]': 'icon-intellect',
	'[combat]': 'icon-combat',
	'[agility]': 'icon-agility',
	'[wild]': 'icon-wild',
	'[mystic]': 'icon-mystic',
	'[rogue]': 'icon-rogue',
	'[seeker]': 'icon-seeker',
	'[survivor]': 'icon-survivor',
	'[guardian]': 'icon-guardian',
	'[neutral]': 'icon-neutral',
	'[health]': 'icon-health',
	'[sanity]': 'icon-sanity',
	'[per_investigator]': 'icon-per_investigator',
	'[frost]': 'icon-frost',
	'[seal_a]': 'icon-seal_a',
	'[seal_b]': 'icon-seal_b',
	'[seal_c]': 'icon-seal_c',
	'[seal_d]': 'icon-seal_d',
	'[seal_e]': 'icon-seal_e'
};

// One regex matching any known inline icon token, with regex metacharacters
// (the surrounding brackets) escaped.
const inlineIconPattern = new RegExp(
	Object.keys(inlineIconClass)
		.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
		.join('|'),
	'g'
);

/**
 * Render campaign / scenario / log text into an HTML string for use with
 * `{@html}`. Supports `[[Trait]]` (bold+italic, the Arkham trait/keyword
 * convention), `**bold**`, `*italic*`, the `2x → 2×` shorthand, and inline Arkham
 * icon tokens such as `[per_investigator]` or `[skull]`.
 *
 * Single source of truth for Arkham inline markup — route every setup/log text
 * render through it so the supported syntax stays in sync across both apps.
 */
export function parseArkhamMarkup(text: string): string {
	// `[[Trait]]` first, so its double brackets are consumed before single-bracket icons.
	let parsed = text.replace(/\[\[(.+?)\]\]/g, '<strong><em>$1</em></strong>');
	parsed = parsed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
	parsed = parsed.replace(/\*(.+?)\*/g, '<em>$1</em>');
	parsed = parsed.replace(/(\d+)x/g, '$1×');
	parsed = parsed.replace(
		inlineIconPattern,
		(token) => `<span class="${inlineIconClass[token as ArkhamInlineIcon]}"></span>`
	);
	return parsed;
}
