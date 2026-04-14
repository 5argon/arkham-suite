<script lang="ts">
	import type { Card } from '@5argon/arkham-kohaku';
	import { HealthSanity, ImageIconCommit } from '@5argon/arkham-life-ui';

	interface Props {
		card: Card;
		imageUrl: string;
		href: string;
	}

	const { card, imageUrl, href }: Props = $props();
</script>

<a
	{href}
	class="block max-w-150 overflow-hidden rounded-lg outline-2 outline-transparent transition-outline duration-200 hover:outline-primary-500"
>
	<div class="aspect-4/1 w-full overflow-hidden">
		<img src={imageUrl} alt={card.name} class="h-full w-full object-cover" />
	</div>
	<div class="bg-primary-50 dark:bg-primary-950 p-4">
		<h2 class="text-xl font-bold text-black md:text-2xl dark:text-white">{card.name}</h2>
		{#if card.subname}
			<p class="text-sm opacity-70 text-black dark:text-white">{card.subname}</p>
		{/if}
		<div class="mt-2 flex items-center gap-2">
			<HealthSanity health={card.health} sanity={card.sanity} />
			<ImageIconCommit {card} />
		</div>
		{#if card.flavor}
			<p class="mt-2 max-w-lg text-sm italic opacity-70">{card.flavor}</p>
		{/if}
	</div>
</a>
