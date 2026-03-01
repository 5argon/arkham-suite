<script lang="ts">
	import { Button, Modal, TextInput, UserDisplay } from '@5argon/arkham-life-ui';
	import type { Card } from '@5argon/arkham-kohaku';

	type RosterMember = { uid: string; name: string; iconCardCode: string };

	let {
		isOpen,
		title,
		submitLabel,
		roster,
		resolveCard,
		initialName = '',
		initialMemberUids = [],
		onClose,
		onSubmit,
	}: {
		isOpen: boolean;
		title: string;
		submitLabel: string;
		roster: RosterMember[];
		resolveCard: (code: string) => Card | null;
		initialName?: string;
		initialMemberUids?: string[];
		onClose: () => void;
		onSubmit: (fields: { name: string; memberUids: string[] }) => void;
	} = $props();

	let name = $state(initialName);
	let selected = $state<Set<string>>(new Set(initialMemberUids));

	// Re-seed the form whenever the modal (re)opens with new inputs.
	let lastOpen = $state(false);
	$effect(() => {
		if (isOpen && !lastOpen) {
			name = initialName;
			selected = new Set(initialMemberUids);
		}
		lastOpen = isOpen;
	});

	function toggle(uid: string) {
		const next = new Set(selected);
		if (next.has(uid)) next.delete(uid);
		else next.add(uid);
		selected = next;
	}

	function submit() {
		const trimmed = name.trim();
		if (trimmed.length === 0) return;
		onSubmit({ name: trimmed, memberUids: [...selected] });
	}
</script>

<Modal {isOpen} {onClose} {title} maxWidth="md">
	<div class="flex flex-col gap-3 py-2">
		<TextInput label="Name" bind:value={name} placeholder="e.g. Thursday Crew" />
		<div>
			<p class="text-primary-900 dark:text-primary-100 mb-1 text-sm font-semibold">Members</p>
			<div class="flex flex-col gap-1">
				{#each roster as m (m.uid)}
					<label class="bg-primary-100 dark:bg-primary-800 flex cursor-pointer items-center gap-3 rounded p-2">
						<input type="checkbox" checked={selected.has(m.uid)} onchange={() => toggle(m.uid)} />
						<UserDisplay username={m.name} card={resolveCard(m.iconCardCode)} size="sm" />
					</label>
				{/each}
				{#if roster.length === 0}
					<p class="text-primary-500 dark:text-primary-400 text-sm">No players to add yet.</p>
				{/if}
			</div>
		</div>
		<Button highlighted label={submitLabel} disabled={name.trim().length === 0} onClick={submit} />
	</div>
</Modal>
