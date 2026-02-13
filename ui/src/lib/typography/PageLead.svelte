<!--
@component
This put the title in &lt;h1&gt;, so no other places in the page should have &lt;h1&gt;.
-->
<script module lang="ts">
	interface Props {
		title: string;
		description?: string;
		/**
		 * Shown over the title.
		 */
		image?: string;
	}
</script>

<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import Divider from '../layout/Divider.svelte';
	const { title, description, image }: Props = $props();
</script>

<hgroup>
	{#if image}
		<div class="image mx-auto max-w-full rounded bg-cover" style="--bg-image:url({image})"></div>
	{/if}
	<h1
		in:fade={{ duration: 150 }}
		class:image-on={image}
		class="text-secondary-900 dark:text-secondary-100 text-center text-2xl font-bold sm:text-4xl"
	>
		{title}
	</h1>
	{#if description}
		<p
			in:fade|global={{ duration: 90, delay: 30 }}
			class="bg-primary-200 dark:bg-primary-700 text-primary-900 dark:text-primary-100 mx-auto rounded px-8 py-4"
		>
			{description}
		</p>
	{/if}
</hgroup>

<Divider type="diamond" />

<style>
	h1 {
		font-family: 'Heading';
	}

	p {
		max-width: 600px;
	}

	.image-on {
		position: relative;
		top: -1rem;
	}

	.image {
		width: 500px;
		height: 150px;
		background-image: var(--bg-image);
		mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
	}
</style>
