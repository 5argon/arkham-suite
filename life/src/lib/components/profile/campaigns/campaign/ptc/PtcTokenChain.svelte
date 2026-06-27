<!--
@component
Reusable PtC chaos-token route — a play's story scenarios as encounter-set icons (the TSK
RoutingTrack idea), with the special-token MIX it was played with rendered beneath each: the
cultist / tablet / elder-thing tokens the PREVIOUS scenario's resolution (or Curtain Call's Act
2b) fed into the bag. A scenario opened on the base bag (Curtain Call, or an unrecorded
predecessor) shows a muted "—". Hover names the scenario + its mix. Rendered through the shared
IconTrack. Reused by the Chaos Tokens widget as an alternate lens on a run (cf. PtcDcChain).
-->
<script lang="ts">
	import { getScenarioData, Scenario, ChaosToken, type EncounterSet } from '@5argon/arkham-kohaku';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { ChaosTokenDisplay } from '@5argon/arkham-life-ui';
	import IconTrack, {
		type IconTrackItem
	} from '$lib/components/profile/_primitives/IconTrack.svelte';
	import ScenarioSetIcon from '$lib/components/profile/_primitives/ScenarioSetIcon.svelte';
	import type { PtcToken, TokenStep } from '$lib/campaign/campaigns/ptc';
	import * as m from '$lib/paraglide/messages.js';

	let { route, size = '1.4rem' }: { route: TokenStep[]; size?: string } = $props();

	const KOHAKU = new Set<string>(Object.values(Scenario));
	function iconSet(id: string): EncounterSet | null {
		if (!KOHAKU.has(id)) return null;
		try {
			return getScenarioData(id as Scenario)?.representativeSet ?? null;
		} catch {
			return null;
		}
	}
	const log = getCampaignLog('ptc');
	const scenName = (id: string) => log?.en.scenarioNames?.[id] ?? id;

	const TOKEN: Record<PtcToken, ChaosToken> = {
		cultist: ChaosToken.TokenCultist,
		tablet: ChaosToken.TokenTablet,
		elder_thing: ChaosToken.TokenElderThing
	};
	const TOKEN_NAME: Record<PtcToken, () => string> = {
		cultist: m.campaign_ptc_tokens_cultist,
		tablet: m.campaign_ptc_tokens_tablet,
		elder_thing: m.campaign_ptc_tokens_elder
	};
	// Tooltip: "Echoes of the Past — 2 Cultist, 1 Tablet" (or "base bag" when empty).
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
			iconSet: iconSet(step.scenario),
			fallback: step.scenario.slice(0, 2).toUpperCase(),
			tooltip: `${scenName(step.scenario)} — ${mixSummary(step.mix)}`,
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
			<!-- 3-4 tokens overlap (each shifted left by (n-2)/(n-1) of a token) so a longer mix still
			     occupies ~2 tokens of width; 1-2 sit side by side. -->
			{@const n = it.step.mix.length}
			{@const overlap = n >= 3 ? ((n - 2) / (n - 1)) * 0.95 : 0}
			<span class="flex items-center">
				{#each it.step.mix as tok, k (k)}
					<span class="shrink-0" style={k > 0 && overlap ? `margin-left:-${overlap.toFixed(3)}rem` : ''}>
						<ChaosTokenDisplay token={TOKEN[tok]} size="text-[0.95rem]" hideLabel />
					</span>
				{/each}
			</span>
		{:else}
			<span class="text-primary-300 dark:text-primary-600 text-[0.6rem]">—</span>
		{/if}
	{/snippet}
</IconTrack>
