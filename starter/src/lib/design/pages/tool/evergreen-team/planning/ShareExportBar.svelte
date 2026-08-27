<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button, FaIconType } from '@5argon/arkham-life-ui';

	import * as m from '$lib/paraglide/messages.js';

	interface Prop {
		encoded: string;
		collectionVisible: boolean;
		canUndo: boolean;
		canRedo: boolean;
		onUndo: () => void;
		onRedo: () => void;
		onToggleCollection: () => void;
		onExport: () => void;
		onEditInfo: () => void;
		/**
		 * Returns every drafted card to the collection, keeping the team.
		 */
		onStartOver: () => void;
		/**
		 * Discards the whole team and returns to setup.
		 */
		onDeleteTeam: () => void;
	}
	const {
		encoded,
		collectionVisible,
		canUndo,
		canRedo,
		onUndo,
		onRedo,
		onToggleCollection,
		onExport,
		onEditInfo,
		onStartOver,
		onDeleteTeam
	}: Prop = $props();

	let copied = $state(false);

	function copyShareLink() {
		navigator.clipboard.writeText(`https://arkham-starter.com/tool/team-builder?t=${encoded}`);
		copied = true;
		setTimeout(() => (copied = false), 1800);
	}

	function openViewMode() {
		goto(resolve(`/tool/team-builder/view?t=${encoded}`, {}));
	}
</script>

<div class="flex flex-wrap items-center gap-2">
	<Button
		hideLabel
		disabled={!canUndo}
		icon={FaIconType.Reset}
		label={m.tool_evergreen_team_undo()}
		onClick={onUndo}
	/>
	<Button
		hideLabel
		disabled={!canRedo}
		icon={FaIconType.Redo}
		label={m.tool_evergreen_team_redo()}
		onClick={onRedo}
	/>
	<Button
		icon={FaIconType.Export}
		label={copied ? m.tool_evergreen_team_share_copied() : m.tool_evergreen_team_share_copy()}
		onClick={copyShareLink}
	/>
	<Button
		icon={FaIconType.CardViewModeScans}
		label={m.tool_evergreen_team_view_mode()}
		onClick={openViewMode}
	/>
	<Button icon={FaIconType.Edit} label={m.tool_evergreen_team_info_button()} onClick={onEditInfo} />
	<Button icon={FaIconType.Import} label={m.tool_evergreen_team_export()} onClick={onExport} />
	<Button
		icon={collectionVisible ? FaIconType.Collapse : FaIconType.FoldoutRight}
		label={collectionVisible
			? m.tool_evergreen_team_hide_collection()
			: m.tool_evergreen_team_show_collection()}
		onClick={onToggleCollection}
	/>
	<Button
		danger
		icon={FaIconType.Broom}
		label={m.tool_evergreen_team_start_over()}
		onClick={onStartOver}
	/>
	<Button
		danger
		icon={FaIconType.Delete}
		label={m.tool_evergreen_team_delete_team()}
		onClick={onDeleteTeam}
	/>
</div>
