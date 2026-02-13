<script lang="ts">
	import { browser } from '$app/environment';
	import {
		Button,
		Checkbox,
		Dropdown,
		type Option,
		SectionSeparator,
		TextInput,
		TextParagraph
	} from '@5argon/arkham-life-ui';
	import type { ExportOptions } from '$lib/proto/generated/export_options';
	import {
		type UpgradeExportOptions,
		UpgradeExportOptions_UpgradeExportStyle
	} from '$lib/proto/generated/upgrade_export';
	import {
		makeUpgradePlannerUrl,
		type UpgradeExport,
		upgradeExportCenter,
		type UpgradeExportRow,
		upgradeExportToProtoString
	} from '$lib/tool/script/export/export-tools-center';
	import type { CardWithQuantity } from '$lib/tool/script/export/proto-string-restore';

	interface Props {
		exportRows: UpgradeExportRow[];
		upgradeExportOptions: UpgradeExportOptions;
		exportOptions: ExportOptions;
		cardsMain?: CardWithQuantity[];
		cardsSide?: CardWithQuantity[];
		onChangeUpgradeExportOptions: (n: UpgradeExportOptions) => void;
	}

	let {
		exportRows,
		upgradeExportOptions = $bindable(),
		exportOptions,
		cardsMain = [],
		cardsSide = [],
		onChangeUpgradeExportOptions
	}: Props = $props();

	const ue = $derived<UpgradeExport>({
		upgradeExportOptions: upgradeExportOptions,
		exportOptions: exportOptions,
		upgradeRows: exportRows,
		cardsMain: cardsMain,
		cardsSide: cardsSide
	});

	const exportText = $derived(upgradeExportCenter(ue));
	const dataCode = $derived(upgradeExportToProtoString(ue));
	const link = $derived(makeUpgradePlannerUrl(dataCode));

	const exportStyleDescription = $derived.by(() => {
		const currentExportStyle = upgradeExportOptions.upgradeExportStyle;
		switch (currentExportStyle) {
			case UpgradeExportOptions_UpgradeExportStyle.MarkdownArkhamDb:
				return "For pasting in arkhamdb.com's Description area. It uses some HTML in addition to Markdown to share the same style sheet coloring as the site, therefore these would only be effective when viewing directly on the site itself.";
			case UpgradeExportOptions_UpgradeExportStyle.MarkdownArkhamCards:
				return "For pasting in arkhamdb.com's Description area that is intended to be synched into ArkhamCards app (decks you cloned to add to your campaign), which simplifies the export a bit. If you just use arkhamdb.com format, deck description viewer in ArkhamCards cannot understand site's style sheet along with many HTML objects, and two column table is difficult to view on vertical phone screen when using the app.";
			default:
				return '';
		}
	});

	const exportFormatOptions: Option<number>[] = [
		{
			value: UpgradeExportOptions_UpgradeExportStyle.MarkdownArkhamDb,
			label: 'Markdown (arkhamdb.com/arkham.build)'
		},
		{
			value: UpgradeExportOptions_UpgradeExportStyle.MarkdownArkhamCards,
			label: 'Markdown (ArkhamCards)'
		}
	];

	let selectedExportStyle = $state(
		upgradeExportOptions.upgradeExportStyle === UpgradeExportOptions_UpgradeExportStyle.Unknown
			? UpgradeExportOptions_UpgradeExportStyle.MarkdownArkhamDb
			: upgradeExportOptions.upgradeExportStyle
	);

	function copyToClipboard(s: string) {
		if (browser) {
			navigator.clipboard.writeText(s);
		}
	}

	function handleExportStyleChange(value: number) {
		const n = { ...upgradeExportOptions };
		n.upgradeExportStyle = value;
		selectedExportStyle = value;
		onChangeUpgradeExportOptions(n);
	}
</script>

<div class="space-y-4">
	<SectionSeparator title="Text" />
	<div class="mb-4">
		<Dropdown
			bind:value={selectedExportStyle}
			label="Export Format"
			onchange={handleExportStyleChange}
			options={exportFormatOptions}
		/>
		{#if exportStyleDescription}
			<TextParagraph>
				{exportStyleDescription}
			</TextParagraph>
		{/if}
	</div>
	{#if upgradeExportOptions.upgradeExportStyle === UpgradeExportOptions_UpgradeExportStyle.MarkdownArkhamDb}
		{@const splitDividerChecked = upgradeExportOptions.splitDivider}
		{@const showLinkChecked = upgradeExportOptions.showLink}
		<div>
			<Checkbox
				checked={splitDividerChecked}
				label="Split Divider"
				onChange={() => {
					upgradeExportOptions.splitDivider = !splitDividerChecked;
					onChangeUpgradeExportOptions({ ...upgradeExportOptions });
				}}
			/>
		</div>
		<Checkbox
			checked={showLinkChecked}
			label="Show Link"
			onChange={() => {
				upgradeExportOptions.showLink = !showLinkChecked;
				onChangeUpgradeExportOptions({ ...upgradeExportOptions });
			}}
		/>
		{#if upgradeExportOptions.showLink}
			<TextInput
				bind:value={upgradeExportOptions.showLinkText}
				label="Link Text"
				onblur={() => onChangeUpgradeExportOptions({ ...upgradeExportOptions })}
			/>
		{/if}
	{/if}

	<div class="space-y-2">
		<Button label="Copy To Clipboard" onClick={() => copyToClipboard(exportText)} />
		<textarea
			class="w-full rounded-lg border border-primary-300 dark:border-primary-700 bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-100 p-3"
			readonly
			rows={10}>{exportText}</textarea
		>
	</div>

	<SectionSeparator title="Link" />
	<TextParagraph>
		Keep it to come back to this page later and continue editing, or to share your upgrade idea to
		others where exported text does not work. Also there is already a link added in arkhamdb.com
		export format. (If "Show Link" is not used, the link is hidden in the Markdown comment that only
		you can see.)
	</TextParagraph>
	<div class="space-y-2">
		<Button label="Copy To Clipboard" onClick={() => copyToClipboard(link)} />
		<textarea
			class="w-full rounded-lg border border-primary-300 dark:border-primary-700 bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-100 p-3"
			readonly
			rows={5}>{link}</textarea
		>
	</div>

	<SectionSeparator title="Data Code" />
	<TextParagraph>
		It represent an entire data that you worked on on this page. It is part of the link that made it
		able to restore your session. Currently it has no use but it will in my finished site.
	</TextParagraph>
	<div class="space-y-2">
		<Button label="Copy To Clipboard" onClick={() => copyToClipboard(dataCode)} />
		<textarea
			class="w-full rounded-lg border border-primary-300 dark:border-primary-700 bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-100 p-3"
			readonly
			rows={5}>{dataCode}</textarea
		>
	</div>
</div>
