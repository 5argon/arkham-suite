<!-- @component A bordered square thumbnail of a card (by `code`) or any image (by `src`). -->
<script lang="ts">
	import { getCardImagePath } from '@5argon/arkham-life-ui';
	import { cardByCode } from '$lib/card-data';

	let {
		code,
		src,
		alt,
		title,
		tone = 'primary',
		objectTop = false,
		size = 'h-16 w-16'
	}: {
		code?: string;
		src?: string;
		/** Defaults to the card's name. */
		alt?: string;
		/** Native tooltip; defaults to `alt`. */
		title?: string;
		tone?: 'primary' | 'danger';
		objectTop?: boolean;
		size?: string;
	} = $props();

	const name = $derived(alt ?? (code ? (cardByCode(code)?.name ?? '') : ''));
	const border = $derived(
		tone === 'danger'
			? 'border-error-300 dark:border-error-700'
			: 'border-primary-300 dark:border-primary-600'
	);
</script>

<img
	src={src ?? (code ? getCardImagePath(code, 'square') : '')}
	alt={name}
	title={title ?? name}
	loading="lazy"
	class="{size} {border} shrink-0 rounded border object-cover shadow {objectTop ? 'object-top' : ''}"
/>
