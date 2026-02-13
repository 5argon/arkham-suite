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
	import * as m from '$lib/paraglide/messages.js';
</script>

<OpenGraph
	description="Photocopier-friendly frame graphics that you can fill in the blank to make a proxy card."
	image="image/resource/proxy.webp"
	title="Proxy Template"
	url="/proxy"
/>

<MarginFull>
	<PageLead title={m.common_proxy_title()} />
</MarginFull>

<MarginText>
	<TextParagraph>
		Generic black and white card frames with the class edited out so you can focus on what's truly
		matter : your awesome proxy art.
	</TextParagraph>

	<TextParagraph>
		It is also photocopy-friendly. Unlike a monochrome printer it cannot reproduce detailed greys.
	</TextParagraph>

	<TextParagraph>
		Proxies are for resolving card overlaps, creating a bit more copies of card you <b
			>already own</b
		>
		to make unconventional team composition possible, or fix accidents such as lost cards. They are not
		meant for you to skip buying an Investigator Expansion by getting a few cards out of it for free.
	</TextParagraph>

	<SectionSeparator title="Premade A4 PDF" />

	<TextParagraph>
		They are designed so the size comes out a bit smaller than an actual card. Then you can overlay
		inside a clear sleeve and still see genuine card back, without the proxy paper accidentally blep
		off the edge and revealing it is a proxy from the back side.
	</TextParagraph>

	<LinkList
		items={[
			{
				href: '/image/custom/proxy/ahlcg-proxy-a4-1.pdf',
				label: 'Asset, Event, Skill : 1, 2, 3 skill icons'
			},
			{
				href: '/image/custom/proxy/ahlcg-proxy-a4-2.pdf',
				label: 'Asset, Event, Skill : 2, 3, 4 skill icons'
			},
			{
				href: '/image/custom/proxy/ahlcg-proxy-a4-3.pdf',
				label: 'Asset, Event, Skill : 0 skill icon'
			},
			{ href: '/image/custom/proxy/ahlcg-proxy-a4-4.pdf', label: 'Skill : Various skill icons' }
		]}
	/>

	<TextParagraph
		>Individual images below if you want an exact amount of a specific frame.</TextParagraph
	>

	<SectionSeparator title="Asset" />

	<div>
		<img alt="Asset" src="/image/custom/proxy/asset-0.png" />
		<img alt="Asset" src="/image/custom/proxy/asset-1.png" />
		<img alt="Asset" src="/image/custom/proxy/asset-2.png" />
		<img alt="Asset" src="/image/custom/proxy/asset-3.png" />
		<img alt="Asset" src="/image/custom/proxy/asset-4.png" />
	</div>

	<SectionSeparator title="Event" />

	<div>
		<img alt="Event" src="/image/custom/proxy/event-0.png" />
		<img alt="Event" src="/image/custom/proxy/event-1.png" />
		<img alt="Event" src="/image/custom/proxy/event-2.png" />
		<img alt="Event" src="/image/custom/proxy/event-3.png" />
		<img alt="Event" src="/image/custom/proxy/event-4.png" />
	</div>

	<SectionSeparator title="Skill" />

	<div>
		<img alt="Skill" src="/image/custom/proxy/skill-0.png" />
		<img alt="Skill" src="/image/custom/proxy/skill-1.png" />
		<img alt="Skill" src="/image/custom/proxy/skill-2.png" />
		<img alt="Skill" src="/image/custom/proxy/skill-3.png" />
		<img alt="Skill" src="/image/custom/proxy/skill-4.png" />
	</div>
</MarginText>
