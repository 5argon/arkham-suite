<script lang="ts">
	import {
		LinkList,
		MarginFull,
		MarginText,
		PageLead,
		TextParagraph
	} from '@5argon/arkham-life-ui';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import * as m from '$lib/paraglide/messages.js';
</script>

<OpenGraph
	description="Printable cards for the supply mechanic in The Forgotten Age campaign."
	image="image/resource/supply.webp"
	title="The Forgotten Age : Supply Cards"
	url="/supply"
/>

<MarginFull>
	<PageLead title={m.common_supply_title()} />
</MarginFull>

<MarginText>
	<img alt="Asset" src="/image/custom/supply/supply-card-preview.jpg" />

	<TextParagraph>
		You can print and use these cards when "shop scene" in The Forgotten Age campaign occurs.
		Instead of one player having to read out each item's description and their cost, you can just
		laid out these cards and let players pick what they want to get. Plus they can keep the cards
		with them to show off what they have while playing.
	</TextParagraph>

	<TextParagraph>
		They are made using official card's Asset frame with AI generated image. The bleed is enough for
		both mini-card cut and standard card cut when their vertical edge touches the oval frame like a
		normal Asset card.
	</TextParagraph>

	<TextParagraph>
		As for the card's back, I think it is better functionally to have the same content on both back
		and front. But if you want an opaque back, I also have made a special card back from collage of
		recolored official graphics.
	</TextParagraph>

	<LinkList
		items={[
			{
				href: 'https://drive.google.com/drive/folders/1KSZYGBeN61XNlA-wV8rww6Kb_Qa_G3gP?usp=share_link',
				label: 'Google Drive Link'
			}
		]}
	/>
</MarginText>
