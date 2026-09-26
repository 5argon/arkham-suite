<!-- @component A scenario passport listing its logged outcomes, picturing the villagers it centres on. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { FHV_PASSPORTS, fhvVillagerName, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import { logText, portraitUrl } from '$lib/campaign/records/campaign-log-source';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { OutcomeList, SectionLabel, type OutcomeItem } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import ScenarioInfo from '../ScenarioInfo.svelte';

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

	const HEADINGS = {
		hybrid: m.campaign_fhv_thing_hybrid_heading,
		bear: m.campaign_fhv_hollow_bear_heading,
		captives: m.campaign_fhv_ln_captives_heading
	};
	/** Hidden notes have no campaign-data text. */
	const LABELS: Record<string, () => string> = {
		'hidden.found_little_sylvie': m.campaign_fhv_house_sylvie
	};

	const scenario = $derived(ctx.scenario ?? '');
	const passport = $derived(FHV_PASSPORTS[scenario] ?? { villagers: [], groups: [] });
	const counts = $derived(fhv?.scenarios[scenario] ?? {});
	const groups = $derived(
		passport.groups
			.map((g, i) => ({
				id: i,
				heading: g.heading ? HEADINGS[g.heading]() : null,
				onlyWhenHit: g.onlyWhenHit,
				items: g.keys.map((key): OutcomeItem => ({
					label: LABELS[key]?.() ?? logText('fhv', key),
					hit: (counts[key] ?? 0) > 0,
					count: counts[key] ?? 0
				}))
			}))
			.filter((g) => !g.onlyWhenHit || g.items.some((i) => i.hit))
	);
	const hit = $derived(groups.some((g) => g.items.some((i) => i.hit)));
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
			<div class="space-y-3">
				{#each groups as g (g.id)}
					<div>
						{#if g.heading}<SectionLabel>{g.heading}</SectionLabel>{/if}
						<OutcomeList items={g.items} />
					</div>
				{/each}
			</div>
		{/if}
		{@render children?.()}
	{/snippet}
</ScenarioInfo>
