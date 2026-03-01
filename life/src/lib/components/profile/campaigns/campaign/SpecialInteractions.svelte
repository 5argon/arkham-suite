<!--
@component
Special Interactions — the roster-gated flavor moments a campaign hides (a specific
investigator, trait, or class triggers a bonus paragraph or setup role). Rendered as
a compact, reflowing grid of ~220px cards: each shows the gating condition, lit when
the player has triggered it across their runs, and credits the investigators who
satisfied it (most-recent first, capped) as CardSquares. The scenario + the "why"
blurb are on a hover tooltip.

The payload carries only keys + state (`id`, `triggered`, `triggeredBy`); the display
strings (why, scenario name) and the condition (`match`/`role`) are resolved here from
the campaign-data package by `(family, id)` — the lean/localizable contract the EotE
and achievement widgets follow, so a compiled/shared profile stays small.

Choice-gated, unrecorded moments (the Dream-Eaters' dreams) are absent — they can't
be derived without input the archive doesn't collect.
-->
<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { CardSquare, HoverTooltip } from '@5argon/arkham-life-ui';
	import { getCampaignLog, type SpecialInteractionMatch } from '@5argon/arkham-campaign-data';
	import type { Card } from '@5argon/arkham-kohaku';
	import { getAllCards } from '$lib/card-data';
	import type { CampaignSpecialInteractions } from '$lib/campaign/special-interactions';

	let { special }: { special: CampaignSpecialInteractions | null } = $props();

	const cardByCode = (() => {
		const m = new Map<string, Card>();
		for (const c of getAllCards()) if (!m.has(c.code)) m.set(c.code, c);
		return m;
	})();
	const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

	/** Resolve codes → distinct investigator cards (dedup by name), capped at 5. */
	function cardsFor(codes: readonly string[]): Card[] {
		const out: Card[] = [];
		const names = new Set<string>();
		for (const code of codes) {
			const card = cardByCode.get(code);
			if (!card || names.has(card.name)) continue;
			names.add(card.name);
			out.push(card);
			if (out.length >= 5) break;
		}
		return out;
	}

	/** Human-readable gating condition shown on the card. */
	function conditionText(match: SpecialInteractionMatch): string {
		if (match.kind === 'code') return cardsFor(match.codes).map((c) => c.name).join(' / ');
		if (match.kind === 'trait') return m.campaign_special_trait({ trait: match.traits.join(' / ') });
		return m.campaign_special_class({
			factions: match.factions.map(cap).join(' / '),
			count: match.factions.length
		});
	}

	// Join the payload's per-interaction state with the package's def + English,
	// resolved by id. Order follows the package catalogue.
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
				// Squares: who triggered it (lit), else the eligible code-gated investigators
				// (greyed). Trait/class gates show nothing when untriggered.
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

	// One shared tooltip — "<scenario> — <why>" — for every card.
	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);
	let tipText = $state('');
	function showTip(cell: { scenarioName: string; why: string }, e: MouseEvent) {
		tipText = cell.why ? `${cell.scenarioName} — ${cell.why}` : cell.scenarioName;
		tipRef = e.currentTarget as HTMLElement;
		tipVisible = true;
	}
	const hideTip = () => (tipVisible = false);
</script>

{#if cells.length}
	<div class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2">
		{#each cells as it (it.id)}
			<div
				role="note"
				onmouseenter={(e) => showTip(it, e)}
				onmouseleave={hideTip}
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
	<p class="text-primary-500 text-sm">{m.campaign_special_empty()}</p>
{/if}

<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
	<span class="block py-1 text-xs text-neutral-700 dark:text-neutral-200">{tipText}</span>
</HoverTooltip>
