<!--
@component
Editor toolbar: undo / redo, Finish (to view mode, where sharing, exporting
and gathering live), team info, collection toggle, and the two destructive
actions.
-->
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
		onEditInfo,
		onStartOver,
		onDeleteTeam
	}: Prop = $props();

	function finish() {
		goto(resolve(`/tool/team-builder/view?t=${encoded}`, {}));
	}
</script>

<div class="flex flex-col items-center gap-1">
	<div class="flex flex-wrap items-center justify-center gap-2">
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
			highlighted
			icon={FaIconType.CardViewModeScans}
			label={m.tool_evergreen_team_view_mode()}
			onClick={finish}
		/>
		<Button
			icon={FaIconType.Edit}
			label={m.tool_evergreen_team_info_button()}
			onClick={onEditInfo}
		/>
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
	<p class="text-primary-600 dark:text-primary-400 text-xs">
		{m.tool_evergreen_team_finish_hint()}
	</p>
</div>
