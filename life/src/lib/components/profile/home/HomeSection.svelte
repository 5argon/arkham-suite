<script lang="ts">
	import { getContext } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { BorderedContainer, SectionSeparator, UserDisplay } from '@5argon/arkham-life-ui';
	import { createCardResolver } from '$lib/card-data';
	import ProfileWidgets from '$lib/components/profile/_framework/ProfileWidgets.svelte';
	import { toWidgetData } from '$lib/components/profile/_framework/profile-widget-data';
	import { LOCAL_PROFILE_KEY, type LocalProfileContext } from '$lib/database/profile-local';

	const ctx = getContext<LocalProfileContext>(LOCAL_PROFILE_KEY);
	const data = $derived(ctx.payload);
	const base = $derived(ctx.base);
	const homeRows = $derived(data ? data.settings.panes.home : []);

	// Resolves a member's investigator card for their avatar; from the ambient card
	// database (bundled), so the Members section renders standalone — no live doc.
	const cardResolver = createCardResolver();
	function cardFor(code: string | null) {
		if (!code) return null;
		try {
			return cardResolver.resolve(code);
		} catch {
			return null;
		}
	}

	// Cards & Investigators are entirely deck-derived; "show only campaign categories" drops
	// them from the nav (a profile with no imported decks has nothing there).
	const campaignOnly = $derived(data?.settings.campaignCategoriesOnly ?? false);
	const navCards = $derived.by(() => {
		const all = [
			{
				label: m.home_nav_campaigns_label(),
				href: `${base}/campaigns`,
				blurb: m.home_nav_campaigns_blurb(),
			},
			{ label: m.home_nav_cards_label(), href: `${base}/cards`, blurb: m.home_nav_cards_blurb() },
			{
				label: m.home_nav_investigators_label(),
				href: `${base}/investigators`,
				blurb: m.home_nav_investigators_blurb(),
			},
		];
		return campaignOnly ? all.slice(0, 1) : all;
	});
</script>

<svelte:head><title>{m.home_page_title()}</title></svelte:head>

{#if data}
	<div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
		{#each navCards as nav (nav.href)}
			<a href={nav.href} class="block">
				<BorderedContainer>
					<div class="flex items-center justify-between gap-3 p-4 transition hover:opacity-80">
						<div class="min-w-0">
							<p class="font-semibold text-black dark:text-white">{nav.label}</p>
							<p class="text-primary-500 dark:text-primary-400 truncate text-xs">{nav.blurb}</p>
						</div>
						<span class="text-secondary-500 shrink-0 text-lg">→</span>
					</div>
				</BorderedContainer>
			</a>
		{/each}
	</div>

	{#if data.subject.kind === 'group' && data.subject.members.length}
		<div class="mt-6">
			<SectionSeparator title={m.home_members_title()} />
			<BorderedContainer>
				<div class="flex flex-wrap gap-4 p-4">
					{#each data.subject.members as member, i (i)}
						<UserDisplay username={member.name} card={cardFor(member.iconCardCode)} size="sm" />
					{/each}
				</div>
			</BorderedContainer>
		</div>
	{/if}

	<ProfileWidgets rows={homeRows} data={toWidgetData(data)} />
{/if}
