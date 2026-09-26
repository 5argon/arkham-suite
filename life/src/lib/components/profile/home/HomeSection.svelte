<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { BorderedContainer, SectionSeparator, UserDisplay } from '@5argon/arkham-life-ui';
	import { cardByCode } from '$lib/card-data';
	import type { ProfilePayload } from '$lib/profile/profile-types';
	import ProfileWidgets from '$lib/components/profile/_framework/ProfileWidgets.svelte';
	import { NavTile, ProfilePane } from '$lib/components/profile/_primitives';

	function navTiles(data: ProfilePayload, base: string) {
		const tiles = [
			{
				label: m.home_nav_campaigns_label(),
				href: `${base}/campaigns`,
				blurb: m.home_nav_campaigns_blurb()
			}
		];
		// Cards and Investigators are read from decks alone.
		if (!data.settings.campaignCategoriesOnly)
			tiles.push(
				{ label: m.home_nav_cards_label(), href: `${base}/cards`, blurb: m.home_nav_cards_blurb() },
				{
					label: m.home_nav_investigators_label(),
					href: `${base}/investigators`,
					blurb: m.home_nav_investigators_blurb()
				}
			);
		if (data.standalones?.length)
			tiles.push({
				label: m.home_nav_standalones_label(),
				href: `${base}/standalones`,
				blurb: m.home_nav_standalones_blurb()
			});
		return tiles;
	}
</script>

<ProfilePane title={m.home_page_title()}>
	{#snippet children(data, base)}
		<div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
			{#each navTiles(data, base) as nav (nav.href)}
				<NavTile href={nav.href} label={nav.label} detail={nav.blurb} />
			{/each}
		</div>

		{#if data.subject.kind === 'group' && data.subject.members.length}
			<div class="mt-6">
				<SectionSeparator title={m.home_members_title()} />
				<BorderedContainer>
					<div class="flex flex-wrap gap-4 p-4">
						{#each data.subject.members as member, i (i)}
							<UserDisplay
								username={member.name}
								card={member.iconCardCode ? (cardByCode(member.iconCardCode) ?? null) : null}
								size="sm"
							/>
						{/each}
					</div>
				</BorderedContainer>
			</div>
		{/if}

		<ProfileWidgets rows={data.settings.panes.home} payload={data} />
	{/snippet}
</ProfilePane>
