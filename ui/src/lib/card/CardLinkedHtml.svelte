<!--
@component
HTML with card links in it, made by the markdown processor. See CardLinkArea for what they do.
-->
<script lang="ts">
	import { type Card } from '@5argon/arkham-kohaku';
	import './deck-description.css';
	import CardLinkArea from './CardLinkArea.svelte';

	interface Prop {
		html: string;
		resolveCard?: (code: string) => Card | undefined;
	}

	const { html, resolveCard }: Prop = $props();
</script>

<CardLinkArea {resolveCard}>
	<div class="prose dark:prose-invert description-content max-w-none">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</div>
</CardLinkArea>
