<!--
@component
Edits the team name, author, and description shown in view mode and copied
into exported decks. Fields are capped at TEAM_INFO_LIMITS.
-->
<script lang="ts">
	import { Button, Modal, TextArea, TextInput } from '@5argon/arkham-life-ui';

	import * as m from '$lib/paraglide/messages.js';
	import { clampTeamInfo, TEAM_INFO_LIMITS } from '$lib/tool/evergreen-team/team-info';
	import type { TeamInfo } from '$lib/tool/evergreen-team/types';

	interface Prop {
		info: TeamInfo;
		isOpen: boolean;
		onSave: (info: TeamInfo) => void;
		onClose: () => void;
	}
	const { info, isOpen, onSave, onClose }: Prop = $props();

	// Draft copies seeded once: the modal is mounted per open, and the team
	// is only touched on Save.
	const getInitial = () => info;
	let name = $state(getInitial().name);
	let author = $state(getInitial().author);
	let description = $state(getInitial().description);

	function limit(value: string, max: number): string {
		return value.slice(0, max);
	}

	function counter(value: string, max: number): string {
		return m.tool_evergreen_team_info_chars({ count: value.length, max });
	}

	function save() {
		onSave(clampTeamInfo({ name, author, description }));
	}
</script>

<Modal {isOpen} {onClose} title={m.tool_evergreen_team_info_title()}>
	<div class="flex flex-col gap-3">
		<p class="text-primary-700 dark:text-primary-300 text-sm">
			{m.tool_evergreen_team_info_help()}
		</p>
		<TextInput
			label={m.tool_evergreen_team_info_name()}
			bind:value={name}
			oninput={(v) => (name = limit(v, TEAM_INFO_LIMITS.name))}
			feedback={{ type: 'info', message: counter(name, TEAM_INFO_LIMITS.name) }}
		/>
		<TextInput
			label={m.tool_evergreen_team_info_author()}
			bind:value={author}
			oninput={(v) => (author = limit(v, TEAM_INFO_LIMITS.author))}
			feedback={{ type: 'info', message: counter(author, TEAM_INFO_LIMITS.author) }}
		/>
		<TextArea
			label={m.tool_evergreen_team_info_description()}
			bind:value={description}
			rows={4}
			oninput={() => (description = limit(description, TEAM_INFO_LIMITS.description))}
			feedback={{ type: 'info', message: counter(description, TEAM_INFO_LIMITS.description) }}
		/>
		<div class="flex justify-end gap-2">
			<Button label={m.tool_evergreen_team_info_save()} onClick={save} />
		</div>
	</div>
</Modal>
