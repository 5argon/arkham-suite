<!-- @component The moments a campaign gates on a specific investigator, trait or class, lit when triggered, with who triggered them. -->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { CardSquare } from '@5argon/arkham-life-ui';
	import { getCampaignLog, type SpecialInteractionMatch } from '@5argon/arkham-campaign-data';
	import { resolveCards } from '$lib/campaign/utils/card-filters';
	import { capitalizeFirst } from '$lib/campaign/utils/entry-text';
	import type { CampaignSpecialInteractions } from '$lib/campaign/outcomes/special-interactions';
	import HoverTip from '$lib/components/profile/_primitives/HoverTip.svelte';
	import { HoverTipState } from '$lib/components/profile/_primitives/hover-tip.svelte';
	import WidgetEmpty from '$lib/components/profile/_primitives/WidgetEmpty.svelte';

	let { special }: { special: CampaignSpecialInteractions | null } = $props();

	const cardsFor = (codes: readonly string[]) => resolveCards(codes, { dedupeByName: true, cap: 5 });

	function conditionText(match: SpecialInteractionMatch): string {
		if (match.kind === 'code') return cardsFor(match.codes).map((c) => c.name).join(' / ');
		if (match.kind === 'trait') return m.campaign_special_trait({ trait: match.traits.join(' / ') });
		return m.campaign_special_class({
			factions: match.factions.map(capitalizeFirst).join(' / '),
			count: match.factions.length
		});
	}

	// The payload holds only each interaction's state; its condition and text come from campaign-data.
	const cells = $derived.by(() => {
		const log = special ? getCampaignLog(special.family) : undefined;
		if (!special || !log) return [];
		const defs = new Map((log.db.specialInteractions ?? []).map((d) => [d.id, d]));
		const en = log.en.specialInteractions ?? {};
		const scenarioNames = log.en.scenarioNames ?? {};
		return special.interactions
			.map((it) => {
				const def = defs.get(it.id);
				if (!def) return null;
				// Untriggered, a code gate shows its eligible investigators greyed; trait and class gates show none.
				const squares = it.triggered
					? cardsFor(it.triggeredBy)
					: def.match.kind === 'code'
						? cardsFor(def.match.codes)
						: [];
				return {
					id: it.id,
					triggered: it.triggered,
					condition: conditionText(def.match),
					role: def.role,
					why: en[it.id]?.text ?? '',
					scenarioName: scenarioNames[def.scenario] ?? def.scenario,
					squares,
				};
			})
			.filter((c) => c !== null);
	});

	const tip = new HoverTipState();
	const tipText = (cell: { scenarioName: string; why: string }) =>
		cell.why ? `${cell.scenarioName} — ${cell.why}` : cell.scenarioName;
</script>

{#if cells.length}
	<div class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2">
		{#each cells as it (it.id)}
			<div
				role="note"
				onmouseenter={(e) => tip.showText(tipText(it), e)}
				onmouseleave={tip.hide}
				class="flex flex-col gap-1.5 rounded border p-2.5 {it.triggered
					? 'border-secondary-300 dark:border-secondary-700 bg-secondary-50/40 dark:bg-secondary-900/10'
					: 'border-primary-200 dark:border-primary-700'}"
			>
				<div class="flex items-start justify-between gap-2">
					<span
						class="text-sm font-semibold {it.triggered
							? 'text-black dark:text-white'
							: 'text-primary-400'}">{it.condition}</span
					>
					<span
						class="mt-0.5 shrink-0 text-sm {it.triggered
							? 'text-secondary-600 dark:text-secondary-400'
							: 'text-primary-300'}"
						aria-label={it.triggered
							? m.campaign_special_triggered()
							: m.campaign_special_not_triggered()}>{it.triggered ? '✓' : '—'}</span
					>
				</div>
				{#if it.role}
					<span
						class="bg-primary-100 dark:bg-primary-800 text-primary-500 w-fit rounded px-1 py-0.5 text-[0.55rem] font-medium uppercase"
						>{it.role}</span
					>
				{/if}
				{#if it.squares.length}
					<div class="mt-0.5 flex flex-wrap gap-1">
						{#each it.squares as card (card.code)}
							<CardSquare {card} greyedOut={!it.triggered} />
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<WidgetEmpty>{m.campaign_special_empty()}</WidgetEmpty>
{/if}

<HoverTip {tip} />
