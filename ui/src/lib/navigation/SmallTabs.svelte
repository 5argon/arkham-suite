<!--
@component
Compact, neutral tab strip. Just the tabs - it doesn't deal with showing or
hiding the content.
-->
<script lang="ts" generics="T">
	interface Prop {
		options: { value: T; label: string }[];
		value: T;
		onSelect: (value: T) => void;
	}
	const { options, value, onSelect }: Prop = $props();
</script>

<div class="small-tabs" role="tablist">
	{#each options as option (option.value)}
		<button
			type="button"
			role="tab"
			aria-selected={option.value === value}
			class="small-tab"
			class:small-tab-active={option.value === value}
			onclick={() => onSelect(option.value)}
		>
			{option.label}
		</button>
	{/each}
</div>

<style>
	.small-tabs {
		display: flex;
		gap: 0.25rem;
	}

	.small-tab {
		flex: 1;
		padding: 0.25rem 0.75rem;
		border-radius: 0.375rem 0.375rem 0 0;
		border: 1px solid var(--color-primary-300);
		border-bottom-width: 2px;
		border-bottom-color: transparent;
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--color-primary-700);
		cursor: pointer;
		transition:
			background-color 120ms ease,
			color 120ms ease;
	}

	.small-tab:hover {
		background-color: var(--color-primary-200);
	}

	.small-tab-active {
		background-color: var(--color-primary-300);
		color: var(--color-primary-950);
		border-bottom-color: var(--color-primary-700);
	}

	:global(.dark) .small-tab {
		border-color: var(--color-primary-700);
		border-bottom-color: transparent;
		color: var(--color-primary-300);
	}

	:global(.dark) .small-tab:hover {
		background-color: var(--color-primary-800);
	}

	:global(.dark) .small-tab-active {
		background-color: var(--color-primary-700);
		color: var(--color-primary-50);
		border-bottom-color: var(--color-primary-300);
	}
</style>
