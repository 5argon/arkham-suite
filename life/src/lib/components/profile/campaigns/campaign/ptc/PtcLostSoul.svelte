<!--
@component
PtC interlude widget — "Lost Soul (Interlude II)", the dream after the asylum. Whether you heeded or
ignored Daniel's warning (a campaign note — log-derived), and Daniel's fate: he survived if you
resigned with him (the Cuckoo's Nest condition) or was possessed (Extra-supplied, so it hides in
log-only mode). The data rides the `unspeakableOath` blob — its Extra lives on the Oath scenario's tab
— surfaced here as its own interlude widget.
-->
<script lang="ts">
	import type { CampaignPtc } from '$lib/campaign/campaigns/ptc';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { ptc, logOnly = false }: { ptc: CampaignPtc | null; logOnly?: boolean } = $props();
	const o = $derived(ptc?.unspeakableOath);

	// Heeded / ignored is a campaign note (log); Daniel's fate (survived / possessed) is Extra-supplied,
	// so it only shows outside log-only mode.
	const hasWarning = $derived(!!o && (o.danielHeeded > 0 || o.danielIgnored > 0));
	const hasFate = $derived(!logOnly && !!o && (o.danielSurvived > 0 || o.danielPossessed > 0));
	const hasData = $derived(hasWarning || hasFate);

	const rows = $derived<Stat[][]>([
		...(hasWarning
			? [
					[
						{ value: o!.danielHeeded, label: m.campaign_ptc_oath_daniel_heeded() },
						{ value: o!.danielIgnored, label: m.campaign_ptc_oath_daniel_ignored() }
					]
				]
			: []),
		...(hasFate
			? [
					[
						{ value: o!.danielSurvived, label: m.campaign_ptc_oath_daniel_survived() },
						{ value: o!.danielPossessed, label: m.campaign_ptc_oath_daniel_possessed() }
					]
				]
			: [])
	]);
</script>

{#if hasData}
	<StatNumbers {rows} />
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_ptc_lost_soul_empty()}</p>
{/if}
