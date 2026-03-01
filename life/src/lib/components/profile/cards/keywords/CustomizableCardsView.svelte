<!--
@component
"Customizable Cards" — every customizable card in the game (greyed when never run), laid
out as a responsive grid of compact blocks (1 / 2 / 3 per row). Each block:
  • the card (CardLine) with its overall use count;
  • one row per named option (xp-0 "choose …" starters omitted) — its required boxes +
    title (hover for effect); a used option lights up with the most-recent investigator
    who used it (right-aligned) and its own smaller use count;
  • a final row of level chips (L0…max, level = ⌈boxes ÷ 2⌉ capped at 5), lit when a deck
    reached that level (hover for how many). L0 = ran it un-customized.
Card data + the deck-derived `customizableUsage` (parsed from deck meta).
-->
<script lang="ts">
	import { CardLine, CardStrip, HoverTooltip, parseArkhamMarkup } from '@5argon/arkham-life-ui';
	import type { Card, CardCode } from '@5argon/arkham-kohaku';
	import { getAllCards } from '$lib/card-data';
	import { inCardClass, isCustomizable } from '$lib/campaign/card-filters';
	import type { CustomizableUsage } from '$lib/profile/profile-types';

	let {
		customizableUsage,
		classFilter = null
	}: {
		customizableUsage: CustomizableUsage;
		/** When set (class-detail page), narrow to one card class. */
		classFilter?: string | null;
	} = $props();

	const byCode = new Map(getAllCards().map((c) => [c.code, c] as const));

	interface Opt {
		title: string;
		description: string;
		/** Required boxes to activate (rendered as that many empty boxes). */
		boxes: number;
		count: number;
		recent: CardCode[];
	}
	interface Row {
		card: Card;
		used: boolean;
		total: number;
		options: Opt[];
		levels: Record<string, number>;
		maxLevel: number;
	}
	const rows = $derived.by((): Row[] => {
		const out: Row[] = [];
		for (const card of getAllCards()) {
			if (!isCustomizable(card) || !card.customizationOptions) continue;
			if (classFilter && !inCardClass(card, classFilter)) continue;
			const usage = customizableUsage[card.code];
			const options: Opt[] = [];
			card.customizationOptions.forEach((opt, idx) => {
				// Skip the xp-0 "choose …" starting options — they have no named upgrade.
				if (!opt.text?.title) return;
				const o = usage?.options[String(idx)];
				options.push({
					title: opt.text.title,
					description: opt.text.description ?? '',
					boxes: opt.xp ?? 0,
					count: o?.count ?? 0,
					recent: o?.recent ?? []
				});
			});
			const totalBoxes = card.customizationOptions.reduce((n, o) => n + (o.xp ?? 0), 0);
			const total = Object.values(usage?.levels ?? {}).reduce((n, x) => n + x, 0);
			out.push({
				card,
				used: total > 0,
				total,
				options,
				levels: usage?.levels ?? {},
				// The game caps ticking at 10 boxes, so the level tops out at ⌈10/2⌉ = 5.
				maxLevel: Math.ceil(Math.min(totalBoxes, 10) / 2)
			});
		}
		// By set then card number (zero-padded code), used cards lit, unused greyed.
		return out.sort((a, b) => a.card.code.localeCompare(b.card.code));
	});

	const litChip =
		'bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-200 font-semibold';
	const dimChip = 'bg-primary-100/50 dark:bg-primary-800/40 text-primary-400';

	// Shared hover for an option's effect text.
	let tipVisible = $state(false);
	let tipRef = $state<HTMLElement | null>(null);
	let tipText = $state('');
	function showTip(text: string, e: MouseEvent) {
		tipText = text;
		tipRef = e.currentTarget as HTMLElement;
		tipVisible = true;
	}
</script>

{#if rows.length}
	<div class="grid grid-cols-1 gap-x-6 gap-y-3 text-sm md:grid-cols-2 xl:grid-cols-3">
		{#each rows as r (r.card.code)}
			<div class="border-primary-100 dark:border-primary-800 flex flex-col gap-1 border-t pt-2">
				<!-- Card + overall use count -->
				<div class="flex items-center justify-between gap-2">
					<CardLine card={r.card} greyedOut={!r.used} hideQuantity />
					<span
						class="text-secondary-700 dark:text-secondary-300 inline-block w-10 shrink-0 text-right font-semibold tabular-nums"
					>
						{#if r.total > 0}×{r.total}{:else}<span class="text-primary-300">—</span>{/if}
					</span>
				</div>
				<!-- One row per named option -->
				{#each r.options as o, i (i)}
					<div class="flex items-center gap-2">
						<span class="text-primary-300 flex w-9 shrink-0 items-center tracking-tighter">
							{'□'.repeat(o.boxes)}
						</span>
						<span
							role="note"
							aria-label="{o.title}{o.description ? ` — ${o.description}` : ''}"
							class="min-w-0 flex-1 cursor-default truncate {o.count > 0
								? 'font-semibold text-black dark:text-white'
								: 'text-primary-400'}"
							onmouseenter={(e) => o.description && showTip(o.description, e)}
							onmouseleave={() => (tipVisible = false)}
						>
							{o.title}
						</span>
						{#if o.count > 0}
							<div class="flex shrink-0 items-center gap-1">
								{#each o.recent.slice(0, 1) as inv (inv)}
									{#if byCode.get(inv)}
										<CardStrip card={byCode.get(inv)!} />
									{/if}
								{/each}
								<span
									class="text-secondary-600 dark:text-secondary-400 inline-block w-6 text-right text-xs font-semibold tabular-nums"
									>×{o.count}</span
								>
							</div>
						{/if}
					</div>
				{/each}
				<!-- Levels -->
				<div class="flex flex-wrap items-center gap-1 pt-0.5">
					<span class="text-primary-400 mr-1 text-[0.65rem] tracking-wide uppercase">Levels</span>
					{#each Array.from({ length: r.maxLevel + 1 }, (_, l) => l) as lvl (lvl)}
						{@const times = r.levels[lvl] ?? 0}
						<span
							class="rounded px-1.5 py-0.5 text-xs tabular-nums {times > 0 ? litChip : dimChip}"
							title={times > 0 ? `${times} deck${times > 1 ? 's' : ''}` : 'Not reached'}
						>
							L{lvl}
						</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<HoverTooltip visible={tipVisible} referenceElement={tipRef}>
		<span class="block max-w-xs py-1 text-xs text-neutral-700 dark:text-neutral-200"
			>{@html parseArkhamMarkup(tipText)}</span
		>
	</HoverTooltip>
{/if}
