<script lang="ts">
	import { InnerHeading, TextParagraph, ThumbnailCardButton } from '@5argon/arkham-life-ui';
	import type { Snippet } from 'svelte';

	import * as m from '$lib/paraglide/messages.js';

	interface Prop {
		/**
		 * Shown between the starter contents and the reference materials.
		 */
		afterStarterContents?: Snippet;
	}
	const { afterStarterContents }: Prop = $props();
</script>

<InnerHeading title={m.resource_heading_starter_contents()}></InnerHeading>

<TextParagraph>{m.resource_intro()}</TextParagraph>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
	<ThumbnailCardButton
		description={m.resource_starter_decks_description()}
		imageUrl="image/resource/starter.webp"
		onClick="/starter"
		title={m.resource_starter_decks_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_pre_built_teams_description()}
		imageUrl="image/resource/team.webp"
		onClick="/team"
		title={m.resource_pre_built_teams_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_team_builder_description()}
		imageUrl="image/resource/evergreen.webp"
		onClick="/tool/team-builder"
		title={m.resource_team_builder_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_card_reviews_description()}
		imageUrl="image/resource/review.webp"
		onClick="/review"
		title={m.resource_card_reviews_title()}
	/>
</div>

{@render afterStarterContents?.()}

<InnerHeading title={m.resource_heading_reference_materials()}></InnerHeading>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
	<ThumbnailCardButton
		description={m.resource_player_cards_description()}
		imageUrl="image/resource/player.webp"
		onClick="/player"
		title={m.resource_player_cards_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_campaign_references_description()}
		imageUrl="image/resource/campaign.webp"
		onClick="/campaign"
		title={m.resource_campaign_references_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_card_table_description()}
		imageUrl="image/resource/card.webp"
		onClick="/tool/card"
		title={m.resource_card_table_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_ultimatums_and_boons_description()}
		imageUrl="image/resource/ultimatum.webp"
		onClick="/ultimatums-and-boons"
		title={m.resource_ultimatums_and_boons_title()}
	/>
</div>

<InnerHeading title={m.resource_heading_deckbuilding_tools()} />
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
	<ThumbnailCardButton
		description={m.resource_who_can_use_description()}
		imageUrl="image/resource/who.webp"
		onClick="/tool/who"
		title={m.resource_who_can_use_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_upgrade_planner_description()}
		imageUrl="image/resource/upgrade.webp"
		onClick="/tool/upgrade"
		title={m.resource_upgrade_planner_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_deck_viewer_description()}
		imageUrl="image/resource/deck.webp"
		onClick="/deck/view"
		title={m.resource_deck_viewer_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_card_thumbnails_description()}
		imageUrl="image/resource/thumbnails.webp"
		onClick="/tool/thumbnails"
		title={m.resource_card_thumbnails_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_limited_pool_explorer_description()}
		imageUrl="image/resource/limited.webp"
		onClick="/tool/limited"
		title={m.resource_limited_pool_explorer_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_arkham_build_description()}
		imageUrl="image/resource/arkhambuild.webp"
		onClick="https://arkham.build"
		title={m.resource_arkham_build_title()}
	/>
</div>

<InnerHeading title={m.resource_heading_play_group_tools()} />
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
	<ThumbnailCardButton
		description={m.resource_deck_gather_description()}
		imageUrl="image/resource/gather.webp"
		onClick="/tool/gather"
		title={m.resource_deck_gather_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_campaign_overlaps_description()}
		imageUrl="image/resource/campaign-overlaps.webp"
		onClick="/tool/campaign-overlaps"
		title={m.resource_campaign_overlaps_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_team_assembler_description()}
		imageUrl="image/resource/assembler.webp"
		onClick="/tool/assembler"
		title={m.resource_team_assembler_title()}
	/>
</div>

<InnerHeading title={m.resource_heading_physical_customs()} />
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
	<ThumbnailCardButton
		description={m.resource_the_3mm_divider_description()}
		imageUrl="image/resource/divider.webp"
		onClick="/divider"
		title={m.resource_the_3mm_divider_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_errata_patch_cards_description()}
		imageUrl="image/resource/errata.webp"
		onClick="/errata"
		title={m.resource_errata_patch_cards_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_utility_mini_card_description()}
		imageUrl="image/resource/utility.webp"
		onClick="/utility-mini"
		title={m.resource_utility_mini_card_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_proxy_template_description()}
		imageUrl="image/resource/proxy.webp"
		onClick="/proxy"
		title={m.resource_proxy_template_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_inexorable_fate_description()}
		imageUrl="image/resource/inexorable-fate.webp"
		onClick="https://inexorablefate.com"
		title={m.resource_inexorable_fate_title()}
	/>
</div>

<InnerHeading title={m.resource_heading_campaign_specific_customs()} />
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
	<ThumbnailCardButton
		description=""
		imageUrl="image/resource/supply.webp"
		onClick="/supply"
		title={m.resource_the_forgotten_age_supply_cards_title()}
	/>
	<ThumbnailCardButton
		description=""
		imageUrl="image/resource/eote.webp"
		onClick="/eote"
		title={m.resource_edge_of_the_earth_prologue_scene_title()}
	/>
	<ThumbnailCardButton
		description=""
		imageUrl="image/resource/tskdoc.webp"
		onClick="/tsk-document"
		title={m.resource_the_scarlet_keys_printable_documents_title()}
	/>
	<ThumbnailCardButton
		description={m.resource_the_scarlet_keys_route_solver_description()}
		imageUrl="image/resource/tskdoc.webp"
		onClick="/tool/tsk"
		title={m.resource_the_scarlet_keys_route_solver_title()}
	/>
</div>
