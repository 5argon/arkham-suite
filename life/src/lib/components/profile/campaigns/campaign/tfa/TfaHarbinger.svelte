<!--
@component
TFA flagship — "The Harbinger of Valusia", the recurring nemesis. It carries its wounds across the
campaign, so this shows how much damage you dealt at each tracked appearance (The Doom of Eztli, then
Heart of the Elders II — recorded via the Extra tab, since the log keeps only the latest total) and
whether you ever let it walk away unharmed (We Have an Understanding). Built on StatNumbers beside the
Harbinger's own card art.
-->
<script lang="ts">
	import { TFA_HARBINGER_CODE, type CampaignTfa } from '$lib/campaign/campaigns/tfa';
	import CardThumb from '$lib/components/profile/_primitives/CardThumb.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { tfa, logOnly = false }: { tfa: CampaignTfa | null; logOnly?: boolean } = $props();
	const h = $derived(tfa?.harbinger);
	// The per-appearance Eztli/HotE II damage is Extra-tab data; the final HP + "unharmed" tally come
	// from the campaign log (campaign_notes.harbinger_alive), so those survive Log-only mode.
	const hasData = $derived(
		!!h && (h.recorded > 0 || (!logOnly && (h.eztli.recorded > 0 || h.hote2.recorded > 0)))
	);

	const damage = $derived<Stat[]>(
		h
			? (() => {
					const out: Stat[] = [];
					if (!logOnly && h.eztli.recorded > 0)
						out.push({ value: h.eztli.max, label: m.campaign_tfa_harbinger_eztli() });
					if (!logOnly && h.hote2.recorded > 0)
						out.push({ value: h.hote2.max, label: m.campaign_tfa_harbinger_hote() });
					if (out.length === 0 && h.recorded > 0)
						out.push({ value: h.max, label: m.campaign_tfa_harbinger_final() });
					return out;
				})()
			: []
	);
</script>

{#if hasData && h}
	<div class="flex items-start gap-3">
		<CardThumb code={TFA_HARBINGER_CODE} alt={m.campaign_tfa_harbinger_name()} tone="danger" objectTop />
		<div class="min-w-0 flex-1 space-y-3">
			{#if damage.length}
				<StatNumbers rows={[{ heading: m.campaign_tfa_harbinger_damage_heading(), stats: damage }]} />
			{/if}
			{#if h.neverDamaged > 0}
				<p class="text-center text-xs text-emerald-600 dark:text-emerald-400">
					{m.campaign_tfa_harbinger_unharmed({ n: h.neverDamaged })}
				</p>
			{/if}
		</div>
	</div>
{:else}
	<p class="text-primary-500 text-sm">{m.campaign_tfa_harbinger_empty()}</p>
{/if}
