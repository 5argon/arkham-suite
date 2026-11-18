<!-- @component The Final Evening: whether Mother Rachel was believed, the Vale's last preparations and Bertie's fate. -->
<script lang="ts">
	import type { CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import { logText } from '$lib/campaign/records/campaign-log-source';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import {
		OutcomeList,
		SectionLabel,
		WidgetEmpty,
		type OutcomeItem
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { blob: fhv }: CampaignWidgetProps<CampaignFhv> = $props();

	const item = (key: string, n = 0): OutcomeItem => ({
		label: logText('fhv', key),
		hit: n > 0,
		count: n
	});

	const groups = $derived.by(() => {
		const f = fhv?.finalEvening;
		const b = fhv?.bertie;
		return [
			{
				id: 'rachel',
				heading: m.campaign_fhv_fe_rachel_heading(),
				items: [
					item('believed', f?.believed),
					item('lied_to_mother_rachel', f?.lied),
					item('interrupted_the_feast', f?.interrupted)
				]
			},
			{
				id: 'vale',
				heading: m.campaign_fhv_fe_vale_heading(),
				items: [
					item('the_hemlocks_made_a_truce', f?.truce),
					item('the_vale_is_full_of_fireworks', f?.fireworks),
					item('gideon.gideon_finished_the_tale_of_the_annabelle_lee', f?.gideonTale)
				]
			},
			{
				id: 'bertie',
				heading: m.campaign_fhv_fe_bertie_heading(),
				items: [item('bertie_had_an_epiphany', b?.epiphany), item('bertie_perished', b?.perished)]
			}
		];
	});
	const anyHit = (items: OutcomeItem[]) => items.some((i) => i.hit);
	const shown = $derived(groups.filter((g) => g.id !== 'bertie' || anyHit(g.items)));
</script>

{#if groups.some((g) => anyHit(g.items))}
	<div class="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
		{#each shown as g (g.id)}
			<div>
				<SectionLabel>{g.heading}</SectionLabel>
				<OutcomeList items={g.items} />
			</div>
		{/each}
	</div>
{:else}
	<WidgetEmpty>{m.campaign_fhv_fe_empty()}</WidgetEmpty>
{/if}
