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
	description="Apply changes from official errata in a per-card basis by sliding a new card under it."
	image="image/resource/errata.webp"
	title="Errata Patch Cards"
	url="/errata"
/>

<MarginFull>
	<PageLead title={m.common_errata_title()} />
</MarginFull>

<MarginText>
	<img alt="Asset" src="/image/custom/errata/patch-1.jpg" />

	<img alt="Asset" src="/image/custom/errata/patch-2.jpg" />

	<TextParagraph>
		Apply a "patch" to your copy of Campaign Expansion that was printed before a certain errata
		version by sliding these cards under. The original card is placed on the empty space.
	</TextParagraph>

	<TextParagraph>
		Your copy may already have a certain errata version applied, you should check and selectively
		choose just versions newer than that.
	</TextParagraph>

	<TextParagraph>
		Orientation of these cards are depending on card type which it patches. Back side graphic is
		also available, which it say just the target card in big font.
	</TextParagraph>

	<TextParagraph>
		<b>New!</b> : This project is available on
		<a href="https://mpc.north101.co.uk/projects/" target="_blank">Inexorable Fate</a> to generate
		your own copy of
		<a href="http://makeplayingcards.com/" target="_blank">MPC (Make Playing Cards)</a> project to order
		prints from them.
	</TextParagraph>

	<LinkList
		items={[
			{
				href: 'https://drive.google.com/drive/folders/1F8-_jYU7ShWN0PphUSBewUXQVtdzYIaz?usp=share_link',
				label: 'Google Drive Link'
			}
		]}
	/>
</MarginText>
