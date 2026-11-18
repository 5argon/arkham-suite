<!-- @component A card-type page: its widget layout, or a placeholder when the page offers no widgets. -->
<script lang="ts">
	import { BorderedContainer, HelpParagraph } from '@5argon/arkham-life-ui';
	import {
		resolveCardSubpageSlug,
		type CardSubpageSlug
	} from '$lib/campaign/profile/profile-card-subpages';
	import { sharedWidgetsForPane } from '$lib/campaign/profile/profile-widgets';
	import ProfileWidgets from '$lib/components/profile/_framework/ProfileWidgets.svelte';
	import { ProfilePane } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';

	let { slug }: { slug: CardSubpageSlug } = $props();

	const sub = $derived(resolveCardSubpageSlug(slug));
</script>

{#if sub}
	<ProfilePane title={m.cards_subpage_title({ name: sub.name() })} deckDerived>
		{#snippet children(data)}
			{@const rows = data.settings.panes[sub.pane]}
			{#if rows.length === 0 && sharedWidgetsForPane(sub.pane).length === 0}
				<BorderedContainer>
					<div class="p-8"><HelpParagraph>{m.cards_subpage_empty()}</HelpParagraph></div>
				</BorderedContainer>
			{:else}
				<ProfileWidgets {rows} payload={data} />
			{/if}
		{/snippet}
	</ProfilePane>
{/if}
