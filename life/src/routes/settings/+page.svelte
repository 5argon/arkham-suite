<script lang="ts">
	import { onMount } from 'svelte';
	import { BackButton, BorderedContainer, Button, HelpParagraph, MarginFull, PageLead, SectionSeparator, TextButton, getToastContext } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { databaseStore } from '$lib/database/database.svelte';
	import { ensureDatabaseLoaded } from '$lib/database/bootstrap';
	import { resolveProfileSettings } from '$lib/campaign/profile-settings';
	import ProfileGlobalsEditor from '$lib/components/profile/_framework/ProfileGlobalsEditor.svelte';

	// Idempotent: resolves the store's loading status on a direct visit.
	onMount(() => void ensureDatabaseLoaded());

	const initialSettings = $derived(resolveProfileSettings(databaseStore.doc?.profileSettings));

	const toast = getToastContext();
	let editor = $state<{ currentPayload(): string }>();
	// Bumped when a reset rewrites the doc, to remount the editor so its controls
	// re-snapshot the fresh globals (otherwise a later Save would rewrite stale ones).
	let editorNonce = $state(0);
	function save() {
		if (!editor) return;
		databaseStore.setProfileSettings(editor.currentPayload());
		toast.success('Settings saved.');
	}

	function resetCampaignPages() {
		if (!confirm('Reset every campaign page back to its default layout? Your other settings are kept.')) return;
		const next = { ...resolveProfileSettings(databaseStore.doc?.profileSettings), campaigns: {} };
		databaseStore.setProfileSettings(JSON.stringify(next));
		toast.info('Campaign pages reset to default.');
	}
	function resetEverything() {
		if (!confirm('Reset ALL profile settings and widget layouts to their defaults? This cannot be undone.')) return;
		databaseStore.setProfileSettings(null); // null → resolves to fresh defaults
		editorNonce++; // re-snapshot the globals editor from the reset defaults
		toast.info('Profile settings reset to defaults.');
	}
</script>

<svelte:head><title>{m.settings_page_title()}</title></svelte:head>

<MarginFull>
	<div class="mb-4">
		<BackButton label="Home" onClick="/" />
	</div>
	<PageLead title={m.settings_title()} description={m.settings_description()} />

	{#if databaseStore.status === 'loading'}
		<div class="text-primary-400 flex items-center justify-center gap-2 py-16 text-sm">
			<span class="border-primary-300 dark:border-primary-600 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
			Loading…
		</div>
	{:else if !databaseStore.doc}
		<BorderedContainer>
			<div class="p-8"><HelpParagraph>No campaign database in this browser yet.</HelpParagraph></div>
		</BorderedContainer>
	{:else}
		{#key editorNonce}
			<ProfileGlobalsEditor bind:this={editor} {initialSettings} />
		{/key}
		<div class="mt-6">
			<Button highlighted label="Save settings" onClick={save} />
		</div>

		<div class="mt-8">
			<SectionSeparator title="Reset" />
			<div class="flex flex-wrap gap-4">
				<TextButton tone="warning" label="Reset all campaign-specific pages" onClick={resetCampaignPages} />
				<TextButton tone="warning" label="Reset everything to default" onClick={resetEverything} />
			</div>
		</div>
	{/if}
</MarginFull>
