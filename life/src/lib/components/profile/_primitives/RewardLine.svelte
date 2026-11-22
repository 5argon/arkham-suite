<!-- @component One campaign reward card in a scenario passport: its thumbnail, name and each difficulty it was unlocked on. -->
<script lang="ts">
	import { orderedDifficulties } from '$lib/campaign/utils/difficulty';
	import type { Tally } from '$lib/campaign/utils/tally';
	import { cardByCode } from '$lib/card-data';
	import * as m from '$lib/paraglide/messages.js';
	import CardThumb from './CardThumb.svelte';
	import RewardTiers from './RewardTiers.svelte';
	import SectionLabel from './SectionLabel.svelte';

	let { code, tally }: { code: string; tally: Tally | null | undefined } = $props();

	const unlocked = $derived((tally?.total ?? 0) > 0);
	const tiers = $derived(
		tally
			? orderedDifficulties(tally.byTier).map((tier) => ({ tier, plays: tally.byTier[tier] }))
			: []
	);
</script>

<div>
	<SectionLabel variant="heading" align="center"
		>{m.framework_label_standalone_reward()}</SectionLabel
	>
	<div class="flex items-center justify-center gap-3 {unlocked ? '' : 'opacity-45'}">
		<CardThumb {code} size="h-12 w-12" />
		<div class="min-w-0">
			<p class="text-sm font-medium text-black dark:text-white">{cardByCode(code)?.name ?? code}</p>
			{#if unlocked}
				<RewardTiers {tiers} align="left" />
			{:else}
				<p class="text-primary-400 text-xs">{m.standalones_reward_locked()}</p>
			{/if}
		</div>
	</div>
</div>
