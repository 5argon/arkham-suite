<script lang="ts">
	import { SectionSeparator } from '@5argon/arkham-life-ui';
	import { CardClass } from '@5argon/arkham-kohaku';
	import { CARD_SUBPAGES } from '$lib/campaign/profile/profile-card-subpages';
	import { classDisplayName } from '$lib/campaign/profile/profile-slugs';
	import ProfileWidgets from '$lib/components/profile/_framework/ProfileWidgets.svelte';
	import { NavTile, ProfilePane } from '$lib/components/profile/_primitives';
	import * as m from '$lib/paraglide/messages.js';
</script>

<ProfilePane title={m.cards_index_title()} deckDerived>
	{#snippet children(data, base)}
		<div class="mt-6">
			<SectionSeparator title={m.cards_index_by_type()} />
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
				{#each CARD_SUBPAGES as sub (sub.slug)}
					<NavTile href="{base}/cards/{sub.slug}" label={sub.name()} />
				{/each}
			</div>
		</div>
		<div class="mt-6">
			<SectionSeparator title={m.cards_index_by_class()} />
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
				{#each Object.values(CardClass) as cls (cls)}
					<NavTile href="{base}/cards/{cls}" label={classDisplayName(cls)} />
				{/each}
			</div>
		</div>
		<ProfileWidgets rows={data.settings.panes.cardsHome} payload={data} />
	{/snippet}
</ProfilePane>
