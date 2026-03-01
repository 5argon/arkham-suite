<script lang="ts">
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import {
		BackButton,
		BorderedContainer,
		Button,
		FaIconType,
		HelpParagraph,
		MarginFull,
		PageLead,
		SectionSeparator,
		UserDisplay
	} from '@5argon/arkham-life-ui';
	import { createCardResolver } from '$lib/card-data';
	import { databaseStore } from '$lib/database/database.svelte';
	import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
	import { allPlayers } from '$lib/database/document';

	// Idempotent: resolves the store's loading status on a direct visit.
	onMount(() => void ensureDatabaseLoaded());

	const cardResolver = createCardResolver();

	const owner = $derived(databaseStore.doc?.owner ?? null);
	const subPlayers = $derived(databaseStore.doc?.players ?? []);
	const groups = $derived(databaseStore.doc?.playGroups ?? []);

	// Same resolver the rest of the app uses (handles aliased/variant codes); never throws.
	function cardFor(code: string | undefined) {
		if (!code) return null;
		try {
			return cardResolver.resolve(code);
		} catch {
			return null;
		}
	}
	function memberNames(memberUids: string[]): string {
		if (!databaseStore.doc) return '';
		const byUid = new Map(allPlayers(databaseStore.doc).map((p) => [p.uid, p.name]));
		return memberUids.map((u) => byUid.get(u) ?? '?').join(', ');
	}

	// Export ONE subject's compiled profile (gzip `.ahlifepro` or plain `.json`).
	async function exportProfile(uid: string, format: 'gzip' | 'json') {
		await databaseStore.exportCompiledProfileFor(uid, format);
	}
</script>

<svelte:head><title>{m.framework_page_profiles_head()}</title></svelte:head>

<MarginFull>
	<div class="mb-4">
		<BackButton label={m.framework_page_home()} onClick="/" />
	</div>

	<PageLead
		title={m.framework_page_profiles_title()}
		description={m.framework_page_profiles_description()}
	/>

	{#if databaseStore.status === 'loading'}
		<div class="text-primary-400 flex items-center justify-center gap-2 py-16 text-sm">
			<span
				class="border-primary-300 dark:border-primary-600 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
			></span>
			{m.framework_page_loading_database()}
		</div>
	{:else if !databaseStore.doc || !owner}
		<BorderedContainer>
			<div class="flex flex-col items-center gap-3 p-8 text-center">
				<HelpParagraph>{m.framework_page_no_database_create_profile()}</HelpParagraph>
				<Button highlighted label={m.framework_page_create_database()} onClick="/new" />
			</div>
		</BorderedContainer>
	{:else}
		{#snippet profileRow(uid: string, label: import('svelte').Snippet)}
			<div class="bg-primary-100 dark:bg-primary-800 flex flex-wrap items-center gap-3 rounded p-3">
				{@render label()}
				<span
					class="text-primary-500 dark:text-primary-400 font-mono text-xs"
					title={m.framework_page_uid_hint()}>{uid}</span
				>
				<div class="ml-auto flex flex-wrap gap-2">
					<Button
						label={m.framework_page_private_profile()}
						icon={FaIconType.ExternalLink}
						onClick={`/p/private/${uid}`}
					/>
					<Button
						label={m.framework_page_export_profile_compiled()}
						icon={FaIconType.Export}
						onClick={() => exportProfile(uid, 'gzip')}
					/>
					<Button
						label={m.framework_page_export_profile_json()}
						icon={FaIconType.Export}
						onClick={() => exportProfile(uid, 'json')}
					/>
				</div>
			</div>
		{/snippet}

		<SectionSeparator title={m.framework_page_you()} />
		<div class="mb-2">
			{#snippet ownerLabel()}
				<UserDisplay username={owner.name} card={cardFor(owner.iconCardCode)} size="sm" />
			{/snippet}
			{@render profileRow(owner.uid, ownerLabel)}
		</div>

		{#if subPlayers.length}
			<SectionSeparator title={m.framework_page_other_players()} />
			<div class="mb-2 flex flex-col gap-2">
				{#each subPlayers as p (p.uid)}
					{#snippet playerLabel()}
						<UserDisplay username={p.name} card={cardFor(p.iconCardCode)} size="sm" />
					{/snippet}
					{@render profileRow(p.uid, playerLabel)}
				{/each}
			</div>
		{/if}

		{#if groups.length}
			<SectionSeparator title={m.framework_page_play_groups()} />
			<div class="mb-2 flex flex-col gap-2">
				{#each groups as g (g.uid)}
					{#snippet groupLabel()}
						<div class="flex flex-col">
							<span class="text-base font-semibold text-black dark:text-white">{g.name}</span>
							<span class="text-primary-500 dark:text-primary-400 text-xs">
								{g.memberUids.length ? memberNames(g.memberUids) : m.framework_page_no_members()}
							</span>
						</div>
					{/snippet}
					{@render profileRow(g.uid, groupLabel)}
				{/each}
			</div>
		{/if}
		<p class="text-primary-500 dark:text-primary-400 mt-4 text-xs">
			{m.framework_page_compiled_note()}
			<a class="underline" href="/guides#file-types">{m.common_learn_more()}</a>
		</p>
	{/if}
</MarginFull>
