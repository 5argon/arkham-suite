<script lang="ts">
	import {
		LinkList,
		MarginFull,
		MarginText,
		PageLead,
		SectionSeparator,
		TextParagraph
	} from '@5argon/arkham-life-ui';
	import OpenGraph from '$lib/components/OpenGraph.svelte';

	import UtilityTableOfContents from './UtilityTableOfContents.svelte';
</script>

<OpenGraph
	description="Printable double sided reminders for various situations in mini card format."
	image="image/resource/utility.webp"
	title="Utility Mini-Card"
	url="/utility-mini"
/>

<MarginFull>
	<PageLead title="Utility Mini-Card" />
</MarginFull>

<MarginText>
	<TextParagraph>
		This game generally did great job utilizing everything in the box to represent states on the
		table. Committed cards are there to count the icons after pulling the token. Exhausted cards are
		tapped. Event and treachery can become attachment (to even Act or Agenda) and retain their text
		box to read. Resources are being used as many kind of counters. Clues are sometimes for the
		enemies and doom are sometimes what you want. Chaos tokens gets onto play area with Seal
		mechanics. Even damage and horror tokens are utilized to represent states of the location!
	</TextParagraph>

	<TextParagraph>
		But players do also fill in some lacking area like location connectors and action counters on
		their investigator dashboard. Or even try to bling their game to use different tokens when the
		game asked for you to reuse core set tokens as something else. These are that kind of thing in
		mini-card format. When we could print whatever we want on paper, it gets quite to-the-point what
		it supposed to help compared to using abstract thing like a colored wooden cube.
	</TextParagraph>

	<TextParagraph>
		See this Google Drive link for download, and read the below section for how to use them. <b
			>Warning: Campaign Expansion mini-card could spoil the campaign!</b
		>
	</TextParagraph>

	<LinkList
		items={[
			{
				href: 'https://drive.google.com/drive/folders/1zP98t0MMVMpZaGcyizmKmR7wpFtQaj-t?usp=share_link',
				label: 'Google Drive Link'
			}
		]}
	/>

	<TextParagraph>
		Inside folders : Horizontal mini-card graphics with bleed, and with further white area
		containing cut lines to cut the bleeds out.
	</TextParagraph>

	<TextParagraph>
		_mpc.zip : Still with bleed, but without the white area and cut lines, rotated to vertical
		orientation differently depending on sides. These should be compatible to print on mini-card
		size with MPC.
	</TextParagraph>

	<SectionSeparator title="Table of Contents" />

	<TextParagraph>
		These preview images has lowered resolution for display. Download from Google Drive link above
		to make your mini-cards.
	</TextParagraph>

	<UtilityTableOfContents />
</MarginText>
