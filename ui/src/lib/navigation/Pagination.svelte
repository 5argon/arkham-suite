<!--
@component
Previous / next page control with the current page and page count. Renders
nothing when there is a single page.
-->
<script lang="ts">
	import FaIcon from '../icon/FaIcon.svelte';
	import { FaIconType } from '../icon/fa-icon-type.js';

	interface Prop {
		/**
		 * 1-based.
		 */
		page: number;
		pageCount: number;
		onChange: (page: number) => void;
	}
	const { page, pageCount, onChange }: Prop = $props();

	const canPrev = $derived(page > 1);
	const canNext = $derived(page < pageCount);
</script>

{#if pageCount > 1}
	<nav class="pagination" aria-label="Pagination">
		<button
			type="button"
			class="page-button"
			disabled={!canPrev}
			aria-label="Previous page"
			onclick={() => onChange(page - 1)}
		>
			<FaIcon icon={FaIconType.LeftSingle} />
		</button>
		<span class="page-status">{page} / {pageCount}</span>
		<button
			type="button"
			class="page-button"
			disabled={!canNext}
			aria-label="Next page"
			onclick={() => onChange(page + 1)}
		>
			<FaIcon icon={FaIconType.RightSingle} />
		</button>
	</nav>
{/if}

<style>
	.pagination {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.page-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 9999px;
		border: 1px solid var(--color-primary-400);
		background-color: var(--color-primary-100);
		color: var(--color-primary-800);
		cursor: pointer;
		transition: background-color 120ms ease;
	}

	.page-button:hover:not(:disabled) {
		background-color: var(--color-primary-200);
	}

	.page-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.page-status {
		min-width: 4rem;
		text-align: center;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-primary-800);
	}

	:global(.dark) .page-button {
		border-color: var(--color-primary-500);
		background-color: var(--color-primary-800);
		color: var(--color-primary-100);
	}

	:global(.dark) .page-button:hover:not(:disabled) {
		background-color: var(--color-primary-700);
	}

	:global(.dark) .page-status {
		color: var(--color-primary-200);
	}
</style>
