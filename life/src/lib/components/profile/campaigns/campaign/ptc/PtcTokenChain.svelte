<!--
@component
A play's PtC chaos-token route: its story scenarios as encounter-set icons with the special-token
mix each was played with beneath (the cultist / tablet / elder-thing tokens the previous scenario's
resolution, or Curtain Call's Act 2b, fed into the bag). A scenario opened on the base bag shows a
muted "—". Hover names the scenario and its mix.
-->
<script lang="ts">
	import type { EncounterSet } from '@5argon/arkham-kohaku';
	import { ChaosTokenDisplay } from '@5argon/arkham-life-ui';
	import type { PtcToken, TokenStep } from '$lib/campaign/campaigns/ptc';
	import { scenarioRepresentativeSet } from '$lib/campaign/utils/standalone-scenarios';
	import IconTrack, {
		type IconTrackItem
	} from '$lib/components/profile/_primitives/IconTrack.svelte';
	import ScenarioSetIcon from '$lib/components/profile/_primitives/ScenarioSetIcon.svelte';
	import { PTC_TOKEN, ptcScenarioName } from './ptc-dc-labels';
	import * as m from '$lib/paraglide/messages.js';

	let { route, size = '1.4rem' }: { route: TokenStep[]; size?: string } = $props();

	const TOKEN_NAME: Record<PtcToken, () => string> = {
		cultist: m.campaign_ptc_tokens_cultist,
		tablet: m.campaign_ptc_tokens_tablet,
		elder_thing: m.campaign_ptc_tokens_elder
	};
	/** "2 Cultist, 1 Tablet", or the base-bag label when the mix is empty. */
	function mixSummary(mix: PtcToken[]): string {
		if (!mix.length) return m.campaign_ptc_tokens_base();
		const counts = new Map<PtcToken, number>();
		for (const t of mix) counts.set(t, (counts.get(t) ?? 0) + 1);
		return [...counts].map(([t, n]) => `${n} ${TOKEN_NAME[t]()}`).join(', ');
	}

	interface TokenItem extends IconTrackItem {
		step: TokenStep;
		iconSet: EncounterSet | null;
		fallback: string;
	}
	const items = $derived<TokenItem[]>(
		route.map((step) => ({
			step,
			iconSet: scenarioRepresentativeSet(step.scenario),
			fallback: step.scenario.slice(0, 2).toUpperCase(),
			tooltip: `${ptcScenarioName(step.scenario)} — ${mixSummary(step.mix)}`,
			tint: 'text-primary-700 dark:text-primary-200'
		}))
	);
</script>

<IconTrack {items} {size} cellWidth="1.2em" gap="0.5em">
	{#snippet icon(it)}
		<ScenarioSetIcon iconSet={it.iconSet} fallback={it.fallback} />
	{/snippet}
	{#snippet sub(it)}
		{#if it.step.mix.length}
			<!-- 3–4 tokens overlap (each shifted left by (n-2)/(n-1) of a token) so a longer mix still
			     occupies ~2 tokens of width; 1–2 sit side by side. -->
			{@const n = it.step.mix.length}
			{@const overlap = n >= 3 ? ((n - 2) / (n - 1)) * 0.95 : 0}
			<span class="flex items-center">
				{#each it.step.mix as tok, k (k)}
					<span class="shrink-0" style={k > 0 && overlap ? `margin-left:-${overlap.toFixed(3)}rem` : ''}>
						<ChaosTokenDisplay token={PTC_TOKEN[tok]} size="text-[0.95rem]" hideLabel />
					</span>
				{/each}
			</span>
		{:else}
			<span class="text-primary-300 dark:text-primary-600 text-[0.6rem]">—</span>
		{/if}
	{/snippet}
</IconTrack>
