<!--
@component
EotE bespoke widget — "The Miasma". At the campaign's end, exactly one of two
mutually-exclusive notes is recorded: "Dr. Kensler has a plan" or "the truth of
the mirage eludes you". Shows how many of your runs ended each way. Built on the
shared StatNumbers.
-->
<script lang="ts">
	import type { CampaignEoe } from '$lib/campaign/eoe';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { eoe }: { eoe: CampaignEoe | null } = $props();
	const plan = $derived(eoe?.miasmaPlan ?? 0);
	const eludes = $derived(eoe?.miasmaEludes ?? 0);
	const rows = $derived<Stat[][]>(
		plan > 0 || eludes > 0
			? [
					[
						{ value: plan, label: m.campaign_eote_miasma_plan() },
						{ value: eludes, label: m.campaign_eote_miasma_eludes() }
					]
				]
			: []
	);
</script>

<StatNumbers {rows} />
