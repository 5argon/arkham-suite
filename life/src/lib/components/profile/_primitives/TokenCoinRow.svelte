<!--
@component
A labelled row of chaos-token coins with a trailing ×count — the shared inner
rendering for the token-range widgets (EotE "Frost Tokens", TSK "Tablet vs Elder
Thing", and any future one), so they stay visually consistent and we don't copy the
markup per widget. Draws `count` copies of the token's coin art (the same art as the
Campaign Archive's chaos-bag editor) followed by `×count`.
-->
<script lang="ts">
	import type { ChaosToken } from '@5argon/arkham-kohaku';
	import { ChaosTokenDisplay } from '@5argon/arkham-life-ui';

	let {
		token,
		label,
		count,
		labelClass = 'w-28'
	}: {
		token: ChaosToken;
		label: string;
		count: number;
		/** Tailwind width for the label column, so a widget's rows line up. */
		labelClass?: string;
	} = $props();
</script>

<div class="flex items-center gap-3">
	<span
		class="text-primary-600 dark:text-primary-300 {labelClass} shrink-0 text-sm font-semibold leading-tight"
	>
		{label}
	</span>
	<div class="flex flex-wrap items-center gap-1">
		{#each Array(count) as _, i (i)}
			<span class="text-2xl"><ChaosTokenDisplay {token} hideLabel /></span>
		{/each}
		<span class="text-primary-500 ml-1 text-sm font-bold tabular-nums">×{count}</span>
	</div>
</div>
