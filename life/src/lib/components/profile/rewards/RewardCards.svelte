<!-- @component Campaign reward cards as full scans: unlocked ones lit with each difficulty they were earned on, locked ones dimmed. -->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import type { Card } from '@5argon/arkham-kohaku';
	import type { RewardUnlock } from '$lib/campaign/rewards/rewards';
	import { cardByCode } from '$lib/card-data';
	import { CardScanWall } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import RewardTiers from '../_primitives/RewardTiers.svelte';

	let {
		rewards,
		showWhere = true
	}: {
		rewards: RewardUnlock[];
		/** Name the scenario that grants each card. */
		showWhere?: boolean;
	} = $props();

	type Item = { card: Card; count: number; reward: RewardUnlock };
	const items = $derived(
		rewards.flatMap((r): Item[] => {
			const card = cardByCode(r.code);
			return card ? [{ card, count: r.earned.total, reward: r }] : [];
		})
	);

	function where(r: RewardUnlock): string {
		const log = getCampaignLog(r.catalogue);
		const scenario = log?.en.scenarioNames?.[r.scenario] ?? r.scenario;
		return r.catalogue === 'side'
			? m.rewards_where_pack({ scenario })
			: m.rewards_where({ scenario, campaign: log?.db.name ?? r.catalogue });
	}
</script>

<CardScanWall {items} dimUnused width={150}>
	{#snippet badge(t)}
		<div class="mt-1 flex flex-col items-center gap-0.5 text-center">
			{#if t.count > 0}
				<span
					class="bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 rounded-full px-2 py-0.5 text-xs font-semibold"
					>{m.standalones_reward_unlocked()}</span
				>
				<RewardTiers tiers={t.reward.tiers} />
			{:else}
				<span class="text-primary-400 text-xs">{m.standalones_reward_locked()}</span>
			{/if}
			{#if showWhere}
				<span class="text-primary-400 text-[0.65rem] leading-tight">{where(t.reward)}</span>
			{/if}
		</div>
	{/snippet}
</CardScanWall>
