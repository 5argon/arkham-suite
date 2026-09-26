<script lang="ts">
	import { page } from '$app/state';
	import { onMount, type Snippet } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { BorderedContainer, Button, HelpParagraph, MarginFull, UserDisplay } from '@5argon/arkham-life-ui';
	import { resolveCardSubpageSlug } from '$lib/campaign/profile/profile-card-subpages';
	import { campaignDisplayName, classDisplayName } from '$lib/campaign/profile/profile-slugs';
	import { resolveCardOrNull } from '$lib/card-data';
	import { databaseStore } from '$lib/database/database.svelte';
	import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
	import { setProfileContext } from '$lib/components/profile/_framework/profile-context';
	import { preloader } from '$lib/preload/preloader.svelte';

	const { children }: { children: Snippet } = $props();

	// Warm the whole profile subtree so moving between its pages is instant.
	onMount(async () => {
		await ensureDatabaseLoaded();
		const { scope, handle } = page.params as { scope?: 'private' | 'loaded'; handle: string };
		if (scope) preloader.warmProfile(handle, `/p/${scope}/${handle}`, scope);
	});

	// `private`: a roster member or play group, built from the database. `loaded`: an opened
	// `.ahlifepro`, read-only. No scope: a vanity handle, not resolvable yet.
	const scope = $derived((page.params as { scope?: 'private' | 'loaded' }).scope);
	const handle = $derived((page.params as { handle: string }).handle);
	const isVanity = $derived(!scope);
	const isReadOnly = $derived(scope !== 'private');
	const base = $derived(scope ? `/p/${scope}/${handle}` : `/p/${handle}`);

	const payload = $derived(
		!databaseStore.doc || isVanity
			? null
			: scope === 'loaded'
				? databaseStore.getLoadedProfilePayload(handle)
				: databaseStore.getProfilePayload(handle),
	);
	setProfileContext({
		get payload() {
			return payload;
		},
		get base() {
			return base;
		},
	});

	const header = $derived(payload?.subject ?? null);

	const tail = $derived(
		page.url.pathname.slice(base.length).replace(/^\//, '').replace(/\/$/, '').split('/').filter(Boolean),
	);
	const crumbs = $derived.by((): { label: string; href: string }[] => {
		const out: { label: string; href: string }[] = [];
		const [section, slug] = tail;
		if (section === 'campaigns') {
			out.push({ label: m.framework_page_crumb_campaigns(), href: `${base}/campaigns` });
			if (slug) out.push({ label: campaignDisplayName(slug), href: `${base}/campaigns/${slug}` });
		} else if (section === 'cards') {
			out.push({ label: m.framework_page_crumb_player_cards(), href: `${base}/cards` });
			if (slug)
				out.push({
					label: resolveCardSubpageSlug(slug)?.name() ?? classDisplayName(slug),
					href: `${base}/cards/${slug}`,
				});
		} else if (section === 'investigators') {
			out.push({ label: m.framework_page_crumb_investigators(), href: `${base}/investigators` });
			if (slug) out.push({ label: classDisplayName(slug), href: `${base}/investigators/${slug}` });
		} else if (section === 'standalones') {
			out.push({ label: m.framework_page_crumb_standalones(), href: `${base}/standalones` });
			// standalones / (pack | campaign) / [campaign] / scenario
			const scenarioId = tail[tail.length - 1];
			if (tail.length > 1 && scenarioId && scenarioId !== 'pack' && scenarioId !== 'campaign') {
				out.push({
					label: payload?.standalones.find((s) => s.scenario === scenarioId)?.name ?? scenarioId,
					href: page.url.pathname,
				});
			}
		}
		return out;
	});
	const customizeHref = $derived(`${page.url.pathname.replace(/\/$/, '')}/customize`);
	const isCustomizable = $derived(tail[0] !== 'standalones');
</script>

<MarginFull>
	{#if databaseStore.status === 'loading'}
		<div class="text-primary-400 flex items-center justify-center gap-2 py-16 text-sm">
			<span class="border-primary-300 dark:border-primary-600 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
			{m.framework_page_loading_database()}
		</div>
	{:else if isVanity}
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
		<div class="border-primary-200 dark:border-primary-700 mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b pb-3">
			<nav class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
				<a href="/p" class="text-primary-500 dark:text-primary-400 hover:text-black dark:hover:text-white hover:underline">← {m.framework_page_all_profiles()}</a>
				<span class="text-primary-300 dark:text-primary-600">|</span>
				<a href={base} class="flex items-center font-semibold text-black hover:underline dark:text-white">
					{#if header?.kind === 'group'}
						<span>{header.name}</span>
					{:else if header}
						<UserDisplay username={header.name} card={header.iconCardCode ? resolveCardOrNull(header.iconCardCode) : null} size="sm" />
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
