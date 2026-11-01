<script lang="ts">
	import { Button, PageLead, SectionSeparator } from '@5argon/arkham-life-ui';
	import { environment } from '@5argon/arkham-kohaku';

	import OpenGraph from '$lib/components/OpenGraph.svelte';
	import ProductTiles from '$lib/design/components/product/ProductTiles.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import {
		environmentPointPath,
		environmentPointTitle,
		releasedPoints
	} from '$lib/tool/environment-choices';

	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	const released = $derived(releasedPoints(data.points, new Date()));
	const isEvergreen = (id: string) => id === environment.currentEnvironmentEvergreenId;
	// Evergreen on top, then newest to oldest.
	const listed = $derived([
		...released.filter((point) => isEvergreen(point.id)),
		...released.filter((point) => !isEvergreen(point.id)).reverse()
	]);

	function formatDate(date: string): string {
		return new Date(`${date}T00:00:00`).toLocaleDateString(getLocale(), { dateStyle: 'long' });
	}
</script>

<OpenGraph
	description={m.explore_env_description()}
	image="image/resource/player.webp"
	title={m.explore_env_title()}
	url="/player/env"
/>

<PageLead description={m.explore_env_description()} title={m.explore_env_title()} />

{#each listed as point (point.id)}
	{@const path = environmentPointPath(point.id)}
	<SectionSeparator title={environmentPointTitle(point)} />
	<div class="mb-2 flex flex-wrap items-center justify-center gap-3">
		<Button label={m.explore_view_all_cards()} onClick={path} />
		{#if !isEvergreen(point.id)}
			<span class="text-primary-700 dark:text-primary-300 text-sm">
				{m.explore_env_since({ date: formatDate(point.date) })}
			</span>
		{/if}
	</div>
	<ProductTiles products={point.products} onClick={() => path} />
{/each}
