<script lang="ts">
	import { page } from '$app/state';
	import { onMount, setContext, type Snippet } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { BorderedContainer, Button, HelpParagraph, MarginFull, UserDisplay } from '@5argon/arkham-life-ui';
	import { u as stringUtils } from '@5argon/arkham-string';
	import { Campaign, CardClass } from '@5argon/arkham-kohaku';
	import { resolveCardSubpageSlug } from '$lib/campaign/profile/profile-card-subpages';
	import { getAllCards } from '$lib/card-data';
	import { databaseStore } from '$lib/database/database.svelte';
	import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
	import { LOCAL_PROFILE_KEY, type LocalProfileContext } from '$lib/database/profile-local';
	import { preloader } from '$lib/preload/preloader.svelte';

	const { children }: { children: Snippet } = $props();

	// Idempotent: resolves the store's loading status on a direct visit. Landing on
	// ANY profile section, warm this subject's whole viewing subtree (every part
	// shares one compiled payload) so navigating around the profile is instant.
	onMount(async () => {
		await ensureDatabaseLoaded();
		const { scope, handle } = page.params as { scope?: 'private' | 'loaded'; handle: string };
		if (scope) preloader.warmProfile(handle, `/p/${scope}/${handle}`, scope);
	});

	const allCards = getAllCards();

	// One `/p/<handle>/…` namespace. The OPTIONAL scope segment (matcher: only `private`
	// /`loaded`) decides how `handle` is read:
	//   - `private` : a MANAGED subject (roster member / play group), rebuilt live here.
	//   - `loaded`  : an externally opened `.ahlifepro`, from its immutable snapshot.
	//   - (absent)  : a VANITY handle → the future PUBLIC/hosted profile (one segment
	//                 shallower: `/p/<vanity>/…`). Not yet wired — shown as coming soon.
	const scope = $derived((page.params as { scope?: 'private' | 'loaded' }).scope);
	const handle = $derived((page.params as { handle: string }).handle);
	const isVanity = $derived(!scope);
	// Only managed (`private`) profiles are editable; loaded snapshots and (future) public
	// vanity profiles are read-only.
	const isReadOnly = $derived(scope !== 'private');
	const base = $derived(scope ? `/p/${scope}/${handle}` : `/p/${handle}`);

	// Payload: managed subjects via the precompute cache (built fresh on miss); loaded
	// subjects hydrated from their stored snapshot (null if that uid isn't in the loaded
	// section — e.g. a managed uid typed into a /p/loaded/... URL); vanity not yet resolvable.
	const payload = $derived(
		!databaseStore.doc || isVanity
			? null
			: scope === 'loaded'
				? databaseStore.getLoadedProfilePayload(handle)
				: databaseStore.getProfilePayload(handle),
	);
	setContext<LocalProfileContext>(LOCAL_PROFILE_KEY, {
		get payload() {
			return payload;
		},
		get base() {
			return base;
		},
	});

	function cardFor(code: string | null | undefined) {
		return code ? (allCards.find((c) => c.code === code) ?? null) : null;
	}

	// Who/what this profile is about — read straight from the payload (card art via
	// the ambient card database). Rendered as the leading "home" crumb.
	const header = $derived(payload?.subject ?? null);

	// Section crumbs after the identity (which is the home crumb).
	const tail = $derived(
		page.url.pathname.slice(base.length).replace(/^\//, '').replace(/\/$/, '').split('/').filter(Boolean),
	);
	function campaignLabel(slug: string): string {
		return (Object.values(Campaign) as string[]).includes(slug) ? stringUtils.campaignName(slug as Campaign) : slug;
	}
	function classLabel(slug: string): string {
		return (Object.values(CardClass) as string[]).includes(slug) ? stringUtils.cardClass(slug as CardClass) : slug;
	}
	const crumbs = $derived.by((): { label: string; href: string }[] => {
		const out: { label: string; href: string }[] = [];
		const [section, slug] = tail;
		if (section === 'campaigns') {
			out.push({ label: m.framework_page_crumb_campaigns(), href: `${base}/campaigns` });
			if (slug) out.push({ label: campaignLabel(slug), href: `${base}/campaigns/${slug}` });
		} else if (section === 'cards') {
			out.push({ label: m.framework_page_crumb_player_cards(), href: `${base}/cards` });
			// A card sub-page slug (core/asset/…) resolves to its localized name; otherwise
			// it's a card-class slug (guardian/…) handled by classLabel.
			if (slug)
				out.push({
					label: resolveCardSubpageSlug(slug)?.name() ?? classLabel(slug),
					href: `${base}/cards/${slug}`,
				});
		} else if (section === 'investigators') {
			out.push({ label: m.framework_page_crumb_investigators(), href: `${base}/investigators` });
			if (slug) out.push({ label: classLabel(slug), href: `${base}/investigators/${slug}` });
		} else if (section === 'standalones') {
			out.push({ label: 'Standalones', href: `${base}/standalones` });
			// tail: standalones / (pack|campaign) / [campaign?] / scenario
			const scenarioId = tail[tail.length - 1];
			if (tail.length > 1 && scenarioId && scenarioId !== 'pack' && scenarioId !== 'campaign') {
				out.push({
					label: scenarioId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
					href: page.url.pathname,
				});
			}
		}
		return out;
	});
	// Customize this very page's widgets: append /customize to the current path.
	const customizeHref = $derived(`${page.url.pathname.replace(/\/$/, '')}/customize`);
	// The Standalones section uses a fixed layout (no widget customization yet).
	const isCustomizable = $derived(tail[0] !== 'standalones');
</script>

<MarginFull>
	{#if databaseStore.status === 'loading'}
		<div class="text-primary-400 flex items-center justify-center gap-2 py-16 text-sm">
			<span class="border-primary-300 dark:border-primary-600 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
			{m.framework_page_loading_database()}
		</div>
	{:else if isVanity}
		<!-- `/p/<vanity>` — the future public/hosted profile. Route shape is live (so the
		     subtree is shared with private/loaded), but resolving a vanity to a profile is
		     not built yet. -->
		<BorderedContainer>
			<div class="flex flex-col items-center gap-3 p-8 text-center">
				<HelpParagraph>{m.framework_page_vanity_coming_soon()}</HelpParagraph>
				<Button highlighted label={m.framework_page_all_profiles()} onClick="/p" />
			</div>
		</BorderedContainer>
	{:else if !databaseStore.doc}
		<BorderedContainer>
			<div class="flex flex-col items-center gap-3 p-8 text-center">
				<HelpParagraph>{m.framework_page_no_database_see_profile()}</HelpParagraph>
				<Button highlighted label={m.framework_page_create_database()} onClick="/new" />
			</div>
		</BorderedContainer>
	{:else if scope === 'loaded' && !payload}
		<BorderedContainer>
			<div class="flex flex-col items-center gap-3 p-8 text-center">
				<HelpParagraph>{m.framework_page_loaded_profile_not_found()}</HelpParagraph>
				<Button highlighted label={m.framework_page_all_profiles()} onClick="/p" />
			</div>
		</BorderedContainer>
	{:else}
		<!-- Compact top bar: All-profiles · identity (home crumb) · breadcrumb · customize -->
		<div class="border-primary-200 dark:border-primary-700 mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b pb-3">
			<nav class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
				<a href="/p" class="text-primary-500 dark:text-primary-400 hover:text-black dark:hover:text-white hover:underline">← {m.framework_page_all_profiles()}</a>
				<span class="text-primary-300 dark:text-primary-600">|</span>
				<a href={base} class="flex items-center font-semibold text-black hover:underline dark:text-white">
					{#if header?.kind === 'group'}
						<span>{header.name}</span>
					{:else if header}
						<UserDisplay username={header.name} card={cardFor(header.iconCardCode)} size="sm" />
					{/if}
				</a>
				{#each crumbs as crumb, i (crumb.href)}
					<span class="text-primary-400 opacity-60">/</span>
					{#if i === crumbs.length - 1}
						<span class="font-medium text-black dark:text-white">{crumb.label}</span>
					{:else}
						<a class="text-primary-500 dark:text-primary-400 hover:text-black dark:hover:text-white hover:underline" href={crumb.href}>{crumb.label}</a>
					{/if}
				{/each}
			</nav>
			<div class="flex items-center gap-3">
				<!-- Only managed (private) profiles recompute / are customizable; loaded snapshots
				     and (future) public vanity profiles are read-only. -->
				{#if !isReadOnly && databaseStore.profileStatus === 'updating'}
					<span class="text-primary-400 flex items-center gap-1 text-xs">
						<span class="border-primary-300 dark:border-primary-600 h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"></span>
						{m.framework_page_updating()}
					</span>
				{/if}
				{#if isReadOnly}
					<span class="text-primary-400 text-xs">{m.framework_page_loaded_readonly()}</span>
				{:else if isCustomizable}
					<a class="text-secondary-600 dark:text-secondary-400 text-sm hover:underline" href={customizeHref}>✎ {m.framework_page_customize_this_page()}</a>
				{/if}
			</div>
		</div>

		{@render children()}
	{/if}
</MarginFull>
