<script lang="ts">
	import { GraphicButton, MarginFull, PageLead, SectionDirection } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { u } from '@5argon/arkham-string';
	import { Campaign, strings } from '@5argon/arkham-kohaku';
	import { campaignBoxImageUrl, campaignColor } from '$lib/mapping/campaign';

	const campaignsToList: Campaign[] = [
		Campaign.NightOfTheZealot,
		Campaign.TheDunwichLegacy,
		Campaign.ThePathToCarcosa,
		Campaign.TheForgottenAge,
		Campaign.TheCircleUndone,
		Campaign.TheDreamQuest,
		Campaign.TheWebOfDreams,
		Campaign.TheInnsmouthConspiracy,
		Campaign.EdgeOfTheEarth,
		Campaign.TheScarletKeys,
		Campaign.TheFeastOfHemlockVale,
		Campaign.TheDrownedCity
	];
</script>

<PageLead title={m.livid_sea_sheep_evoke()} description={m.brief_free_gecko_radiate()}
></PageLead>

<SectionDirection text={m.clear_ornate_hound_lift()}>
	<MarginFull>
		<div class="flex flex-wrap justify-center">
			{#each campaignsToList as campaign, i}
				{@const imageUrl = campaignBoxImageUrl(campaign)}
				{@const accentColor = campaignColor(campaign)}
				{@const linkTo = '/manage/archive/campaign/' + strings.campaignAbbreviation(campaign)}
				<div class="m-1">
					<GraphicButton
						text={u.campaignName(campaign)}
						onClick={linkTo}
						graphic={imageUrl}
						{accentColor}
					/>
				</div>
			{/each}
		</div>
	</MarginFull>
</SectionDirection>
