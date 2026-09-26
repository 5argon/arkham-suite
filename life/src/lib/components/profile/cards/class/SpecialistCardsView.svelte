<!-- @component Specialist cards fielded: the investigators who ran any, and per allowed trait which cards an investigator of that trait ran. -->
<script lang="ts">
	import { CardSquare } from '@5argon/arkham-life-ui';
	import type { Card, CardCode } from '@5argon/arkham-kohaku';
	import { specialistMatrix } from '$lib/campaign/utils/card-filters';
	import { HoverTip, HoverTipState, SectionLabel } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { specialistUsage }: { specialistUsage: Record<CardCode, CardCode[]> } = $props();

	const matrix = $derived(specialistMatrix(specialistUsage));
	const titleCase = (t: string): string => t.charAt(0).toUpperCase() + t.slice(1);

	const tip = new HoverTipState();
</script>

{#snippet square(card: Card, lit: boolean, small = false)}
	<span
		role="img"
		aria-label={card.name}
		class={lit ? '' : 'grayscale'}
		onmouseenter={(e) => tip.showText(card.name, e)}
		onmouseleave={tip.hide}
	>
		<CardSquare {card} greyedOut={!lit} {small} />
	</span>
{/snippet}

{#if matrix.traits.length}
	<div class="flex flex-col gap-4">
		<div>
			<SectionLabel>
				{m.cards_class_specialist_investigators({ used: matrix.used, total: matrix.roster.length })}
			</SectionLabel>
			<div class="flex flex-wrap gap-1.5">
				{#each matrix.roster as inv (inv.card.code)}{@render square(inv.card, inv.lit)}{/each}
			</div>
		</div>

		<div class="grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-2 lg:grid-cols-3">
			{#each matrix.traits as r (r.trait)}
				<div
					class="border-primary-100 dark:border-primary-800/60 flex items-start gap-2 border-b py-1.5"
				>
					<div class="text-primary-700 dark:text-primary-200 w-20 shrink-0 text-sm font-semibold">
						{titleCase(r.trait)}
					</div>
					<div class="flex flex-wrap gap-2">
						{#each r.cards as cc (cc.card.code)}
							<div class="flex flex-col items-center gap-0.5">
								{@render square(cc.card, cc.lit)}
								{#if cc.triggers.length}
									<div class="flex gap-0.5">
										{#each cc.triggers as t (t.code)}{@render square(t, true, true)}{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
	<HoverTip {tip} />
{/if}
