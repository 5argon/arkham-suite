<!--
@component
A cycling radio control: shows the current choice with a faded peek of the
next one at the right edge; clicking anywhere slides the next choice in.
Options should have distinct initial wording so the peek stays recognizable.
-->
<script lang="ts" generics="T">
	import { fly } from 'svelte/transition';

	interface Prop {
		/**
		 * Name of the whole control, shown next to it.
		 */
		label: string;
		options: { value: T; label: string }[];
		value: T;
		onCycle: (next: T) => void;
		/**
		 * CSS width of the control; size it to the longest label plus a peek.
		 */
		width?: string;
	}
	const { label, options, value, onCycle, width = '12rem' }: Prop = $props();

	// Generate unique ID for this component instance to associate the label.
	const labelId = `carousel-radio-${Math.random().toString(36).substring(2, 11)}`;

	const index = $derived(
		Math.max(
			0,
			options.findIndex((o) => o.value === value)
		)
	);
	const current = $derived(options[index]);
	const next = $derived(options[(index + 1) % options.length]);
</script>

<div class="wrapper">
	<span class="control-label" id={labelId}>{label}</span>
	<button
		type="button"
		class="carousel"
		style:width
		aria-labelledby={labelId}
		onclick={() => onCycle(next.value)}
	>
		<span class="current">
			{#key index}
				<span class="slide" in:fly={{ x: 28, duration: 160 }} out:fly={{ x: -28, duration: 160 }}>
					{current.label}
				</span>
			{/key}
		</span>
		<span class="peek" aria-hidden="true">{next.label}</span>
	</button>
</div>

<style>
	.wrapper {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	.control-label {
		font-size: 0.75rem;
		font-weight: 600;
		white-space: nowrap;
		color: var(--color-primary-700);
	}

	:global(.dark) .control-label {
		color: var(--color-primary-300);
	}

	.carousel {
		display: flex;
		align-items: center;
		overflow: hidden;
		position: relative;
		border: 1px solid var(--color-primary-300);
		border-radius: 9999px;
		background-color: var(--color-primary-50);
		color: var(--color-primary-900);
		padding: 0.25rem 0;
		cursor: pointer;
		font-size: 0.875rem;
		text-align: left;
		transition: background-color 120ms ease;
	}

	.carousel:hover {
		background-color: var(--color-primary-200);
	}

	.carousel:active {
		background-color: var(--color-primary-300);
	}

	.current {
		position: relative;
		flex: 1;
		min-width: 0;
		height: 1.25rem;
		margin-left: 0.75rem;
	}

	.slide {
		position: absolute;
		inset: 0;
		white-space: nowrap;
		overflow: hidden;
		font-weight: 600;
	}

	.peek {
		flex-shrink: 0;
		max-width: 5.5rem;
		overflow: hidden;
		white-space: nowrap;
		opacity: 0.45;
		border-left: 1px solid var(--color-primary-300);
		padding: 0 0.5rem;
		font-size: 0.75rem;
		mask-image: linear-gradient(to right, black 55%, transparent);
	}

	:global(.dark) .carousel {
		border-color: var(--color-primary-700);
		background-color: var(--color-primary-900);
		color: var(--color-primary-100);
	}

	:global(.dark) .carousel:hover {
		background-color: var(--color-primary-800);
	}

	:global(.dark) .carousel:active {
		background-color: var(--color-primary-700);
	}

	:global(.dark) .peek {
		border-left-color: var(--color-primary-700);
	}
</style>
