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
		top,
		bottom,
		borderColorClass = 'border-primary-200 dark:border-primary-500',
		bgColorClass = 'bg-primary-200 dark:bg-primary-500'
	}: {
		children?: Snippet;
		top?: Snippet;
		bottom?: Snippet;
		borderColorClass?: string;
		bgColorClass?: string;
	} = $props();
</script>

<div class="horizontal-card-frame dark:bg-primary-950 mx-auto flex flex-col bg-white shadow-lg">
	{#if top}
		<div class="top-frame {bgColorClass} {borderColorClass}">
			<div class="top-frame-inner">
				{@render top()}
			</div>
		</div>
	{/if}
	{#if children}
		<div class={clsx('full-frame', borderColorClass)}>
			<div class="full-frame-inner">
				{@render children()}
			</div>
		</div>
	{/if}
	{#if bottom}
		<div class="bottom-frame">
			<div class="bottom-frame-inner">
				{@render bottom()}
			</div>
		</div>
	{/if}
</div>

<style>
	.horizontal-card-frame {
		width: 100%;
		overflow: visible;
		border-radius: 10px;
	}

	.top-frame {
		border-radius: 10px 10px 0 0;
		border-bottom-width: 2px;
	}

	@media (min-width: 1024px) {
		.horizontal-card-frame {
			width: 780px;
			/* 780 * 61.5 / 88 = 545.34 */
			height: 545px;
			overflow: hidden;
			border-radius: 0px;
		}

		.top-frame {
			border-radius: 0px;
			padding-top: 40px;
			padding-left: 40px;
			padding-right: 40px;
		}

		.top-frame-inner {
			height: 35px;
			overflow: hidden;
			border-top: 1px solid rgba(0, 0, 0, 0.1);
			border-radius: 28.3px 28.3px 0 0;
		}

		.bottom-frame {
			padding-bottom: 40px;
			padding-left: 40px;
			padding-right: 40px;
		}

		.bottom-frame-inner {
			height: calc(545px - 40px - 35px - 40px);
			overflow: hidden;
			border-left: 1px solid rgba(0, 0, 0, 0.1);
			border-right: 1px solid rgba(0, 0, 0, 0.1);
			border-bottom: 1px solid rgba(0, 0, 0, 0.1);
			border-radius: 0 0 28.3px 28.3px;
		}

		.full-frame {
			padding: 40px;
		}

		.full-frame-inner {
			height: calc(545px - 80px);
			border: 1px solid rgba(0, 0, 0, 0.1);
			border-radius: 28.3px;
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
