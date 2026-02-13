<script lang="ts">
	import type { ExtraInfo } from '$lib/core/campaign';
	import { ArkhamText } from '@5argon/arkham-life-ui';

	let {
		extraInfos,
		centered = false
	}: {
		extraInfos: ExtraInfo[];
		centered?: boolean;
	} = $props();
</script>

<div class="extra-info-container" class:centered>
	{#each extraInfos as info, i (i)}
		{#if info.heading}
			<h3 class="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-2 mt-2 first:mt-0">
				{info.heading}
			</h3>
		{/if}
		{#if info.paragraph}
			<p class="leading-5 text-base text-primary-800 dark:text-primary-200 mb-1">
				<ArkhamText text={info.paragraph} />
			</p>
		{/if}
		{#if info.bullets}
			<ul class="mb-3">
				{#each info.bullets as bullet, j (j)}
					<li
						class="leading-none text-base text-primary-800 dark:text-primary-200 ml-5 mb-1 list-disc"
					>
						{bullet}
					</li>
				{/each}
			</ul>
		{/if}
		{#if info.image}
			<div class="px-4 my-3">
				<img src="/image/custom/setup-reference-card/{info.image}" alt="" class="w-full h-auto" />
			</div>
		{/if}
	{/each}
</div>

<style>
	.extra-info-container {
		display: flex;
		flex-direction: column;
	}

	.extra-info-container.centered {
		justify-content: center;
		flex: 1;
	}
</style>
