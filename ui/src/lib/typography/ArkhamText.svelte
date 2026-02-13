<!--
@component
Render text with inline Arkham icons replacing special text markers.
-->
<script lang="ts">
	import { ArkhamIcon } from '@5argon/arkham-icon';
	import type { ArkhamInlineIcon } from '@5argon/arkham-kohaku';

	interface Prop {
		/**
		 * Text content that may contain inline icon markers
		 */
		text: string;
	}

	const { text }: Prop = $props();

	/**
	 * Parse text and split into segments, marking icon positions
	 */
	function parseText(input: string): Array<{ type: 'text' | 'icon'; content: string }> {
		const segments: Array<{ type: 'text' | 'icon'; content: string }> = [];
		const iconPattern = /\[per_investigator\]/g;
		let lastIndex = 0;
		let match: RegExpExecArray | null;

		while ((match = iconPattern.exec(input)) !== null) {
			// Add text before the icon
			if (match.index > lastIndex) {
				segments.push({
					type: 'text',
					content: input.slice(lastIndex, match.index)
				});
			}

			// Add the icon
			segments.push({
				type: 'icon',
				content: match[0] as ArkhamInlineIcon
			});

			lastIndex = iconPattern.lastIndex;
		}

		// Add remaining text after last icon
		if (lastIndex < input.length) {
			segments.push({
				type: 'text',
				content: input.slice(lastIndex)
			});
		}

		return segments;
	}

	const segments = $derived(parseText(text));
</script>

<span class="arkham-text">
	{#each segments as segment, i (i)}
		{#if segment.type === 'text'}
			{segment.content}
		{:else}
			{@const segmentContent = segment.content as ArkhamInlineIcon}
			<span class="inline-icon">
				<ArkhamIcon icon={segmentContent} />
			</span>
		{/if}
	{/each}
</span>

<style>
	.arkham-text {
		display: inline;
	}

	.inline-icon {
		display: inline-block;
		vertical-align: baseline;
		line-height: 1;
	}
</style>
