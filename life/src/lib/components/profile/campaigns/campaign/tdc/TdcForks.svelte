<!--
@component
TDC bespoke widget — "Expedition Forks". The branching decisions across the journey: One Last
Job (the alien language, Ruby's bet), the Western Wall (the creature, the pilgrim), the Drowned
Quarter (diverting the power), the Apiary (the pilgrims' fate), and the Grand Vault (unsealing
the inner sanctum). StatNumbers (grouped by scenario), labels from log text. Full width.
-->
<script lang="ts">
	import { tdcText, type CampaignTdc } from '$lib/campaign/campaigns/tdc';
	import StatNumbers, { type StatGroup } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tdc }: { tdc: CampaignTdc | null } = $props();

	const groups = $derived.by<StatGroup[]>(() => {
		if (!tdc) return [];
		const t = tdc;
		const out: StatGroup[] = [];
		const push = (heading: string, stats: { value: number; label: string }[]) => {
			if (stats.some((s) => s.value > 0)) out.push({ heading, stats });
		};
		push(m.campaign_tdc_sc_one_last_job(), [
			{ value: t.oneLastJob.discoveredLanguage, label: tdcText('campaign_notes.discovered_an_alien_language') },
			{ value: t.oneLastJob.rubyWon, label: tdcText('campaign_notes.ruby_won_the_bet') },
			{ value: t.oneLastJob.rubyLost, label: tdcText('campaign_notes.ruby_lost_the_bet') }
		]);
		push(m.campaign_tdc_sc_western_wall(), [
			{ value: t.westernWall.creatureDefeated, label: tdcText('campaign_notes.the_creature_was_defeated') },
			{ value: t.westernWall.helpedPilgrim, label: tdcText('campaign_notes.expedition_helped_pilgrim') },
			{ value: t.westernWall.abandonedPilgrim, label: tdcText('campaign_notes.expedition_abandoned_pilgrim') }
		]);
		push(m.campaign_tdc_sc_drowned_quarter(), [
			{ value: t.drownedQuarter.powerDiverted, label: tdcText('campaign_notes.the_power_was_diverted') }
		]);
		push(m.campaign_tdc_sc_apiary(), [
			{ value: t.apiary.pilgrimsSaved, label: tdcText('campaign_notes.pilgrims_were_saved') },
			{ value: t.apiary.pilgrimsDevoured, label: tdcText('campaign_notes.pilgrims_were_devoured') },
			{ value: t.apiary.exterminatedParasites, label: tdcText('campaign_notes.exterminated_the_alien_parasites') }
		]);
		push(m.campaign_tdc_sc_grand_vault(), [
			{ value: t.grandVault.innerSanctumUnsealed, label: tdcText('campaign_notes.the_inner_sanctum_was_unsealed') }
		]);
		return out;
	});
	const hasData = $derived(groups.length > 0);
</script>

{#if hasData}
	<StatNumbers rows={groups} />
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tdc_forks_empty()}</p>
{/if}
