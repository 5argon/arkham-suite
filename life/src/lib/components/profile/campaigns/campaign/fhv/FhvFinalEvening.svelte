<!--
@component
FHV bespoke widget — "The Final Evening", the eve of the Feast. Whether you believed Mother
Rachel or lied to her (or interrupted the Feast outright), whether the Hemlocks made their
truce, Gideon finished the tale of the Annabelle Lee, and Simeon's fireworks were readied for
the finale — plus Bertie's last turn (an epiphany, or perished). All log-derived. Grouped by
theme. Built on OutcomeList.
-->
<script lang="ts">
	import { fhvText, type CampaignFhv } from '$lib/campaign/campaigns/fhv';
	import OutcomeList, { type OutcomeItem } from '$lib/components/profile/_primitives/OutcomeList.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { fhv }: { fhv: CampaignFhv | null } = $props();
	const f = $derived(fhv?.finalEvening ?? null);
	const b = $derived(fhv?.bertie ?? null);
	const it = (key: string, n: number): OutcomeItem => ({ label: fhvText(key), hit: n > 0, count: n });

	const rachelItems = $derived<OutcomeItem[]>(
		f
			? [
					it('campaign_notes.believed', f.believed),
					it('campaign_notes.lied_to_mother_rachel', f.lied),
					it('campaign_notes.interrupted_the_feast', f.interrupted)
				]
			: []
	);
	const valeItems = $derived<OutcomeItem[]>(
		f
			? [
					it('campaign_notes.the_hemlocks_made_a_truce', f.truce),
					it('campaign_notes.the_vale_is_full_of_fireworks', f.fireworks),
					it('gideon.gideon_finished_the_tale_of_the_annabelle_lee', f.gideonTale)
				]
			: []
	);
	const bertieItems = $derived<OutcomeItem[]>(
		b ? [it('campaign_notes.bertie_had_an_epiphany', b.epiphany), it('campaign_notes.bertie_perished', b.perished)] : []
	);
	const hasData = $derived([...rachelItems, ...valeItems, ...bertieItems].some((i) => i.hit));
</script>

{#if hasData}
	<div class="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
		<div>
			<SectionLabel>{m.campaign_fhv_fe_rachel_heading()}</SectionLabel>
			<OutcomeList items={rachelItems} />
		</div>
		<div>
			<SectionLabel>{m.campaign_fhv_fe_vale_heading()}</SectionLabel>
			<OutcomeList items={valeItems} />
		</div>
		{#if bertieItems.some((i) => i.hit)}
			<div>
				<SectionLabel>{m.campaign_fhv_fe_bertie_heading()}</SectionLabel>
				<OutcomeList items={bertieItems} />
			</div>
		{/if}
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_fhv_fe_empty()}</p>
{/if}
