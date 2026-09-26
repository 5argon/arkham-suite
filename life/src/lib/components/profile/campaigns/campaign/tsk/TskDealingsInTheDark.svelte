<!-- @component Dealings in the Dark: the deal struck with Ece, and which Grand Bazaar layout Act 2 revealed. -->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import type { CampaignTsk } from '$lib/campaign/campaigns/tsk/profile';
	import { choicesForScenario } from '$lib/campaign/stats/scenario-extras';
	import type { CampaignWidgetProps } from '$lib/components/profile/_framework/widget-context';
	import { LitTileGrid, SectionLabel, StatNumbers, type LitTile } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
	import { times } from '$lib/profile/plural';
	import TskScenarioInfo from './TskScenarioInfo.svelte';

	let { blob: tsk, ctx }: CampaignWidgetProps<CampaignTsk> = $props();

	const SCENARIO = 'dealings_in_the_dark';
	const CHOICE = 'act_2_setup';
	const IMG = '/image/widget/campaign/tsk/dealings-in-the-dark';
	/** The chaos token revealed picks the layout. */
	const ART: Record<string, string> = {
		odd: `${IMG}/1357.webp`,
		even: `${IMG}/2468.webp`,
		skull: `${IMG}/skull-1-0.webp`,
		spooky: `${IMG}/cultist-tablet-elder.webp`,
		extreme: `${IMG}/autofail-eldersign.webp`
	};

	const setupTiles = $derived.by((): LitTile[] => {
		const stat = ctx.scenarios?.scenarios.find((s) => s.scenario === SCENARIO);
		const played = new Map((stat?.choices?.find((c) => c.id === CHOICE)?.values ?? []).map((v) => [v.value, v.played]));
		const log = getCampaignLog(ctx.family ?? 'tskc');
		const def = log ? choicesForScenario(log, SCENARIO).find((c) => c.id === CHOICE) : undefined;
		return (def?.options ?? [])
			.filter((o) => ART[o.value])
			.map((o) => {
				const plays = played.get(o.value) ?? 0;
				return {
					id: o.value,
					image: ART[o.value],
					label: o.label,
					count: plays,
					detail: plays > 0 ? m.campaign_tsk_dealings_tip_played({ plays: times(plays) }) : m.campaign_tsk_dealings_tip_never()
				};
			});
	});
	const ece = $derived(tsk?.dealings ?? null);
</script>

<TskScenarioInfo blob={tsk} {ctx}>
	{#snippet stats()}
		{#if ece}
			<StatNumbers
				rows={[
					[
						{ value: ece.workedWithEce, label: m.campaign_tsk_dealings_ece_worked() },
						{ value: ece.deceivedEce, label: m.campaign_tsk_dealings_ece_deceived() },
						{ value: ece.refusedEce, label: m.campaign_tsk_dealings_ece_refused() }
					]
				]}
			/>
		{/if}
	{/snippet}
	{#if setupTiles.length && !ctx.logOnly}
		<div>
			<SectionLabel>{m.campaign_tsk_dealings_act2_setup()}</SectionLabel>
			<LitTileGrid tiles={setupTiles} layout="flex" fit="contain" markup />
		</div>
	{/if}
</TskScenarioInfo>
