<!-- @component A play's chaos-token route: each story scenario it reached with the special tokens in the bag while playing it. -->
<script lang="ts">
	import { ChaosTokenDisplay } from '@5argon/arkham-life-ui';
	import type { PtcToken, TokenStep } from '$lib/campaign/campaigns/ptc';
	import {
		IconTrack,
		ScenarioSetIcon,
		type IconTrackItem
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { PTC_TOKEN, ptcScenarioName } from './ptc-spine';

	let { route }: { route: TokenStep[] } = $props();

	const TOKEN_NAME: Record<PtcToken, () => string> = {
		cultist: m.campaign_ptc_tokens_cultist,
		tablet: m.campaign_ptc_tokens_tablet,
		elder_thing: m.campaign_ptc_tokens_elder
	};
	function mixSummary(mix: PtcToken[]): string {
		if (!mix.length) return m.campaign_ptc_tokens_base();
		const counts = new Map<PtcToken, number>();
		for (const t of mix) counts.set(t, (counts.get(t) ?? 0) + 1);
		return [...counts].map(([t, n]) => `${n} ${TOKEN_NAME[t]()}`).join(', ');
	}

	const items = $derived<(IconTrackItem & { step: TokenStep })[]>(
		route.map((step) => ({
			step,
			tooltip: `${ptcScenarioName(step.scenario)} — ${mixSummary(step.mix)}`,
			tint: 'text-primary-700 dark:text-primary-200'
		}))
	);
</script>

<IconTrack {items} size="1.4rem" cellWidth="1.2em" gap="0.5em">
	{#snippet icon(it)}
		<ScenarioSetIcon scenarioId={it.step.scenario} />
	{/snippet}
	{#snippet sub(it)}
		{#if it.step.mix.length}
			<!-- Three or four tokens overlap so a long mix stays about two tokens wide. -->
			{@const n = it.step.mix.length}
			{@const overlap = n >= 3 ? ((n - 2) / (n - 1)) * 0.95 : 0}
			<span class="flex items-center">
				{#each it.step.mix as tok, k (k)}
					<span
						class="shrink-0"
						style={k > 0 && overlap ? `margin-left:-${overlap.toFixed(3)}rem` : ''}
					>
						<ChaosTokenDisplay token={PTC_TOKEN[tok]} size="text-[0.95rem]" hideLabel />
					</span>
				{/each}
			</span>
		{:else}
			<span class="text-primary-300 dark:text-primary-600 text-[0.6rem]">—</span>
		{/if}
	{/snippet}
</IconTrack>
