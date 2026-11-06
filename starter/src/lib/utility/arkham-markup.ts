import type { ArkhamInlineIcon } from '@5argon/arkham-kohaku';

/**
 * Maps each inline icon token (as authored in scenario / campaign setup text)
 * to its icon-font CSS class from `icons-icon.css`, which is loaded globally in
 * `app.html`. Keep this aligned with the `ArkhamInlineIcon` union so every icon
 * the data layer can emit is renderable here.
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
	'[blood]': 'icon-blood',
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
 * Render campaign / scenario setup text into an HTML string for use with
 * `{@html}`. Supports `**bold**`, `*italic*`, the `2x → 2×` shorthand, and
 * inline Arkham icon tokens such as `[per_investigator]` or `[skull]`.
 *
 * This is the single source of truth for setup-reference text markup — route
 * every `what` / paragraph render through it so the supported syntax stays in
 * sync across the setup reference card.
 */
/**
 * Render ArkhamDB-style card text (as found in campaign data such as
 * achievements) into an HTML string for use with `{@html}`. Keeps `<i>` / `<b>`,
 * renders `[[Trait]]` as bold italic like printed card text, and turns known
 * inline icon tokens such as `[blood]` into icons. Unknown tokens are dropped.
 */
export function parseArkhamDbText(text: string): string {
	return text
		.replace(/\[\[([^\]]+)\]\]/g, '<b><i>$1</i></b>')
		.replace(/\[[a-z_]+\]/g, (token) => {
			const iconClass = inlineIconClass[token as ArkhamInlineIcon];
			return iconClass ? `<span class="${iconClass}"></span>` : '';
		})
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Render a card's whole text, where each line is its own ability. Unlike {@link parseArkhamDbText} it
 * keeps a token that isn't an icon, which in flavor text is an editor's word inside a quote.
 */
export function parseArkhamDbCardText(text: string): string {
	return text
		.replace(/\[\[([^\]]+)\]\]/g, '<b><i>$1</i></b>')
		.replace(/\[[a-z_]+\]/g, (token) => {
			const iconClass = inlineIconClass[token as ArkhamInlineIcon];
			return iconClass ? `<span class="${iconClass}"></span>` : token;
		})
		.split('\n')
		.map((line) => `<p>${line}</p>`)
		.join('');
}

export function parseArkhamMarkup(text: string): string {
	let parsed = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
	parsed = parsed.replace(/\*(.+?)\*/g, '<em>$1</em>');
	parsed = parsed.replace(/(\d+)x/g, '$1×');
	parsed = parsed.replace(
		inlineIconPattern,
		(token) => `<span class="${inlineIconClass[token as ArkhamInlineIcon]}"></span>`
	);
	return parsed;
}
