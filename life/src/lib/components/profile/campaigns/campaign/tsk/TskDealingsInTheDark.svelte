<!--
@component
TSK — Dealings in the Dark. The shared scenario passport, plus a bespoke Act 2
Setup tableau: the five possible Grand Bazaar token layouts (the revealed chaos
token decides which), shown as art lit when the player has revealed that layout
across their plays. Rendered through the shared LitTileGrid (contain-fit so the
diagrams aren't cropped; the token label is Arkham markup).
-->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { choicesForScenario } from '$lib/campaign/stats/scenario-extras';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';
	import TskScenarioInfo from '$lib/components/profile/campaigns/campaign/tsk/TskScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
	import SectionLabel from '$lib/components/profile/_primitives/SectionLabel.svelte';
	import LitTileGrid, { type LitTile } from '$lib/components/profile/_primitives/LitTileGrid.svelte';
	import type { TskScenarioWidgetProps } from '$lib/components/profile/campaigns/campaign/tsk/tsk-scenario';

	let props: TskScenarioWidgetProps = $props();

	// The three mutually-exclusive ways the scenario opens (which deal you struck with
	// Ece) — counted across plays from the recorded campaign-log note for each.
	const ECE_ROUTES: { id: string; label: string }[] = [
		{ id: 'cell_is_working_with_ece', label: m.campaign_tsk_dealings_ece_worked() },
		{ id: 'cell_is_deceiving_ece', label: m.campaign_tsk_dealings_ece_deceived() },
		{ id: 'cell_refused_eces_offer', label: m.campaign_tsk_dealings_ece_refused() }
	];
	const eceRow = $derived<Stat[]>(
		ECE_ROUTES.map((r) => ({ value: props.tsk?.logCounts[r.id] ?? 0, label: r.label }))
	);

	const SCENARIO = 'dealings_in_the_dark';
	const CHOICE = 'act_2_setup';
	const IMG = '/image/widget/campaign/tsk/dealings-in-the-dark';
	/** Act 2 Setup option value → its layout art. */
	const ART: Record<string, string> = {
		odd: `${IMG}/1357.webp`,
		even: `${IMG}/2468.webp`,
		skull: `${IMG}/skull-1-0.webp`,
		spooky: `${IMG}/cultist-tablet-elder.webp`,
		extreme: `${IMG}/autofail-eldersign.webp`
	};

	// Times the player revealed each Act 2 Setup, across their plays (value → plays).
	const playsByValue = $derived.by(() => {
		const stat = (props.scenarios?.scenarios ?? []).find((s) => s.scenario === SCENARIO);
		const agg = stat?.choices?.find((c) => c.id === CHOICE);
		const counts = new Map<string, number>();
		for (const v of agg?.values ?? []) counts.set(v.value, v.played);
		return counts;
	});

	// The five setups in catalogue order, labels resolved from campaign-data, as lit tiles. The
	// label is the token group that triggers the layout (Arkham markup → glyphs); the tooltip adds
	// the play count.
	const setupTiles = $derived.by((): LitTile[] => {
		const log = getCampaignLog(props.family ?? 'tskc');
		const def = log ? choicesForScenario(log, SCENARIO).find((c) => c.id === CHOICE) : undefined;
		return (def?.options ?? [])
			.filter((o) => ART[o.value])
			.map((o) => {
				const plays = playsByValue.get(o.value) ?? 0;
				return {
					id: o.value,
					image: ART[o.value],
					label: o.label,
					count: plays,
					detail:
						plays > 0
							? m.campaign_tsk_dealings_tip_played({ plays: times(plays) })
							: m.campaign_tsk_dealings_tip_never()
				};
			});
	});
</script>

<div class="flex flex-col gap-3">
	<TskScenarioInfo scenarioId={SCENARIO} {...props}>
		{#snippet extraStats()}
			<!-- How the scenario opened: the deal struck with Ece (three exclusive routes) —
			     grouped with the passport's Succeed/Failed numbers. -->
			{#if eceRow.some((s) => s.value)}
				<StatNumbers rows={[eceRow]} />
			{/if}
		{/snippet}
	</TskScenarioInfo>

	{#if setupTiles.length && !props.logOnly}
		<div>
			<SectionLabel>{m.campaign_tsk_dealings_act2_setup()}</SectionLabel>
			<LitTileGrid tiles={setupTiles} layout="flex" fit="contain" markup />
		</div>
	{/if}
</div>
