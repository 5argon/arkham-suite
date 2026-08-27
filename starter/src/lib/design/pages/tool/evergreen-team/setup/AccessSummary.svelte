<script lang="ts">
	import { ArkhamIcon } from '@5argon/arkham-icon';
	import { type ArkhamInlineIcon, type Card, CardClass } from '@5argon/arkham-kohaku';

	import * as m from '$lib/paraglide/messages.js';
	import { accessSummary } from '$lib/tool/evergreen-team/pool';

	interface Prop {
		investigator: Card;
	}
	const { investigator }: Prop = $props();

	const summary = $derived(accessSummary(investigator));

	function textColorClass(cardClass: CardClass): string {
		switch (cardClass) {
			case CardClass.Guardian:
				return 'text-guardian-700 dark:text-guardian-300';
			case CardClass.Seeker:
				return 'text-seeker-700 dark:text-seeker-300';
			case CardClass.Rogue:
				return 'text-rogue-700 dark:text-rogue-300';
			case CardClass.Mystic:
				return 'text-mystic-700 dark:text-mystic-300';
			case CardClass.Survivor:
				return 'text-survivor-700 dark:text-survivor-300';
			case CardClass.Neutral:
				return 'text-neutral-700 dark:text-neutral-300';
		}
	}
</script>

<div class="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-xs">
	{#each summary.lines as line (line.cardClass)}
		<span class="flex items-center gap-0.5 whitespace-nowrap {textColorClass(line.cardClass)}">
			<ArkhamIcon icon={`[${line.cardClass}]` as ArkhamInlineIcon} />
			{m.tool_evergreen_team_level_range({ min: line.min, max: line.max })}
		</span>
	{/each}
	{#if summary.special}
		<span class="text-neutral-600 dark:text-neutral-400">
			{m.tool_evergreen_team_special_access()}
		</span>
	{/if}
</div>
