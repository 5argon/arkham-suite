<script>
	import { InnerHeading, ThumbnailCardButton } from '@5argon/arkham-life-ui';
</script>

<InnerHeading title="Reference Materials"></InnerHeading>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
	<ThumbnailCardButton
		description="View cards inside a particular product to help with purchasing decisions."
		imageUrl="image/resource/player.webp"
		onClick="/player"
		title="Player Cards"
	/>
	<ThumbnailCardButton
		description="Encounter set overviews, and quick setup references for each scenario."
		imageUrl="image/resource/campaign.webp"
		onClick="/campaign"
		title="Campaign References"
	/>
	<ThumbnailCardButton
		description="Conjure any card by name and line them up on this virtual table. Click on a card to view it in detail."
		imageUrl="image/resource/card.webp"
		onClick="/tool/card"
		title="Card Table"
	/>
</div>

<InnerHeading title="Deckbuilding Tools" />
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
	<ThumbnailCardButton
		description="Query eligible investigators that could run combo cards you are interested in together in their deck."
		imageUrl="image/resource/who.webp"
		onClick="/tool/who"
		title="Who Can Use"
	/>
	<ThumbnailCardButton
		description="Plan out how you progress your deck throughout the campaign with automatic XP calculations in each step. "
		imageUrl="image/resource/upgrade.webp"
		onClick="/tool/upgrade"
		title="Upgrade Planner"
	/>
	<ThumbnailCardButton
		description="View decks from arkhamdb.com or arkham.build with this site's UI."
		imageUrl="image/resource/deck.webp"
		onClick="/deck/view"
		title="Deck Viewer"
	/>
	<ThumbnailCardButton
		description="Generate HTML code for card thumbnail tables."
		imageUrl="image/resource/thumbnails.webp"
		onClick="/tool/thumbnails"
		title="Card Thumbnails"
	/>
	<ThumbnailCardButton
		description="Take a look at an overview of all the usable cards when playing with limited card pool."
		imageUrl="image/resource/limited.webp"
		onClick="/tool/limited"
		title="Limited Pool Explorer"
	/>
	<ThumbnailCardButton
		description="Modern web-based deckbuilder. Just want to spread the word in case you haven't heard of it."
		imageUrl="image/resource/arkhambuild.webp"
		onClick="https://arkham.build"
		title="arkham.build"
	/>
</div>

<InnerHeading title="Play Group Tools" />
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
	<ThumbnailCardButton
		description="Collect all required cards of multiple decks into one freely sortable list."
		imageUrl="image/resource/gather.webp"
		onClick="/tool/gather"
		title="Deck Gather"
	/>
	<ThumbnailCardButton
		description="Identify common cards used between two campaigns. This might help moving cards around while running concurrent campaigns."
		imageUrl="image/resource/campaign-overlaps.webp"
		onClick="/tool/campaign-overlaps"
		title="Campaign Overlaps"
	/>
	<ThumbnailCardButton
		description="Import as many decks as you want, then view all possible 2, 3, or 4 player combinations sorted by the fewest overlaps."
		imageUrl="image/resource/assembler.webp"
		onClick="/tool/assembler"
		title="Team Assembler"
	/>
</div>

<InnerHeading title="Physical Customs" />
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
	<ThumbnailCardButton
		description="Minimal-style dividers that are only 3mm wider than the cards. It has many unique quirks such as fitting in the new campaign box, supporting both orientations in one design, sleevable, and available in multiple languages."
		imageUrl="image/resource/divider.webp"
		onClick="/divider"
		title="The 3mm Divider"
	/>
	<ThumbnailCardButton
		description="Apply changes from official errata in a per-card basis by sliding a new card under it."
		imageUrl="image/resource/errata.webp"
		onClick="/errata"
		title="Errata Patch Cards"
	/>
	<ThumbnailCardButton
		description="Printable double sided reminders for various situations in mini card format."
		imageUrl="image/resource/utility.webp"
		onClick="/utility-mini"
		title="Utility Mini-Card"
	/>
	<ThumbnailCardButton
		description="Print out each Refractions as an individual card so you can store with the campaign or scenario they apply to."
		imageUrl="image/resource/ultimatum.webp"
		onClick="/ultimatum"
		title="Ultimatums and Boons : Refraction Cards"
	/>
	<ThumbnailCardButton
		description="Photocopier-friendly frame graphics that you can fill in the blank to make a proxy card."
		imageUrl="image/resource/proxy.webp"
		onClick="/proxy"
		title="Proxy Template"
	/>
</div>

<InnerHeading title="Campaign-Specific Customs" />
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
	<ThumbnailCardButton
		description=""
		imageUrl="image/resource/supply.webp"
		onClick="/supply"
		title="The Forgotten Age : Supply Cards"
	/>
	<ThumbnailCardButton
		description=""
		imageUrl="image/resource/eote.webp"
		onClick="/eote"
		title="Edge of the Earth : Prologue Scene"
	/>
	<ThumbnailCardButton
		description=""
		imageUrl="image/resource/tskdoc.webp"
		onClick="/tsk-document"
		title="The Scarlet Keys : Printable Documents"
	/>
</div>
