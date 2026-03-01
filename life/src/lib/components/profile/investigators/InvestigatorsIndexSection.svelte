<script lang="ts">
	import { getContext } from 'svelte';
	import { BorderedContainer, SectionSeparator } from '@5argon/arkham-life-ui';
	import { u as stringUtils } from '@5argon/arkham-string';
	import { CardClass } from '@5argon/arkham-kohaku';
	import ProfileWidgets from '$lib/components/profile/_framework/ProfileWidgets.svelte';
	import CategoryHiddenNotice from '$lib/components/profile/_primitives/CategoryHiddenNotice.svelte';
	import { toWidgetData } from '$lib/components/profile/_framework/profile-widget-data';
	import { LOCAL_PROFILE_KEY, type LocalProfileContext } from '$lib/database/profile-local';
	import * as m from '$lib/paraglide/messages.js';

	const ctx = getContext<LocalProfileContext>(LOCAL_PROFILE_KEY);
	const data = $derived(ctx.payload);
	const base = $derived(ctx.base);
	const classes = Object.values(CardClass);
	const rows = $derived(data ? data.settings.panes.investigatorsHome : []);
</script>

<svelte:head><title>{m.investigators_index_title()}</title></svelte:head>

{#if data}
	{#if data.settings.campaignCategoriesOnly}
		<CategoryHiddenNotice />
	{:else}
	<div class="mt-6">
		<SectionSeparator title={m.investigators_index_by_class()} />
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
			{#each classes as cls (cls)}
				<a href={`${base}/investigators/${cls}`} class="block">
					<BorderedContainer>
						<div class="flex items-center justify-between gap-2 p-3 transition hover:opacity-80">
							<span class="font-medium text-black dark:text-white">{stringUtils.cardClass(cls)}</span>
							<span class="text-secondary-500 shrink-0">→</span>
						</div>
					</BorderedContainer>
				</a>
			{/each}
		</div>
	</div>

	<ProfileWidgets {rows} data={toWidgetData(data)} />
	{/if}
{/if}
