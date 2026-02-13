<script lang="ts">
	import { GraphicButton, SectionSeparator, TextParagraph } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import {
		Campaign,
		chapterOneCampaigns,
		chapterOneReturnToCampaigns,
		color,
		convert,
		strings
	} from '@5argon/arkham-kohaku';
	import { u } from '@5argon/arkham-string';
	import { ProductIcon } from '@5argon/arkham-icon';
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	function campaignToLink(campaign: Campaign): string {
		return '/campaign/' + strings.campaignAbbreviation(campaign);
	}

	function getCampaignImage(campaign: Campaign): string {
		return `/image/expansion/campaign/${campaign}.webp`;
	}

	function campaignToColor(campaign: Campaign): color.ColorPalette {
		const product = convert.campaignToProduct(campaign);
		return color.productToColors(product);
	}
</script>

<SectionSeparator title={m.campaign_chapter_one()} />

<div class="flex gap-1">
	{#each chapterOneCampaigns as campaign (campaign)}
		{#if campaign !== Campaign.TheFeastOfHemlockVale && campaign !== Campaign.TheDrownedCity}
			<div in:slide|global={{ duration: 200, easing: quintOut }}>
				<GraphicButton
					text={u.campaignName(campaign)}
					graphic={getCampaignImage(campaign)}
					accentColor={color.getColor(campaignToColor(campaign), 950, false)}
					small
					onClick={campaignToLink(campaign)}
				>
					<ProductIcon product={convert.campaignToProduct(campaign)} />
				</GraphicButton>
			</div>
		{/if}
	{/each}
</div>

<div class="flex gap-1 pt-4">
	{#each chapterOneReturnToCampaigns as campaign (campaign)}
		<div in:slide|global={{ duration: 200, delay: 100, easing: quintOut }}>
			<GraphicButton
				text={u.campaignName(campaign)}
				graphic={getCampaignImage(campaign)}
				accentColor={color.getColor(campaignToColor(campaign), 950, false)}
				small
				onClick={campaignToLink(campaign)}
			>
				<ProductIcon product={convert.campaignToProduct(campaign)} />
			</GraphicButton>
		</div>
	{/each}
</div>

<SectionSeparator title={m.campaign_chapter_two()} />

<TextParagraph>Coming Soon...</TextParagraph>

<style>
	.flex {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		margin: 8px 0px;
	}
</style>
