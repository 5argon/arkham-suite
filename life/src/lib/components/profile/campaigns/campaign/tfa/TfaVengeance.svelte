<!--
@component
TFA bespoke widget — "Yig's Fury". The campaign spine: final Vengeance per play
(most/least) + lifetime total, and the breakpoint it most visibly crosses — which
agenda you began The Depths of Yoth on (and how often Yig's Fury hit 16+, when
Ichtaca refuses your plea in Shattered Aeons). Built on StatNumbers. The log holds
only the final total, an upper bound (Fury only rises) — see the per-scenario caveat.
-->
<script lang="ts">
	import type { CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tfa }: { tfa: CampaignTfa | null } = $props();
	const v = $derived(tfa?.vengeance);
	const hasData = $derived(!!v && v.recorded > 0);

	const agendaRow = $derived<Stat[]>(
		v
			? Object.keys(v.depthsAgenda)
					.map(Number)
					.sort((a, b) => a - b)
					.map((n) => ({
						value: v.depthsAgenda[n],
						label:
							n === 0 ? m.campaign_tfa_vengeance_agenda_special() : m.campaign_tfa_vengeance_agenda({ n })
					}))
			: []
	);
	const rows = $derived<Stat[][]>(
		hasData && v
			? [
					[
						{ value: v.max, label: m.campaign_tfa_vengeance_max() },
						{ value: v.min, label: m.campaign_tfa_vengeance_min() },
						{ value: v.lifetime, label: m.campaign_tfa_vengeance_lifetime() }
					],
					agendaRow,
					v.ichtacaRefused > 0
						? [{ value: v.ichtacaRefused, label: m.campaign_tfa_vengeance_refused() }]
						: []
				].filter((r) => r.length)
			: []
	);
</script>

{#if hasData}
	<StatNumbers {rows} />
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tfa_vengeance_empty()}</p>
{/if}
