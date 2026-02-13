<script context="module" lang="ts">
	import jsonDir from './divider-dir.json';

	interface Language {
		code: string;
		text: string;
	}

	interface DividerDir {
		folder: string;
		items: string[];
	}
</script>

<script lang="ts">
	import { dividerData } from './divider-data';
	import { Button, PageLead, SectionSeparator } from '@5argon/arkham-life-ui';

	let selectedLanguageIndex = 0;
	let selectedOuterIndex = 0;
	let selectedInnerIndex = 0;
	const languages: Language[] = [
		{ code: 'en', text: 'English' },
		{ code: 'de', text: 'German' },
		{ code: 'it', text: 'Italian' },
		{ code: 'ru', text: 'Russian' },
		{ code: 'es', text: 'Spanish' },
		{ code: 'fr', text: 'French' },
		{ code: 'pt', text: 'Portuguese' },
		{ code: 'pl', text: 'Polish' },
		{ code: 'cs', text: 'Czech' },
		{ code: 'th', text: 'Thai' },
		{ code: 'hu', text: 'Hungarian' }
	];
	const dirs = jsonDir as DividerDir[];

	$: selectedLanguage = languages[selectedLanguageIndex];
	$: selectedOuter = dividerData[selectedOuterIndex];
	$: selectedInner = selectedOuter.items[selectedInnerIndex];
	let finalDisplays: string[] = [];
	$: {
		if (selectedOuter.items.length > selectedInnerIndex) {
			const selectedInner = selectedOuter.items[selectedInnerIndex];
			const s = dirs.find((x) => x.folder === selectedInner.name + ' x' + selectedInner.count);
			if (s !== undefined) {
				finalDisplays = s.items.map((_, i) => {
					return getPreviewUrl(selectedLanguage.code, selectedInner.name, selectedInner.count, i);
				});
			}
		}
	}

	function getPreviewUrl(langCode: string, name: string, count: number, index: number): string {
		const nameAndCount = name + ' x' + count;
		const dir = dirs.find((x) => x.folder === nameAndCount);
		if (dir !== undefined) {
			const url = [
				'/image',
				'divider',
				langCode,
				nameAndCount,
				langCode + '_' + name + '_' + dir.items[index]
			].join('/');
			return url;
		}
		return '';
	}
</script>

<svelte:head>
	<title>arkham-starter.com | The 3mm Divider : Download</title>
</svelte:head>

<PageLead title={'The 3mm Divider : Download'} />

<p>
	<a href="/divider">Back to the main divider page</a>
</p>

<p>
	I'm moving the hosting of dividers to Google Drive. There you could batch download the whole
	folder easier with the right click menu. You can also switch from list view to thumbnail view.
</p>

<Button
	label="Go to Google Drive"
	onClick={() => {
		window.open(
			'https://drive.google.com/drive/folders/1WdXXcRYv4CfTCN_XUb29eX-e84oXxazp?usp=share_link',
			'_blank'
		);
	}}
/>

<SectionSeparator title="Available Languages" />

<ul>
	{#each languages as l}
		<li>{l.text} (Folder: {l.code})</li>
	{/each}
</ul>

<SectionSeparator title="Premade PDF (English Only)" />

<img alt="PDF" src="/image/documentation/divider/pdf.webp" />

<p>
	Instead of picking individual graphics, these are PDF files with graphics already laid out and cut
	lines extended to the paper's edge. When print shop see this file, they will be happy as layout
	work is saved for them, and likely willing to cut them for you since the cut lines are there.
</p>

<p>
	The disadvantage is that I cannot maintain this for all languages, you might not want all of what
	I decided to pack in, and also paper size is locked to A4. This make it inefficient for print shop
	that can print larger size to fit more dividers.
</p>

<ul>
	<li>
		<a
			href="https://drive.google.com/file/d/1wN-ZsYtzIhRgoL4iMHm4BPDhHOXTR5l0/view?usp=share_link"
			target="_blank"
			><b
				>Massive All Campaign Dividers (Core Encounters, Night of the Zealot to The Feast of Hemlock
				Vale)</b
			></a
		>. 27 pages, 211 dividers, 283.8 MB. Since they are sorted chronologically, maybe you can print
		only pages of what you really want and discard minimal amount of dividers?
	</li>
	<li>
		<a
			href="https://drive.google.com/file/d/1wXM8Yj_z1IhBA_7UyB49N3jSP5wf6O0W/view?usp=share_link"
			target="_blank"><b>Selected Player Card Dividers</b></a
		>. 4 pages, 32 dividers, 42.7 MB. I choose the Lv. 0 vs Lv. 1~5 per class organization, which I
		think is the most popular way that could scale well. There are dividers for investigator by
		their class, basic weakness, etc. I also tried to cater to as many users as possible with stuff
		like Permanent, Bonded, or even Parallel Investigator dividers for when you decided to dip into
		those and don't want to mix with regular ones. You might have to discard some of them that you
		think are excessive if you don't like separating them out of the other section.
	</li>
</ul>

<style>
	img {
		max-width: 400px;
		margin: 0 auto;
	}
</style>
