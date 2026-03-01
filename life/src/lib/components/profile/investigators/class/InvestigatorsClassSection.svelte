<script lang="ts">
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import { BorderedContainer, HelpParagraph } from '@5argon/arkham-life-ui';
	import { u as stringUtils } from '@5argon/arkham-string';
	import { resolveClassSlug } from '$lib/campaign/profile-slugs';
	import ProfileWidgets from '$lib/components/profile/_framework/ProfileWidgets.svelte';
	import CategoryHiddenNotice from '$lib/components/profile/_primitives/CategoryHiddenNotice.svelte';
	import { toWidgetData } from '$lib/components/profile/_framework/profile-widget-data';
	import { LOCAL_PROFILE_KEY, type LocalProfileContext } from '$lib/database/profile-local';
	import * as m from '$lib/paraglide/messages.js';

	const ctx = getContext<LocalProfileContext>(LOCAL_PROFILE_KEY);
	const data = $derived(ctx.payload);
	const cardClass = $derived(resolveClassSlug(page.params.class ?? ''));
	const rows = $derived(data ? data.settings.panes.investigatorClassDetail : []);
</script>

<svelte:head><title>{m.investigators_class_title({ className: cardClass ? stringUtils.cardClass(cardClass) : m.investigators_class_fallback_name() })}</title></svelte:head>

{#if data}
	{#if data.settings.campaignCategoriesOnly}
		<CategoryHiddenNotice />
	{:else if !cardClass}
		<BorderedContainer><div class="p-8"><HelpParagraph>{m.investigators_class_unknown()}</HelpParagraph></div></BorderedContainer>
	{:else}
		<ProfileWidgets {rows} data={toWidgetData(data)} classFilter={cardClass} />
	{/if}
{/if}
