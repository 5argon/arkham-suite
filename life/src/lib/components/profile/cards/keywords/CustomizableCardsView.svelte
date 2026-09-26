<!-- @component Every customizable card: its use count, the options decks ticked (with the latest investigator) and the levels reached. -->
<script lang="ts">
	import { CardLine, CardStrip } from '@5argon/arkham-life-ui';
	import { customizableRows } from '$lib/campaign/utils/card-filters';
	import type { CustomizableUsage } from '$lib/profile/profile-types';
	import { HoverTip, HoverTipState } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let {
		customizableUsage,
		classFilter = null
	}: {
		customizableUsage: CustomizableUsage;
		classFilter?: string | null;
	} = $props();

	const rows = $derived(customizableRows(customizableUsage, classFilter));

	const litChip =
		'bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-200 font-semibold';
	const dimChip = 'bg-primary-100/50 dark:bg-primary-800/40 text-primary-400';
	const levelDetail = (decks: number) =>
		decks > 0 ? m.cards_keywords_level_decks({ count: decks }) : m.cards_keywords_level_not_reached();

	const tip = new HoverTipState();
</script>

{#if rows.length}
	<div class="grid grid-cols-1 gap-x-6 gap-y-3 text-sm md:grid-cols-2 xl:grid-cols-3">
		{#each rows as r (r.card.code)}
			<div class="border-primary-100 dark:border-primary-800 flex flex-col gap-1 border-t pt-2">
				<div class="flex items-center justify-between gap-2">
					<CardLine card={r.card} greyedOut={r.total === 0} hideQuantity />
					<span
						class="text-secondary-700 dark:text-secondary-300 inline-block w-10 shrink-0 text-right font-semibold tabular-nums"
					>
						{#if r.total > 0}×{r.total}{:else}<span class="text-primary-300">—</span>{/if}
					</span>
				</div>
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
							onmouseenter={(e) => tip.showText(o.description, e)}
							onmouseleave={tip.hide}
						>
							{o.title}
						</span>
						{#if o.count > 0}
							<div class="flex shrink-0 items-center gap-1">
								{#if o.recent}<CardStrip card={o.recent} />{/if}
								<span
									class="text-secondary-600 dark:text-secondary-400 inline-block w-6 text-right text-xs font-semibold tabular-nums"
									>×{o.count}</span
								>
							</div>
						{/if}
					</div>
				{/each}
				<div class="flex flex-wrap items-center gap-1 pt-0.5">
					<span class="text-primary-400 mr-1 text-[0.65rem] tracking-wide uppercase">
						{m.cards_keywords_levels()}
					</span>
					{#each Array.from({ length: r.maxLevel + 1 }, (_, l) => l) as lvl (lvl)}
						{@const decks = r.levels[lvl] ?? 0}
						<span
							role="img"
							aria-label="L{lvl} — {levelDetail(decks)}"
							class="cursor-default rounded px-1.5 py-0.5 text-xs tabular-nums {decks > 0
								? litChip
								: dimChip}"
							onmouseenter={(e) => tip.showText(levelDetail(decks), e)}
							onmouseleave={tip.hide}
						>
							L{lvl}
						</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<HoverTip {tip} markup />
{/if}
