<!--
@component
Body for a card-taxonomy inner page (Core Set / Asset / Event / Skill / Keywords /
Levels). Resolves the sub-page from its `slug`, then renders that pane's saved row
layout — parallel to `cards/class/CardsClassSection.svelte`, minus the class
filter. A scaffold page with no rows AND no available widgets (Asset / Event)
shows a placeholder rather than a blank page.
-->
<script lang="ts">
	import { getContext } from 'svelte';
	import { BorderedContainer, HelpParagraph } from '@5argon/arkham-life-ui';
	import { resolveCardSubpageSlug, type CardSubpageSlug } from '$lib/campaign/profile-card-subpages';
	import { sharedWidgetsForPane } from '$lib/campaign/profile-widgets';
	import ProfileWidgets from '$lib/components/profile/_framework/ProfileWidgets.svelte';
	import CategoryHiddenNotice from '$lib/components/profile/_primitives/CategoryHiddenNotice.svelte';
	import { toWidgetData } from '$lib/components/profile/_framework/profile-widget-data';
	import { LOCAL_PROFILE_KEY, type LocalProfileContext } from '$lib/database/profile-local';
	import * as m from '$lib/paraglide/messages.js';

	let { slug }: { slug: CardSubpageSlug } = $props();

	const ctx = getContext<LocalProfileContext>(LOCAL_PROFILE_KEY);
	const data = $derived(ctx.payload);
	const sub = $derived(resolveCardSubpageSlug(slug));
	const rows = $derived(data && sub ? data.settings.panes[sub.pane] : []);
	const offersNothing = $derived(!!sub && sharedWidgetsForPane(sub.pane).length === 0);
</script>

<svelte:head><title>{sub ? m.cards_subpage_title({ name: sub.name() }) : ''}</title></svelte:head>

{#if data && sub}
	{#if data.settings.campaignCategoriesOnly}
		<CategoryHiddenNotice />
	{:else if rows.length === 0 && offersNothing}
		<BorderedContainer><div class="p-8"><HelpParagraph>{m.cards_subpage_empty()}</HelpParagraph></div></BorderedContainer>
	{:else}
		<ProfileWidgets {rows} data={toWidgetData(data)} />
	{/if}
{/if}
