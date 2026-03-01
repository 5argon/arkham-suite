<!--
@component
TSK — Dealings in the Dark. The shared scenario passport, plus a bespoke Act 2
Setup tableau: the five possible Grand Bazaar token layouts (the revealed chaos
token decides which), shown as art on a white card and lit when the player has
revealed that layout across their plays.
-->
<script lang="ts">
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { HoverTooltip, parseArkhamMarkup } from '@5argon/arkham-life-ui';
	import { choicesForScenario } from '$lib/campaign/scenario-extras';
	import { times } from '$lib/profile/plural';
	import * as m from '$lib/paraglide/messages.js';
	import TskScenarioInfo from '$lib/components/profile/campaigns/campaign/tsk/TskScenarioInfo.svelte';
	import StatNumbers, { type Stat } from '$lib/components/profile/_primitives/StatNumbers.svelte';
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
		const stat = props.scenarioXp.flatMap((c) => c.scenarios).find((s) => s.scenario === SCENARIO);
		const agg = stat?.choices?.find((c) => c.id === CHOICE);
		const m = new Map<string, number>();
		for (const v of agg?.values ?? []) m.set(v.value, v.played);
		return m;
	});

	// The five setups in catalogue order, labels resolved from campaign-data.
	const setups = $derived.by(() => {
		const log = getCampaignLog(props.family ?? 'tskc');
		const def = log ? choicesForScenario(log, SCENARIO).find((c) => c.id === CHOICE) : undefined;
		return (def?.options ?? [])
			.filter((o) => ART[o.value])
			.map((o) => ({
				value: o.value,
				label: o.label,
				img: ART[o.value],
				plays: playsByValue.get(o.value) ?? 0
			}));
	});

	// One shared tooltip for the setup tiles — the layout's token list (e.g. "Cultist,
	// Tablet, Elder Thing"), plus the play count.
	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);
	let tipText = $state('');
	function showTip(s: { label: string; plays: number }, e: MouseEvent) {
		// i18n: s.label is package-sourced (campaign-data choice option)
		tipText =
			s.plays > 0
				? m.campaign_tsk_dealings_tip_played({ label: s.label, plays: times(s.plays) })
				: m.campaign_tsk_dealings_tip_never({ label: s.label });
		tipRef = e.currentTarget as HTMLElement;
		tipVisible = true;
	}
	const hideTip = () => (tipVisible = false);
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

	{#if setups.length && !props.logOnly}
		<div>
			<p class="text-primary-500 mb-1 text-xs font-medium">{m.campaign_tsk_dealings_act2_setup()}</p>
			<div class="flex flex-wrap gap-2">
				{#each setups as s (s.value)}
					<div
						role="img"
						aria-label={s.label}
						class="flex flex-col items-center gap-1"
						onmouseenter={(e) => showTip(s, e)}
						onmouseleave={hideTip}
					>
						<div
							class="bg-primary-100 dark:bg-primary-800 flex h-16 w-16 items-center justify-center rounded border p-1 {s.plays >
							0
								? 'border-secondary-400 shadow'
								: 'border-primary-200 dark:border-primary-700'}"
						>
							<img
								src={s.img}
								alt={s.label}
								class="max-h-full max-w-full object-contain {s.plays > 0
									? ''
									: 'opacity-30 grayscale'}"
								loading="lazy"
							/>
						</div>
						{#if s.plays > 0}
							<span class="text-secondary-600 dark:text-secondary-400 text-[0.6rem] tabular-nums"
								>×{s.plays}</span
							>
						{:else}
							<span class="text-primary-400 text-[0.6rem]">—</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
	<span class="block py-1 text-xs text-neutral-700 dark:text-neutral-200"
		>{@html parseArkhamMarkup(tipText)}</span
	>
</HoverTooltip>
