<!--
@component
A horizontal card frame with rounded borders and padding, similar to SetupReferenceCardFrame but oriented horizontally.
Content that overflows will be clipped. On smaller screens, removes height constraints.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import clsx from 'clsx';

	let {
		children,
		borderColorClass = 'border-primary-200 dark:border-primary-500'
	}: {
		children: Snippet;
		borderColorClass?: string;
	} = $props();
</script>

<div class="horizontal-card-frame bordered dark:bg-primary-800 mx-auto bg-white shadow-lg">
	<div class={clsx('content-area border-opacity-10 rounded-lg border', borderColorClass)}>
		{@render children()}
	</div>
</div>

<style>
	.horizontal-card-frame {
		width: 100%;
		padding: 1rem;
		overflow: visible;
	}

	@media (min-width: 1024px) {
		.horizontal-card-frame {
			width: 1100px;
			/* 1100 * 61.5 / 88 = 768.75 */
			height: 769px;
			padding: 40px;
			overflow: hidden;
		}
	}

	.content-area {
		padding: 10px;
		position: relative;
		height: auto;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	@media (min-width: 1024px) {
		.content-area {
			height: 100%;
		}
	}
</style>
