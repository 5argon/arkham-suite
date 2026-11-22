<!-- @component A scenario passport counting its logged outcomes under short labels, picturing the villagers it centres on. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { FHV_PASSPORTS, fhvVillagerName, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import { portraitUrl } from '$lib/campaign/records/campaign-log-source';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { StatNumbers } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';
	import { FHV_SCENARIO_VIEWS } from './fhv-views';

	let {
		blob: fhv,
		ctx,
		hasMore = false,
		children
	}: CampaignWidgetProps<CampaignFhv> & {
		/** `children` has something to show, so the empty note is left out. */
		hasMore?: boolean;
		children?: Snippet;
	} = $props();

	const scenario = $derived(ctx.scenario ?? '');
	const passport = $derived(FHV_PASSPORTS[scenario] ?? { villagers: [], keys: [] });
	const counts = $derived(fhv?.scenarios[scenario] ?? {});
	const rows = $derived(
		(FHV_SCENARIO_VIEWS[scenario] ?? []).map((g) => ({
			heading: g.heading?.(),
			stats: g.stats.map((st) => ({ value: counts[st.key] ?? 0, label: st.label() }))
		}))
	);
	const hit = $derived(rows.some((g) => g.stats.some((st) => st.value > 0)));
	const headerCards = $derived(
		passport.villagers.map((v) => ({
			src: portraitUrl('fhv', v),
			label: fhvVillagerName(v),
			objectTop: true
		}))
	);
</script>

<ScenarioInfo
	{ctx}
	showPlays
	{headerCards}
	empty={hit || hasMore ? null : m.campaign_fhv_scenario_empty()}
>
	{#snippet stats()}
		{#if hit}
			<StatNumbers {rows} />
		{/if}
		{@render children?.()}
	{/snippet}
</ScenarioInfo>
