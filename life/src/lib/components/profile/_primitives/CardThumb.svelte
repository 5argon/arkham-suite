<!--
@component
A single square card thumbnail — the bordered, shadowed `getCardImagePath(code,'square')` image used
for passport header art (key / scenario / coterie) and the no-scenario key widgets. `tone` sets the
border (neutral primary vs danger red); `objectTop` frames portraits from the top; `size` overrides
the default `h-16 w-16`.
-->
<script lang="ts">
	import { getCardImagePath } from '@5argon/arkham-life-ui';

	let {
		code,
		alt = '',
		title,
		tone = 'primary',
		objectTop = false,
		size = 'h-16 w-16'
	}: {
		code: string;
		alt?: string;
		/** Native hover tooltip (e.g. a coterie member's name). */
		title?: string;
		tone?: 'primary' | 'danger';
		objectTop?: boolean;
		/** Size utility classes (default `h-16 w-16`). */
		size?: string;
	} = $props();

	const border = $derived(
		tone === 'danger'
			? 'border-error-300 dark:border-error-700'
			: 'border-primary-300 dark:border-primary-600'
	);
</script>

<img
	src={getCardImagePath(code, 'square')}
	{alt}
	{title}
	loading="lazy"
	class="{size} {border} shrink-0 rounded border object-cover shadow {objectTop ? 'object-top' : ''}"
/>
