<!--
@component
Create or edit a play group. Controlled: the page owns the draft, and the modal is open while
there is one.
-->
<script module lang="ts">
	export interface PlayGroupDraft {
		/** null when creating. */
		uid: string | null;
		name: string;
		memberUids: string[];
	}
</script>

<script lang="ts">
	import { Button, Checkbox, Modal, TextInput, UserDisplay } from '@5argon/arkham-life-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { resolveCardOrNull } from '$lib/card-data';
	import type { LocalPlayer } from '$lib/database/document';

	interface Props {
		draft: PlayGroupDraft | null;
		roster: LocalPlayer[];
		onClose: () => void;
		onSubmit: (draft: PlayGroupDraft) => void;
	}
	let { draft = $bindable(), roster, onClose, onSubmit }: Props = $props();

	function toggle(uid: string) {
		if (!draft) return;
		const members = draft.memberUids;
		draft.memberUids = members.includes(uid) ? members.filter((u) => u !== uid) : [...members, uid];
	}
</script>

<Modal
	isOpen={draft !== null}
	{onClose}
	title={draft?.uid ? m.players_group_edit() : m.players_group_create()}
	maxWidth="md"
>
	{#if draft}
		<div class="flex flex-col gap-3 py-2">
			<TextInput
				label={m.players_name()}
				bind:value={draft.name}
				placeholder={m.players_group_name_placeholder()}
			/>
			<div>
				<p class="text-primary-900 dark:text-primary-100 mb-1 text-sm font-semibold">
					{m.players_group_members()}
				</p>
				<div class="flex flex-col gap-1">
					{#each roster as member (member.uid)}
						<div class="bg-primary-100 dark:bg-primary-800 flex items-center gap-3 rounded p-2">
							<Checkbox
								label={member.name}
								hideLabel
								checked={draft.memberUids.includes(member.uid)}
								onChange={() => toggle(member.uid)}
							/>
							<UserDisplay
								username={member.name}
								card={resolveCardOrNull(member.iconCardCode)}
								size="sm"
							/>
						</div>
					{/each}
					{#if roster.length === 0}
						<p class="text-primary-500 dark:text-primary-400 text-sm">{m.players_group_no_roster()}</p>
					{/if}
				</div>
			</div>
			<Button
				highlighted
				label={draft.uid ? m.players_save() : m.players_group_create_submit()}
				disabled={draft.name.trim().length === 0}
				onClick={() => draft && onSubmit({ ...draft, name: draft.name.trim() })}
			/>
		</div>
	{/if}
</Modal>
