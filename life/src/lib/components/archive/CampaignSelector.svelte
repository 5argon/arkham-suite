<!--
@component
Reusable campaign selector grid.
Displays an "Unspecified" button followed by three campaign sections
(Chapter One, Return To, Chapter Two). Calls `onSelect` immediately on click.
Optionally highlights the currently selected campaign.
-->
<script lang="ts">
	import {
		Button,
		FaIconType,
		GraphicButton,
		SectionSeparator,
	} from '@5argon/arkham-life-ui';
	import {
		type Campaign,
		chapterOneCampaigns,
		chapterOneReturnToCampaigns,
		chapterTwoSmallCampaigns,
		color,
		convert,
	} from '@5argon/arkham-kohaku';
	import { ProductIcon } from '@5argon/arkham-icon';
	import { u } from '@5argon/arkham-string';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		/** Currently selected campaign, or `null` for unspecified. */
		selected?: Campaign | null;
		/** Called immediately when the user clicks a campaign or "Unspecified". */
		onSelect: (campaign: Campaign | null) => void;
	}

	const { selected = undefined, onSelect }: Props = $props();

	function getCampaignImage(campaign: Campaign): string {
		return `/image/expansion/campaign/${campaign}.webp`;
	}

	function campaignToAccentColor(campaign: Campaign): string {
		const product = convert.campaignToProduct(campaign);
		const palette = color.productToColors(product);
		return color.getColor(palette, 950, false);
	}
</script>

<div>
	<!-- Unspecified option -->
	<div class="mb-4">
		<Button
			label={m.archive_campaign_unspecified()}
			icon={FaIconType.NoticeInfo}
			highlighted={selected === null}
			onClick={() => onSelect(null)}
		/>
	</div>

	<SectionSeparator title={m.archive_chapter_one()} />
	<div class="campaign-grid">
		{#each chapterOneCampaigns as campaign (campaign)}
			<GraphicButton
				text={u.campaignName(campaign)}
				graphic={getCampaignImage(campaign)}
				accentColor={campaignToAccentColor(campaign)}
				small
				active={selected === campaign ? true : undefined}
				onClick={() => onSelect(campaign)}
			>
				<ProductIcon product={convert.campaignToProduct(campaign)} />
			</GraphicButton>
		{/each}
	</div>

	<SectionSeparator title={m.archive_chapter_one_return()} />
	<div class="campaign-grid">
		{#each chapterOneReturnToCampaigns as campaign (campaign)}
			<GraphicButton
				text={u.campaignName(campaign)}
				graphic={getCampaignImage(campaign)}
				accentColor={campaignToAccentColor(campaign)}
				small
				active={selected === campaign ? true : undefined}
				onClick={() => onSelect(campaign)}
			>
				<ProductIcon product={convert.campaignToProduct(campaign)} />
			</GraphicButton>
		{/each}
	</div>

	<SectionSeparator title={m.archive_chapter_two()} />
	<div class="campaign-grid">
		{#each chapterTwoSmallCampaigns as campaign (campaign)}
			<GraphicButton
				text={u.campaignName(campaign)}
				graphic={getCampaignImage(campaign)}
				accentColor={campaignToAccentColor(campaign)}
				small
				active={selected === campaign ? true : undefined}
				onClick={() => onSelect(campaign)}
			>
				<ProductIcon product={convert.campaignToProduct(campaign)} />
			</GraphicButton>
		{/each}
	</div>
</div>

<style>
	.campaign-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 4px;
		margin: 8px 0;
	}
</style>
