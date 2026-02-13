<!--
@component
Container for form controls that aligns them to the bottom, ensuring consistent alignment
regardless of whether each control has a label or not.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Prop {
		children: Snippet;
		/**
		 * Gap between form controls. Defaults to 1rem.
		 */
		gap?: string;
	}
	const { children, gap = '1rem' }: Prop = $props();
</script>

<div class="form-row" style:gap>
	{@render children()}
</div>

<style>
	.form-row {
		display: flex;
		align-items: end;
		flex-wrap: wrap;
	}
</style>
