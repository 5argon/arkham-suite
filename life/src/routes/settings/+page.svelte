<script lang="ts">
	import {
		BackButton,
		BorderedContainer,
		Button,
		HelpParagraph,
		MarginFull,
		PageLead,
		SectionSeparator,
		TextButton,
		getToastContext
	} from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { databaseStore } from '$lib/database/database.svelte';
	import { resolveProfileSettings } from '$lib/campaign/profile/profile-settings';
	import ProfileGlobalsEditor from '$lib/components/profile/_framework/ProfileGlobalsEditor.svelte';
	import DatabaseGate from '$lib/components/DatabaseGate.svelte';

	const initialSettings = $derived(resolveProfileSettings(databaseStore.doc?.profileSettings));

	const toast = getToastContext();
	let editor = $state<{ currentPayload(): string }>();
	// Remounts the editor after a reset so a later Save does not write its stale controls back.
	let editorNonce = $state(0);
	function save() {
		if (!editor) return;
		databaseStore.setProfileSettings(editor.currentPayload());
		toast.success('Settings saved.');
	}

	function resetCampaignPages() {
		if (
			!confirm(
				'Reset every campaign page back to its default layout? Your other settings are kept.'
			)
		)
			return;
		const next = { ...resolveProfileSettings(databaseStore.doc?.profileSettings), campaigns: {} };
		databaseStore.setProfileSettings(JSON.stringify(next));
		toast.info('Campaign pages reset to default.');
	}
	function resetEverything() {
		if (
			!confirm(
				'Reset ALL profile settings and widget layouts to their defaults? This cannot be undone.'
			)
		)
			return;
		databaseStore.setProfileSettings(null);
		editorNonce++;
		toast.info('Profile settings reset to defaults.');
	}
</script>

<svelte:head><title>{m.settings_page_title()}</title></svelte:head>

<MarginFull>
	<div class="mb-4">
		<BackButton label="Home" onClick="/" />
	</div>
	<PageLead title={m.settings_title()} description={m.settings_description()} />

	<DatabaseGate>
		{#snippet empty()}
			<BorderedContainer>
				<div class="p-8">
					<HelpParagraph>No campaign database in this browser yet.</HelpParagraph>
				</div>
			</BorderedContainer>
		{/snippet}
		{#key editorNonce}
			<ProfileGlobalsEditor bind:this={editor} {initialSettings} />
		{/key}
		<div class="mt-6">
			<Button highlighted label="Save settings" onClick={save} />
		</div>

		<div class="mt-8">
			<SectionSeparator title="Reset" />
			<div class="flex flex-wrap gap-4">
				<TextButton
					tone="warning"
					label="Reset all campaign-specific pages"
					onClick={resetCampaignPages}
				/>
				<TextButton tone="warning" label="Reset everything to default" onClick={resetEverything} />
			</div>
		</div>
	</DatabaseGate>
</MarginFull>
