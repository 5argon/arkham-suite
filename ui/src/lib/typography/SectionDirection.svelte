<!--
@component
Ask user to do something in a divider that spans the screen.
Children snippet is rendered right below with no side padding provided. The advantage
of using children is that the section might be collapsible to hide content once
user finished inputting the data.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Prop {
		text: string;
		description?: string;
		hideChildren?: boolean;
		children?: Snippet;
	}
	import { MarginText } from '../layout/index.js';
	const { text, description, hideChildren, children }: Prop = $props();
</script>

<MarginText>
	<hgroup class="py-4">
		<h2 class="text-secondary-800 dark:text-secondary-200 flex items-center font-bold md:text-2xl">
			<svg
				viewBox="0 0 193 136"
				version="1.1"
				class="text-secondary-600 dark:text-secondary-300 mr-2 inline"
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				xml:space="preserve"
				style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"
			>
				<g transform="matrix(0.24,0,0,0.24,0,0)">
					<g transform="matrix(2.5,0,0,2.5,-1521.7,-1193.21)">
						<path
							d="M713.089,647.922L613.719,590.551L713.089,533.18L713.089,519.685C713.089,518.643 713.645,517.68 714.547,517.159L755.462,493.537C756.364,493.016 757.476,493.016 758.378,493.537L876.319,561.63L924.67,524.409L898.63,590.551L924.67,656.693L876.319,619.472L758.378,687.565C757.476,688.086 756.364,688.086 755.462,687.565L714.547,663.943C713.645,663.422 713.089,662.459 713.089,661.417L713.089,647.922ZM871.319,565.479C845.638,550.652 756.92,499.431 756.92,499.431L718.922,521.369C718.922,521.369 718.922,525.842 718.922,533.18L818.292,590.551L718.922,647.922C718.922,655.26 718.922,659.733 718.922,659.733L756.92,681.671L871.319,615.623L838.749,590.551L871.319,565.479Z"
						/>
					</g>
				</g>
			</svg>
			<span class="leading-0">{text}</span>
		</h2>
		{#if description}
			<p class="text-primary-950 dark:text-primary-50">
				{description}
			</p>
		{/if}
	</hgroup>
</MarginText>
<div>
	{@render children?.()}
</div>

<style>
	svg {
		width: 40px;
	}

	svg path {
		fill: currentColor;
	}
</style>
