<script lang="ts">
	import {
		MarginFull,
		MarginText,
		PageLead,
		SectionSeparator,
		TextParagraph
	} from '@5argon/arkham-life-ui';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import * as m from '$lib/paraglide/messages.js';
</script>

<OpenGraph
	description="View expedition member cards online during the Edge of the Earth prologue."
	image="image/resource/eote.webp"
	title="Edge of the Earth : Prologue Scene"
	url="/eote"
/>

<MarginFull>
	<PageLead title={m.common_eote_title()} />
</MarginFull>

<MarginText>
	<TextParagraph>
		In the Prologue of Edge of the Earth, the campaign guide asks you to introduce expedition
		members by showing their card as you read to your group. However the length of that prologue
		might be time prohibitive for your meetup, you might want to do the prologue separately / online
		(using online PDF of the guide, or ArkhamCards app) instead so you could arrive and start the
		1st scenario immediately.
	</TextParagraph>

	<TextParagraph>
		But that way, none other than collection owner could see the expedition members as they are
		introduced. This page is a solution to that problem so everyone can see them online as they
		read.
	</TextParagraph>

	<SectionSeparator title="Scene 1" />
	<img alt="Scene 1" src="/image/custom/eote/eote1.png" />

	<SectionSeparator title="Scene 2" />
	<img alt="Scene 2" src="/image/custom/eote/eote2.png" />

	<SectionSeparator title="Scene 3" />
	<img alt="Scene 3" src="/image/custom/eote/eote3.png" />

	<SectionSeparator title="Scene 4" />
	<img alt="Scene 4" src="/image/custom/eote/eote4.png" />

	<SectionSeparator title="Scene 5" />
	<img alt="Scene 5" src="/image/custom/eote/eote5.png" />

	<SectionSeparator title="Scene 6" />
	<img alt="Scene 6" src="/image/custom/eote/eote6.png" />

	<SectionSeparator title="Scene 7" />
	<img alt="Scene 7" src="/image/custom/eote/eote7.png" />

	<SectionSeparator title="Scene 8" />
	<img alt="Scene 8" src="/image/custom/eote/eote8.png" />

	<SectionSeparator title="Scene 9" />
	<img alt="Scene 9" src="/image/custom/eote/eote9.png" />

	<SectionSeparator title="Expedition Team Overview" />
	<img alt="Crew" src="/image/custom/eote/crew.png" />
</MarginText>

<style>
	img {
		margin: 0 auto;
		width: 100%;
		max-width: 800px;
	}
</style>
