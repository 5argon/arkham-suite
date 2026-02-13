<script lang="ts">
	import {
		InnerHeading,
		LinkList,
		MarginFull,
		MarginText,
		PageLead,
		SectionSeparator,
		TextParagraph
	} from '@5argon/arkham-life-ui';
	import OpenGraph from '$lib/components/OpenGraph.svelte';
</script>

<OpenGraph
	description="High-resolution upscaled world map for The Scarlet Keys campaign."
	image="image/resource/tskworld.webp"
	title="The Scarlet Keys : Upscaled World Map"
	url="/tsk-map"
/>

<MarginFull>
	<PageLead title="The Scarlet Keys : Upscaled World Map" />
</MarginFull>

<MarginText>
	<TextParagraph>
		I took the playmat scan available at <a href="https://hallofarkham.com/the-scarlet-keys/"
			>Hall of Arkham</a
		>, add the Rome location banner that was missing, then enlarge with an AI Upscaler. But these
		kind of upscaler smear texts and symbols, so I cleaned up all the location labels manually and
		type back everything. Some other things are lost in the upscaling and I didn't manually restore
		them, for example blue star icon on the labels.
	</TextParagraph>

	<SectionSeparator title="Clean Map" />

	<TextParagraph>
		Using original output from the upscaler, image size is 8000 x 4516 px. Therefore if you are
		going to print them, at 300 DPI, this size can cover 26.67 x 15.05 inch or 677.3 x 382.4 mm.
		(Fits in A0 paper, 841 x 1189 mm) Download size is <b>~30 MB</b>.
	</TextParagraph>

	<!-- <LinkList items={[
        { href: '/image/custom/tsk-map/tsk-map.png', label: 'English' },
        { href: '/image/custom/tsk-map/tsk-map-bw.png', label: 'English (Photocopier-friendly)' },
        { href: '/image/custom/tsk-map/tsk-map-blank.png', label: 'Blank' }
    ]} /> -->
	<LinkList
		items={[{ href: '', label: 'Changing the hosting of these large files, please wait!' }]}
	/>

	<TextParagraph>
		These are scaled further than the output from upscaler by 2 times, which blurs the background.
		But since I typed back all the texts before exporting it, you would still get benefit of sharp
		text at larger size. Maybe it is useful for even larger print. Download size is <b>~70 MB</b>.
	</TextParagraph>

	<!-- <LinkList items={[
        { href: '/image/custom/tsk-map/tsk-map-2x.png', label: 'English 2x' }
    ]} /> -->
	<LinkList
		items={[{ href: '', label: 'Changing the hosting of these large files, please wait!' }]}
	/>

	<SectionSeparator title="Overlaid Map" />

	<TextParagraph>Map with extended information edited on top of it.</TextParagraph>

	<TextParagraph>
		These are sized to "A3 plus" / "Full-bleed A3", it is a size a bit larger than A3 that many A3
		printer supports. The purpose is that after printing, you can cut the bleed out to make an exact
		A3 size. (e.g. For printer with maximum paper size of 330 x 487mm and a maximum printing area of
		323 x 480mm)
	</TextParagraph>

	<InnerHeading title="Spoiler-Free Dossier Map" />

	<TextParagraph>
		Augmented map that has relevant dossier floating near its location. This is spoiler-free, since
		the game said you can read any dossier at any time as soon as you gain access to the world map.
	</TextParagraph>

	<LinkList items={[{ href: '', label: 'Coming Soon' }]} />

	<InnerHeading title="FULL SPOILER Map" />

	<TextParagraph>
		If you had enough of discovery, surprises, and disappointments already, this might be the map
		for you! <b
			>(But I strongly recommend you to play the game normally first before looking at this map to
			experience the said discovery, surprises, and disappointments.)</b
		>
	</TextParagraph>

	<TextParagraph>
		On later replays of TSK, you might want to focus on hitting unplayed version or unplayed time
		threshold difficulty scaling of some scenarios, getting unobtained keys, or make your own
		"gauntlet course" consisting of challenging scenarios back to back, or even arrange the
		narrative as you like. You might want to challenge Hard/Expert level, which you must take
		advantage of every drop of extra XP on the map to add critical playmaking cards to your deck
		before going into the next scenario.
	</TextParagraph>

	<TextParagraph>
		In all these cases, the surprise about time and conditions to obtain stuff on the map is not
		desirable. You don't want to start over after realizing you ended up getting the same version of
		scenario you had played so many times.
	</TextParagraph>

	<TextParagraph>
		This map shows possible time cost at each location, key/enemies/playable scenario locations, and
		color-coded connecting questlines. Don't worry, there is still plenty of "game" to play on this
		map, not just at start, but also when you don't get the best resolution and need to re-route
		your path. Amount of information in this map is equivalent to having read this excellent article <a
			href="https://derbk.com/ancientevils/best-laid-plans-traveling-the-world/"
			><b>Best-Laid Plans: Traveling the World (https://derbk.com/ancientevils)</b></a
		>
	</TextParagraph>

	<TextParagraph>
		It is also designed so you can circle on things you are planning to hit. (e.g. XP,
		trust/deception, keys, time, etc.) Just to make sure you don't miss anything.
	</TextParagraph>

	<LinkList items={[{ href: '', label: 'Coming Soon' }]} />
</MarginText>
