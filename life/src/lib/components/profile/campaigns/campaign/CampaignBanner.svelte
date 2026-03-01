<!--
@component
The forced header card at the top of a campaign's profile page: the campaign's
box art (the same image as the Campaign Archive listing) with its name overlaid.
It is a normal widget card but with NO tab title (a "Campaign Name" tab reads
oddly), and it is NOT part of the customizable layout — always shown, never
offered in the widget picker. A missing image degrades to a plain title card.
-->
<script lang="ts">
	import WidgetFrame from '$lib/components/profile/_primitives/WidgetFrame.svelte';

	let { slug, name }: { slug: string; name: string } = $props();
	const imageUrl = $derived(`/image/expansion/campaign/${slug}.webp`);
	let imageFailed = $state(false);
</script>

<WidgetFrame title={null}>
	{#if imageFailed}
		<h2 class="text-2xl font-bold text-black dark:text-white">{name}</h2>
	{:else}
		<div class="relative overflow-hidden rounded">
			<img
				src={imageUrl}
				alt={name}
				onerror={() => (imageFailed = true)}
				class="h-40 w-full object-cover"
			/>
			<div class="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent"></div>
			<h2 class="absolute bottom-2 left-3 text-2xl font-bold text-white drop-shadow-lg">{name}</h2>
		</div>
	{/if}
</WidgetFrame>
