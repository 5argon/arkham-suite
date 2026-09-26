<script lang="ts">
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
		Tabs,
		TextBox,
		TextInput,
		UserDisplay
	} from '@5argon/arkham-life-ui';
	import { resolveCardOrNull } from '$lib/card-data';
	import { databaseStore } from '$lib/database/database.svelte';
	import { allPlayers } from '$lib/database/document';
	import { readDataFile } from '$lib/database/file-format';
	import { parseCompiledProfileFile } from '$lib/database/compiled-profile';
	import DatabaseGate from '$lib/components/DatabaseGate.svelte';
	import FilePickerButton from '$lib/components/FilePickerButton.svelte';
	import { toDirectDownloadUrl, buildCpViewerUrl } from '$lib/profile/cloud-url';

	const loaded = $derived(databaseStore.loadedSubjects());

	let activeTab = $state(0);

	const cardFor = (code: string | undefined | null) => (code ? resolveCardOrNull(code) : null);
	function memberNames(memberUids: string[]): string {
		if (!databaseStore.doc) return '';
		const byUid = new Map(allPlayers(databaseStore.doc).map((p) => [p.uid, p.name]));
		return memberUids.map((u) => byUid.get(u) ?? '?').join(', ');
	}
	function fmtDate(iso: string): string {
		const d = new Date(iso);
		return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
	}

	async function exportProfile(uid: string, format: 'gzip' | 'json') {
		await databaseStore.exportCompiledProfileFor(uid, format);
	}

	// ─── External Profiles tab ────────────────────────────────────────────────
	let loadError = $state<string | null>(null);

	async function handleLoadFile(file: File) {
		loadError = null;
		try {
			databaseStore.loadCompiledProfile(parseCompiledProfileFile(await readDataFile(file)));
		} catch (e) {
			loadError = e instanceof Error ? e.message : m.database_open_error();
		}
	}

	async function exportLoaded(uid: string, format: 'gzip' | 'json') {
		await databaseStore.exportLoadedProfile(uid, format);
	}
	function removeLoaded(uid: string) {
		if (confirm(m.framework_page_remove_confirm())) databaseStore.removeLoadedProfile(uid);
	}

	// cp= link builder.
	let shareUrl = $state('');
	let builtLink = $state<string | null>(null);
	let linkError = $state<string | null>(null);
	let copied = $state(false);
	function buildLink() {
		linkError = null;
		copied = false;
		builtLink = null;
		const direct = toDirectDownloadUrl(shareUrl);
		if (!direct) {
			linkError = m.framework_page_external_link_invalid();
			return;
		}
		const origin = typeof window !== 'undefined' ? window.location.origin : '';
		builtLink = buildCpViewerUrl(direct.url, origin);
	}
	async function copyLink() {
		if (!builtLink) return;
		try {
			await navigator.clipboard.writeText(builtLink);
			copied = true;
		} catch {
			/* clipboard blocked — the link is still selectable in the field */
		}
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

	<DatabaseGate>
		{#snippet empty()}
			<BorderedContainer>
				<div class="flex flex-col items-center gap-3 p-8 text-center">
					<HelpParagraph>{m.framework_page_no_database_create_profile()}</HelpParagraph>
					<Button highlighted label={m.framework_page_create_database()} onClick="/new" />
				</div>
			</BorderedContainer>
		{/snippet}
		{#snippet children(doc)}
			{@const owner = doc.owner}
			<div class="mb-4">
				<Tabs
					direction="horizontal"
					activeTabIndex={activeTab}
					onTabChange={(i) => (activeTab = i)}
					tabs={[
						{ label: m.framework_page_tab_this_database() },
						{ label: m.framework_page_tab_external_profiles() }
					]}
				/>
			</div>

			{#if activeTab === 0}
				<!-- ── This Database: profiles compiled from the loaded database ── -->
				{#snippet profileRow(uid: string, label: import('svelte').Snippet)}
					<div
						class="bg-primary-100 dark:bg-primary-800 flex flex-wrap items-center gap-3 rounded p-3"
					>
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

				{#if doc.players.length}
					<SectionSeparator title={m.framework_page_other_players()} />
					<div class="mb-2 flex flex-col gap-2">
						{#each doc.players as p (p.uid)}
							{#snippet playerLabel()}
								<UserDisplay username={p.name} card={cardFor(p.iconCardCode)} size="sm" />
							{/snippet}
							{@render profileRow(p.uid, playerLabel)}
						{/each}
					</div>
				{/if}

				{#if doc.playGroups.length}
					<SectionSeparator title={m.framework_page_play_groups()} />
					<div class="mb-2 flex flex-col gap-2">
						{#each doc.playGroups as g (g.uid)}
							{#snippet groupLabel()}
								<div class="flex flex-col">
									<span class="text-base font-semibold text-black dark:text-white">{g.name}</span>
									<span class="text-primary-500 dark:text-primary-400 text-xs">
										{g.memberUids.length
											? memberNames(g.memberUids)
											: m.framework_page_no_members()}
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
			{:else}
				<!-- ── External Profiles: open & keep other people's .ahlifepro ── -->
				<SectionSeparator title={m.framework_page_external_load_title()} />
				<HelpParagraph>{m.framework_page_external_load_description()}</HelpParagraph>
				<div class="mt-3 mb-2">
					<FilePickerButton
						label={m.framework_page_external_open_button()}
						accept=".ahlifepro,.json,application/gzip,application/json"
						highlighted
						onFile={handleLoadFile}
					/>
				</div>
				{#if loadError}
					<div
						class="mb-2 rounded border border-red-400 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300"
					>
						{loadError}
					</div>
				{/if}

				<SectionSeparator title={m.framework_page_external_loaded_section()} />
				{#if !loaded.length}
					<HelpParagraph>{m.framework_page_external_empty()}</HelpParagraph>
				{:else}
					<div class="mb-2 flex flex-col gap-2">
						{#each loaded as entry (entry.subject.uid)}
							<div
								class="bg-primary-100 dark:bg-primary-800 flex flex-wrap items-center gap-3 rounded p-3"
							>
								{#if entry.subject.kind === 'group'}
									<span class="text-base font-semibold text-black dark:text-white"
										>{entry.subject.name}</span
									>
								{:else}
									<UserDisplay
										username={entry.subject.name}
										card={cardFor(entry.subject.iconCardCode)}
										size="sm"
									/>
								{/if}
								<span
									class="text-primary-500 dark:text-primary-400 font-mono text-xs"
									title={m.framework_page_uid_hint()}>{entry.subject.uid}</span
								>
								<span class="text-primary-400 text-xs"
									>{m.framework_page_external_exported({ date: fmtDate(entry.exportedAt) })}</span
								>
								<div class="ml-auto flex flex-wrap gap-2">
									<Button
										label={m.framework_page_loaded_open()}
										icon={FaIconType.ExternalLink}
										onClick={`/p/loaded/${entry.subject.uid}`}
									/>
									<Button
										label={m.framework_page_export_profile_compiled()}
										icon={FaIconType.Export}
										onClick={() => exportLoaded(entry.subject.uid, 'gzip')}
									/>
									<Button
										label={m.framework_page_export_profile_json()}
										icon={FaIconType.Export}
										onClick={() => exportLoaded(entry.subject.uid, 'json')}
									/>
									<Button
										label={m.framework_page_remove()}
										icon={FaIconType.Delete}
										onClick={() => removeLoaded(entry.subject.uid)}
									/>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<SectionSeparator title={m.framework_page_external_link_title()} />
				<HelpParagraph>{m.framework_page_external_link_description()}</HelpParagraph>
				<div class="mt-3 max-w-xl">
					<TextInput
						label={m.framework_page_external_link_field()}
						bind:value={shareUrl}
						placeholder={m.framework_page_external_link_placeholder()}
						submittable={{
							submitText: m.framework_page_external_link_build(),
							onSubmit: buildLink
						}}
						feedback={{ type: 'error', message: linkError ?? undefined }}
					/>
				</div>
				{#if builtLink}
					<div class="mt-3 max-w-xl">
						<div class="text-primary-500 dark:text-primary-400 mb-1 text-xs">
							{m.framework_page_external_link_result()}
						</div>
						<div class="flex flex-wrap items-end gap-2">
							<div class="min-w-[16rem] flex-1">
								<TextBox value={builtLink} disabled />
							</div>
							<Button
								label={copied
									? m.framework_page_external_link_copied()
									: m.framework_page_external_link_copy()}
								onClick={copyLink}
							/>
						</div>
					</div>
				{/if}
			{/if}
		{/snippet}
	</DatabaseGate>
</MarginFull>
