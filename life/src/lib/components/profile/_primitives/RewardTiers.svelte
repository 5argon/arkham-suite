<!-- @component The difficulties a reward card was earned on, one line each with its play count and, when known, the first date. -->
<script lang="ts">
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import { formatFinishDate } from '$lib/campaign/utils/format-date';
	import * as m from '$lib/paraglide/messages.js';

	/** A difficulty's count, with its first date when known. */
	type TierLine = { tier: string; plays: number; firstDate?: number | null };

	let { tiers, align = 'center' }: { tiers: TierLine[]; align?: 'center' | 'left' } = $props();
</script>

<ul class="flex flex-col gap-0.5 text-xs {align === 'center' ? 'items-center text-center' : ''}">
	{#each tiers as t (t.tier)}
		<li>
			<span class="text-secondary-600 dark:text-secondary-400 font-semibold"
				>{m.rewards_tier({ difficulty: difficultyLabel(t.tier), plays: t.plays })}</span
			>
			{#if t.firstDate != null}
				<span class="text-primary-500">
					· {m.rewards_tier_first({ date: formatFinishDate(t.firstDate) })}</span
				>
			{/if}
		</li>
	{/each}
</ul>
