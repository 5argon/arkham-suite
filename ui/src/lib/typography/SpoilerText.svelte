<!-- 
 @component
 Inline text renderer with spoiler-protection support.
 Segments wrapped in ||double pipes|| are rendered as solid colour blocks
 that visually obscure the text (like Discord spoiler tags).
 The hidden text remains in the DOM so screen-readers and search still work.
 -->
<script lang="ts">
	interface Segment {
		type: 'normal' | 'spoiler';
		text: string;
	}

	interface Props {
		/** Text with optional ||spoiler|| regions. */
		text: string;
		/** Extra CSS classes forwarded to the root <span>. */
		class?: string;
	}

	let { text, class: className = '' }: Props = $props();

	function parseSegments(raw: string): Segment[] {
		const segments: Segment[] = [];
		const pattern = /\|\|(.+?)\|\|/g;
		let lastIndex = 0;
		let match: RegExpExecArray | null;

		while ((match = pattern.exec(raw)) !== null) {
			if (match.index > lastIndex) {
				segments.push({ type: 'normal', text: raw.slice(lastIndex, match.index) });
			}
			segments.push({ type: 'spoiler', text: match[1] });
			lastIndex = pattern.lastIndex;
		}

		if (lastIndex < raw.length) {
			segments.push({ type: 'normal', text: raw.slice(lastIndex) });
		}

		return segments;
	}

	const segments = $derived(parseSegments(text));
</script>

<span class={className}>
	{#each segments as segment, i (i)}
		{#if segment.type === 'spoiler'}
			<span
				class="rounded bg-primary-900 text-primary-900 dark:bg-primary-100 dark:text-primary-100 select-none cursor-default"
				aria-hidden="true"
			>{segment.text}</span>
		{:else}
			{segment.text}
		{/if}
	{/each}
</span>
