<!--
@component
"Core Set Cards Used Once" — the leveled player cards from one core product that
appear in EXACTLY ONE deck across every recorded campaign. A flat list (no class
grouping, no count — they are all 1), sorted by card number. Each row mirrors the
List mode of FlexibleCardDisplay (a CardLine) and adds a left-aligned trailing column
showing the lone use: the investigator's card strip, the campaign's encounter-set
icon, its difficulty, and the finish date.
-->
<script lang="ts">
	import { CardLine, CardStrip } from '@5argon/arkham-life-ui';
	import { ProductIcon } from '@5argon/arkham-icon';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { card as cardUtils, convert, Campaign, type Product } from '@5argon/arkham-kohaku';
	import { getAllCards } from '$lib/card-data';
	import { slugForFamily } from '$lib/campaign/profile-slugs';
	import type { UsedOnceMap } from '$lib/profile/profile-types';
	import * as m from '$lib/paraglide/messages.js';

	let { product, usedOnce }: { product: Product; usedOnce: UsedOnceMap } = $props();

	const byCode = new Map(getAllCards().map((c) => [c.code, c] as const));
	const difficultyLabel: Record<string, string> = {
		easy: m.shared_difficulty({ tier: 'easy' }),
		standard: m.shared_difficulty({ tier: 'standard' }),
		hard: m.shared_difficulty({ tier: 'hard' }),
		expert: m.shared_difficulty({ tier: 'expert' })
	};

	// This product's leveled player cards used in exactly one deck, by card number.
	const cards = $derived(
		getAllCards()
			.filter(
				(c) =>
					c.product === product && cardUtils.deckbuildingPlayerCardsFilter(c) && !!usedOnce[c.code]
			)
			.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
	);

	const CAMPAIGNS = new Set<string>(Object.values(Campaign));
	/** The Product enum that represents this campaign (drives its ProductIcon glyph). */
	function campaignProduct(code: string): Product | null {
		const log = getCampaignLog(code);
		const slug = log ? slugForFamily(log.db.originalId ?? log.db.code) : null;
		if (!slug || !CAMPAIGNS.has(slug)) return null;
		return convert.campaignToProduct(slug as Campaign);
	}
	function formatDate(ms: number | null): string {
		if (ms == null) return '';
		return new Date(ms).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

{#if cards.length}
	<div class="overflow-x-auto">
		<table class="w-full border-collapse">
			<tbody>
				{#each cards as c (c.code)}
					{@const u = usedOnce[c.code]}
					{@const inv = byCode.get(u.investigator)}
					{@const prod = campaignProduct(u.campaignCode)}
					<tr class="border-primary-100 dark:border-primary-800/60 border-b last:border-0">
						<td class="w-px py-1 pr-3"><CardLine card={c} hideQuantity /></td>
						<td class="py-1">
							<div class="flex items-center gap-2 text-xs whitespace-nowrap">
								{#if inv}
									<CardStrip card={inv} />
								{/if}
								{#if prod}
									<span
										class="text-primary-700 dark:text-primary-300 text-2xl leading-none"
										title={u.campaignTitle}
									>
										<ProductIcon product={prod} />
									</span>
								{/if}
								<span class="text-primary-500">{difficultyLabel[u.difficulty] ?? u.difficulty}</span>
								{#if u.finishDate != null}
									<span class="text-primary-400 tabular-nums">{formatDate(u.finishDate)}</span>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="text-primary-400 py-2 text-sm italic">No cards from this set used exactly once.</p>
{/if}
