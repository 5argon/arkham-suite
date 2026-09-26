<!-- @component A core set's player cards that went into exactly one deck, with that deck's investigator, campaign, difficulty and date. -->
<script lang="ts">
	import { CardStrip } from '@5argon/arkham-life-ui';
	import { ProductIcon } from '@5argon/arkham-icon';
	import { getCampaignLog } from '@5argon/arkham-campaign-data';
	import { card as cardUtils, convert, Campaign, type Product } from '@5argon/arkham-kohaku';
	import { cardByCode, getAllCards } from '$lib/card-data';
	import { slugForFamily } from '$lib/campaign/profile/profile-slugs';
	import { familyOf } from '$lib/campaign/records/campaign-family';
	import { difficultyLabel } from '$lib/campaign/utils/difficulty';
	import type { UsedOnceEntry, UsedOnceMap } from '$lib/profile/profile-types';
	import {
		CardLineList,
		FinishDate,
		HoverTip,
		HoverTipState,
		WidgetEmpty
	} from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { product, usedOnce }: { product: Product; usedOnce: UsedOnceMap } = $props();

	const items = $derived(
		getAllCards()
			.filter(
				(c) =>
					c.product === product && cardUtils.deckbuildingPlayerCardsFilter(c) && !!usedOnce[c.code]
			)
			.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
			.map((c) => ({ code: c.code, use: usedOnce[c.code] }))
	);

	const CAMPAIGNS = new Set<string>(Object.values(Campaign));
	/** The product whose icon stands for the campaign. */
	function campaignProduct(code: string): Product | null {
		const log = getCampaignLog(code);
		const slug = log ? slugForFamily(familyOf(log)) : null;
		if (!slug || !CAMPAIGNS.has(slug)) return null;
		return convert.campaignToProduct(slug as Campaign);
	}

	const tip = new HoverTipState();
</script>

{#snippet lone(u: UsedOnceEntry)}
	{@const inv = cardByCode(u.investigator)}
	{@const prod = campaignProduct(u.campaignCode)}
	<div class="flex items-center gap-2">
		{#if inv}<CardStrip card={inv} />{/if}
		{#if prod}
			<span
				role="img"
				aria-label={u.campaignTitle}
				class="text-primary-700 dark:text-primary-300 text-2xl leading-none"
				onmouseenter={(e) => tip.showText(u.campaignTitle, e)}
				onmouseleave={tip.hide}
			>
				<ProductIcon product={prod} />
			</span>
		{/if}
		<span class="text-primary-500">{difficultyLabel(u.difficulty)}</span>
		{#if u.finishDate != null}<FinishDate ms={u.finishDate} />{/if}
	</div>
{/snippet}

{#if items.length}
	<div class="overflow-x-auto">
		<CardLineList {items} key={(it) => it.code}>
			{#snippet trailing(it)}{@render lone(it.use)}{/snippet}
		</CardLineList>
	</div>
	<HoverTip {tip} />
{:else}
	<WidgetEmpty>{m.cards_core_used_once_empty()}</WidgetEmpty>
{/if}
