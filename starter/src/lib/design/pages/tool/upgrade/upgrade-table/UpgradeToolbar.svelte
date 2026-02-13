<script lang="ts">
	import type { GlobalSettings } from '$lib/proto/generated/global_settings';
	import type { ToolbarEvents } from '$lib/tool/upgrade/upgrade-table/table-events';
	import { Button, Checkbox, FaIconType } from '@5argon/arkham-life-ui';

	import type { CardResolver } from '@5argon/arkham-kohaku';

	interface Props {
		toolbarEvents: ToolbarEvents;
		cardResolver: CardResolver;
		gs: GlobalSettings;
	}

	let { toolbarEvents, cardResolver, gs }: Props = $props();

	let tabooChecked = $derived(gs.taboo);
</script>

<div class="flex flex-wrap justify-center items-center gap-2 p-4">
	<Button icon={FaIconType.Add} label="Card Row" onClick={toolbarEvents.onAddCardRow} />
	<Button icon={FaIconType.Add} label="Divider Row" onClick={toolbarEvents.onAddDividerRow} />
	<Button icon={FaIconType.Delete} label="Clear" onClick={toolbarEvents.onClear} />
	<Button
		icon={FaIconType.Export}
		label="Export"
		onClick={() => toolbarEvents.onExportMarkdown(cardResolver)}
	/>
	<Checkbox
		bind:checked={tabooChecked}
		label="Latest Taboo"
		onChange={() => toolbarEvents.onTabooToggle(tabooChecked)}
	/>
</div>
