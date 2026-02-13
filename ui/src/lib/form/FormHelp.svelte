<!--
@component
Show help when hovering on any Snippet.
-->
<script lang="ts">
	import clsx from 'clsx';
	import type { Snippet } from 'svelte';

	interface Prop {
		help: string;
		children: Snippet;
		passThrough?: boolean;
		direction?: 'top' | 'top-right';
	}
	const { help, children, direction, passThrough }: Prop = $props();
</script>

{#if passThrough}
	{@render children()}
{:else}
	<span class="relative">
		<span class="group">
			{@render children()}
			<span
				class={clsx(
					'pointer-events-none absolute bottom-full left-1/2 w-max max-w-xs transform rounded bg-black/70 p-2 text-xs text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100',
					direction === 'top' ? '-translate-x-1/2' : ''
				)}
			>
				{help}
			</span>
		</span>
	</span>
{/if}
