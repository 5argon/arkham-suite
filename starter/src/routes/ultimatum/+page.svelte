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
	description="Print out each Refractions as an individual card so you can store with the campaign or scenario they apply to."
	image="image/resource/ultimatum.webp"
	title="Ultimatums and Boons : Refraction Cards"
	url="/ultimatum"
/>

<MarginFull>
	<PageLead title={m.common_ultimatum_title()} />
</MarginFull>

<MarginText>
	<img alt="Asset" src="/image/resource/ultimatum.webp" />

	<TextParagraph>
		The <a
			href="https://www.fantasyflightgames.com/en/news/2024/10/23/questions-and-ultimatums/"
			target="_blank">FAQ version 2.3 ("The Midwinter Gala Edition")</a
		> comes with explanation about Ultimatums and Boons which are essentially optional buffs and nerfs
		that are officially defined. So when you found the game too easy or too hard, you can apply some designer-guided
		adjustments.
	</TextParagraph>

	<TextParagraph>
		Refractions are scenario or campaign specific version of Ultimatums and Boons. It is a bit
		inconvenient to consult FAQ every time to check what are available to toggle on-off before you
		begin the campaign or scenario. Many of them also constantly modify scenario cards from what
		they are physically printed, so digital Refractions require players to remember the changes.
	</TextParagraph>

	<TextParagraph>
		At this point you might see where I'm going now. I made these cards so they can be stored in the
		same box as the scenario or campaign. You probably forget what Refractions are available for a
		particular campaign if you have not played it for some time. Now they are already waiting in the
		box.
	</TextParagraph>

	<TextParagraph>
		The modifications that the Ultimatums and Boons perform are also more visible in a form of
		individual card to prevent misplays, just like those back-of-Act/Agenda effects staying on the
		table to be used as a reminder. As an individual card, you can point to "that" Ultimatum or pass
		it around without recalling the name. You can shuffle them to randomize. You want to break the
		rule and give the Boon card to only one player having trouble. Maybe you are making online
		content and want viewers to look graphic instead of a FAQ entry when talking about what
		Ultimatums you choose. I said all that reasons, but maybe you simply want more blings...
	</TextParagraph>

	<TextParagraph>
		Graphic includes bleed area. See the preview image above how much to cut out. (The throwing
		stars thing should be at around the edge.) They are color coded according to whether they are
		Ultimatums or Boons. Some printing system supports only standard size card (MTG size), but AHLCG
		cards are a little bit narrower. With large bleed available you can cut out as much as you want
		to suit how your print shop works.
	</TextParagraph>

	<LinkList
		items={[
			{
				href: 'https://drive.google.com/drive/folders/1Q8E-2x_ggq6ARe_3seBjZvx2SvI0d7b5?usp=share_link',
				label: 'Google Drive Link : Physical Ultimatums and Boons.'
			}
		]}
	/>

	<TextParagraph>
		These are printer-ready files in A4 size. Downside is that I packed in all the cards you may not
		want, but they do make exactly 4 sheets of A4 currently. Margin is rather small but if your
		printer can't handle this, you still have a bit of bleed for the printer to eats into before
		getting to the actual card. (Though you will lose the cut guide, in that case you can edit the
		image so cut lines are drawn across the sheet.)
	</TextParagraph>

	<LinkList
		items={[
			{
				href: 'https://drive.google.com/drive/folders/1_2ow5-Y8FZ9Hh6oXw_8gollPyqH9Cc4E?usp=share_link',
				label: 'Google Drive Link : Physical Ultimatums and Boons. (A4, 4 sheets, 9 cards each.)'
			}
		]}
	/>

	<TextParagraph>
		These are no bleed version, cut to MTG card aspect ratio. Intended for digital content creation.
	</TextParagraph>

	<LinkList
		items={[
			{
				href: 'https://drive.google.com/drive/folders/1UKVQ3W6XLZrzEquTBPHxSaDeS-5tmIY3?usp=share_link',
				label: 'Google Drive Link : Physical Ultimatums and Boons. (No Bleed, MTG Size)'
			}
		]}
	/>

	<TextParagraph>
		The FAQ also talked about making your own Ultimatums and Boons. I also exported some empty card
		frames for that as well if you want to materialize your personal Ultimatums and Boons.
	</TextParagraph>

	<LinkList
		items={[
			{
				href: 'https://drive.google.com/drive/folders/1cKXBoP57kk7VkkYDc5ZPx5PlpsN1xSEk?usp=share_link',
				label: 'Google Drive Link : Empty Physical Ultimatum and Boon Frames.'
			}
		]}
	/>
</MarginText>

<style>
	img {
		max-width: 500px;
	}
</style>
